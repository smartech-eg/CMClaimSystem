package hk.com.claim.features;

import java.util.Locale;

import com.ibm.ecm.extension.PluginFeature;

public class LookupManagerFeature  extends PluginFeature {

	/**
	 * Returns an identifier that is used to describe this feature.
	 * <p>
	 * <strong>Important:</strong> This identifier is used in URLs so it must
	 * contain only alphanumeric characters.
	 * </p>
	 * 
	 * @return An alphanumeric <code>String</code> that is used to identify the
	 *         feature.
	 */
	@Override
	public String getId() {
		return "LookupManagerFeature";
	}

	/**
	 * Returns a descriptive label for this feature that is displayed in the IBM
	 * Content Navigator administration tool.
	 * 
	 * @return A short description for the menu.
	 */
	@Override
	public String getName(Locale locale) {
		return "LookupManagerFeature";
	}

	/**
	 * Returns descriptive text for this feature that is displayed in the IBM
	 * Content Navigator administration tool.
	 * 
	 * @return A short description for the feature.
	 */
	@Override
	public String getDescription(Locale locale) {
		return "";
	}

	/**
	 * Returns a image CSS class to use as the icon displayed for this feature.
	 * This icon typically appears on the left side of the desktop.
	 * <p>
	 * An icon file is a 32x32 pixel transparent image, for example, a
	 * transparent GIF image or PNG image. The icon file must be included in the
	 * <code><i>pluginPackage</i>/WebContent</code> subdirectory of the JAR file
	 * for the plug-in that contains this action.
	 * </p>
	 * 
	 * @return A CSS class name
	 */
	@Override
	public String getIconUrl() {
		return "workLaunchIcon";
	}

	/**
	 * Returns a <code>String</code> to use as help context for this feature.
	 * 
	 * @return A <code>String</code> to use as the help text for this feature.
	 */
	

	/**
	 * Returns a <code>String</code> to use as tooltip text on the icon for this
	 * feature.
	 * 
	 * @param locale
	 *            The current locale for the user.
	 * @return A <code>String</code> to use as tooltip text on the feature icon.
	 */
	@Override
	public String getFeatureIconTooltipText(Locale locale) {
		return "";
	}

	/**
	 * Returns a <code>String</code> to use as tooltip text on the popup or
	 * flyout window icon that is used for this feature.
	 * 
	 * @param locale
	 *            The current locale for the user.
	 * @return A <code>String</code> to use as tooltip text.
	 */
	@Override
	public String getPopupWindowTooltipText(Locale locale) {
		return "";
	}

	/**
	 * Returns the name of a widget to implement the pane that provides the
	 * primary interface for this feature.
	 * 
	 * @return A <code>String</code> name of the dijit.
	 */
	@Override
	public String getContentClass() {
		return "hk.com.claim.widgets.featuresDojo.LookupManagerFeature";
	}

	/**
	 * Returns a Boolean value that indicates whether this feature is a
	 * separator. A separator is a special case where the feature is not a true
	 * feature but represents a separator to appear between features in the
	 * interface.
	 * 
	 * @return A value of <code>true</code> if this feature is a separator. By
	 *         default, this method returns <code>false</code>.
	 */
	@Override
	public boolean isSeparator() {
		return false;
	}

	/**
	 * Returns the name of the widget that implements a popup window, also known
	 * as the flyout, for this feature.
	 * 
	 * @return A <code>String</code> name of the widget that implements the
	 *         flyout for the feature.
	 */
	@Override
	public String getPopupWindowClass() {
		return "";
	}

	/**
	 * Returns true if the feature should be preloaded by the application layout
	 * and false if it should be lazy-loaded.
	 * 
	 * @return A boolean indicating if the feature should be preloaded.
	 */
	@Override
	public boolean isPreLoad() {
		return false;
	}

}
