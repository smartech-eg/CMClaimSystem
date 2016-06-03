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
			jobNumber: null,
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
					var myWindow = window.open("http://www.google.com", "claimWindow", "width=1200px,height=600px,toolbar=no,titlebar=no,status=no");
				});
				
            },

			/*
			This function called automatically passing job information to the widget
			*/
			handleICM_eSoSCaseEvent: function(payload){
				var wid=this;
				var myCase=payload.workItemEditable.getCase();
				this.myCase=myCase;
				myCase.retrieveAttributes(lang.hitch(this,function(retAtt){
					myCase.retrieveCaseFolder(lang.hitch(this,function(retFol){
						console.log(retAtt);
						wid.txtBatchNumber.setValue(retAtt.attributes['GLCL_BatchNumber']);
						wid.txtClaimNumber.setValue(retAtt.attributes['GLCL_ClaimNumber']);
						wid.txtMemberNumber.setValue(retAtt.attributes['GLCL_MemberNumber']);
						wid.txtPolicyNumber.setValue(retAtt.attributes['GLCL_PolicyNumber']);
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
							var repository=wid.getSolution().getTargetOS();
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
				
			}
			
        });
});