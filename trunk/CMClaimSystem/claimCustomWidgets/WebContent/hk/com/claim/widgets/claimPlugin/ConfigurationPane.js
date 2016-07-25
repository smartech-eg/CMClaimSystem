/**
 * Licensed Materials - Property of IBM (C) Copyright IBM Corp. 2012 US
 * Government Users Restricted Rights - Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([ "dojo/_base/declare", "dojo/_base/lang", "dojo/json",
		"dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
		"ecm/widget/admin/PluginConfigurationPane", "ecm/MessagesMixin",
		"ecm/widget/ValidationTextBox",
		"dojo/text!./templates/ConfigurationPane.html" ],

function(declare, lang, JSON, _TemplatedMixin, _WidgetsInTemplateMixin,
		PluginConfigurationPane, MessagesMixin, ValidationTextBox, template) {

	isJSONConfig: false;

	/**
	 * @name edsPlugin.configurationPane
	 * @class
	 * @augments dijit.layout.PluginConfigurationPane, dijit._TemplatedMixin,
	 *           dijit._WidgetsInTemplateMixin, ecm.MessagesMixin
	 */
	return declare("hk.com.claim.widgets.claimPlugin.ConfigurationPane", [ PluginConfigurationPane,
			_TemplatedMixin, _WidgetsInTemplateMixin, MessagesMixin ], {
		/** @lends edsPlugin.ConfigurationPane.prototype */

		templateString : template,
		widgetsInTemplate : true,

		postCreate : function() {
			//this.edsRequestTimeout.set('value', '300');
		},

		load : function(callback) {
			/*var config = {
				iisURL : ""
			};
			if (this.configurationString) {
				if (this.isJSONConfig
						|| this.configurationString.indexOf("{") == 0) {
					this.isJSONConfig = true;
					config = lang.mixin(config, JSON
							.parse(this.configurationString));
				} else {
					//config.edsUrl = this.configurationString;
				}
			}
			this.iisURL.set('value', config.iisURL);
			*/
			if (this.configurationString) {
				var jsonConfig = eval('(' + this.configurationString + ')');
				this.claimSystemURL.set('value',jsonConfig.configuration[0].value);
				this.dbJindi.set('value',jsonConfig.configuration[1].value);
				//this.param2Field.set('value',jsonConfig.configuration[1].value);
			}
		},
		_onParamChange: function() {
			var configArray = [];
			var configString = {  
				name: "claimSystemURL",
				value: this.claimSystemURL.get('value')
			}; 
			configArray.push(configString);
			
			var configString2 = {  
				name: "dbJindi",
				value: this.dbJindi.get('value')
			}; 
			configArray.push(configString2);
			
			var configJson = {
				"configuration" : configArray
			};
			
			this.configurationString = JSON.stringify(configJson);
			this.onSaveNeeded(true);
		},
		
		/*_onEdsFieldChange : function() {
			var config = {
				edsUrl : this.edsUrlField.get('value'),
				edsRequestTimeout : this.edsRequestTimeout.get('value'),
				edsIsRequired : this.edsIsRequired.get('checked'),
				edsJaasURI: this.edsJaasURI.get('value'),
				edsJaasUserName : this.edsUsername.get('value'),
				edsJaasUserPassword : this.edsPassword.get('value')
			};

			this.configurationString = JSON.stringify(config);
			this.isJSONConfig = true;

			this.onSaveNeeded(true);
		},*/

		validate : function() {
			var valid = this.dbJindi.isValid() && this.claimSystemURL.isValid();
			return valid;
		},

	});
});
