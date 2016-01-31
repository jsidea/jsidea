package jsidea.core;

import java.net.SocketAddress;

public interface ISocketReceiver {
	public void input(SocketAddress add, String message);
}
