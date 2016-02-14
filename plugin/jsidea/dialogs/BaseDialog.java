package jsidea.dialogs;

import org.eclipse.jface.dialogs.Dialog;
import org.eclipse.swt.widgets.Shell;
import org.json.JSONObject;

public class BaseDialog extends Dialog {

	protected JSONObject _data = new JSONObject();

	protected BaseDialog(Shell shell) {
		super(shell);
	}
	
	public JSONObject toJSON() {
		return _data;
	}
}
