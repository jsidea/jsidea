package jsidea.eclipsebridge;

import java.net.SocketAddress;

import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.ui.IStartup;
import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.json.JSONObject;
import org.osgi.framework.BundleContext;

import jsidea.core.ISocketReceiver;
import jsidea.core.PluginServer;

/**
 * The activator class controls the plug-in life cycle
 */
public class Activator extends AbstractUIPlugin implements IStartup, ISocketReceiver {

	// The plug-in ID
	public static final String PLUGIN_ID = "jsidea"; //$NON-NLS-1$

	// The shared instance
	private static Activator plugin;

	/**
	 * The constructor
	 */
	public Activator() {
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.eclipse.ui.plugin.AbstractUIPlugin#start(org.osgi.framework.
	 * BundleContext)
	 */
	public void start(BundleContext context) throws Exception {
		super.start(context);

		PluginServer.start(this);

		plugin = this;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.eclipse.ui.plugin.AbstractUIPlugin#stop(org.osgi.framework.
	 * BundleContext)
	 */
	public void stop(BundleContext context) throws Exception {
		PluginServer.stop();

		plugin = null;
		super.stop(context);
	}

	/**
	 * Returns the shared instance
	 *
	 * @return the shared instance
	 */
	public static Activator getDefault() {
		return plugin;
	}

	/**
	 * Returns an image descriptor for the image file at the given plug-in
	 * relative path
	 *
	 * @param path
	 *            the path
	 * @return the image descriptor
	 */
	public static ImageDescriptor getImageDescriptor(String path) {
		return imageDescriptorFromPlugin(PLUGIN_ID, path);
	}

	public void input(SocketAddress add, String in) {
		JSONObject o = new JSONObject(in);
		// String inp = "";
		if (o.has("plugin"))
			System.out.println(o.get("plugin").toString());
		if (o.has("method"))
			System.out.println(o.get("method").toString());
		System.out.println(o.toString(4));
	}

	@Override
	public void earlyStartup() {
	}
}
