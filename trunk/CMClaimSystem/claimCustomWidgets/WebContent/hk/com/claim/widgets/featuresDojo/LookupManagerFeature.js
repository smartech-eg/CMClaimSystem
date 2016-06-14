define(
		[ "dojo/_base/declare", "dojo/_base/lang",
				"ecm/widget/layout/_LaunchBarPane",
                "idx/layout/BorderContainer",
                "dijit/layout/ContentPane",
				"dojo/parser",
				"dijit/layout/TabContainer",
				"dojox/layout/TableContainer",
				"dijit/form/Button",
				"dijit/form/TextBox",
				"ecm/model/Request",
				"dojox/grid/DataGrid",
				"dojox/grid/cells",
				"dojox/grid/cells/dijit",
				"dijit/form/DateTextBox",
				"dojo/data/ItemFileWriteStore",
				"ecm/model/Repository",
 				"ecm/model/User",
				"ecm/widget/dialog/BaseDialog",
				"ecm/model/Desktop",
				"dojo/request/iframe",
				"dojo/text!./templates/LookupManagerFeature.html" ],
		function(declare, lang, _LaunchBarPane, idxBorderContainer,
				dojoxLayoutTableContainer, ContentPane, parser, tabContainer,
				Button, TextBox, Request, DataGrid, cells, cellsDijit,
				DateTextBox, ItemFileWriteStore, repository,User, BaseDialog, Desktop, dojoRequest,
				template) {
			
			return declare(
					"hk.com.claim.widgets.featuresDojo.LookupManagerFeature",
					[ _LaunchBarPane ],
					{
						/** @lends iGReportsDojo.CPAReportsFeature.prototype */

						templateString : template,
						webAppURL : "",
						// Set to true if widget template contains DOJO widgets.
						widgetsInTemplate : true,
						repository : null,
						dataObject : "",
						records : "",
						modifiedIndex : "",
						postCreate : function() {
						this.inherited(arguments);
							var wid = this;

							

							/*ecm.model.desktop.loadDesktop(null, function() {
								var repository = ecm.model.desktop
										.getDefaultRepository();
								if (repository.connected) {
									wid.repository = repository;
								}
							}, true);
							*/

							var data = {
								items : []
							};

							var serviceParams = new Object();
							
							Request
									.invokePluginService(
											"claimCustomPlugin",
											"getConfigDataService",
											{
												requestParams : serviceParams,
												requestCompleteCallback : function(
														response) {
													var jsonResponse = dojo
															.toJson(response,
																	true, "  ");
													dataObject = JSON
															.parse(jsonResponse);
													records = new Array();

													for (i = 0; i < dataObject.length; i++) {

														var ID = dataObject[i].ID;
														var disc = dataObject[i].Disc;
														var value = dataObject[i].Value;
														
														data.items
																.push({
																	"ID" : ID,
																	"Disc" : disc,
																	"Value" : value 
																});
													}
													var store = new ItemFileWriteStore(
															{
																data : data
															});

													wid.configDataGrid
															.setStore(store);
													var gridLayout = [ {
														defaultCell : {
															width : 8,
															editable : true,
															type : cells._Widget,
															styles : 'text-align: right;'
														},
														cells : [
																{
																	name : 'ID',
																	field : 'ID',
																	styles : 'text-align: center;',
																	editable : false,
																	width : '11%'
																},
																{
																	name : 'Disc',
																	field : 'Disc',
																	styles : 'text-align: center;',
																	editable : false,
																	width : '11%'
																},
																{
																	name : 'Value',
																	field : 'Value',
																	styles : 'text-align: center;',
																	editable : true,
																	width : '11%'
																}]
													} ];

													

													wid.configDataGrid
															.setStructure(gridLayout);

													wid.configDataGrid.resize();
												}
											});

						
							this.logExit("postCreate");
						},

						/**
						 * Optional method that sets additional parameters when
						 * the user clicks on the launch button associated with
						 * this feature.
						 */
						setParams : function(params) {
							this.logEntry("setParams", params);

							if (params) {

								if (!this.isLoaded && this.selected) {
									this.loadContent();
								}
							}

							this.logExit("setParams");
						},

						/**
						 * Loads the content of the pane. This is a required
						 * method to insert a pane into the LaunchBarContainer.
						 */
						loadContent : function() {
							this.logEntry("loadContent");

							if (!this.isLoaded) {
								/**
								 * Add custom load logic here. The
								 * LaunchBarContainer widget will call this
								 * method when the user clicks on the launch
								 * button associated with this feature.
								 */
								this.isLoaded = true;
								this.needReset = false;
							}

							this.logExit("loadContent");
						},

						/**
						 * Resets the content of this pane.
						 */
						reset : function() {
							this.logEntry("reset");

							/**
							 * This is an option method that allows you to force
							 * the LaunchBarContainer to reset when the user
							 * clicks on the launch button associated with this
							 * feature.
							 */
							this.needReset = false;

							this.logExit("reset");
						},
						OnSave : function() {
							var wid = this;
							var serviceParams = new Object();
							var jsonStr = "[";

							for (var j = 0; j < dataObject.length; j++) {
								if (j != 0)
									jsonStr += ',';
								var item = wid.configDataGrid.store._arrayOfAllItems[j];
 								dataObject[j].ID = item.ID;
								dataObject[j].Disc = item.Disc;
								dataObject[j].Value = item.Value;
								jsonStr += '{"ID":"'
										+ item.ID
										+ '","Disc":"'
										+ item.Disc
										+ '","Value":"'
										+ item.Value
										+ '"}';
							}
							jsonStr += "]";
							serviceParams.inputJSON = jsonStr;

							Request
									.invokePluginService(
											"claimCustomPlugin",
											"saveConfigDataService",
											{
												requestParams : serviceParams,
												synchronous : true,
												requestCompleteCallback : function(
														response) {
													records = new Array();
													alert("Save operation completed successfully");

												}
											});

						},
						

					});
		});
