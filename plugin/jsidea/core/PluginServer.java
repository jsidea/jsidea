package jsidea.core;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.nio.charset.Charset;


public class PluginServer {
	public static ISocketReceiver receiver = null;

	public static void start(ISocketReceiver hook) throws Exception {
		PluginServer.receiver = hook;
		AsynchronousServerSocketChannel server = AsynchronousServerSocketChannel.open();

		String host = "localhost";
		int port = 3008;
		InetSocketAddress sAddr = new InetSocketAddress(host, port);
		server.bind(sAddr);
//		System.out.format("Server is listening at %s%n", sAddr);
		Attachment attach = new Attachment();
		attach.server = server;
		server.accept(attach, new ConnectionHandler());
		// Thread.currentThread().join();
	}

	public static void stop() throws Exception {

	}
}

class Attachment {
	AsynchronousServerSocketChannel server;
	AsynchronousSocketChannel client;
	ByteBuffer buffer;
	SocketAddress clientAddr;
	boolean isRead;
}

class ConnectionHandler implements CompletionHandler<AsynchronousSocketChannel, Attachment> {
	@Override
	public void completed(AsynchronousSocketChannel client, Attachment attach) {
		try {
			SocketAddress clientAddr = client.getRemoteAddress();
//			System.out.format("Accepted a  connection from  %s%n", clientAddr);
			attach.server.accept(attach, this);
			ReadWriteHandler rwHandler = new ReadWriteHandler();
			Attachment newAttach = new Attachment();
			newAttach.server = attach.server;
			newAttach.client = client;
			newAttach.buffer = ByteBuffer.allocate(2048);
			newAttach.isRead = true;
			newAttach.clientAddr = clientAddr;
			client.read(newAttach.buffer, newAttach, rwHandler);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void failed(Throwable e, Attachment attach) {
		System.out.println("Failed to accept a  connection.");
		e.printStackTrace();
	}
}

class ReadWriteHandler implements CompletionHandler<Integer, Attachment> {
	@Override
	public void completed(Integer result, Attachment attach) {
		if (result == -1) {
			try {
				attach.client.close();
				System.out.format("[stop] client %s%n", attach.clientAddr);
			} catch (IOException ex) {
				ex.printStackTrace();
			}
			return;
		}

		if (attach.isRead) {
			attach.buffer.flip();
			int limits = attach.buffer.limit();
			byte bytes[] = new byte[limits];
			attach.buffer.get(bytes, 0, limits);
			Charset cs = Charset.forName("UTF-8");
			String msg = new String(bytes, cs);
			PluginServer.receiver.input(attach.clientAddr, msg);
//			System.out.format("Client at  %s  says: %s%n", attach.clientAddr, msg);
			attach.isRead = false; // It is a write
			attach.buffer.rewind();

		} else {
			// Write to the client
			attach.client.write(attach.buffer, attach, this);
			attach.isRead = true;
			attach.buffer.clear();
			attach.client.read(attach.buffer, attach, this);
		}
	}

	@Override
	public void failed(Throwable e, Attachment attach) {
		e.printStackTrace();
	}
}
