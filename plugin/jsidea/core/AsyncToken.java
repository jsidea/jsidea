package jsidea.core;

import java.util.UUID;

import org.json.JSONObject;

public class AsyncToken {
	private Client _client = null;
	private String _id = null;

	public AsyncToken() {
		this._id = UUID.randomUUID().toString();
	}

	public void execute(Object result) {
		// TODO: throw error?
		if (_client == null)
			return;

		JSONObject jsonResult = new JSONObject();
		jsonResult.put("kind", "async-result");
		jsonResult.put("async", _id);
		jsonResult.put("result", result);

		_client.write(jsonResult.toString());

		_client = null;
		_id = null;
	}

	public String getId() {
		return _id;
	}

	public void setClient(Client client) {
		_client = client;
	}
}
