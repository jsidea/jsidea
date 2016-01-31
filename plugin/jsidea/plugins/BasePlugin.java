package jsidea.plugins;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.json.JSONObject;

abstract public class BasePlugin {
	public abstract void init();

	public JSONObject execute(String method, JSONObject options) {
		JSONObject jsonResult = new JSONObject();
		try {
			// invoke the method by reflection
			Method m = this.getClass().getMethod(method, new Class[] { JSONObject.class });
			Object ret = m.invoke(this, options);

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
			jsonResult.put("error", e);
			e.printStackTrace();
		}

		return jsonResult;
	}
}
