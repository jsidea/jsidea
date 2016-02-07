package jsidea.plugins;

import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.MessageBox;
import org.eclipse.swt.widgets.Shell;
import org.json.JSONObject;

public class Prompt extends BasePlugin {

	@Override
	public void init() {
	}

	public void _messageBox(JSONObject options) {
		this.messageBox(options.getString("message"));
	}

	public void messageBox(String message) {
		Display display = Display.getDefault();
		display.asyncExec(new Runnable() {
			@Override
			public void run() {
				Shell shell = new Shell(display);
				// create a dialog with ok and cancel buttons and a question
				// icon
				MessageBox dialog = new MessageBox(shell, SWT.ICON_QUESTION | SWT.OK | SWT.CANCEL);
				dialog.setText("My info");
				dialog.setMessage(message);

				// open dialog and await user selection
				int returnCode = dialog.open();
				System.out.println("Open dialog return value: " + returnCode);
			}
		});
	}

}
