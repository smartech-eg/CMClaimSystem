package hk.com.claim.services;

import hk.com.claim.db.LookupManagerDAO;

import java.io.PrintWriter;
import org.apache.commons.json.JSONArray;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

 
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;

public class GetConfigurations extends PluginService {

	@Override
	public void execute(PluginServiceCallbacks callbacks,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		System.out.println(">> IN GetConfigurations");
		PrintWriter responseWriter = response.getWriter();
		LookupManagerDAO configDataDao = new LookupManagerDAO();
		JSONArray configData = configDataDao.getConFigurationData();
		try {
			responseWriter.print(configData);
			responseWriter.flush();
		} finally {
			responseWriter.close();
		}

	}

	@Override
	public String getId() {
		return "getConfigDataService";
	}

	

}