package hk.com.claim.services;

import hk.com.claim.db.LookupManagerDAO;
import hk.com.claim.db.UsersManagersDAO;

import java.io.PrintWriter;
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

		JSONArray rows = new JSONArray(request.getParameter("inputJSON"));
		String user = request.getParameter("user");
		UsersManagersDAO usersDataDao = new UsersManagersDAO();
		ArrayList<String> updatedIds=new ArrayList<String>();
		JSONObject jsonObject=null;
		
		for (int i = 0; i < rows.size(); i++) {
			
			jsonObject=new JSONObject(rows.get(i));
			String userId=jsonObject.get("User_Id").toString();
			if(!updatedIds.contains(userId))
			{
				updatedIds.add(userId);
				System.out.println(i+"  "+jsonObject);
				usersDataDao.saveUsersData(jsonObject,user);	
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
			
			responseWriter.close();
		}
	}

	@Override
	public String getId() {
		return "saveUserDataService";
	}

}
