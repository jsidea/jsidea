package jsidea;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.ui.IStartup;
import org.eclipse.ui.plugin.AbstractUIPlugin;
import org.json.JSONObject;
import org.osgi.framework.BundleContext;

import jsidea.core.Client;
import jsidea.core.IReceiver;
import jsidea.core.Server;
import jsidea.plugins.BasePlugin;

/**
 * The activator class controls the plug-in life cycle
 */
public class Activator extends AbstractUIPlugin implements IStartup, IReceiver {

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
			put("editor", "jsidea.plugins.Editor");
			put("build", "jsidea.plugins.Build");
			put("console", "jsidea.plugins.Console");
			put("prompt", "jsidea.plugins.Prompt");
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
			JSONObject ret = this.execute(pluginInstance, pluginMethod, options);
			String retString = ret.toString(4);
			client.write(retString);
		} else {
			System.out.println("[jsidea] Failed to create plugin!");
			System.out.println(o.toString(4));

			JSONObject jsonResult = new JSONObject();
			jsonResult.put("error", "Error creating plugin: " + plugin);
			client.write(jsonResult.toString(4));
		}
	}

	private JSONObject execute(BasePlugin plugin, String method, JSONObject options) {
		JSONObject jsonResult = new JSONObject();
		try {
			// invoke the method by reflection
			Method m = plugin.getClass().getMethod("_" + method, new Class[] { JSONObject.class });
			Object ret = m.invoke(plugin, options);

			// convert the result to json, end return it

			if (ret != null)
				jsonResult.put("result", ret);
			else
				jsonResult.put("result", "void");

			// Class<?> rt = m.getReturnType();
			// if (rt == String.class) {
			// jsonResult.put("result", jsonString);
			// }

		} catch (NoSuchMethodException e) {
			jsonResult.put("error", e);
			e.printStackTrace();
		} catch (SecurityException e) {
			jsonResult.put("error", e);
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			jsonResult.put("error", e);
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			jsonResult.put("error", e);
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			// if(e.getCause() instanceof PluginException)
			// {
			// PluginException exc = (PluginException) e.getCause();
			// jsonResult.put("error", exc);
			// }
			jsonResult.put("error", e.getCause().getMessage());
			// e.printStackTrace();
		}

		return jsonResult;
	}

	@Override
	public void earlyStartup() {
	}
}
