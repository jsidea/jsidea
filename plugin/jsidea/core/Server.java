package jsidea.core;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;

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
	public void completed(AsynchronousSocketChannel socket, Client client) {
		try {
			SocketAddress clientAddr = socket.getRemoteAddress();
			// System.out.format("Accepted a connection from %s%n", clientAddr);
			client.server.accept(client, this);

			Client newAttach = new Client();
			newAttach.server = client.server;
			newAttach.socket = socket;
			newAttach.buffer = ByteBuffer.allocate(2048);
			newAttach.clientAddr = clientAddr;
			newAttach.read();
			
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
