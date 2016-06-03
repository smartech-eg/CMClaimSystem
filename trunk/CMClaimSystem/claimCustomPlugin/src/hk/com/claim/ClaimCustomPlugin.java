/******************************************************************************
 * @Author : RSCA. 
 * @Date 20 Dec 2015
 * @LastModified: Ahmed Alaa@smarTech. 
 * <p>
 * @Description : This CLASS contains all the services in the plugin 
 *
 *******************************************************************************/
package hk.com.claim;

import java.util.Locale;

import com.ibm.ecm.extension.Plugin;
import com.ibm.ecm.extension.PluginFeature;
import com.ibm.ecm.extension.PluginService;

public class ClaimCustomPlugin extends Plugin {

    @Override
    public String getId() {
        return "claimCustomPlugin";
    }

    @Override
    public String getName(Locale locale) {
        return "Claim Custom Plugin";
    }

    @Override
    public String getVersion() {
        return "6.0";
    }

    @Override
    public String getScript() {
        return "claimCustomPlugin.js";
    }

    @Override
    public String getCSSFileName() {
        return "ICMPluginCSS.css";
    }

    @Override
    public String getConfigurationDijitClass() {
        return "hk.com.claim.widgets.claimPlugin.ConfigurationPane";
    }
}
