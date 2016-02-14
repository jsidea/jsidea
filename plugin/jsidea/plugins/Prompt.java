package jsidea.plugins;

import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.MessageBox;
import org.eclipse.swt.widgets.Shell;
import org.json.JSONObject;

import jsidea.dialogs.LoginDialog;

public class Prompt extends BasePlugin {

	@Override
	public void init() {
	}

	public Object _messageBox(JSONObject options) {
//		return this.async("messageBox", options.getString("message"));
		return this.async("loginDialog", options.getString("message"));
	}

	public int messageBox(String message) {
		Shell shell = new Shell(Display.getDefault());
		// create a dialog with ok and cancel buttons and a question
		// icon
		MessageBox dialog = new MessageBox(shell, SWT.ICON_QUESTION | SWT.OK | SWT.CANCEL);
		dialog.setText("My info");
		dialog.setMessage(message);

		// open dialog and await user selection
		int returnCode = dialog.open();

		return returnCode;
	}

	public JSONObject loginDialog(String message) {
		Shell shell = new Shell(Display.getDefault());
		// Create a dialog with ok and cancel buttons and a question
		// icon
		LoginDialog dialog = new LoginDialog(shell);

		// Open dialog and await user selection
		dialog.open();

		return dialog.toJSON();
	}

}
