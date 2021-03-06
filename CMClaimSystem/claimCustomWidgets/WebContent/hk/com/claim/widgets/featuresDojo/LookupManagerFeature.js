define(
		[ "dojo/_base/declare", "dojo/_base/lang",
				"ecm/widget/layout/_LaunchBarPane",
				"idx/layout/BorderContainer", "dijit/layout/ContentPane",
				"dojo/parser", "dijit/layout/TabContainer",
				"dojox/layout/TableContainer", "dijit/form/Button",
				"dijit/form/TextBox", "ecm/model/Request",
				"dojox/grid/DataGrid", "dojox/grid/cells",
				"dojox/grid/cells/dijit", "dijit/form/DateTextBox",
				"dojo/data/ItemFileWriteStore", "ecm/model/Repository",
				"ecm/model/User", "ecm/widget/dialog/BaseDialog",
				"ecm/model/Desktop", "dojo/request/iframe",
				"dojo/text!./templates/LookupManagerFeature.html" ],
		function(declare, lang, _LaunchBarPane, idxBorderContainer,
				dojoxLayoutTableContainer, ContentPane, parser, tabContainer,
				Button, TextBox, Request, DataGrid, cells, cellsDijit,
				DateTextBox, ItemFileWriteStore, repository, User, BaseDialog,
				Desktop, dojoRequest, template) {

			return declare(
					"hk.com.claim.widgets.featuresDojo.LookupManagerFeature",
					[ _LaunchBarPane ],
					{

						templateString : template,
						webAppURL : "",
						// Set to true if widget template contains DOJO widgets.
						widgetsInTemplate : true,
						repository : null,
						dataObject : "",
						records : "",
						userInfoObject : "",
						usrsRecords : "",
						modifiedIndex : "",
						stores :"",
						postCreate : function() {
							this.inherited(arguments);
							var wid = this;

							ecm.model.desktop.loadDesktop(null, function() {
								var repository = ecm.model.desktop
										.getDefaultRepository();
								if (repository.connected) {
									wid.repository = repository;
								}
							}, true);

							var data = {
								items : []
							};

							var usrData = {
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

														data.items.push({
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
															editable : true,
															type : cells._Widget,
															styles : 'text-align: left;'
														},
														cells : [
																{
																	name : 'ID',
																	field : 'ID',
																	styles : 'text-align: left;',
																	editable : false,
																	width : '7%'
																},
																{
																	name : 'Value',
																	field : 'Value',
																	styles : 'text-align: left;',
																	editable : true,
																	width : '9%',
																	formatter : function(
																			item,
																			rowIndex,
																			cell) {

																		var gridRow = wid.configDataGrid
																				.getItem(rowIndex);
																		if (gridRow["ID"] == "Password") {

																			return "*********";
																		} else {
																			return gridRow["Value"];
																		}

																	}
																},
																{
																	name : 'Description',
																	field : 'Disc',
																	styles : 'text-align: left;',
																	editable : false,
																	width : '15%'
																}

														]
													} ];

													wid.configDataGrid
															.setStructure(gridLayout);

													wid.configDataGrid.onApplyCellEdit = function(
															inValue,
															inRowIndex,
															inFieldIndex) {

														if (dataObject[inRowIndex].Value != inValue) {
															records
																	.push(inRowIndex);
														}
													};

													wid.configDataGrid.resize();
												}
											});

							// /User Info Tab

							var service = new Object();
							Request
									.invokePluginService(
											"claimCustomPlugin",
											"getUserDataService",
											{
												requestParams : service,
												requestCompleteCallback : function(
														response) {

													var jsonResponse = dojo
															.toJson(response,
																	true, "  ");

													userInfoObject = JSON
															.parse(jsonResponse);

													usrsRecords = new Array();
													for (i = 0; i < userInfoObject.length; i++) {
														var ID = userInfoObject[i].ID
														var User_Id = userInfoObject[i].User_Id;
														var User_Team = userInfoObject[i].User_Team;
														var User_Group = userInfoObject[i].User_Group;
														var Min_Amount = userInfoObject[i].Min_Amount;
														var Max_Amount = userInfoObject[i].Max_Amount;
														usrData.items
																.push({
																	"ID" : ID,
																	"User_Id" : User_Id,
																	"User_Team" : User_Team,
																	"User_Group" : User_Group,
																	"Min_Amount" : Min_Amount,
																	"Max_Amount" : Max_Amount

																});
													}

													 stores = new ItemFileWriteStore(
															{
																data : usrData
															});

													wid.usersDataGrid
															.setStore(stores);
													var usergridLayout = [ {
														defaultCell : {
															editable : true,
															type : cells._Widget,
															styles : 'text-align: left;'
														},
														cells : [
																{
																	name : 'User_Id',
																	field : 'User_Id',
																	styles : 'text-align: left;',
																	editable : true,
																	width : '7%'
																},
																{
																	name : 'User_Team',
																	field : 'User_Team',
																	styles : 'text-align: left;',
																	editable : true,
																	width : '9%'

																},
																{
																	name : 'User_Group',
																	field : 'User_Group',
																	styles : 'text-align: left;',
																	editable : true,
																	width : '15%'
																},
																{
																	name : 'Min_Amount',
																	field : 'Min_Amount',
																	styles : 'text-align: left;',
																	editable : true,
																	width : '15%'
																},
																{
																	name : 'Max_Amount',
																	field : 'Max_Amount',
																	styles : 'text-align: left;',
																	editable : true,
																	width : '15%'
																}

														]
													} ];

													wid.usersDataGrid
															.setStructure(usergridLayout);

													wid.usersDataGrid.onApplyCellEdit = function(
															inValue,
															inRowIndex,
															inFieldIndex) {
                                                      var gridRow= wid.usersDataGrid.getItem(inRowIndex);
													 
														if (usrsRecords
																.indexOf(inRowIndex) == -1) {
															usrsRecords
																	.push(inRowIndex);
														}

													};
													wid.usersDataGrid.resize();
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

							for (var j = 0; j < records.length; j++) {
								if (j != 0)
									jsonStr += ',';
								var item = wid.configDataGrid.store._arrayOfAllItems[records[j]];
								dataObject[j].ID = item.ID;
								dataObject[j].Disc = item.Disc;
								dataObject[j].Value = item.Value;
								jsonStr += '{"ID":"' + item.ID + '","Disc":"'
										+ item.Disc + '","Value":"'
										+ item.Value + '"}';
							}
							jsonStr += "]";
							serviceParams.inputJSON = jsonStr;
							serviceParams.user = wid.repository.userId;
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
																					.toJson(
																							response,
																							true,
																							"  ");
																			dataObject = JSON
																					.parse(jsonResponse);
																		}
																	});

												}
											});

						},
                        OnAddRow:function() {
						stores.newItem({ID :"", User_Id : ".",User_Team :"",User_Group:"",Min_Amount :"",Max_Amount:""});
						
						},
						OnSaveUsers : function() {
							var wid = this;
							var serviceParams = new Object();
							var jsonStr = "[";

							for (var j = 0; j < usrsRecords.length; j++) {
								if (j != 0)
									jsonStr += ',';
								var item = wid.usersDataGrid.store._arrayOfAllItems[usrsRecords[j]];
								userInfoObject[j].ID = item.ID;
								userInfoObject[j].User_Id = item.User_Id;
								userInfoObject[j].User_Team = item.User_Team;
								userInfoObject[j].User_Group = item.User_Group;
								userInfoObject[j].Min_Amount = item.Min_Amount;
								userInfoObject[j].Max_Amount = item.Max_Amount;

								jsonStr += '{"ID":"' + item.ID
										+ '","User_Id":"' + item.User_Id
										+ '","User_Team":"' + item.User_Team
										+ '","User_Group":"' + item.User_Group
										+ '","Min_Amount":"' + item.Min_Amount
										+ '","Max_Amount":"' + item.Max_Amount
										+ '"}';
							}
							jsonStr += "]";

							serviceParams.inputJSON = jsonStr;
							serviceParams.user = wid.repository.userId;
							Request
									.invokePluginService(
											"claimCustomPlugin",
											"saveUserDataService",
											{
												requestParams : serviceParams,
												synchronous : true,
												requestCompleteCallback : function(
														response) {
													usrsRecords = new Array();
													alert("Save operation completed successfully");

													var serviceParams = new Object();

													Request
															.invokePluginService(
																	"claimCustomPlugin",
																	"getUserDataService",
																	{
																		requestParams : serviceParams,
																		requestCompleteCallback : function(
																				response) {
																			var jsonResponse = dojo
																					.toJson(
																							response,
																							true,
																							"  ");
																			userInfoObject = JSON
																					.parse(jsonResponse);
																		}
																	});

												}
											});

						},

					});
		});
