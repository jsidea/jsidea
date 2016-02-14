package jsidea.plugins;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.eclipse.swt.widgets.Display;

import jsidea.core.AsyncToken;

abstract public class BasePlugin {
	public abstract void init();

	protected AsyncToken async(String method, Object... options) {
		AsyncToken token = new AsyncToken();
		Display display = Display.getDefault();
		BasePlugin plugin = this;
		display.asyncExec(new Runnable() {
			@Override
			public void run() {
				Object result = plugin.call(method, options);
				token.execute(result);
			}
		});
		return token;
	}

	protected Object call(String method, Object... options) {
		try {
			@SuppressWarnings("rawtypes")
			Class[] signature = new Class[options.length];
			for (int i = 0; i < signature.length; i++) {
				signature[i] = options[i].getClass();
			}
			Method m = this.getClass().getMethod(method, signature);
			return m.invoke(this, options);

		} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchMethodException | SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
}
