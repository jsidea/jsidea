package jsidea.core;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.nio.charset.Charset;

public class Server {
	public static ISocketReceiver receiver = null;

	public static void start(ISocketReceiver hook) throws Exception {
		Server.receiver = hook;
		AsynchronousServerSocketChannel server = AsynchronousServerSocketChannel.open();

		String host = "localhost";
		int port = 3008;
		InetSocketAddress sAddr = new InetSocketAddress(host, port);
		server.bind(sAddr);
		// System.out.format("Server is listening at %s%n", sAddr);
		Client attach = new Client();
		attach.server = server;
		server.accept(attach, new ConnectionHandler());
		// Thread.currentThread().join();
	}

	public static void stop() throws Exception {

	}
}

class ConnectionHandler implements CompletionHandler<AsynchronousSocketChannel, Client> {
	@Override
	public void completed(AsynchronousSocketChannel client, Client attach) {
		try {
			SocketAddress clientAddr = client.getRemoteAddress();
			// System.out.format("Accepted a connection from %s%n", clientAddr);
			attach.server.accept(attach, this);
			ReadWriteHandler rwHandler = new ReadWriteHandler();
			Client newAttach = new Client();
			newAttach.server = attach.server;
			newAttach.socket = client;
			newAttach.buffer = ByteBuffer.allocate(2048);
			newAttach.isRead = true;
			newAttach.clientAddr = clientAddr;
			client.read(newAttach.buffer, newAttach, rwHandler);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void failed(Throwable e, Client attach) {
		System.out.println("Failed to accept a  connection.");
		e.printStackTrace();
	}
}

class ReadWriteHandler implements CompletionHandler<Integer, Client> {
	@Override
	public void completed(Integer result, Client attach) {
		if (result == -1) {
			try {
				attach.socket.close();
				System.out.format("[stop] socket %s%n", attach.clientAddr);
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
			Server.receiver.input(attach, msg);
			// System.out.format("Client at %s says: %s%n", attach.clientAddr,
			// msg);
			attach.isRead = false; // It is a write
			attach.buffer.rewind();

		} else {
			// Write to the socket
			attach.socket.write(attach.buffer, attach, this);
			attach.isRead = true;
			attach.buffer.clear();
			attach.socket.read(attach.buffer, attach, this);
		}
	}

	@Override
	public void failed(Throwable e, Client attach) {
		e.printStackTrace();
	}
}
