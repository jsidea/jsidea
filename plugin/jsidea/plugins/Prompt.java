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
		return this.async("messageBox", options.getString("message"));
	}

	public Object _loginDialog(JSONObject options) {
		return this.async("loginDialog", options.getString("message"));
	}

	public JSONObject messageBox(String message) {
		Shell shell = new Shell(Display.getDefault());
		MessageBox dialog = new MessageBox(shell, SWT.ICON_QUESTION | SWT.OK | SWT.CANCEL);
		dialog.setText("My info");
		dialog.setMessage(message);
		int returnCode = dialog.open();
		JSONObject res = new JSONObject();
		res.put("returnCode", returnCode);
		return res;
	}

	public JSONObject loginDialog(String message) {
		Shell shell = new Shell(Display.getDefault());
		LoginDialog dialog = new LoginDialog(shell);
		int returnCode = dialog.open();
		JSONObject res = dialog.toJSON();
		res.put("returnCode", returnCode);
		return res;
	}

}
