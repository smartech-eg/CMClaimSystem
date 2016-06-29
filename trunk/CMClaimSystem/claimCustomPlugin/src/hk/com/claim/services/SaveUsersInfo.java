package hk.com.claim.services;

import hk.com.claim.db.ConnectionManager;
import hk.com.claim.db.UsersManagersDAO;

import java.io.PrintWriter;
import java.sql.Connection;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.json.JSONArray;
import org.apache.commons.json.JSONObject;

import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;

public class SaveUsersInfo extends PluginService {
	@Override
	public void execute(PluginServiceCallbacks callbacks,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		
		
		PrintWriter responseWriter = response.getWriter();
		String dataSourceName = "ECMCLAIMSDS";
		Connection con = ConnectionManager.getConnection(dataSourceName);
		JSONArray rows = new JSONArray(request.getParameter("inputJSON"));
		String user = request.getParameter("user");
		UsersManagersDAO usersDataDao = new UsersManagersDAO();
		ArrayList<String> updatedIds = new ArrayList<String>();
		JSONObject jsonObject = null;

		for (int i = 0; i < rows.size(); i++) {

			jsonObject = new JSONObject(rows.get(i));
			String ID= jsonObject.get("ID").toString();
			if (!ID.equals("")) {
				 
					updatedIds.add(ID);
					System.out.println(i + "  " + jsonObject);
					usersDataDao.saveUsersData(jsonObject, user,con);
				
			} else {
				usersDataDao.insertUsersData(jsonObject, user,con);

			}
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
           ConnectionManager.closeConnection(con);
			responseWriter.close();
		}
	}

	@Override
	public String getId() {
		return "saveUserDataService";
	}

}
