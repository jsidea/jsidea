package jsidea.dialogs;

import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.swt.widgets.Text;

public class LoginDialog extends BaseDialog {

	private Text _username = null;
	private Text _password = null;

	public LoginDialog(Shell shell) {
		super(shell);
	}

	@Override
	protected Control createDialogArea(Composite parent) {
		Composite container = (Composite) super.createDialogArea(parent);

		GridLayout layout = (GridLayout) container.getLayout();
		layout.numColumns = 2;

		GridData data = new GridData(GridData.FILL_HORIZONTAL);
		
		// Create a multiple-line text field
//	    Text t = new Text(container, SWT.MULTI | SWT.BORDER | SWT.WRAP | SWT.V_SCROLL);
	    Text t = new Text(container, SWT.MULTI | SWT.WRAP | SWT.READ_ONLY);
	    GridData d = new GridData(GridData.FILL_HORIZONTAL);
	    t.setText("SFASD ASD ASD ASDASD ASDA SDASD ASD ASD ASD ASDASDFGSDGKJSDLF SDJFKSDJFKSD LSDF");
	    d.heightHint = 30;
//	    d.minimumHeight = 200;
	    d.horizontalSpan = 2;
	    t.setLayoutData(d);

		Label usernameLabel = new Label(container, SWT.RIGHT);
		usernameLabel.setText("Username: ");
		_username = new Text(container, SWT.SINGLE | SWT.BORDER);
		_username.setLayoutData(data);

		Label passwordLabel = new Label(container, SWT.RIGHT);
		passwordLabel.setText("Password: ");
		_password = new Text(container, SWT.SINGLE | SWT.PASSWORD | SWT.BORDER);
		_password.setLayoutData(data);

		return container;
	}

	// overriding this methods allows you to set the
	// title of the custom dialog
	@Override
	protected void configureShell(Shell newShell) {
		super.configureShell(newShell);
		newShell.setText("Login dialog");
	}

	@Override
	public boolean close() {
		_data.put("username", _username.getText());
		_data.put("password", _password.getText());

		return super.close();
	}

	@Override
	protected Point getInitialSize() {
		return new Point(300, 185);
	}
}
