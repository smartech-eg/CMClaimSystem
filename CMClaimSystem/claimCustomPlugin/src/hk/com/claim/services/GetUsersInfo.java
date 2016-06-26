package hk.com.claim.services;

import hk.com.claim.db.UsersManagersDAO;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.json.JSONArray;

import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;

public class GetUsersInfo extends PluginService {

	@Override
	public void execute(PluginServiceCallbacks callbacks,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		System.out.println(">> IN GetConfigurations");
		PrintWriter responseWriter = response.getWriter();
		UsersManagersDAO usersInfoDAO = new UsersManagersDAO();
		JSONArray usersInfo = usersInfoDAO.getUsersData();
		try {
			responseWriter.print(usersInfo);
			responseWriter.flush();
		} finally {
			responseWriter.close();
		}

	}

	@Override
	public String getId() {
		return "getUserDataService";
	}

	

}