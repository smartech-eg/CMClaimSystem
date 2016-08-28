package hk.com.claim.services;

import hk.com.claim.db.ConnectionManager;
import hk.com.claim.db.UsersManagersDAO;

import java.io.PrintWriter;
import java.sql.Connection;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.json.JSONArray;
import org.apache.commons.json.JSONObject;

import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;

public class CheckUserAmount extends PluginService {

	@Override
	public void execute(PluginServiceCallbacks callbacks,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		PrintWriter responseWriter = response.getWriter();
		String dataSourceName = "ECMCLAIMSDS";
		Connection con = ConnectionManager.getConnection(dataSourceName);
		try {
			
			
			System.out.println("In CheckUserAmount");
 			String user_id = request.getParameter("user_id");
		    String user_group = request.getParameter("user_group");
			String user_amount = request.getParameter("user_amount");
			System.out.println(user_id);
			System.out.println(user_group);
			System.out.println(user_amount);
	 		UsersManagersDAO usersInfoDAO = new UsersManagersDAO();
	 		
			String userGroup = usersInfoDAO.getUserGroupFromAmount(con,user_id,user_amount);
			System.out.println("userGroup "+userGroup);
			
			
			JSONArray retArr = new JSONArray();
			JSONObject retObj = new JSONObject();
			retObj.put("UserGroup", userGroup);
			retArr.add(retObj);
			responseWriter.print(retArr);
			responseWriter.flush();
		} finally {
			responseWriter.close();
			ConnectionManager.closeConnection(con);
		}

	}

	@Override
	public String getId() {
		return "CheckUserAmount";
	}

	

}