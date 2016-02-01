package jsidea.core;

import java.io.IOException;
import java.net.SocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.nio.charset.Charset;

public class Client {
	public AsynchronousServerSocketChannel server;
	public AsynchronousSocketChannel socket;
	public ByteBuffer buffer;
	public SocketAddress clientAddr;

	private CompletionHandler<Integer, Client> _reader = new ReadHandler();
	private CompletionHandler<Integer, Client> _writer = new WriteHandler();

	public Client() {

	}

	public void read() {
		socket.read(this.buffer, this, this._reader);
	}

	public void write(String message) {
		// this.buffer.clear();
		// message += "\nEND";

		// buffer.put(message.getBytes());
		// buffer.flip();

		// buffer.rewind();
		// buffer.compact();

		ByteBuffer buffer = ByteBuffer.wrap(message.getBytes());
//		buffer.put((byte) null);
		socket.write(buffer, this, _writer);

//		System.out.println("WRITE: " + message);
		// Write to the socket
//		socket.write(this.buffer, this, this._writer);
//		buffer.compact();
	}
}

class ReadHandler implements CompletionHandler<Integer, Client> {
	@Override
	public void completed(Integer result, Client client) {
		if (result == -1) {
			try {
				client.socket.close();
				System.out.format("[stop] socket %s%n", client.clientAddr);
			} catch (IOException ex) {
				ex.printStackTrace();
			}
			return;
		}

		client.buffer.flip();
		int limits = client.buffer.limit();
		byte bytes[] = new byte[limits];
		client.buffer.get(bytes, 0, limits);
		Charset cs = Charset.forName("UTF-8");
		String msg = new String(bytes, cs);
		client.buffer.rewind();

		// send it to the receiver
		Server.receiver.input(client, msg);
	}

	@Override
	public void failed(Throwable e, Client attach) {
		e.printStackTrace();
	}
}

class WriteHandler implements CompletionHandler<Integer, Client> {
	@Override
	public void completed(Integer result, Client client) {
		if (result == -1) {
			try {
				client.socket.close();
				System.out.format("[stop] socket %s%n", client.clientAddr);
			} catch (IOException ex) {
				ex.printStackTrace();
			}
			return;
		}

		// String message = "HELLO WORLD";
		// client.buffer.put(message.getBytes());
		//
		// // Write to the socket
		// client.socket.write(client.buffer, client, this);
//		System.out.println("STUFF WRITTEN");
		// try {
		// client.socket.shutdownInput();
		// } catch (IOException e) {
		// // TODO Auto-generated catch block
		// e.printStackTrace();
		// }
		client.buffer.clear();
		client.buffer.rewind();
//		client.socket.shutdownOutput();
		// client.read();
		// try {
		// client.socket.close();
		// } catch (IOException e) {
		// // TODO Auto-generated catch block
		// e.printStackTrace();
		// }
		// client.read();
		// client.socket.read(client.buffer, client, this);
	}

	@Override
	public void failed(Throwable e, Client attach) {
		e.printStackTrace();
	}
}