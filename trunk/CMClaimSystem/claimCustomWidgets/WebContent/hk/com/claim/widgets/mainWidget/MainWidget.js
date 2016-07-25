/*
This is the main widget of the application that carries all UI elements (tabs,buttons,...etc)
*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/text!./templates/MainWidget.html",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
	"dojo/dom-construct",
	"dojox/grid/DataGrid", 
	"dojo/data/ItemFileWriteStore",
	"dijit/_AttachMixin",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"icm/base/BasePageWidget",
    "icm/base/_BaseWidget",
	"icm/base/BaseActionContext",
	"ecm/model/Desktop",
	"icm/action/Action",
	"icm/model/Case",
	"dojo/_base/array",
	"ecm/model/Request",
	"dijit/Menu",
    "dijit/MenuItem",
    "dijit/CheckedMenuItem",
    "dijit/MenuSeparator",
    "dijit/PopupMenuItem",
	"icm/widget/menu/MenuManager",
	"icm/widget/menu/ContextualMenu",
	"ecm/widget/dialog/AddContentItemDialog",
	"dojo/dom-style",
	"./ConfirmDialog",
	"dojo/store/Memory",
	"dojo/window",
	"icm/action/workitem/MoveToInbox",
	"icm/model/WorkItem",
	"icm/util/WorkItemHandler",
	"icm/model/properties/controller/ControllerManager",
	"icm/base/Constants"
    ],

    function(declare, lang, 
        template, TabContainer, ContentPane,domConstruct,DataGrid,ItemFileWriteStore,_AttachMixin,_Widget,_TemplatedMixin,_WidgetsInTemplateMixin,BasePageWidget,_BaseWidget,BaseActionContext,Desktop,Action,Case,array,Request
		,Menu,MenuItem,CheckedMenuItem,MenuSeparator,PopupMenuItem,MenuManager,ContextualMenu,AddContentItemDialog,domStyle,ConfirmDialog,Memory,win,MoveToInbox
		,ControllerManager,Constants){
		
		
        return declare("hk.com.claim.widgets.mainWidget.MainWidget",  [_BaseWidget,BasePageWidget, BaseActionContext], {
        	templateString: template,
            widgetsInTemplate: true,
			menu: null,
			myCase: null,
			claimURL: "",
			lapsePeriods: new Object(),
            constructor: function(context){
				this.context=context;
            },
			/*
			This function called automatically after widget creation
			*/
			postCreate: function(){
            	this.inherited(arguments);
				var wid=this;
				var repository=wid.getSolution().getTargetOS();
				Request.invokePluginService("claimCustomPlugin", "configurationService",
				{
					synchronous:true,
					requestCompleteCallback: function(response) {	// success
						var jsonResponse=dojo.toJson(response, true, "  ");
						var obj = JSON.parse(jsonResponse);
						wid.claimURL=obj.configuration[0].value;
					}
				});
				/*
				Row click event handler for the filings grid
				Enables/Disables button according to the filing type
				Display the filing image in the viewer
				*/
				this.docsDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex,
					rowData = wid.docsDataGrid.getItem(idx);
					repository.retrieveItem(rowData.GUID, lang.hitch(wid, function(retItem) {
						//var acn=new Action();
						/*wid.onPublishEvent("icm.SelectDocument", {
							contentItem : retItem
						});*/
						var payload = {"contentItem": retItem, "action": "open"};
						wid.onBroadcastEvent("icm.OpenDocument", payload);
					}));
				});
				
				this.btnShowClaim.on("Click", function(evt){
					var myWindow = window.open(wid.claimURL, "claimWindow", "width=1200px,height=600px,toolbar=no,titlebar=no,status=no");
				});
				
            },

			/*
			This function called automatically passing job information to the widget
			*/
			handleICM_eSoSCaseEvent: function(payload){
				var wid=this;
				var myCase=payload.workItemEditable.getCase();
				this.myCase=myCase;
				var repository=wid.getSolution().getTargetOS();
				
				myCase.retrieveAttributes(lang.hitch(this,function(retAtt){
					myCase.retrieveCaseFolder(lang.hitch(this,function(retFol){
						console.log(retAtt);
						
								
						if(payload.workItemEditable.icmWorkItem.queueName != 'Inbox'){
							var serviceParams = new Object();
							serviceParams.user_id = repository.userId;
							serviceParams.user_group = retAtt.attributes['GLCL_Team'];
							serviceParams.user_amount = retAtt.attributes['GLCL_TotalIncurredAmount'];
							Request.invokePluginService("claimCustomPlugin", "CheckUserAmount",
							{
								requestParams: serviceParams,
								synchronous:true,
								requestCompleteCallback: function(response) {
									var jsonResponse=dojo.toJson(response, true, "  ");
									var obj = JSON.parse(jsonResponse);
									if(obj[0].isUserinRange==true){
										payload.workItemEditable.icmWorkItem.moveToInbox(function(test){
											alert("The selected job has been moved to your personal inbox please open it again for processing");
											window.location.reload(false);
										});
									}
									else{
										payload.workItemEditable.icmWorkItem.abortStep(function(ret){
											alert("Sorry you don't have permissions to process this job !!!");
											window.location.reload(false);
										});
									}
									console.log(obj);
								}
							});
							
						}
						//wid.txtBatchNumber.setValue(retAtt.attributes['GLCL_BatchNumber']);
						//wid.txtClaimNumber.setValue(retAtt.attributes['GLCL_ClaimNumber']);
						//wid.txtMemberNumber.setValue(retAtt.attributes['GLCL_MemberNumber']);
						//wid.txtPolicyNumber.setValue(retAtt.attributes['GLCL_PolicyNumber']);
						wid.setAttributesValues(retAtt);
						/*Retrieves the job details information
						*/
						retFol.retrieveFolderContents(false, function(results) {
							var items = [];
							var itemIds = [];
							array.forEach(results.items, function(item){
								if(!item.isFolder()){
									items.push(item);
									itemIds.push(item.id.toString().split(',')[2]);
								}
							});
							console.log(itemIds);
							
							if(itemIds.length){
								var serviceInput=[];
								repository.retrieveMultiItem(itemIds,lang.hitch(this,function(retItems){
									var data = {
									  identifier: "GUID",
									  items: []
									};
									array.forEach(retItems,function(item){
										serviceInput.push('{"Filing_Number":"'+item.attributes['DocumentTitle']+'","GUID":"'+item.attributes['Id']+'"}');
										var GUID=item.attributes['Id'];
										var filingNumber=item.attributes['DocumentTitle'];
										var filingDate=item.attributes['DateCreated'];
										
										data.items.push({ 
											"GUID":GUID,
											"Filing_Number" : filingNumber,
											"Filing_Date"  : filingDate
										});
										
									});
									var store = new ItemFileWriteStore({data: data});
									wid.docsDataGrid.setStore(store);
									var layout = [[
									  {'name': 'id', 'field': 'GUID', 'hidden':true},
									  {'name': 'Document Name', 'field': 'Filing_Number', 'width': '50%'},
									  {'name': 'Creation Date', 'field': 'Filing_Date', 'width': '50%'}
									]];
									wid.docsDataGrid.setStructure(layout);
									wid.docsDataGrid.resize();
									
								}));
							}
						});
					}));
							
						
				}));
				
			},
			/*
			This function called automatically when the save job button clicked
			Saved submitter and sentto information
			*/
			handleICM_SaveCaseEvent: function(payload){
				
			},
			
			setAttributesValues: function(retAtt){
				var wid=this;
				wid.txtAccessorGroup.setValue(retAtt.attributes['GLCL_AccessorGroup']);
				wid.txtAdjustmentDate.setValue(retAtt.attributes['GLCL_AdjustmentDate']);
				wid.txtBatchNumber.setValue(retAtt.attributes['GLCL_BatchNumber']);
				wid.txtClaimApprovalUser.setValue(retAtt.attributes['GLCL_ClaimApprovalUser']);
				wid.txtClaimCopmany.setValue(retAtt.attributes['GLCL_ClaimCopmany']);
				wid.txtClaimNumber.setValue(retAtt.attributes['GLCL_ClaimNumber']);
				wid.txtClaimPrefix.setValue(retAtt.attributes['GLCL_ClaimPrefix']);
				wid.txtClaimRegisterUser.setValue(retAtt.attributes['GLCL_ClaimRegisterUser']);
				wid.txtClaimType.setValue(retAtt.attributes['GLCL_ClaimType']);
				wid.txtDiagnosisCode.setValue(retAtt.attributes['GLCL_DiagnosisCode']);
				wid.txtDOS.setValue(retAtt.attributes['GLCL_DOS']);
				wid.txtEscalationGroup.setValue(retAtt.attributes['GLCL_EscalationGroup']);
				wid.txtExcludeFromStatistic.setValue(retAtt.attributes['GLCL_ExcludeFromStatistic']);
				wid.txtHardCopy.setValue(retAtt.attributes['GLCL_HardCopy']);
				wid.txtHold.setValue(retAtt.attributes['GLCL_Hold']);
				wid.txtInputGroup.setValue(retAtt.attributes['GLCL_InputGroup']);
				wid.txtMemberHKID.setValue(retAtt.attributes['GLCL_MemberHKID']);
				wid.txtMemberID.setValue(retAtt.attributes['GLCL_MemberID']);
				wid.txtMemberNumber.setValue(retAtt.attributes['GLCL_MemberNumber']);
				wid.txtMode.setValue(retAtt.attributes['GLCL_Mode']);
				wid.txtPaymentDate.setValue(retAtt.attributes['GLCL_PaymentDate']);
				wid.txtPaymentStatus.setValue(retAtt.attributes['GLCL_PaymentStatus']);
				wid.txtPending1.setValue(retAtt.attributes['GLCL_Pending1']);
				wid.txtPendingReason.setValue(retAtt.attributes['GLCL_PendingReason']);
				wid.txtPolicyName.setValue(retAtt.attributes['GLCL_PolicyName']);
				wid.txtPolicyNumber.setValue(retAtt.attributes['GLCL_PolicyNumber']);
				wid.txtProcessDate.setValue(retAtt.attributes['GLCL_ProcessDate']);
				wid.txtProviderName.setValue(retAtt.attributes['GLCL_ProviderName']);
				wid.txtRecievedDate.setValue(retAtt.attributes['GLCL_RecievedDate']);
				wid.txtStatus.setValue(retAtt.attributes['GLCL_Status']);
				wid.txtSupervisorGroup.setValue(retAtt.attributes['GLCL_SupervisorGroup']);
				wid.txtTeam.setValue(retAtt.attributes['GLCL_Team']);
				wid.txtTotalIncurredAmount.setValue(retAtt.attributes['GLCL_TotalIncurredAmount']);
				wid.txtTotalPaidAmount.setValue(retAtt.attributes['GLCL_TotalPaidAmount']);
				wid.txtTotalShortfallAmount.setValue(retAtt.attributes['GLCL_TotalShortfallAmount']);
			}
        });
});