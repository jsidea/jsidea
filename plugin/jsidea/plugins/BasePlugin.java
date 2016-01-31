package jsidea.plugins;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.json.JSONObject;

abstract public class BasePlugin {
	public abstract void init();

	public JSONObject execute(String method, JSONObject options) {
		try {
			// invoke the method by reflection
			Method m = this.getClass().getMethod(method, new Class[] { JSONObject.class });
			Object ret = m.invoke(this, options);

			// convert the result to json, end return it
			JSONObject jsonResult = new JSONObject();
			jsonResult.put("result", ret);
			return jsonResult;

			// Class<?> rt = m.getReturnType();
			// if (rt == String.class) {
			// jsonResult.put("result", jsonString);
			// }

		} catch (NoSuchMethodException e) {
			e.printStackTrace();
		} catch (SecurityException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			e.printStackTrace();
		}
		return null;
	}
}
