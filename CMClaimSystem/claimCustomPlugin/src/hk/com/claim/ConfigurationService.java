package hk.com.claim;

import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import java.io.PrintWriter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ConfigurationService extends PluginService
{
  public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
    throws Exception
  {
    String configuration = callbacks.loadConfiguration();
    PrintWriter responseWriter = response.getWriter();
    try {
      responseWriter.print(configuration);
      responseWriter.flush();
    } finally {
      responseWriter.close();
    }
  }

  public String getId()
  {
    return "configurationService";
  }
}