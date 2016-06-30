package hk.com.claim.services;

import hk.com.claim.db.ConnectionManager;
import hk.com.claim.db.UsersManagersDAO;

import java.io.PrintWriter;
import java.sql.Connection;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
			
			
			
 			String user_id = request.getParameter("user_id");
			
			String user_group = request.getParameter("user_group");
			String user_amount = request.getParameter("user_amount");
	 		UsersManagersDAO usersInfoDAO = new UsersManagersDAO();
			boolean isUserinRange = usersInfoDAO.checkUserAmount(con,user_id,user_group,user_amount);
			responseWriter.print(isUserinRange);
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