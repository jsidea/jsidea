package jsidea.plugins;

import org.eclipse.ui.console.ConsolePlugin;
import org.eclipse.ui.console.IConsole;
import org.eclipse.ui.console.IConsoleManager;
import org.eclipse.ui.console.MessageConsole;
import org.eclipse.ui.console.MessageConsoleStream;
import org.json.JSONObject;

public class Console extends BasePlugin {

	@Override
	public void init() {

	}

	public void _log(JSONObject options) {
		this.log(options.getString("message"));
	}

	public void _clear(JSONObject options) {
		this.clear();
	}

	public void clear() {
		MessageConsole myConsole = findConsole("jsidea-console");
		myConsole.clearConsole();
	}

	public void log(String message) {
		MessageConsole myConsole = findConsole("jsidea-console");
		MessageConsoleStream out = myConsole.newMessageStream();
		out.println(message);
		System.out.println("Output message: " + message);
	}

	// SOURCE:
	// https://wiki.eclipse.org/FAQ_How_do_I_write_to_the_console_from_a_plug-in%3F
	private MessageConsole findConsole(String name) {
		ConsolePlugin plugin = ConsolePlugin.getDefault();
		IConsoleManager conMan = plugin.getConsoleManager();
		IConsole[] existing = conMan.getConsoles();
		for (int i = 0; i < existing.length; i++)
			if (name.equals(existing[i].getName()))
				return (MessageConsole) existing[i];
		// no console found, so create a new one
		MessageConsole myConsole = new MessageConsole(name, null);
		conMan.addConsoles(new IConsole[] { myConsole });
		return myConsole;
	}
}
