package jsidea.core;

import java.net.SocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;

public class Client {
	public AsynchronousServerSocketChannel server;
	public AsynchronousSocketChannel socket;
	public ByteBuffer buffer;
	public SocketAddress clientAddr;
	public boolean isRead;
}