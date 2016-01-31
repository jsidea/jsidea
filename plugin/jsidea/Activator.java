package jsidea;

import java.util.HashMap;
import java.util.Map;

import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.ui.IStartup;
import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.json.JSONObject;
import org.osgi.framework.BundleContext;

import jsidea.core.Client;
import jsidea.core.ISocketReceiver;
import jsidea.core.Server;
import jsidea.plugins.BasePlugin;

/**
 * The activator class controls the plug-in life cycle
 */
public class Activator extends AbstractUIPlugin implements IStartup, ISocketReceiver {

	// The plug-in ID
	public static final String PLUGIN_ID = "jsidea";

	// The shared instance
	private static Activator plugin;

	// all active plugins
	private Map<String, BasePlugin> plugins = new HashMap<String, BasePlugin>();

	// TODO: put this in a config file
	private Map<String, String> pluginsAvailable = new HashMap<String, String>() {
		private static final long serialVersionUID = 1L;

		{
			put("filesystem", "jsidea.plugins.FileSystemPlugin");
			put("build", "jsidea.plugins.BuildPlugin");
		}
	};

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

		Server.start(this);

		plugin = this;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.eclipse.ui.plugin.AbstractUIPlugin#stop(org.osgi.framework.
	 * BundleContext)
	 */
	public void stop(BundleContext context) throws Exception {
		Server.stop();

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

	public void input(Client client, String in) {
		JSONObject o = new JSONObject(in);

		// some simple validation

		if (!o.has("plugin")) {
			System.out.println("[jsidea] Missing plugin property in json data.");
			return;
		}

		if (!o.has("method")) {
			System.out.println("[jsidea] Missing method property in json data.");
			return;
		}

		if (!o.has("options")) {
			System.out.println("[jsidea] Missing options property in json data.");
			return;
		}

		String plugin = o.getString("plugin");
		String pluginMethod = o.getString("method");
		JSONObject options = o.getJSONObject("options");

		BasePlugin pluginInstance = null;
		if (this.plugins.containsKey(plugin)) {
			pluginInstance = this.plugins.get(plugin);
		} else if (this.pluginsAvailable.containsKey(plugin)) {

			String className = this.pluginsAvailable.get(plugin);

			try {
				Class<?> myClass = Class.forName(className);
				pluginInstance = (BasePlugin) myClass.newInstance();
				pluginInstance.init();
				this.plugins.put(plugin, pluginInstance);
				System.out.println("[jsidea] Plugin created: " + plugin + " => " + className);
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
			} catch (InstantiationException e) {
				e.printStackTrace();
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			}
		}

		if (pluginInstance != null) {
			JSONObject ret = pluginInstance.execute(pluginMethod, options);
			String retString = ret.toString(4);
			client.write(retString);
//			System.out.println("[jsidea] Coming Soon | DONE ... Return value write:");
//			System.out.println(retString);

		} else {
			System.out.println("[jsidea] Failed to create plugin!");
			System.out.println(o.toString(4));
		}
	}

	@Override
	public void earlyStartup() {
	}
}
