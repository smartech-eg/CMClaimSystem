package hk.com.claim.services;

import hk.com.claim.db.LookupManagerDAO;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.json.JSONArray;
import org.apache.commons.json.JSONObject;

import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;

public class SaveConfigurationsService extends PluginService {
 	@Override
	public void execute(PluginServiceCallbacks callbacks,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		PrintWriter responseWriter = response.getWriter();

		JSONArray rows = new JSONArray(request.getParameter("inputJSON"));
		String user = request.getParameter("user");
		LookupManagerDAO configigDataDao = new LookupManagerDAO();
		for (int i = 0; i < rows.size(); i++) {
			configigDataDao.saveConfigrationData(new JSONObject(rows.get(i)),user);
		}
		
		
		JSONArray retArr = new JSONArray();
		JSONObject retObj = new JSONObject();
		retObj.put("Done", "true");
		retArr.add(retObj);
 		try {
			responseWriter.print(retArr);
 			responseWriter.flush();
		} catch (Exception e) {
 		} finally {
			
			responseWriter.close();
		}
	}

	@Override
	public String getId() {
		return "saveConfigDataService";
	}

}
