define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/text!./templates/ClaimMainWidget.html",
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
		
		
        return declare("hk.com.claim.widgets.claimMainWidget.ClaimMainWidget",  [_BaseWidget,BasePageWidget, BaseActionContext], {
        	templateString: template,
            widgetsInTemplate: true,
			menu: null,
			myCase: null,
			jobNumber: null,
			lapsePeriods: new Object(),
			lastLapse:'',
            constructor: function(context){
				this.context=context;
            },
			testFun:function(){
				var wid=this;
				wid.getSolution().retrieveAllRoleMembers("Filing Officer",function(users){
					console.log(users);
					array.forEach(users.members,function(user){
						console.log(user.name);
					});
				});
				
			},
			postCreate: function(){
            	this.inherited(arguments);
				var wid=this;
				wid.testFun();
				//wid.testIFrame='<iframe width="1000" height="800" data-dojo-attach-point="testIFrame" src="http://www.google.com">';
				//console.log("teeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeest");
				console.log(wid.testIFrame);
				var repository=wid.getSolution().getTargetOS();
				
				this.docsDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex,
					rowData = wid.docsDataGrid.getItem(idx);
					if(ecm.model.desktop.currentRole.name == "Supervisor" || ecm.model.desktop.currentRole.name == "Filing Officer" ){
						wid.btnDeleteDoc.set("disabled",false);
						
					}
					wid.btnRejectLetter.set("disabled",false);
					repository.retrieveItem(rowData.GUID, lang.hitch(wid, function(retItem) {
						repository.retrieveItem(rowData.GUID, lang.hitch(wid, function(releasedItem) {
							if(releasedItem.attributes['ESOS_DocType']=='Tax Lien'){
								wid.btnDebtor.set("disabled",true);
								wid.btnUCC11.set("disabled",true);
								wid.btnTaxLien.set("disabled",false);
							}
							else if(releasedItem.attributes['ESOS_DocType']=='UCC11'){
								wid.btnDebtor.set("disabled",true);
								wid.btnTaxLien.set("disabled",true);
								wid.btnUCC11.set("disabled",false);
							}
							else{
								wid.btnDebtor.set("disabled",false);
								wid.btnTaxLien.set("disabled",true);
								wid.btnUCC11.set("disabled",true);
							}
							if(releasedItem.attributes['ESOS_Stamped'] != true && releasedItem.attributes['ESOS_Stamped'] != 'true'){
								var serviceParams = new Object();
								var jsonStr="['"+releasedItem.attributes['DocumentTitle']+"']";
								serviceParams.input = jsonStr;
								Request.invokePluginService("claimCustomPlugin", "stampService",
								{
									requestParams: serviceParams,
									synchronous:true,
									requestCompleteCallback: function(response) {
										repository.retrieveItem(rowData.GUID, lang.hitch(wid, function(finalVersion) {
										var properties = [{"name": "ESOS_Stamped","value" : true},{"name": "ESOS_Redaction_Reviewed","value" : true}];
											finalVersion.saveAttributes(properties,finalVersion.template,null,null,false,function(response) {
												var payload = {"contentItem": finalVersion, "action": "open"};
												wid.onBroadcastEvent("icm.OpenDocument", payload);
											});
										}),releasedItem.template,"released",releasedItem.vsId);
									}
								});
							}
							else{
								var payload = {"contentItem": releasedItem, "action": "open"};
								wid.onBroadcastEvent("icm.OpenDocument", payload);
								var properties = [{"name": "ESOS_Redaction_Reviewed","value" : true}];
								releasedItem.saveAttributes(properties,releasedItem.template,null,null,false,function(response) {
								});
							}
							console.log("teeeeeeeeeeeeest");
							console.log(releasedItem);
						}),retItem.template,"released",retItem.vsId);
					}));
				});
				
				this.debtorDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex;
					var size=wid.debtorDataGrid.store._arrayOfTopLevelItems.length;
					var item = wid.debtorDataGrid.getItem(idx);
					wid.btnViewDeptor.set("disabled",false);
					if(item.FromEsos=='true')
						wid.btnDeleteDebtor.set("disabled",true);
					else
						wid.btnDeleteDebtor.set("disabled",false);
					wid.btnCopyDebtor.set("disabled",false);
					if(idx != (size -1))
						wid.btnMoveDebtorDown.set("disabled",false);
					else
						wid.btnMoveDebtorDown.set("disabled",true);
					if(idx != 0)
						wid.btnMoveDebtorUp.set("disabled",false);
					else
						wid.btnMoveDebtorUp.set("disabled",true);
				});
				
				this.debtorDataGrid.on("StyleRow", function(row){
					var item = wid.debtorDataGrid.getItem(row.index);
					if(item){
						if(item.FromEsos=='true')
							row.customStyles += "background-color:#DEA4A3;";
						else
							row.customStyles += "background-color:#FFFF64;";
					 }
					 wid.debtorDataGrid.focus.styleRow(row);
					 wid.debtorDataGrid.edit.styleRow(row);
				});
				
				this.securePartyDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex;
					var size=wid.securePartyDataGrid.store._arrayOfTopLevelItems.length;
					var item = wid.securePartyDataGrid.getItem(idx);
					if(theDialog.get("title") == 'Tax Payer'){
						wid.btnViewSecureParty.set("disabled",true);
						wid.btnDeleteSecuredParty.set("disabled",true);
						wid.btnCopySecuredParty.set("disabled",true);
					}
					else{
						wid.btnViewSecureParty.set("disabled",false);
						if(item.FromEsos=='true'){
							wid.btnDeleteSecuredParty.set("disabled",true);
						}
						else{
							wid.btnDeleteSecuredParty.set("disabled",false);
						}
						wid.btnCopySecuredParty.set("disabled",false);
					}
					if(idx != (size -1))
						wid.btnMoveSecuredPartyDown.set("disabled",false);
					else
						wid.btnMoveSecuredPartyDown.set("disabled",true);
					if(idx != 0)
						wid.btnMoveSecuredPartyUp.set("disabled",false);
					else
						wid.btnMoveSecuredPartyUp.set("disabled",true);
				});
				
				this.securePartyDataGrid.on("StyleRow", function(row){
					var item = wid.securePartyDataGrid.getItem(row.index);
					if(item){
						if(item.FromEsos=='true')
							row.customStyles += "background-color:#C8DAA3;";
						else
							row.customStyles += "background-color:#FFFF64;";
					 }
					 wid.securePartyDataGrid.focus.styleRow(row);
					 wid.securePartyDataGrid.edit.styleRow(row);
				});
				/*
				this.menu = new ContextualMenu({
             	    dojoAttachPoint: "customContextualMenu" //consistent to the id value of the contextualMenu's definition in the page widget definition json file;
                 });
				 
				 this.contextualMenuStore.appendChild(this.menu.domNode); 
				 
				 MenuManager.setTargetReference(this.menu, "contextualMenuTargetRefPoint");
				 MenuManager.setSelectedItems(this.id, "contextualMenuTargetRefPoint", [{customProperty: true}], "CustomContext");
				this.menu.startup();
				*/
				
				
				this.notesDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex;
					var rowData = wid.notesDataGrid.getItem(idx);
					if((wid.notesDataGrid.store._arrayOfTopLevelItems.length == (idx+1)) && rowData.User==wid.getSolution().getTargetOS().userId)
						wid.btnDltNote.set("disabled",false);
					else
						wid.btnDltNote.set("disabled",true);
				});
				
				this.btnMoveSecuredPartyDown.on("click",function(evt){
					var fromRow = wid.securePartyDataGrid.selection.getSelected()[0];
					var fromIndex=fromRow._0;
					var toRow = wid.securePartyDataGrid.store._arrayOfTopLevelItems[fromIndex+1];
					var name1=fromRow.name;
					var name2=toRow.name;
					
					var address1=fromRow.address;
					var address2=toRow.address;
					
					var securePartyId1=fromRow.securePartyId;
					var securePartyId2=toRow.securePartyId;
					
					var rowType1=fromRow.rowType;
					var rowType2=toRow.rowType;
					
					var FromOCR1=fromRow.FromOCR;
					var FromOCR2=toRow.FromOCR;
					
					var IsEditable1=fromRow.IsEditable;
					var IsEditable2=toRow.IsEditable;
					
					var FromEsos1=fromRow.FromEsos;
					var FromEsos2=toRow.FromEsos;
					
					wid.securePartyDataGrid.store.setValue(fromRow, 'name', name2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'address', address2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'securePartyId', securePartyId2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'FromOCR', FromOCR2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'IsEditable', IsEditable2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'FromEsos', FromEsos2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'rowType', rowType2);
					
					wid.securePartyDataGrid.store.setValue(toRow, 'name', name1);
					wid.securePartyDataGrid.store.setValue(toRow, 'address', address1);
					wid.securePartyDataGrid.store.setValue(toRow, 'securePartyId', securePartyId1);
					wid.securePartyDataGrid.store.setValue(toRow, 'FromOCR', FromOCR1);
					wid.securePartyDataGrid.store.setValue(toRow, 'IsEditable', IsEditable1);
					wid.securePartyDataGrid.store.setValue(toRow, 'FromEsos', FromEsos1);
					wid.securePartyDataGrid.store.setValue(toRow, 'rowType', rowType1);
					
					wid.securePartyDataGrid.selection.setSelected(fromIndex,false);
					wid.securePartyDataGrid.selection.setSelected(fromIndex+1,true);
					wid.securePartyDataGrid.update();
					var size=wid.securePartyDataGrid.store._arrayOfTopLevelItems.length;
					
					if((fromIndex+1) == (size -1))
						wid.btnMoveSecuredPartyDown.set("disabled",true);
					wid.btnMoveSecuredPartyUp.set("disabled",false);
				});
				
				this.btnMoveSecuredPartyUp.on("click",function(evt){
					var fromRow = wid.securePartyDataGrid.selection.getSelected()[0];
					var fromIndex=fromRow._0;
					var toRow = wid.securePartyDataGrid.store._arrayOfTopLevelItems[fromIndex-1];
					var name1=fromRow.name;
					var name2=toRow.name;
					
					var address1=fromRow.address;
					var address2=toRow.address;
					
					var securePartyId1=fromRow.securePartyId;
					var securePartyId2=toRow.securePartyId;
					
					var rowType1=fromRow.rowType;
					var rowType2=toRow.rowType;
					
					var FromOCR1=fromRow.FromOCR;
					var FromOCR2=toRow.FromOCR;
					
					var IsEditable1=fromRow.IsEditable;
					var IsEditable2=toRow.IsEditable;
					
					var FromEsos1=fromRow.FromEsos;
					var FromEsos2=toRow.FromEsos;
					
					wid.securePartyDataGrid.store.setValue(fromRow, 'name', name2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'address', address2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'securePartyId', securePartyId2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'FromOCR', FromOCR2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'IsEditable', IsEditable2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'FromEsos', FromEsos2);
					wid.securePartyDataGrid.store.setValue(fromRow, 'rowType', rowType2);
					
					wid.securePartyDataGrid.store.setValue(toRow, 'name', name1);
					wid.securePartyDataGrid.store.setValue(toRow, 'address', address1);
					wid.securePartyDataGrid.store.setValue(toRow, 'securePartyId', securePartyId1);
					wid.securePartyDataGrid.store.setValue(toRow, 'FromOCR', FromOCR1);
					wid.securePartyDataGrid.store.setValue(toRow, 'IsEditable', IsEditable1);
					wid.securePartyDataGrid.store.setValue(toRow, 'FromEsos', FromEsos1);
					wid.securePartyDataGrid.store.setValue(toRow, 'rowType', rowType1);
					
					wid.securePartyDataGrid.selection.setSelected(fromIndex,false);
					wid.securePartyDataGrid.selection.setSelected(fromIndex-1,true);
					wid.securePartyDataGrid.update();
					var size=wid.securePartyDataGrid.store._arrayOfTopLevelItems.length;
					
					if((fromIndex-1) == 0)
						wid.btnMoveSecuredPartyUp.set("disabled",true);
					wid.btnMoveSecuredPartyDown.set("disabled",false);
				});
				
				this.btnMoveDebtorDown.on("click",function(evt){
					var fromRow = wid.debtorDataGrid.selection.getSelected()[0];
					var fromIndex=fromRow._0;
					var toRow = wid.debtorDataGrid.store._arrayOfTopLevelItems[fromIndex+1];
					var name1=fromRow.name;
					var name2=toRow.name;
					
					var address1=fromRow.address;
					var address2=toRow.address;
					
					var debtorId1=fromRow.debtorId;
					var debtorId2=toRow.debtorId;
					
					var rowType1=fromRow.rowType;
					var rowType2=toRow.rowType;
					
					var FromOCR1=fromRow.FromOCR;
					var FromOCR2=toRow.FromOCR;
					
					var IsEditable1=fromRow.IsEditable;
					var IsEditable2=toRow.IsEditable;
					
					var FromEsos1=fromRow.FromEsos;
					var FromEsos2=toRow.FromEsos;
					
					wid.debtorDataGrid.store.setValue(fromRow, 'name', name2);
					wid.debtorDataGrid.store.setValue(fromRow, 'address', address2);
					wid.debtorDataGrid.store.setValue(fromRow, 'debtorId', debtorId2);
					wid.debtorDataGrid.store.setValue(fromRow, 'FromOCR', FromOCR2);
					wid.debtorDataGrid.store.setValue(fromRow, 'IsEditable', IsEditable2);
					wid.debtorDataGrid.store.setValue(fromRow, 'FromEsos', FromEsos2);
					wid.debtorDataGrid.store.setValue(fromRow, 'rowType', rowType2);
					
					wid.debtorDataGrid.store.setValue(toRow, 'name', name1);
					wid.debtorDataGrid.store.setValue(toRow, 'address', address1);
					wid.debtorDataGrid.store.setValue(toRow, 'debtorId', debtorId1);
					wid.debtorDataGrid.store.setValue(toRow, 'FromOCR', FromOCR1);
					wid.debtorDataGrid.store.setValue(toRow, 'IsEditable', IsEditable1);
					wid.debtorDataGrid.store.setValue(toRow, 'FromEsos', FromEsos1);
					wid.debtorDataGrid.store.setValue(toRow, 'rowType', rowType1);
					
					wid.debtorDataGrid.selection.setSelected(fromIndex,false);
					wid.debtorDataGrid.selection.setSelected(fromIndex+1,true);
					wid.debtorDataGrid.update();
					var size=wid.debtorDataGrid.store._arrayOfTopLevelItems.length;
					
					if((fromIndex+1) == (size -1))
						wid.btnMoveDebtorDown.set("disabled",true);
					wid.btnMoveDebtorUp.set("disabled",false);
				});
				
				this.btnMoveDebtorUp.on("click",function(evt){
					var fromRow = wid.debtorDataGrid.selection.getSelected()[0];
					var fromIndex=fromRow._0;
					var toRow = wid.debtorDataGrid.store._arrayOfTopLevelItems[fromIndex-1];
					var name1=fromRow.name;
					var name2=toRow.name;
					
					var address1=fromRow.address;
					var address2=toRow.address;
					
					var debtorId1=fromRow.debtorId;
					var debtorId2=toRow.debtorId;
					
					var rowType1=fromRow.rowType;
					var rowType2=toRow.rowType;
					
					var FromOCR1=fromRow.FromOCR;
					var FromOCR2=toRow.FromOCR;
					
					var IsEditable1=fromRow.IsEditable;
					var IsEditable2=toRow.IsEditable;
					
					var FromEsos1=fromRow.FromEsos;
					var FromEsos2=toRow.FromEsos;
					
					wid.debtorDataGrid.store.setValue(fromRow, 'name', name2);
					wid.debtorDataGrid.store.setValue(fromRow, 'address', address2);
					wid.debtorDataGrid.store.setValue(fromRow, 'debtorId', debtorId2);
					wid.debtorDataGrid.store.setValue(fromRow, 'FromOCR', FromOCR2);
					wid.debtorDataGrid.store.setValue(fromRow, 'IsEditable', IsEditable2);
					wid.debtorDataGrid.store.setValue(fromRow, 'FromEsos', FromEsos2);
					wid.debtorDataGrid.store.setValue(fromRow, 'rowType', rowType2);
					
					wid.debtorDataGrid.store.setValue(toRow, 'name', name1);
					wid.debtorDataGrid.store.setValue(toRow, 'address', address1);
					wid.debtorDataGrid.store.setValue(toRow, 'debtorId', debtorId1);
					wid.debtorDataGrid.store.setValue(toRow, 'FromOCR', FromOCR1);
					wid.debtorDataGrid.store.setValue(toRow, 'IsEditable', IsEditable1);
					wid.debtorDataGrid.store.setValue(toRow, 'FromEsos', FromEsos1);
					wid.debtorDataGrid.store.setValue(toRow, 'rowType', rowType1);
					
					wid.debtorDataGrid.selection.setSelected(fromIndex,false);
					wid.debtorDataGrid.selection.setSelected(fromIndex-1,true);
					wid.debtorDataGrid.update();
					var size=wid.debtorDataGrid.store._arrayOfTopLevelItems.length;
					
					if((fromIndex-1) == 0)
						wid.btnMoveDebtorUp.set("disabled",true);
					wid.btnMoveDebtorDown.set("disabled",false);
				});
				
				this.historyDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex;
					var rowData = wid.historyDataGrid.getItem(idx);
					wid.txtFilenetId.setValue(rowData.GUID);
				});
				this.btnDltNote.on("click",function(e){
					var dialog=new ConfirmDialog({ message: "Are you sure you want to delete the selected note ?",title: "Confirmation"});
					dialog.confirmAction=function(){
						var selectedIds=new Array();
						var repository=wid.getSolution().getTargetOS();
						array.forEach(wid.notesDataGrid.selection.getSelected(), function(row){
							var serviceParams = new Object();
							serviceParams.input = row.NoteId;
							serviceParams.input2 = wid.isFoS.value=='true'?true:false;
							
							Request.invokePluginService("claimCustomPlugin", "deleteNoteService",
							{
								requestParams: serviceParams,
								synchronous:true,
								requestCompleteCallback: function(response) {	// success
									wid.notesDataGrid.store.deleteItem(row);
								}
							});
						});
					}
					dialog.show();
				});
				
				this.btnDeleteDebtor.on("click",function(e){
					var msg="";
					if(wid.txtDialogType.value=="TaxLien")
						msg="Are you sure you want to delete the selected tax payer ?";
					else
						msg="Are you sure you want to delete the selected debtor ?";
					var dialog=new ConfirmDialog({ message: msg,title: "Confirmation"});
					dialog.confirmAction=function(){
						var selectedIds=new Array();
						var repository=wid.getSolution().getTargetOS();
						array.forEach(wid.debtorDataGrid.selection.getSelected(), function(row){
							var serviceParams = new Object();
							serviceParams.input = row.debtorId;
							serviceParams.input2 = wid.isFoS.value=='true'?true:false;
							
							Request.invokePluginService("claimCustomPlugin", "deptorDeleteService",
							{
								requestParams: serviceParams,
								synchronous:true,
								requestCompleteCallback: function(response) {	// success
									wid.debtorDataGrid.store.deleteItem(row);
								}
							});
						});
					}
					dialog.show();
				});
				
				this.btnDeleteSecuredParty.on("click",function(e){
					var msg="";
					if(wid.txtDialogType.value=="TaxLien")
						msg="Are you sure you want to delete the selected tax lien holder ?";
					else
						msg="Are you sure you want to delete the selected secured party ?";
					var dialog=new ConfirmDialog({ message: msg,title: "Confirmation"});
					dialog.confirmAction=function(){
						var selectedIds=new Array();
						var repository=wid.getSolution().getTargetOS();
						array.forEach(wid.securePartyDataGrid.selection.getSelected(), function(row){
							var serviceParams = new Object();
							serviceParams.input = row.securePartyId;
							serviceParams.input2 = wid.isFoS.value=='true'?true:false;
							
							Request.invokePluginService("claimCustomPlugin", "deptorDeleteService",
							{
								requestParams: serviceParams,
								synchronous:true,
								requestCompleteCallback: function(response) {	// success
									wid.securePartyDataGrid.store.deleteItem(row);
								}
							});
						});
					}
					dialog.show();
				});
				
				this.btnDebtor.on("click",function(e){
					wid.debtorTabs.selectChild(wid.fillingInfoTab);
					theDialog.set("title","Debtors/Secured Parties");
					wid.btnAddDeptor.setLabel("Add New Debtor");
					wid.btnCopyDebtor.setLabel("Copy to Secured Parties");
					wid.btnCopySecuredParty.setLabel("Copy to Debtors");
					wid.btnAddSecureParty.setLabel("Add New Secured Party");
					wid.btnAddSecureParty.set("disabled",false);
					wid.lblDebtor.innerHTML="Debtors";
					wid.lblSecuredParty.innerHTML="Secured Parties";
					domStyle.set(wid.ddlDebtorTypes.domNode, 'display', '');
					domStyle.set(wid.ddlTaxTypes.domNode, 'display', 'none');
					
					var selectedIds=new Array();
					array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row);
					});
					wid.txtDialogType.value="Debtor";
						
					wid.ddlType.setValue("");
					wid.initDebtorSecureParty(selectedIds[0].Filing_Number,selectedIds[0].GUID);
					theDialog.show();
					wid.securePartyDataGrid.resize();
					wid.debtorDataGrid.resize();
					wid.historyDataGrid.resize();
					wid.notesDataGrid.resize();
				});
				
		
				this.btnUCC11.on("click",function(e){
					var selectedIds=new Array();
					array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row);
					});
					
					var serviceParams2 = new Object();
					serviceParams2.input = selectedIds[0].Filing_Number;
						
					Request.invokePluginService("claimCustomPlugin", "reviewDocService",
					{
						requestParams: serviceParams2,
						synchronous:true,
						requestCompleteCallback: function(response) {	// success
							var store = wid.docsDataGrid.store;
							store.setValue(selectedIds[0], 'Reviewed', 'Yes');
							wid.docsDataGrid.update();
						}				
					});
					var url = window.location.href;
					var ip = url.split("/")[2];
					var jobNo=wid.jobNumber , filingNo=selectedIds[0].Filing_Number , user=wid.getSolution().getTargetOS().userId;
					wid.testIFrame.set("content", dojo.create("iframe", {//ip.split(":")[0]
						"src": "http://10.128.198.8:500/ucc11?jobNo="+jobNo+"&filingNo="+filingNo+"&user="+user,
						"style": "border: 0; width: 100%; height: 100%"
					}));
					ucc11Dialog.show();
					
				});
				
				this.btnDoReset.on("click",function(e){
					wid.rejectCHK1.setChecked(false);
					wid.rejectCHK2.setChecked(false);
					wid.rejectCHK3.setChecked(false);
					wid.rejectCHK4.setChecked(false);
					wid.rejectCHK5.setChecked(false);
					wid.rejectCHK6.setChecked(false);
					wid.rejectCHK7.setChecked(false);
					wid.rejectCHK8.setChecked(false);
					wid.rejectCHK9.setChecked(false);
					wid.rejectCHK10.setChecked(false);
					wid.rejectCHK11.setChecked(false);
					wid.rejectCHK12.setChecked(false);
					wid.rejectCHK13.setChecked(false);
					wid.rejectCHK14.setChecked(false);
					wid.rejectCHK15.setChecked(false);
					wid.rejectCHK16.setChecked(false);
					wid.rejectCHK17.setChecked(false);
					wid.rejectCHK18.setChecked(false);
					wid.rejectCHK19.setChecked(false);
					wid.rejectCHK20.setChecked(false);
					wid.rejectCHK21.setChecked(false);
					wid.rejectCHK22.setChecked(false);
					wid.rejectCHK23.setChecked(false);
					wid.rejectCHK24.setChecked(false);
					wid.rejectCHK25.setChecked(false);
					wid.rejectCHK26.setChecked(false);
					wid.rejectCHK27.setChecked(false);
					wid.rejectCHK100.setChecked(false);
					wid.rejectCHK200.setChecked(false);
					wid.rejectionNotes.setValue('');
				});
				
				
				wid.txtLapseDate.on("change",function(newValue){
					if(newValue && newValue != ''){
						var lapsedDate=new Date(newValue);
						lapsedDate.setHours(23);
						lapsedDate.setMinutes(59);
						var currDate=new Date();
						
						if(lapsedDate<currDate){
							wid.btnSaveZDialog.setDisabled(true);
						}
						else{
							wid.btnSaveZDialog.setDisabled(false);
						}
						
					}
				});
				wid.txtLastName3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtLastName3.getValue())){
						var str=wid.txtLastName3.getValue();
						wid.txtLastName3.setValue(str.substring(0, str.length - 1));
					}
				
				});
				wid.txtFirstName3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtFirstName3.getValue())){
						var str=wid.txtFirstName3.getValue();
						wid.txtFirstName3.setValue(str.substring(0, str.length - 1));
					}
				
				});
				wid.txtMiddleName3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtMiddleName3.getValue())){
						var str=wid.txtMiddleName3.getValue();
						wid.txtMiddleName3.setValue(str.substring(0, str.length - 1));
					}
				
				});
				wid.txtSuffixName3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtSuffixName3.getValue())){
						var str=wid.txtSuffixName3.getValue();
						wid.txtSuffixName3.setValue(str.substring(0, str.length - 1));
					}
				
				});
				/*wid.txtOrganization3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtOrganization3.getValue())){
						var str=wid.txtOrganization3.getValue();
						wid.txtOrganization3.setValue(str.substring(0, str.length - 1));
					}
				
				});
				wid.txtAddress13.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtAddress13.getValue())){
						var str=wid.txtAddress13.getValue();
						wid.txtAddress13.setValue(str.substring(0, str.length - 1));
					}
				});
				wid.txtAddress23.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtAddress23.getValue())){
						var str=wid.txtAddress23.getValue();
						wid.txtAddress23.setValue(str.substring(0, str.length - 1));
					}
				
				});
				wid.txtCity3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtCity3.getValue())){
						var str=wid.txtCity3.getValue();
						wid.txtCity3.setValue(str.substring(0, str.length - 1));
					}
				
				});
				wid.txtState3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtState3.getValue())){
						var str=wid.txtState3.getValue();
						wid.txtState3.setValue(str.substring(0, str.length - 1));
					}
				
				});
				wid.txtZip3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtZip3.getValue())){
						var str=wid.txtZip3.getValue();
						wid.txtZip3.setValue(str.substring(0, str.length - 1));
					}
				
				});
				wid.txtCountry3.on("keyup",function(newValue){
					var re = /^[a-zA-Z0-9 ]$/i;
					
					if(!/^[a-zA-Z0-9 \'\".,?!:;\-\\/()\[\]]+$/.test(wid.txtCountry3.getValue())){
						var str=wid.txtCountry3.getValue();
						wid.txtCountry3.setValue(str.substring(0, str.length - 1));
					}
				
				});*/
				/*this.txtOrganization3.on("change",function(e){
					if(wid.txtOrganization3.getValue()==''){
						wid.txtFirstName3.setDisabled(false);
						wid.txtLastName3.setDisabled(false);
						wid.txtSuffixName3.setDisabled(false);
						wid.txtMiddleName3.setDisabled(false);
					}
					else{
						wid.txtFirstName3.setDisabled(true);
						wid.txtLastName3.setDisabled(true);
						wid.txtSuffixName3.setDisabled(true);
						wid.txtMiddleName3.setDisabled(true);
					}
				});
				this.txtFirstName3.on("change",function(e){
					if(wid.txtFirstName3.getValue()=='' && wid.txtLastName3.getValue()=='' && wid.txtSuffixName3.getValue()=='' && wid.txtMiddleName3.getValue()==''){
						wid.txtOrganization3.setDisabled(false);
					}
					else{
						wid.txtOrganization3.setDisabled(true);
					}
				});
				this.txtLastName3.on("change",function(e){
					if(wid.txtFirstName3.getValue()=='' && wid.txtLastName3.getValue()=='' && wid.txtSuffixName3.getValue()=='' && wid.txtMiddleName3.getValue()==''){
						wid.txtOrganization3.setDisabled(false);
					}
					else{
						wid.txtOrganization3.setDisabled(true);
					}
				});
				this.txtSuffixName3.on("change",function(e){
					if(wid.txtFirstName3.getValue()=='' && wid.txtLastName3.getValue()=='' && wid.txtSuffixName3.getValue()=='' && wid.txtMiddleName3.getValue()==''){
						wid.txtOrganization3.setDisabled(false);
					}
					else{
						wid.txtOrganization3.setDisabled(true);
					}
				});
				this.txtMiddleName3.on("change",function(e){
					if(wid.txtFirstName3.getValue()=='' && wid.txtLastName3.getValue()=='' && wid.txtSuffixName3.getValue()=='' && wid.txtMiddleName3.getValue()==''){
						wid.txtOrganization3.setDisabled(false);
					}
					else{
						wid.txtOrganization3.setDisabled(true);
					}
				});*/
				this.btnTaxLien.on("click",function(e){
					wid.debtorTabs.selectChild(wid.fillingInfoTab);
					var selectedIds=new Array();
					theDialog.set("title","Tax Payer");
					wid.btnAddDeptor.setLabel("Add Tax Payer");
					wid.btnAddSecureParty.setLabel("Add Lien Holder");
					wid.btnAddSecureParty.set("disabled",true);
					wid.btnCopyDebtor.setLabel("Copy to Lien Holders");
					wid.btnCopySecuredParty.setLabel("Copy to Tax Payers");
					wid.lblDebtor.innerHTML="Tax Payers";
					wid.lblSecuredParty.innerHTML="Lien Holders";
					domStyle.set(wid.ddlDebtorTypes.domNode, 'display', 'none');
					domStyle.set(wid.ddlTaxTypes.domNode, 'display', '');
					
					array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row);
					});
					wid.txtDialogType.value="TaxLien";
					var serviceParams2 = new Object();
					serviceParams2.input = selectedIds[0].Filing_Number;
						
					wid.ddlType.setValue("");
					wid.initDebtorSecureParty(selectedIds[0].Filing_Number,selectedIds[0].GUID);
					
					theDialog.show();
					wid.securePartyDataGrid.resize();
					wid.debtorDataGrid.resize();
					wid.historyDataGrid.resize();
					wid.notesDataGrid.resize();
				});
				
				this.debtorDataGrid.on("RowDblClick",function(evt){
					var idx = evt.rowIndex;
					var rowData = wid.debtorDataGrid.getItem(idx);
					wid.initDebtorSecurePartyDetails(rowData.debtorId,rowData.FromEsos);
					wid.txtDebtorType.value="Debitor";
					domStyle.set(wid.btnSearchDeptor.domNode, 'display', 'none');
					if(wid.txtDialogType.value=="Debtor")
						deptorDetailsDialog.set("title","Debtor Details");
					else
						deptorDetailsDialog.set("title","Tax Payer Details");
					deptorDetailsDialog.show();
					
				});
					
				this.btnViewDeptor.on("click",function(e){
					var selectedIds=new Array();
					var selectedTypes=new Array();

					array.forEach(wid.debtorDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row.debtorId);
						selectedTypes.push(row.FromEsos);
					});
					
					wid.initDebtorSecurePartyDetails(selectedIds[0],selectedTypes[0]);
					wid.txtDebtorType.value="Debitor";
					domStyle.set(wid.btnSearchDeptor.domNode, 'display', 'none');
					if(wid.txtDialogType.value=="Debtor")
						deptorDetailsDialog.set("title","Debtor Details");
					else
						deptorDetailsDialog.set("title","Tax Payer Details");
					deptorDetailsDialog.show();
					
				});
				
				this.btnAddDeptor.on("click",function(e){
					domStyle.set(wid.btnSearchDeptor.domNode, 'display', '');
					if(wid.txtDialogType.value=="Debtor"){
						deptorDetailsDialog.set("title","Add New Debtor");
						searchDeptorDialog.set("title","Find a Debtor");
						wid.ddlDebtorTypes.setValue("Debtor");
					}
					else{
						deptorDetailsDialog.set("title","Add New Tax Payer");
						searchDeptorDialog.set("title","Find a Tax Payer");
						wid.ddlTaxTypes.setValue("Tax Payer");
					}
					
					
						
					wid.txtFirstName3.setValue("");
					wid.txtMiddleName3.setValue("");
					wid.txtLastName3.setValue("");
					wid.txtSuffixName3.setValue("");
					wid.txtOrganization3.setValue("");
					wid.txtAddress13.setValue("");
					wid.txtAddress23.setValue("");
					wid.txtCity3.setValue("");
					wid.txtState3.setValue("NV");
					wid.txtZip3.setValue("");
					wid.txtCountry3.setValue("");
					//wid.txtPhone3.setValue("");
					//wid.txtEmail3.setValue("");
					
					deptorDetailsDialog.show();
					wid.txtDebtorType.value="Debitor";
					wid.txtDebtorId.value="0";
				});
				this.securePartyDataGrid.on("RowDblClick",function(evt){
					var idx = evt.rowIndex;
					var rowData = wid.securePartyDataGrid.getItem(idx);
					wid.initDebtorSecurePartyDetails(rowData.securePartyId,rowData.FromEsos);
					wid.txtDebtorType.value="Secured Party";
					domStyle.set(wid.btnSearchDeptor.domNode, 'display', 'none');
					if(wid.txtDialogType.value=="Debtor")
						deptorDetailsDialog.set("title","Secured Party Details");
					else
						deptorDetailsDialog.set("title","Lien Holder Details");
					deptorDetailsDialog.show();
					
				});
				this.btnViewSecureParty.on("click",function(e){
					var selectedIds=new Array();
					var selectedTypes=new Array();
					array.forEach(wid.securePartyDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row.securePartyId);
						selectedTypes.push(row.FromEsos);
					});
					wid.initDebtorSecurePartyDetails(selectedIds[0],selectedTypes[0]);
					wid.txtDebtorType.value="Secured Party";
					domStyle.set(wid.btnSearchDeptor.domNode, 'display', 'none');
					if(wid.txtDialogType.value=="Debtor")
						deptorDetailsDialog.set("title","Secured Party Details");
					else
						deptorDetailsDialog.set("title","Lien Holder Details");
					deptorDetailsDialog.show();
				});
				this.btnAddSecureParty.on("click",function(e){
					domStyle.set(wid.btnSearchDeptor.domNode, 'display', '');
					wid.txtDebtorType.value="Secured Party";
					if(wid.txtDialogType.value=="TaxLien")
						wid.ddlTaxTypes.setValue("Lien Holder");
					else
						wid.ddlDebtorTypes.setValue("Secured Party");
					wid.txtFirstName3.setValue("");
					wid.txtMiddleName3.setValue("");
					wid.txtLastName3.setValue("");
					wid.txtSuffixName3.setValue("");
					wid.txtOrganization3.setValue("");
					wid.txtAddress13.setValue("");
					wid.txtAddress23.setValue("");
					wid.txtCity3.setValue("");
					wid.txtState3.setValue("NV");
					wid.txtZip3.setValue("");
					wid.txtCountry3.setValue("");
					//wid.txtPhone3.setValue("");
					//wid.txtEmail3.setValue("");
					
					if(wid.txtDialogType.value=="Debtor"){
						deptorDetailsDialog.set("title","Add New Secured Party");
						searchDeptorDialog.set("title","Find a Secure Party");
					}else{
						deptorDetailsDialog.set("title","Add New Lien Holder");
						searchDeptorDialog.set("title","Find a Lien Holder");
					}
					deptorDetailsDialog.show();
					wid.txtDebtorId.value="0";
				});
				
				this.btnCopyDebtor.on("click",function(e){
					
					var selectedIds=new Array();
					var selectedTypes=new Array();
					
					array.forEach(wid.debtorDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row.debtorId);
						selectedTypes.push(row.FromEsos);
					});
					
					wid.initDebtorSecurePartyDetails(selectedIds[0],selectedTypes[0]);
					
					domStyle.set(wid.btnSearchDeptor.domNode, 'display', 'none');
					wid.txtDebtorType.value="Secured Party";
					
					if(wid.txtDialogType.value=="Debtor"){
						deptorDetailsDialog.set("title","Add New Secured Party");
						searchDeptorDialog.set("title","Find a Secure Party");
					}else{
						deptorDetailsDialog.set("title","Add New Lien Holder");
						searchDeptorDialog.set("title","Find a Lien Holder");
					}
					deptorDetailsDialog.show();
					wid.txtDebtorId.value="0";
					if(wid.txtDialogType.value=="TaxLien")
						wid.ddlTaxTypes.setValue("Lien Holder");
					else
						wid.ddlDebtorTypes.setValue("Secured Party");
					
				});
				
				this.btnCopySecuredParty.on("click",function(e){
					
					
					var selectedIds=new Array();
					var selectedTypes=new Array();

					array.forEach(wid.securePartyDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row.securePartyId);
						selectedTypes.push(row.FromEsos);
					});
					
					wid.initDebtorSecurePartyDetails(selectedIds[0],selectedTypes[0]);
					
					domStyle.set(wid.btnSearchDeptor.domNode, 'display', 'none');
					wid.txtDebtorType.value="Debitor";
					
					if(wid.txtDialogType.value=="Debtor"){
						deptorDetailsDialog.set("title","Add New Secured Party");
						searchDeptorDialog.set("title","Find a Secure Party");
					}else{
						deptorDetailsDialog.set("title","Add New Lien Holder");
						searchDeptorDialog.set("title","Find a Lien Holder");
					}
					deptorDetailsDialog.show();
					wid.txtDebtorId.value="0";
					if(wid.txtDialogType.value=="TaxLien")
						wid.ddlTaxTypes.setValue("Tax Payer");
					else
						wid.ddlDebtorTypes.setValue("Debtor");
				});
				
				this.btnCopyToSentTo.on("click",function(e){
					wid.txtFirstName2.setValue(wid.txtFirstName.getValue());
					wid.txtMiddleName2.setValue(wid.txtMiddleName.getValue());
					wid.txtLastName2.setValue(wid.txtLastName.getValue());
					wid.txtSuffixName2.setValue(wid.txtSuffixName.getValue());
					wid.txtOrganization2.setValue(wid.txtOrganization.getValue());
					wid.txtAddress12.setValue(wid.txtAddress1.getValue());
					wid.txtAddress22.setValue(wid.txtAddress2.getValue());
					wid.txtCity2.setValue(wid.txtCity.getValue());
					wid.txtState2.setValue(wid.txtState.getValue());
					wid.txtZip2.setValue(wid.txtZip.getValue());
					wid.txtCountry2.setValue(wid.txtCountry.getValue());
					wid.txtPhone2.setValue(wid.txtPhone.getValue());
					wid.txtEmail2.setValue(wid.txtEmail.getValue());
					wid.submitterInfoTabs.selectChild(wid.sentToTab);
				});
				this.btnFindSubmitter.on("click",function(e){
					wid.txtSearchType.value="Submitter";
					searchDeptorDialog.set("title","Find a Submitter");
					wid.organizationRadio.setChecked(true);
					wid.nameRadio.setChecked(true);
					wid.txtOrganizationSearch.setValue("");
					wid.txtAccountNumberSearch.setValue("");
					wid.txtLastNameSearch.setValue("");
					wid.txtFirstNameSearch.setValue("");
					wid.txtMiddleNameSearch.setValue("");
					var newStore = new dojo.data.ItemFileReadStore({data: {  identifier: "",  items: []}});  
					wid.searchDataGrid.setStore(newStore); 
					searchDeptorDialog.show();
				});
				this.btnFindSentTo.on("click",function(e){
					wid.txtSearchType.value="SentTo";
					searchDeptorDialog.set("title","Find a Submitter");
					wid.organizationRadio.setChecked(true);
					wid.nameRadio.setChecked(true);
					wid.txtOrganizationSearch.setValue("");
					wid.txtAccountNumberSearch.setValue("");
					wid.txtLastNameSearch.setValue("");
					wid.txtFirstNameSearch.setValue("");
					wid.txtMiddleNameSearch.setValue("");
					var newStore = new dojo.data.ItemFileReadStore({data: {  identifier: "",  items: []}});  
					wid.searchDataGrid.setStore(newStore); 
					searchDeptorDialog.show();
				});
				this.btnSearchDeptor.on("click",function(e){
					wid.txtSearchType.value="Debtor";
					wid.organizationRadio.setChecked(true);
					wid.nameRadio.setChecked(true);
					wid.txtOrganizationSearch.setValue("");
					wid.txtAccountNumberSearch.setValue("");
					wid.txtLastNameSearch.setValue("");
					wid.txtFirstNameSearch.setValue("");
					wid.txtMiddleNameSearch.setValue("");
					var newStore = new dojo.data.ItemFileReadStore({data: {  identifier: "",  items: []}});  
					wid.searchDataGrid.setStore(newStore); 
					searchDeptorDialog.show();
				});
				this.btnCopySubmitter.on("click",function(e){
					wid.txtFirstName.setValue(wid.txtFirstName3.getValue());
					wid.txtMiddleName.setValue(wid.txtMiddleName3.getValue());
					wid.txtLastName.setValue(wid.txtLastName3.getValue());
					wid.txtSuffixName.setValue(wid.txtSuffixName3.getValue());
					wid.txtOrganization.setValue(wid.txtOrganization3.getValue());
					wid.txtAddress1.setValue(wid.txtAddress13.getValue());
					wid.txtAddress2.setValue(wid.txtAddress23.getValue());
					wid.txtCity.setValue(wid.txtCity3.getValue());
					wid.txtZip.setValue(wid.txtZip3.getValue());
					wid.txtState.setValue(wid.txtState3.getValue());
					wid.txtCountry.setValue(wid.txtCountry3.getValue());
					deptorDetailsDialog.hide();
					theDialog.hide();
					wid.mainTabs.selectChild(wid.submitterInfo);
					wid.submitterInfoTabs.selectChild(wid.submitterTab);
				});
				this.btnSaveDeptor.on("click",function(e){
					if((wid.txtFirstName3.getValue()!='' ||  wid.txtLastName3.getValue()!='' || wid.txtSuffixName3.getValue()!='' || wid.txtMiddleName3.getValue()!='') && wid.txtOrganization3.getValue() != ''){
						alert("You can't enter individual and organization names together please enter one of them only !!!");
					}
					else if(wid.txtCity3.getValue()=="" || wid.txtState3.getValue()=="")
						alert("State and City can't be empty");
					else if(wid.txtAddress13.getValue()==null || wid.txtAddress13.getValue() == ''){
						alert("Please enter address 1");
					}
					else{
						var typeName=wid.txtDebtorType.value;
						var typeCode=1;
						var origCode="1";
						if(typeName=='Secured Party')
							origCode="0";
						if(wid.txtDialogType.value=="TaxLien"){
							if(wid.ddlTaxTypes.getValue()=="Tax Payer")
								typeCode="1";
							else
								typeCode="0";
						}
						else{
							if(wid.ddlDebtorTypes.getValue()=="Debtor")
								typeCode="1";
							else
								typeCode="0";
						}
						var repository=wid.getSolution().getTargetOS();
						var serviceParams = new Object();
						var jsonStr='{"FirstName":"'+wid.txtFirstName3.getValue()+'","MiddleInitial":"'+wid.txtMiddleName3.getValue()+'","LastName":"'+wid.txtLastName3.getValue()+'","Suffix":"'+wid.txtSuffixName3.getValue()+'","Orgnization":"'+wid.txtOrganization3.getValue()+'","Address_1":"'+wid.txtAddress13.getValue()+'","Address_2":"'+
						
						wid.txtAddress23.getValue()+'","City":"'+wid.txtCity3.getValue()+'","Zip":"'+wid.txtZip3.getValue()+'","State":"'+wid.txtState3.getValue()+'","Country":"'+wid.txtCountry3.getValue()
					//	+'","Email":"'+wid.txtEmail3.getValue()+'","Phone":"'+wid.txtPhone3.getValue()
						+'","TypeCode":"'+typeCode+'","TypeName":"'+typeName+'","FillingId":"'+wid.txtFillingKey.value+'","DebtorId":"'+wid.txtDebtorId.value+'","FromEsos":'+(wid.isFoS.value=='true'?true:false)+',"ModifiedBy":"'+repository.userId+'"}';
						serviceParams.input = jsonStr;
						Request.invokePluginService("claimCustomPlugin", "saveDebtorService",
						{
							requestParams: serviceParams,
							synchronous:true,
							requestCompleteCallback: function(response) {
								var jsonResponse=dojo.toJson(response, true, "  ");
								var obj = JSON.parse(jsonResponse);
							//	alert("Done");
								deptorDetailsDialog.hide();
								var newName=wid.txtOrganization3.getValue();
								var address=wid.txtAddress13.getValue();
								if(wid.txtAddress23.getValue() && wid.txtAddress23.getValue() != '')
									address=address+" "+wid.txtAddress23.getValue();
								if(wid.txtCity3.getValue() && wid.txtCity3.getValue() != '')
									address=address+" "+wid.txtCity3.getValue();
								if(wid.txtState3.getValue() && wid.txtState3.getValue() != '')
									address=address+" "+wid.txtState3.getValue();
								if(wid.txtZip3.getValue() && wid.txtZip3.getValue() != '')
									address=address+" "+wid.txtZip3.getValue();
								if(wid.txtCountry3.getValue() && wid.txtCountry3.getValue() != '')
									address=address+" "+wid.txtCountry3.getValue();								
								if(!newName || newName== ''){
									newName=wid.txtFirstName3.getValue()+" "+wid.txtMiddleName3.getValue()+" "+wid.txtLastName3.getValue()+" "+wid.txtSuffixName3.getValue();
								}
								//deptorDetailsDialog.set("title","Add New Debtor");
								if(deptorDetailsDialog.get("title").toString().contains("Add New") ){
									if(typeCode=="1"){
										var newSequence;
										console.log(wid.debtorDataGrid);
										console.log(wid.debtorDataGrid.store._arrayOfTopLevelItems.length);
										if(wid.debtorDataGrid.store._arrayOfTopLevelItems.length==0 || (wid.debtorDataGrid.store._arrayOfTopLevelItems[0]==null))
											newSequence=1;
										else{
											var lastItem=wid.debtorDataGrid.store._arrayOfTopLevelItems[wid.debtorDataGrid.store._arrayOfTopLevelItems.length-1];
											newSequence=parseInt(lastItem.Sequence)+1;
										}
										var myNewItem = {debtorId: obj.DebitorId, rowType: "new",name: newName.toString().toUpperCase(),address:address.toString().toUpperCase(),FromEsos:"false",IsEditable:"true",Sequence:newSequence};
										wid.debtorDataGrid.store.newItem(myNewItem);
									}
									else{
										var newSequence;
										if(wid.securePartyDataGrid.store._arrayOfTopLevelItems.length==0)
											newSequence=1;
										else{
											var lastItem=wid.securePartyDataGrid.store._arrayOfTopLevelItems[wid.securePartyDataGrid.store._arrayOfTopLevelItems.length-1];
											newSequence=parseInt(lastItem.Sequence)+1;
										}
										var myNewItem = {securePartyId: obj.DebitorId, rowType: "new",name: newName.toString().toUpperCase(),address:address.toString().toUpperCase(),FromEsos:"false",IsEditable:"true",Sequence:newSequence};
										wid.securePartyDataGrid.store.newItem(myNewItem);
									}
								}
								else{
									console.log("typeCode="+typeCode);
									console.log("origCode="+origCode);
									console.log(typeCode != origCode);
									if(typeCode != origCode){
										if(typeCode=="1"){
											var myNewItem = {debtorId: obj.DebitorId, rowType: "new",name: newName.toString().toUpperCase(),address:address.toString().toUpperCase(),FromEsos:"false"};
											console.log(myNewItem);
											wid.debtorDataGrid.store.newItem(myNewItem);
											array.forEach(wid.securePartyDataGrid.selection.getSelected(), function(row){
												wid.securePartyDataGrid.store.deleteItem(row);
											});
											wid.securePartyDataGrid.store.save();
										}
										else{
											var myNewItem = {securePartyId: obj.DebitorId, rowType: "new",name: newName.toString().toUpperCase(),address:address.toString().toUpperCase(),FromEsos:"false"};
											console.log(myNewItem);
											wid.securePartyDataGrid.store.newItem(myNewItem);
											
											array.forEach(wid.debtorDataGrid.selection.getSelected(), function(row){
												wid.debtorDataGrid.store.deleteItem(row);
											});
											
											wid.debtorDataGrid.store.save();
										}
									}
									else{
										if(typeCode=="1"){
											var store = wid.debtorDataGrid.store;
											store.setValue(wid.debtorDataGrid.selection.getSelected()[0], 'name', newName.toString().toUpperCase());
											store.setValue(wid.debtorDataGrid.selection.getSelected()[0], 'address', address.toString().toUpperCase());
											wid.debtorDataGrid.update();
										}
										else{
											var store = wid.securePartyDataGrid.store;
											store.setValue(wid.securePartyDataGrid.selection.getSelected()[0], 'name', newName.toString().toUpperCase());
											store.setValue(wid.securePartyDataGrid.selection.getSelected()[0], 'address', address.toString().toUpperCase());
											wid.securePartyDataGrid.update();
										}
									}
								}
							}
						});
					}
				});
				this.btnSaveZDialog.on("click",function(e){
					
					if(theDialog.get("title") == 'Tax Payer' && (wid.ddlType.getValue()==null || wid.ddlType.getValue() == '')){
						alert("Please select a type");
					}
					else if(theDialog.get("title") == 'Tax Payer' && wid.debtorDataGrid.store._arrayOfTopLevelItems.length==0){
						alert("Please enter at least one tax payer");
					}
					else if(theDialog.get("title") == 'Debtors/Secured Parties' && (wid.debtorDataGrid.store._arrayOfTopLevelItems.length==0 || wid.securePartyDataGrid.store._arrayOfTopLevelItems.length==0)){
						alert("Please enter at least one debtor and one secured party");
					}
					else if(wid.txtIFSN.getValue()==null || wid.txtIFSN.getValue() == ''){
						alert("Please enter IFSN");
					}
					else if(wid.ddlAction.disabled==false &&(wid.ddlAction.getValue()==null || wid.ddlAction.getValue() == '')){
						alert("Please select an action");
					}
					else{
						
						if(wid.ddlAction.getValue()=='Assignment'){
							var securedPartyAdded=false;
							for(var i=0;i<wid.securePartyDataGrid.store._arrayOfTopLevelItems.length;i++){
								if(wid.securePartyDataGrid.store._arrayOfTopLevelItems[i]==null)
									continue;
								var currItem=wid.securePartyDataGrid.store._arrayOfTopLevelItems[i];
								if(currItem.FromEsos=='false'){
									securedPartyAdded=true;
									break;
								}
							}
							if(!securedPartyAdded){
								alert("You have to add at least 1 secured party");
								return;
							}
						}
						var serviceParams = new Object();
						var ProcessedBy=wid.ProcessedBy.value;
						if(!ProcessedBy)
							ProcessedBy="";
						var VerifiedBy=wid.VerifiedBy.value;
						if(!VerifiedBy)
							VerifiedBy="";
						var ModifiedBy=wid.ModifiedBy.value;
						if(!ModifiedBy)
							ModifiedBy="";
						var jsonStr='{"FillingID":'+wid.txtFillingKey.value+',"FillingDate":"'+wid.txtFillingDate.getDisplayedValue()+'","FilingTime":"'+wid.txtFillingTime.getDisplayedValue()+'","NumPages":"'+wid.NumPages.value+'","ProcessedBy":"'+repository.userId+'","VerifiedBy":"'+repository.userId+'","ModifiedBy":"'+repository.userId+'","FileID":"'+wid.txtFillingId.getValue()+'","IFSN":"'+wid.txtIFSN.getValue()+'","Status":"'+wid.txtStatus.getValue()+'","LapseDate":"'+wid.txtLapseDate.getValue()+'","FormType":"'+wid.txtFormType.getValue()+'","JobNumber":"'+wid.jobNumber+'","IsFOS":'+(wid.isFoS.value=='true'?true:false)+',"DocAction":"'+
						wid.ddlAction.getValue()+'"';
						if(wid.isFoS.value=='true'){
							jsonStr+=',"IsFOS":true,"FOSID":'+wid.FOSId.value+',"OldFilingNumber":"'+wid.txtOldFillingId.getValue()+'"';
						}else{
							jsonStr+=',"IsFOS":false';
						}
						jsonStr+=',"Type":"'+wid.ddlType.getValue()+'","Debitors":[';
						if(theDialog.get("title") == 'Tax Payer'){
							jsonStr='{"FillingID":'+wid.txtFillingKey.value+',"FillingDate":"'+wid.txtFillingDate.getDisplayedValue()+'","FilingTime":"'+wid.txtFillingTime.getDisplayedValue()+'","NumPages":"'+wid.NumPages.value+'","ProcessedBy":"'+repository.userId+'","VerifiedBy":"'+repository.userId+'","ModifiedBy":"'+repository.userId+'","FileID":"'+wid.txtFillingId.getValue()+'","IFSN":"'+wid.txtIFSN.getValue()+'","Status":"'+wid.txtStatus.getValue()+'","LapseDate":"'+wid.txtLapseDate.getValue()+'","FormType":"'+wid.txtFormType.getValue()+'","JobNumber":"'+wid.jobNumber+'","IsFOS":'+(wid.isFoS.value=='true'?true:false)+',"DocAction":"'+
							wid.ddlType.getValue()+'","Type":"'+wid.ddlAction.getValue()+'","Debitors":[';
						}
						for(var i=0;i<wid.debtorDataGrid.store._arrayOfTopLevelItems.length;i++){
							if(wid.debtorDataGrid.store._arrayOfTopLevelItems[i]==null)
								continue;
							var currItem=wid.debtorDataGrid.store._arrayOfTopLevelItems[i];
							var fromOCR=currItem.FromOCR;
							if(!fromOCR || fromOCR=="")
								fromOCR="false";
							if(i!=0)
								jsonStr+=',';
							jsonStr+='{"DebtorId":'+currItem.debtorId+',"Name":"'+currItem.name+'","Address_1":"'+currItem.address+'","IsEditable":'+currItem.IsEditable+',"FromEsos":'+currItem.FromEsos+',"FromOCR":'+fromOCR+',"Sequence":'+currItem.Sequence+'}';
							
						}
						jsonStr+='],"SecuredParties":[';
						for(var j=0;j<wid.securePartyDataGrid.store._arrayOfTopLevelItems.length;j++){
							if(wid.securePartyDataGrid.store._arrayOfTopLevelItems[j]==null)
								continue;
							var currItem=wid.securePartyDataGrid.store._arrayOfTopLevelItems[j];
							if(j!=0)
								jsonStr+=',';
							if(currItem.securePartyId==-1){
								var repository2=wid.getSolution().getTargetOS();
								var serviceParams = new Object();
								var jsonStr2='{"FirstName":"","MiddleInitial":"","LastName":"","Suffix":"","Orgnization":"INTERNAL REVENUE SERVICE","Address_1":"P.O. BOX 145595","Address_2":"","City":"CINCINNATI","Zip":"45250-5595","State":"OH","Country":"","TypeCode":"0","TypeName":"Secured Party","FillingId":"'+wid.txtFillingKey.value+'","DebtorId":"0","FromEsos":false,"ModifiedBy":"'+repository2.userId+'"}';
								serviceParams.input = jsonStr2;
								Request.invokePluginService("claimCustomPlugin", "saveDebtorService",
								{
									requestParams: serviceParams,
									synchronous:true,
									requestCompleteCallback: function(response) {
										var jsonResponse=dojo.toJson(response, true, "  ");
										var obj = JSON.parse(jsonResponse);
									}
								});
							}
							else{
								var fromOCR=currItem.FromOCR;
								if(!fromOCR || fromOCR=="")
									fromOCR="false";
								jsonStr+='{"DebtorId":'+currItem.securePartyId+',"Name":"'+currItem.name+'","Address_1":"'+currItem.address+'","IsEditable":'+currItem.IsEditable+',"FromEsos":'+currItem.FromEsos+',"FromOCR":'+fromOCR+',"Sequence":'+currItem.Sequence+'}';
							}
							
						}
						jsonStr+=']}';
						serviceParams.input = jsonStr;
						repository.retrieveItem(wid.txtGUID.value, lang.hitch(wid, function(retItem) {
							
							var properties = [{"name": "DocumentTitle","value" : wid.txtFillingId.getValue()},{"name": "ESOS_Redaction_Reviewed","value" : true}];
							retItem.saveAttributes(properties,retItem.template,null,null,false,function(response) {
								console.log(retItem);
								Request.invokePluginService("claimCustomPlugin", "saveDebitorsService",
								{
									requestParams: serviceParams,
									synchronous:true,
									requestCompleteCallback: function(response) {
										var jsonResponse=dojo.toJson(response, true, "  ");
										var obj = JSON.parse(jsonResponse);
										if(obj.Done==false || obj.Done=='false'){
											alert(obj.Error);
										}
										else{
											var store = wid.docsDataGrid.store;
											store.setValue(wid.docsDataGrid.selection.getSelected()[0], 'Filing_Number', wid.txtFillingId.getValue());
											store.setValue(wid.docsDataGrid.selection.getSelected()[0], 'Filing_Date', wid.txtFillingDate.getDisplayedValue()+", "+wid.txtFillingTime.getDisplayedValue());
											store.setValue(wid.docsDataGrid.selection.getSelected()[0], 'Filing_Status', wid.txtStatus.getValue());
											wid.docsDataGrid.update();
											var selectedIds=new Array();
											array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
												selectedIds.push(row);
											});
											wid.txtDialogType.value="Debtor";
											var serviceParams2 = new Object();
											serviceParams2.input = selectedIds[0].Filing_Number;
											
											Request.invokePluginService("claimCustomPlugin", "reviewDocService",
											{
												requestParams: serviceParams2,
												synchronous:true,
												requestCompleteCallback: function(response) {	// success
													var store = wid.docsDataGrid.store;
													store.setValue(selectedIds[0], 'Reviewed', 'Yes');
													wid.docsDataGrid.update();
													theDialog.hide();
												}				
											});
											
											/*var serviceParams2 = new Object();
											serviceParams2.input = wid.jobNumber;
											serviceParams2.input2 = wid.txtFillingId.getValue();
											Request.invokePluginService("claimCustomPlugin", "calculateChargesService",
											{
												requestParams: serviceParams2,
												synchronous:true,
												requestCompleteCallback: function(response) {
												}
											});*/
										}
									}
								});
							});
						}));
					}
				});
				this.btnFindDeptor.on("click",function(e){
					var searchType;
					if(wid.txtSearchType.value=="Submitter" || wid.txtSearchType.value=="SentTo"){
						searchType=1;
					}
					else if(wid.txtDialogType.value=="TaxLien"){
						if(wid.ddlTaxTypes.getValue()=="Tax Payer")
							searchType=2;
						else
							searchType=3;
					}
					else{
						if(wid.ddlDebtorTypes.getValue()=="Debtor")
							searchType=2;
						else
							searchType=3;
					}

					var serviceParams = new Object();
					var jsonStr='{"IsOrganization":'+wid.organizationRadio.checked+',"SearchType":'+searchType+',"IsName":'+wid.nameRadio.checked+',"WildCard":'+true+',"Soundex":'+true+',"OrganizationName":"'+wid.txtOrganizationSearch.getValue()+'","FirstName":"'+wid.txtFirstNameSearch.getValue()+'","Initial":"'+
					wid.txtMiddleNameSearch.getValue()+'","LastName":"'+wid.txtLastNameSearch.getValue()+'","AccountNumber":"'+wid.txtAccountNumberSearch.getValue()+'"}';
					serviceParams.input = jsonStr;
					Request.invokePluginService("claimCustomPlugin", "searchDebtorService",
					{
						requestParams: serviceParams,
						synchronous:true,
						requestCompleteCallback: function(response) {
							var jsonResponse=dojo.toJson(response, true, "  ");
							var obj = JSON.parse(jsonResponse);
							var data = {
							  items: []
							};
							
							
							for(i=0;i<obj.length;i++){
								var firstName=obj[i].FirstName;
								var middleInitial=obj[i].MiddleInitial;
								var lastName=obj[i].LastName;
								var suffix=obj[i].Suffix;
								var orgnization=obj[i].Orgnization;
								var address1=obj[i].Address_1;
								var address2=obj[i].Address_2;
								var country=obj[i].Country;
								var city=obj[i].City;
								var state=obj[i].State;
								var zip=obj[i].Zip;
								var phone=obj[i].Phone;
								var email=obj[i].Email;
								data.items.push({ 
									"FirstName" : firstName,
									"MiddleInitial"  : middleInitial,
									"LastName"       : lastName,
									"Suffix" : suffix,
									"Orgnization"       : orgnization,
									"Address_1"       : address1,
									"Address_2"       : address2,
									"Country"    : country,
									"City"       : city,
									"State"      : state,
									"Zip"        : zip,
									"Phone"     : phone,
									"Email"     : email
								});
							}
							var store = new ItemFileWriteStore({data: data});
							wid.searchDataGrid.setStore(store);
							var layout = [[
							  {'name': 'id', 'field': 'CustomerId', 'hidden':true,'noresize': true},
							  {'name': 'First Name', 'field': 'FirstName', 'width': '10%','noresize': true},
							  {'name': 'Last Name', 'field': 'LastName', 'width': '10%','noresize': true},
							  {'name': 'Middle Initial', 'field': 'MiddleInitial', 'width': '10%','noresize': true},
							  {'name': 'Suffix', 'field': 'Suffix', 'width': '10%','noresize': true},
							  {'name': 'Organization', 'field': 'Orgnization', 'width': '10%','noresize': true},
							  {'name': 'Address 1', 'field': 'Address_1', 'width': '10%','noresize': true},
							  {'name': 'Address 2', 'field': 'Address_2', 'width': '10%','noresize': true},
							  {'name': 'Country', 'field': 'Country', 'width': '10%','noresize': true},
							  {'name': 'City', 'field': 'City', 'width': '10%','noresize': true},
							  {'name': 'State', 'field': 'State', 'width': '10%','noresize': true},
							  {'name': 'Zip', 'field': 'Zip', 'width': '10%','noresize': true},
							  {'name': 'Phone', 'field': 'Phone', 'width': '10%','noresize': true},
							  {'name': 'Email', 'field': 'Email', 'width': '10%','noresize': true}
							  
							]];
							wid.searchDataGrid.setStructure(layout);
						}
					});
				});
				
				this.btnAddNote.on("click",function(e){
					var serviceParams = new Object();
					var jsonStr='{"FillingId":'+wid.txtFillingKey.value+',"User":"'+wid.getSolution().getTargetOS().userId+'","IsFOS":'+(wid.isFoS.value=='true'?true:false)+',"Note":"'+wid.txtNewNote.getValue()+'"}';
					serviceParams.input = jsonStr;
					Request.invokePluginService("claimCustomPlugin", "addNoteService",
					{
						requestParams: serviceParams,
						synchronous:true,
						requestCompleteCallback: function(response) {
							var jsonResponse=dojo.toJson(response, true, "  ");
							var obj = JSON.parse(jsonResponse);
							var currDate=new Date();
							var curr_day = currDate.getDate();
							var curr_month = currDate.getMonth()+1;
							var curr_year = currDate.getFullYear();
							if(curr_day<10)
								curr_day="0"+curr_day;
							if(curr_month<10)
								curr_month="0"+curr_month;
							var myNewItem = {NoteId: obj.NoteId, User: wid.getSolution().getTargetOS().userId,Note: wid.txtNewNote.getValue(),CreationDate:(curr_month+"/"+curr_day+"/"+curr_year)};
							wid.notesDataGrid.store.newItem(myNewItem);
							wid.txtNewNote.setValue("");
							//alert("Note added successfully");
						}
					});
				});
				
				this.ddlType.on("change",function(newValue){
					if(newValue=="")
						return;
					var formType=wid.txtFormType.getValue();
					if(formType=="FOS" || formType == "UCC3" || formType == "UCC5")
						return
					if(theDialog.get("title") == 'Tax Payer'){
						if(newValue != "Notice of Federal Tax Lien" && wid.txtIFSN.getValue()==''){
							alert("please enter IFSN first");
							wid.ddlType.setValue("");
							return;
						}
					}
					var currDate=new Date(wid.txtFillingDate.getDisplayedValue());
									
					var lapsePeriod=wid.lapsePeriods[newValue];
					if(theDialog.get("title") == 'Tax Payer' && lapsePeriod == '20'){
						var initialTaxDate=wid.txtFillingDate.getDisplayedValue();
						for(var i=0;i<wid.historyDataGrid.store._arrayOfTopLevelItems.length;i++){
							var currItem=wid.historyDataGrid.store._arrayOfTopLevelItems[i];
							if(currItem.Action=='Tax Lien Original Filing'){
								initialTaxDate=currItem.FilingDate;
								break;
							}
						}
						currDate=new Date(initialTaxDate);
					}
					if(lapsePeriod)
						currDate.setFullYear(currDate.getFullYear()+parseInt(lapsePeriod));
					else
						currDate.setFullYear(currDate.getFullYear());
					if(theDialog.get("title") == 'Tax Payer' && lapsePeriod == '10'){
						currDate.setMonth(currDate.getMonth()+1);
						
					}
					
					var curr_day = currDate.getDate();
					var curr_month = currDate.getMonth()+1;
					var curr_year = currDate.getFullYear();
					if(curr_day<10)
						curr_day="0"+curr_day;
					if(curr_month<10)
						curr_month="0"+curr_month;
					
					if(lapsePeriod){
						wid.lastLapse=wid.txtLapseDate.getValue();
						wid.txtLapseDate.setValue(curr_month+"/"+curr_day+"/"+curr_year);
					}
					else if(wid.lastLapse != null && wid.lastLapse!="")
						wid.txtLapseDate.setValue(wid.lastLapse);
					if(newValue=='Transmitting Utility')
						wid.txtLapseDate.setValue("");
					if(theDialog.get("title") == 'Tax Payer'){
						if(newValue == "Notice of Federal Tax Lien"){
							wid.txtIFSN.setValue(wid.txtFillingId.getValue());
						}
						else{
							if(wid.txtFormSaved.value == "false"){
								wid.txtIFSN.setValue("");
							}
							else{
								wid.txtFormSaved.value="false";
							}
						}
					}
					//else
						//wid.txtLapseDate.setValue("");
				});
				
				this.ddlAction.on("change",function(newValue){
					console.log(wid.txtApplyAction.value);
					if(wid.txtApplyAction.value=='true'){
						var ucc1Date=wid.txtFillingDate.getDisplayedValue();
						if(wid.historyDataGrid.store)
						for(var i=0;i<wid.historyDataGrid.store._arrayOfTopLevelItems.length;i++){
							var currItem=wid.historyDataGrid.store._arrayOfTopLevelItems[i];
							if(currItem.Action=='Initial Financing Statement'){
								ucc1Date=currItem.FilingDate;
								break;
							}
						}
						console.log(wid.txtFormType.getValue());
						if(wid.txtFormType.getValue()=="UCC3"){
							console.log(wid.ddlAction.getValue())					  ;
							if(wid.ddlAction.getValue()=='Continuation'){
								var continuationExists=false;
								console.log(wid.historyDataGrid.store._arrayOfAllItems.length);
								for(var j=0;j<wid.historyDataGrid.store._arrayOfAllItems.length;j++){
									var currItem=wid.historyDataGrid.store._arrayOfAllItems[j];
									if(currItem.Action=='Continuation'){
										continuationExists=true;
										break;
									}
								}
								console.log(continuationExists);
								
								if(continuationExists){
									var currLapse=new Date(wid.txtLapseDate.getValue());
									var currDate=new Date();
									currLapse.setYear(currLapse.getYear()-5);
									
									if(currDate < currLapse){
										return;
									}
								}
								var currLapse;
								var startDate;
								if(!continuationExists){
									currLapse=new Date(wid.txtLapseDate.getValue());
									startDate=new Date(wid.txtLapseDate.getValue());
								}
								else{
									currLapse=new Date(wid.txtLapseDate.getValue());
									
									currLapse.setYear(currLapse.getFullYear()-5);
									startDate=new Date(wid.txtLapseDate.getValue());
									startDate.setYear(startDate.getFullYear()-5);
								}
								currLapse.setHours(23);
								currLapse.setMinutes(59);
								
								startDate.setMonth(startDate.getMonth()-6);
								var currDate=new Date();
								var currType=wid.ddlType.getValue();
								console.log(startDate);
								console.log(currDate);
								console.log(currLapse);
								if(currType=='Manufactured Home' || currType=='Public Financing' || currType=='Financing Statement'){
									if(!(startDate <= currDate && currDate <= currLapse)){
										alert("this does not fall within continuation period");
										wid.ddlAction.setValue("");
									}
									else{
										currLapse.setYear(currLapse.getFullYear()+5);
										console.log(currLapse);
										var curr_day = currLapse.getDate();
										var curr_month = currLapse.getMonth()+1;
										var curr_year = currLapse.getFullYear();
										console.log(curr_day);
										console.log(curr_month);
										console.log(curr_year);
										if(curr_day<10)
											curr_day="0"+curr_day;
										if(curr_month<10)
											curr_month="0"+curr_month;
										
										wid.txtLapseDate.setValue(curr_month+"/"+curr_day+"/"+curr_year);
									}
								}
							}
						}
					}else{
						console.log("before "+wid.txtApplyAction.value);
						wid.txtApplyAction.value="true";
						console.log("after "+wid.txtApplyAction.value);
					}
				});
				
				this.txtFillingDate.on("change",function(newValue){
					var currDate=new Date(newValue);
					var lapsePeriod=wid.lapsePeriods[wid.ddlType.getValue()];
					if(lapsePeriod)
						currDate.setFullYear(currDate.getFullYear()+parseInt(lapsePeriod));
					else
						currDate.setFullYear(currDate.getFullYear());
					if(theDialog.get("title") == 'Tax Payer' && lapsePeriod == '10'){
						currDate.setMonth(currDate.getMonth()+1);
					}	
					var curr_day = currDate.getDate();
					var curr_month = currDate.getMonth()+1;
					var curr_year = currDate.getFullYear();
					if(curr_day<10)
						curr_day="0"+curr_day;
					if(curr_month<10)
						curr_month="0"+curr_month;
					if(lapsePeriod){
						wid.lastLapse=wid.txtLapseDate.getValue();
						wid.txtLapseDate.setValue(curr_month+"/"+curr_day+"/"+curr_year);
						
					}
					else if(wid.lastLapse != null && wid.lastLapse!="")
						wid.txtLapseDate.setValue(wid.lastLapse);
				});
				
				this.individualRadio.on("change",function(newValue){
					if(wid.individualRadio.checked){
						domStyle.set(wid.individualSearch1, 'display', '');
						domStyle.set(wid.individualSearch2, 'display', '');
						domStyle.set(wid.individualSearch3, 'display', '');
						domStyle.set(wid.organizationSearch, 'display', 'none');
					}
				});
				
				this.organizationRadio.on("change",function(newValue){
					if(wid.organizationRadio.checked){
						domStyle.set(wid.individualSearch1, 'display', 'none');
						domStyle.set(wid.individualSearch2, 'display', 'none');
						domStyle.set(wid.individualSearch3, 'display', 'none');
						domStyle.set(wid.organizationSearch, 'display', '');
					}
				});
				
				this.nameRadio.on("change",function(newValue){
					if(wid.nameRadio.checked){
						if(wid.individualRadio.checked){
							domStyle.set(wid.individualSearch1, 'display', '');
							domStyle.set(wid.individualSearch2, 'display', '');
							domStyle.set(wid.individualSearch3, 'display', '');
							domStyle.set(wid.organizationSearch, 'display', 'none');
						}
						else if(wid.organizationRadio.checked){
							domStyle.set(wid.individualSearch1, 'display', 'none');
							domStyle.set(wid.individualSearch2, 'display', 'none');
							domStyle.set(wid.individualSearch3, 'display', 'none');
							domStyle.set(wid.organizationSearch, 'display', '');
						}
						domStyle.set(wid.accountNumberSearch, 'display', 'none');
					}
				});
				
				this.billingRadio.on("change",function(newValue){
					if(wid.billingRadio.checked){
						domStyle.set(wid.individualSearch1, 'display', 'none');
						domStyle.set(wid.individualSearch2, 'display', 'none');
						domStyle.set(wid.individualSearch3, 'display', 'none');
						domStyle.set(wid.organizationSearch, 'display', 'none');
						domStyle.set(wid.accountNumberSearch, 'display', '');
					}
				});
				
				this.searchDataGrid.on("RowDblClick",function(evt){
					var idx = evt.rowIndex;
					var rowData = wid.searchDataGrid.getItem(idx);
					if(wid.txtSearchType.value=="Submitter"){
						wid.txtFirstName.setValue(rowData.FirstName);
						wid.txtMiddleName.setValue(rowData.MiddleInitial);
						wid.txtLastName.setValue(rowData.LastName);
						wid.txtSuffixName.setValue(rowData.Suffix);
						wid.txtOrganization.setValue(rowData.Orgnization);
						wid.txtAddress1.setValue(rowData.Address_1);
						wid.txtAddress2.setValue(rowData.Address_2);
						wid.txtCity.setValue(rowData.City);
						wid.txtState.setValue(rowData.State);
						if(wid.txtState.getValue()=='')
							wid.txtState.setValue('NV');
						wid.txtZip.setValue(rowData.Zip);
						wid.txtCountry.setValue(rowData.Country);
						wid.txtPhone.setValue(rowData.Phone);
						wid.txtEmail.setValue(rowData.Email);
					}
					else if(wid.txtSearchType.value=="SentTo"){
						wid.txtFirstName2.setValue(rowData.FirstName);
						wid.txtMiddleName2.setValue(rowData.MiddleInitial);
						wid.txtLastName2.setValue(rowData.LastName);
						wid.txtSuffixName2.setValue(rowData.Suffix);
						wid.txtOrganization2.setValue(rowData.Orgnization);
						wid.txtAddress12.setValue(rowData.Address_1);
						wid.txtAddress22.setValue(rowData.Address_2);
						wid.txtCity2.setValue(rowData.City);
						wid.txtState2.setValue(rowData.State);
						if(wid.txtState2.getValue()=='')
							wid.txtState2.setValue('NV');
						wid.txtZip2.setValue(rowData.Zip);
						wid.txtCountry2.setValue(rowData.Country);
						wid.txtPhone2.setValue(rowData.Phone);
						wid.txtEmail2.setValue(rowData.Email);
					}
					else{
						wid.txtFirstName3.setValue(rowData.FirstName);
						wid.txtMiddleName3.setValue(rowData.MiddleInitial);
						wid.txtLastName3.setValue(rowData.LastName);
						wid.txtSuffixName3.setValue(rowData.Suffix);
						wid.txtOrganization3.setValue(rowData.Orgnization);
						wid.txtAddress13.setValue(rowData.Address_1);
						wid.txtAddress23.setValue(rowData.Address_2);
						wid.txtCity3.setValue(rowData.City);
						wid.txtState3.setValue(rowData.State);
						if(wid.txtState3.getValue()=='')
							wid.txtState3.setValue('NV');
						wid.txtZip3.setValue(rowData.Zip);
						wid.txtCountry3.setValue(rowData.Country);
					}
					//wid.txtPhone3.setValue(rowData.Phone);
					//wid.txtEmail3.setValue(rowData.Email);
					
					searchDeptorDialog.hide();
				});
				
				
            },
			
			
			fillSecondTab: function(jobId){
				var wid=this;
				var serviceParams = new Object();
				serviceParams.jobId = jobId;
					//alert(repository.id);
				  Request.invokePluginService("claimCustomPlugin", "submitterInfoService",
				  {
						requestParams: serviceParams,
						synchronous:true,
						requestCompleteCallback: function(response) {	// success
							var jsonResponse=dojo.toJson(response, true, "  ");
							var obj = JSON.parse(jsonResponse);
							wid.txtFirstName.setValue(obj.Submitter.FirstName);
							wid.txtMiddleName.setValue(obj.Submitter.MiddleInitial);
							wid.txtLastName.setValue(obj.Submitter.LastName);
							wid.txtSuffixName.setValue(obj.Submitter.Suffix);
							wid.txtOrganization.setValue(obj.Submitter.Orgnization);
							wid.txtAddress1.setValue(obj.Submitter.Address_1);
							wid.txtAddress2.setValue(obj.Submitter.Address_2);
							wid.txtCity.setValue(obj.Submitter.City);
							wid.txtState.setValue(obj.Submitter.State);
							if(wid.txtState.getValue()=='')
								wid.txtState.setValue('NV');
							wid.txtZip.setValue(obj.Submitter.Zip);
							wid.txtCountry.setValue(obj.Submitter.Country);
							wid.txtPhone.setValue(obj.Submitter.Phone);
							wid.txtEmail.setValue(obj.Submitter.Email);
							
							wid.txtFirstName2.setValue(obj.Send_To.FirstName);
							wid.txtMiddleName2.setValue(obj.Send_To.MiddleInitial);
							wid.txtLastName2.setValue(obj.Send_To.LastName);
							wid.txtSuffixName2.setValue(obj.Send_To.Suffix);
							wid.txtOrganization2.setValue(obj.Send_To.Orgnization);
							wid.txtAddress12.setValue(obj.Send_To.Address_1);
							wid.txtAddress22.setValue(obj.Send_To.Address_2);
							wid.txtCity2.setValue(obj.Send_To.City);
							wid.txtState2.setValue(obj.Send_To.State);
							if(wid.txtState2.getValue()=='')
								wid.txtState2.setValue('NV');
							wid.txtZip2.setValue(obj.Send_To.Zip);
							wid.txtCountry2.setValue(obj.Send_To.Country);
							wid.txtPhone2.setValue(obj.Send_To.Phone);
							wid.txtEmail2.setValue(obj.Send_To.Email);
							
							wid.txtNotes.setValue(obj.Note);
						}
				  });
			},
			
			handleICM_eSoSCaseEvent: function(payload){
				console.log("test 1");
				
				var wid=this;
				var myCase=payload.workItemEditable.getCase();
				console.log("#########************************");
				var lockedByCurrentUser=payload.workItemEditable.icmWorkItem.lockedByCurrentUser;
				
			
				/*if(payload.workItemEditable.getStepName() == "Rejected Job"){
					domStyle.set(wid.btnReject.domNode, 'display', 'none');
					domStyle.set(wid.btnCommit.domNode, 'display', '');
					domStyle.set(wid.btnPend.domNode, 'display', 'none');
					domStyle.set(wid.btnDeleteJob.domNode, 'display', 'none');
					domStyle.set(wid.btnRejectLetter.domNode, 'display', '');
					domStyle.set(wid.btnConfirmDelete.domNode, 'display', '');
				}
				else{
					domStyle.set(wid.btnReject.domNode, 'display', 'none');
					domStyle.set(wid.btnCommit.domNode, 'display', '');
					domStyle.set(wid.btnPend.domNode, 'display', '');
					domStyle.set(wid.btnDeleteJob.domNode, 'display', 'none');
					domStyle.set(wid.btnRejectLetter.domNode, 'display', '');
					domStyle.set(wid.btnConfirmDelete.domNode, 'display', '');
				}*/
				this.myCase=myCase;
				//var newStore = new dojo.data.ItemFileReadStore({data: {  identifier: "GUID",  items: []}});
				//this.docsDataGrid.setStore(newStore);
						
				
				myCase.retrieveAttributes(lang.hitch(this,function(retAtt){
					console.log("************************");
					console.log(retAtt);
					var map={
					   '1':'Downgrade',
					   '2':'NONE',
					  '3':'24H',
					   '4':'4H',
					   '5':'2H',
					   '6':'1H' 
					};
					
					if(retAtt.attributes.ESOS_Status=='Pended'){
						wid.btnCommit.setDisabled(true);
						wid.btnConfirmDelete.setDisabled(true);
						wid.btnPend.setDisabled(true);
						wid.btnUpdateExpedite.setDisabled(true);
					}
					else{
						wid.btnCommit.setDisabled(false);
						wid.btnConfirmDelete.setDisabled(false);
						wid.btnPend.setDisabled(false);
						wid.btnUpdateExpedite.setDisabled(false);
					}
					
					wid.btnPend.setDisabled(!lockedByCurrentUser);
					wid.btnCommit.setDisabled(!lockedByCurrentUser);
					wid.btnConfirmDelete.setDisabled(!lockedByCurrentUser);
					wid.btnUpdateExpedite.setDisabled(!lockedByCurrentUser);
					wid.btnAddDoc.setDisabled(!lockedByCurrentUser);
					
					wid.fillSecondTab(retAtt.attributes.ESOS_JobNumber);
					console.log(retAtt.attributes.ESOS_JobNumber);
					wid.jobNumber=retAtt.attributes.ESOS_JobNumber;
					wid.txtJobNumber.setValue(retAtt.attributes.ESOS_JobNumber);
					wid.txtExpedite.setValue(map[retAtt.attributes.ESOS_Expdite]);
					/*if(retAtt.attributes.ESOS_Type !="Deleted"){
						domStyle.set(wid.btnConfirmDelete.domNode, 'display', 'none');
					}*/
					myCase.retrieveCaseFolder(lang.hitch(this,function(retFol){
						var properties = [{"name": "ESOS_AssignedTo","value" : retFol.repository.userId}];
						retFol.saveAttributes(properties,retFol.template,null,null,false,function(response) {
							//wid.onRefresh();
						});
						
						this.btnUpdateExpedite.on("click",function(e){
							dojo.require("dijit.form.Button");
							dojo.require("dijit.Dialog");
							dojo.require("dijit.form.ComboBox");
							dojo.require("dojo.store.Memory");
							dojo.require("ecm.model.Request");
							
							var myDialog = new dijit.Dialog({
								title:'Update Expedite',
								style:'width:400px;height:250px;'
							});
							var map={
							   'Downgrade' : 1 ,
							   'NONE' : 2 ,
							   '24H' : 3 ,
							   '4H' : 4 ,
							   '2H' : 5 ,
							   '1H' : 6 
							};
							var stateStore = new dojo.store.Memory({
								data: [
									{name:"Downgrade", id:"1"},
									{name:"NONE", id:"2"},
									{name:"24H", id:"3"},
									{name:"4H", id:"4"},
									{name:"2H", id:"5"},
									{name:"1H", id:"6"}
								]
							});

							var ddlExpedite = new dijit.form.ComboBox({
								name: "state",
								value: "NONE",
								store: stateStore,
								searchAttr: "name"
							});
							ddlExpedite.startup();
							var myButton = new dijit.form.Button({
								label: "Update",
								onClick: function(){
									var priority=map[ddlExpedite.getValue()];
									var repository=wid.getSolution().getTargetOS();
									if(priority<=6){
										var properties = [{"name": "ESOS_Expdite","value" : priority},{"name": "ESOS_Priority","value" : priority}];
										var serviceParams = new Object();
										retFol.saveAttributes(properties,retFol.template,null,null,false,function(response) {
											console.log(retAtt);
											serviceParams.input = '{"JobNumber":"'+retAtt.attributes.ESOS_JobNumber+'","ExpediteCode":"'+priority+'"}';
											ecm.model.Request.invokePluginService("claimCustomPlugin", "updateExpediteService",
											{
												requestParams: serviceParams,
												synchronous:true,
												requestCompleteCallback: function(response) {
													//wid.onRefresh();
												}
											});
											
										});
									}
									else{
										repository.retrieveItem(retAtt.caseFolderId,function(retFol){
											var properties = [{"name": "ESOS_Expdite","value" : priority}];
											retFol.saveAttributes(properties,retFol.template,null,null,false,function(response) {
												//wid.onRefresh();
											});
										});
									}
									wid.txtExpedite.setValue(ddlExpedite.getValue());
									myDialog.hide();
								}
							});
							myButton.startup();
							var tbl     = document.createElement("table");
							var tblBody = document.createElement("tbody");
							var row1 = document.createElement("tr");
							var row2 = document.createElement("tr");
							var cell1 = document.createElement("td");
							var cell2 = document.createElement("td");
							var cell3 = document.createElement("td");
							cell2.colspan="2";
							dojo.place(ddlExpedite.domNode,cell2);
							var cellText = document.createTextNode("Select Expedite : ");
							cell1.appendChild(cellText);
							dojo.place(myButton.domNode,cell3);
							row1.appendChild(cell1);
							row1.appendChild(cell2);
							row2.appendChild(cell3);
							tblBody.appendChild(row1);
							tblBody.appendChild(row2);
							tbl.appendChild(tblBody);

							dojo.place(tbl,myDialog.containerNode);
							myDialog.show();
						});
						
						this.btnRejectLetter.on("click",function(e){
							if(wid.txtOrganization.getValue() ==''){
								if(wid.txtFirstName.getValue()=='' || wid.txtLastName.getValue()==''){
									alert("Please enter submitter name or organization");
									return;
								}
							}
							if(wid.txtAddress1.getValue()=='' || wid.txtCity.getValue()=='' || wid.txtZip.getValue()=='' || wid.txtState.getValue()==''){
								alert("Please enter the submitter address information");
								return;
							}
							var serviceParams2 = new Object();
							var emptySentTo=false;
							if(wid.txtFirstName2.getValue()=='' && wid.txtMiddleName2.getValue()=='' && wid.txtLastName2.getValue()=='' && wid.txtSuffixName2.getValue()=='' && wid.txtOrganization2.getValue()=='' && wid.txtAddress12.getValue()==''){
								emptySentTo=true;
							}
							var jsonStr='{"JobNumber":"'+retAtt.attributes.ESOS_JobNumber+'","Note":"'+wid.txtNotes.getValue()+'","Submitter":{"FirstName":"'+wid.txtFirstName.getValue()+'","MiddleInitial":"'+wid.txtMiddleName.getValue()+'","LastName":"'+wid.txtLastName.getValue()+'","Suffix":"'+wid.txtSuffixName.getValue()+'","Orgnization":"'+wid.txtOrganization.getValue()+'","Address_1":"'+wid.txtAddress1.getValue()+'","Address_2":"'+
							wid.txtAddress2.getValue()+'","City":"'+wid.txtCity.getValue()+'","Zip":"'+wid.txtZip.getValue()+'","Phone":"'+wid.txtPhone.getValue()+'","State":"'+wid.txtState.getValue()+'","Country":"'+wid.txtCountry.getValue()+'","Email":"'+wid.txtEmail.getValue()+'"}';
							if(!emptySentTo){
								jsonStr+=',"SendTo":{"FirstName":"'+wid.txtFirstName2.getValue()+'","MiddleInitial":"'+wid.txtMiddleName2.getValue()+'","LastName":"'+wid.txtLastName2.getValue()+'","Suffix":"'+wid.txtSuffixName2.getValue()+'","Orgnization":"'+wid.txtOrganization2.getValue()+'","Address_1":"'+wid.txtAddress12.getValue()+'","Address_2":"'+
								wid.txtAddress22.getValue()+'","City":"'+wid.txtCity2.getValue()+'","Zip":"'+wid.txtZip2.getValue()+'","Phone":"'+wid.txtPhone2.getValue()+'","State":"'+wid.txtState2.getValue()+'","Country":"'+wid.txtCountry2.getValue()+'","Email":"'+wid.txtEmail2.getValue()+'"}';
							}
							else{
								jsonStr+=',"SendTo":null';
							}
							jsonStr+='}';
							
							serviceParams2.input = jsonStr;
							console.log("before save");
							Request.invokePluginService("claimCustomPlugin", "saveJobService",
							{
								requestParams: serviceParams2,
								synchronous:true,
								requestCompleteCallback: function(response) {
									rejectionDialog.show();
								}
							});
							
						});
						
						this.btnDoRejection.on("click",function(e){
							var selectedIds=new Array();
							var repository=wid.getSolution().getTargetOS();
							array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
								selectedIds.push(row);
							});
							var currDoc=selectedIds[0];
							var reasons=new Array();
							if(wid.rejectCHK1.checked)
								reasons.push("1");
							if(wid.rejectCHK2.checked)
								reasons.push("2");
							if(wid.rejectCHK3.checked)
								reasons.push("3");
							if(wid.rejectCHK4.checked)
								reasons.push("4");
							if(wid.rejectCHK5.checked)
								reasons.push("5");
							if(wid.rejectCHK6.checked)
								reasons.push("6");
							if(wid.rejectCHK7.checked)
								reasons.push("7");
							if(wid.rejectCHK8.checked)
								reasons.push("8");
							if(wid.rejectCHK9.checked)
								reasons.push("9");
							if(wid.rejectCHK10.checked)
								reasons.push("10");
							if(wid.rejectCHK11.checked)
								reasons.push("11");
							if(wid.rejectCHK12.checked)
								reasons.push("12");
							if(wid.rejectCHK13.checked)
								reasons.push("13");
							if(wid.rejectCHK14.checked)
								reasons.push("14");
							if(wid.rejectCHK15.checked)
								reasons.push("15");
							if(wid.rejectCHK16.checked)
								reasons.push("16");
							if(wid.rejectCHK17.checked)
								reasons.push("17");
							if(wid.rejectCHK18.checked)
								reasons.push("18");
							if(wid.rejectCHK19.checked)
								reasons.push("19");
							if(wid.rejectCHK20.checked)
								reasons.push("20");
							if(wid.rejectCHK21.checked)
								reasons.push("21");
							if(wid.rejectCHK22.checked)
								reasons.push("22");
							if(wid.rejectCHK23.checked)
								reasons.push("23");
							if(wid.rejectCHK24.checked)
								reasons.push("24");
							if(wid.rejectCHK25.checked)
								reasons.push("25");
							if(wid.rejectCHK26.checked)
								reasons.push("26");
							if(wid.rejectCHK27.checked)
								reasons.push("27");
							//alert(reasons.join(","));
							var filingNo=selectedIds[0].Filing_Number , user=wid.getSolution().getTargetOS().userId;
									//window.open("http://localhost:500/letter/RejectionLetter?filingNo="+filingNo+"&user="+user+"&rejectionNotes="+textarea.getValue());
							var url = window.location.href;
							var ip = url.split("/")[2];
							window.showModalDialog("http://"+ip.split(":")[0]+":500/letter/RejectionLetter?filingNo="+filingNo+"&user="+user+"&rejectionNotes="+wid.txtRejectionNotes.getValue()+"&formOfPayment="+wid.txtFormOfPayment.getValue()+"&reasons="+reasons.join(","), "", 'dialogHeight=10px,dialogWidth=10px,status=no,toolbar=no,menubar=no,location=no');
							
							
							var serviceParams = new Object();
							serviceParams.input = selectedIds[0].Filing_Number;
							
							//setTimeout(
							Request.invokePluginService("claimCustomPlugin", "deleteDocService",
							{
								requestParams: serviceParams,
								synchronous:true,
								requestCompleteCallback: function(response) {	// success
									repository.retrieveItem(selectedIds[0].GUID,function(contentItem){
										repository.retrieveItem(selectedIds[0].GUID, lang.hitch(wid, function(releasedItem) {
											var properties = [{"name": "ESOS_DocStatus","value" : "Rejected"}];
											releasedItem.saveAttributes(properties,releasedItem.template,null,null,false,function(response) {
											//repository.deleteItems([contentItem],function(){
												wid.docsDataGrid.store.deleteItem(currDoc);
												var deleteJob=true;
												for(var i=0;i<wid.docsDataGrid.store._arrayOfTopLevelItems.length;i++){
													var currItem=wid.docsDataGrid.store._arrayOfTopLevelItems[i];
													if(currItem==null)
														continue;
													if(currItem.Filing_Type != "Correspondence" && currItem.Filing_Type != "Payment"){
														deleteJob=false;
														break
													}
												}
												
												if(deleteJob){
													alert("this job will be deleted as it has no filings");
													var selectedIds=new Array();
													var repository=wid.getSolution().getTargetOS();
													var properties2 = [{"name": "ESOS_Rejected","value" : "Delete"}];
														
													retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
														
														var serviceParams = new Object();
														serviceParams.input = retAtt.attributes.ESOS_JobNumber;
															
														Request.invokePluginService("claimCustomPlugin", "deleteJobService",
														{
															requestParams: serviceParams,
															synchronous:true,
															requestCompleteCallback: function(response) {	// success
																payload.workItemEditable.completeStep(function(){
																	repository.deleteItems([retFol],function(){
																		window.location.reload(false);
																	},true);
																});
																
															}
														});
													});
												}
												rejectionDialog.hide();
											});
										}),contentItem.template,"released",contentItem.vsId);
									});
								}
							});
						});
						
						this.btnDeleteDoc.on("click",function(e){
							var dialog=new ConfirmDialog({ message: "Are you sure you want to delete the selected document(s) ?",title: "Confirmation"});
							dialog.confirmAction=function(){
								var selectedIds=new Array();
								var repository=wid.getSolution().getTargetOS();
								array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
									var serviceParams = new Object();
									serviceParams.input = row.Filing_Number;
										
									Request.invokePluginService("claimCustomPlugin", "deleteDocService",
									{
										requestParams: serviceParams,
										synchronous:true,
										requestCompleteCallback: function(response) {	// success
											repository.retrieveItem(row.GUID,function(contentItem){
												repository.deleteItems([contentItem],function(){
													wid.docsDataGrid.store.deleteItem(row);
													var deleteJob=true;
													for(var i=0;i<wid.docsDataGrid.store._arrayOfTopLevelItems.length;i++){
														var currItem=wid.docsDataGrid.store._arrayOfTopLevelItems[i];
														if(currItem==null)
															continue;
														if(currItem.Filing_Type != "Correspondence" && currItem.Filing_Type != "Payment"){
															deleteJob=false;
															break
														}
													}
													if(deleteJob){
														alert("this job will be deleted as it has no filings");
														var selectedIds=new Array();
														var repository=wid.getSolution().getTargetOS();
														var properties2 = [{"name": "ESOS_Rejected","value" : "Delete"}];
															
														retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
															
															var serviceParams = new Object();
															serviceParams.input = retAtt.attributes.ESOS_JobNumber;
																
															Request.invokePluginService("claimCustomPlugin", "deleteJobService",
															{
																requestParams: serviceParams,
																synchronous:true,
																requestCompleteCallback: function(response) {	// success
																	payload.workItemEditable.completeStep(function(){
																		repository.deleteItems([retFol],function(){
																			window.location.reload(false);
																		},true);
																	});
																	
																}
															});
														});
													}
												},true);
											});
										}
									});
								});
								
								
							}
							dialog.show();
						});
						
						wid.btnConfirmDelete.on("click",function(evt){
							var dialog=new ConfirmDialog({ message: "Are you sure you want to confirm job deletion ?",title: "Confirmation"});
							dialog.confirmAction=function(){
								var selectedIds=new Array();
								var repository=wid.getSolution().getTargetOS();
								var properties2 = [{"name": "ESOS_Rejected","value" : "Delete"}];
									
								retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
									
									var serviceParams = new Object();
									serviceParams.input = retAtt.attributes.ESOS_JobNumber;
										
									Request.invokePluginService("claimCustomPlugin", "deleteJobService",
									{
										requestParams: serviceParams,
										synchronous:true,
										requestCompleteCallback: function(response) {	// success
											payload.workItemEditable.completeStep(function(){
												repository.deleteItems([retFol],function(){
													window.location.reload(false);
												},true);
											});
											
										}
									});
								});
								
							}
							dialog.show();
						});
						
					
						var url = window.location.href;
						var ip = url.split("/")[2];
						
						wid.chargesTab.on("show",function(e){
							wid.paymentsIFrame.set("content", dojo.create("iframe", {
								"src": "http://"+ip.split(":")[0]+":600/Payments?jnum="+retAtt.attributes.ESOS_JobNumber,
								"style": "border: 0; width: 100%; height: 100%"
							}));
							paymentsDialog.show();
							
						});
						wid.btnCnclPayment.on("click",function(evt){
							paymentsDialog.hide();
							wid.mainTabs.selectChild(wid.fillingsTab);
						});
						wid.btnCommit.on("click",function(evt){
							var notReviewed=new Array();
							var noUCC=true;
							if(wid.docsDataGrid.store !=null){
								array.forEach(wid.docsDataGrid.store._arrayOfTopLevelItems, function(item){
									if(item && item['Reviewed'] != 'Yes'){
										notReviewed.push(item);
									}
									if(item.Filing_Type != "Correspondence" && item.Filing_Type != "Payment"){
										noUCC=false;
									}
								});
							}

							if(noUCC){
								alert("There is no UCC fillings in this job to commit !!!");
								return;
							}
							
							if(notReviewed.length > 0){
								alert("All filings must be reviewed before commit !!!");
								return;
							}
							if(wid.txtOrganization.getValue() ==''){
								if(wid.txtFirstName.getValue()=='' || wid.txtLastName.getValue()==''){
									alert("Please enter submitter name or organization");
									return;
								}
							}
							if(wid.txtAddress1.getValue()=='' || wid.txtCity.getValue()=='' || wid.txtZip.getValue()=='' || wid.txtState.getValue()==''){
								alert("Please enter the submitter address information");
								return;
							}
							if(wid.emailRadio.checked){
								if(wid.txtFirstName2.getValue()=='' && wid.txtMiddleName2.getValue()=='' && wid.txtLastName2.getValue()=='' && wid.txtSuffixName2.getValue()=='' && wid.txtOrganization2.getValue()=='' && wid.txtAddress12.getValue()==''){
									if(wid.txtEmail.getValue()==''){
										alert("Please enter submitter email");
										return;
									}
									else if(!wid.validateEmail(wid.txtEmail.getValue())){
										alert("Please enter a valid submitter email");
										return;
									}
								}
								else{
									if(wid.txtEmail2.getValue()==''){
										alert("Please enter sentto email");
										return;
									}
									else if(!wid.validateEmail(wid.txtEmail2.getValue())){
										alert("Please enter a valid sentto email");
										return;
									}
								}
							}
							var invalidTaxLien=false;
							var invalidUCC=false;
							for(var j=0;j<wid.docsDataGrid.store._arrayOfTopLevelItems.length;j++){
								var currItem=wid.docsDataGrid.store._arrayOfTopLevelItems[j];
								var docType=currItem.Filing_Type.toString();
								if(currItem.Filing_Type.toString().contains("Tax Lien")){

									var serviceParams5 = new Object();
									serviceParams5.input = currItem.Filing_Number;
										//alert(repository.id);
										
									  Request.invokePluginService("claimCustomPlugin", "deptorsListService",
									  {
										  
											requestParams: serviceParams5,
											synchronous:true,
											requestCompleteCallback: function(response) {	// success
												var jsonResponse=dojo.toJson(response, true, "  ");
												var obj = JSON.parse(jsonResponse);
												if(obj.Debitors.length == 0){
													invalidTaxLien=true;
													
												}
													
											}
									  });
								}
								else if(docType=="UCC1" || docType == "UCC3" || docType == "UCC5"){
									var serviceParams5 = new Object();
									serviceParams5.input = currItem.Filing_Number;
										//alert(repository.id);
										
									  Request.invokePluginService("claimCustomPlugin", "deptorsListService",
									  {
											requestParams: serviceParams5,
											synchronous:true,
											requestCompleteCallback: function(response) {	// success
												var jsonResponse=dojo.toJson(response, true, "  ");
												var obj = JSON.parse(jsonResponse);
												if(obj.Debitors.length == 0 || obj.SecuredParties.length == 0){
													invalidUCC=true;
												}
											}
									  });
								}
							}
							
							if(invalidTaxLien){
								alert("Tax lien fillings must have at least one tax payer");
							}
							else if(invalidUCC){
								alert("UCC fillings must have at least one debtor and one secured party");
							}
							else{
								var serviceParams4 = new Object();
								serviceParams4.input = retAtt.attributes.ESOS_JobNumber;
								
								//setTimeout(
								Request.invokePluginService("claimCustomPlugin", "fullPaidService",
								{
									requestParams: serviceParams4,
									synchronous:true,
									requestCompleteCallback: function(response) {	// success
										var jsonResponse=dojo.toJson(response, true, "  ");
										var obj = JSON.parse(jsonResponse);
										
										if(obj.Result==false){
											alert("This job is not fully paid yet");
										}else{
											var serviceParams5 = new Object();
											serviceParams5.input = retAtt.attributes.ESOS_JobNumber;
											Request.invokePluginService("claimCustomPlugin", "checkPendingUCC11Service",
											{
												requestParams: serviceParams5,
												synchronous:true,
												requestCompleteCallback: function(response) {	// success
													var jsonResponse=dojo.toJson(response, true, "  ");
													var obj = JSON.parse(jsonResponse);
													if(obj.Done==false || obj.Done=='false'){
														alert(obj.Error);
													}
													else{
														var serviceParams2 = new Object();
														var emptySentTo=false;
														if(wid.txtFirstName2.getValue()=='' && wid.txtMiddleName2.getValue()=='' && wid.txtLastName2.getValue()=='' && wid.txtSuffixName2.getValue()=='' && wid.txtOrganization2.getValue()=='' && wid.txtAddress12.getValue()==''){
															emptySentTo=true;
														}
														var jsonStr='{"JobNumber":"'+retAtt.attributes.ESOS_JobNumber+'","Note":"'+wid.txtNotes.getValue()+'","Submitter":{"FirstName":"'+wid.txtFirstName.getValue()+'","MiddleInitial":"'+wid.txtMiddleName.getValue()+'","LastName":"'+wid.txtLastName.getValue()+'","Suffix":"'+wid.txtSuffixName.getValue()+'","Orgnization":"'+wid.txtOrganization.getValue()+'","Address_1":"'+wid.txtAddress1.getValue()+'","Address_2":"'+
														wid.txtAddress2.getValue()+'","City":"'+wid.txtCity.getValue()+'","Zip":"'+wid.txtZip.getValue()+'","Phone":"'+wid.txtPhone.getValue()+'","State":"'+wid.txtState.getValue()+'","Country":"'+wid.txtCountry.getValue()+'","Email":"'+wid.txtEmail.getValue()+'"}';
														if(!emptySentTo){
															jsonStr+=',"SendTo":{"FirstName":"'+wid.txtFirstName2.getValue()+'","MiddleInitial":"'+wid.txtMiddleName2.getValue()+'","LastName":"'+wid.txtLastName2.getValue()+'","Suffix":"'+wid.txtSuffixName2.getValue()+'","Orgnization":"'+wid.txtOrganization2.getValue()+'","Address_1":"'+wid.txtAddress12.getValue()+'","Address_2":"'+
															wid.txtAddress22.getValue()+'","City":"'+wid.txtCity2.getValue()+'","Zip":"'+wid.txtZip2.getValue()+'","Phone":"'+wid.txtPhone2.getValue()+'","State":"'+wid.txtState2.getValue()+'","Country":"'+wid.txtCountry2.getValue()+'","Email":"'+wid.txtEmail2.getValue()+'"}';
														}
														else{
															jsonStr+=',"SendTo":null';
														}
														jsonStr+='}';
														serviceParams2.input = jsonStr;
														console.log("before save");
														Request.invokePluginService("claimCustomPlugin", "saveJobService",
														{
															requestParams: serviceParams2,
															synchronous:true,
															requestCompleteCallback: function(response) {
																console.log("after save");
																var jobNumber=retAtt.attributes.ESOS_JobNumber,user=wid.getSolution().getTargetOS().userId;
															//	window.open("http://localhost:500/letter/AcknowldgementLetter?jobNumber="+jobNumber+"&user="+user);
																var url = window.location.href;
																var ip = url.split("/")[2];
																if(wid.emailRadio.checked){
																	var email;
																	if(wid.txtFirstName2.getValue()=='' && wid.txtMiddleName2.getValue()=='' && wid.txtLastName2.getValue()=='' && wid.txtSuffixName2.getValue()=='' && wid.txtOrganization2.getValue()=='' && wid.txtAddress12.getValue()==''){
																		email=wid.txtEmail.getValue();
																	}
																	else{
																		email=wid.txtEmail2.getValue();
																	}
																	//alert("http://"+ip.split(":")[0]+":500/letter/AcknowldgementLetter?jobNumber="+jobNumber+"&user="+user+"&sendMail=true&email="+email);
																	/*wid.aknowledgeIFrame.set("content", dojo.create("iframe", {//ip.split(":")[0]
																		"src": "http://"+ip.split(":")[0]+":500/letter/AcknowldgementLetter?jobNumber="+jobNumber+"&user="+user+"&sendMail=true&email="+email,
																		"style": "border: 0; width: 100%; height: 100%"
																	}));
																	aknowledgeDialog.show();*/
																	
																	var serviceParams4 = new Object();
																	serviceParams4.input = "jobNumber="+jobNumber+"&user="+user+"&sendMail=true&email="+email;
																	Request.invokePluginService("claimCustomPlugin", "sendMailService",
																	{
																		requestParams: serviceParams4,
																		synchronous:true,
																		requestCompleteCallback: function(response) {	// success
																			var serviceParams = new Object();
																			serviceParams.input = retAtt.attributes.ESOS_JobNumber;
																			Request.invokePluginService("claimCustomPlugin", "commitJobService",
																			{
																				requestParams: serviceParams,
																				synchronous:true,
																				requestCompleteCallback: function(response) {	// success
																					var jsonResponse=dojo.toJson(response, true, "  ");
																					var obj = JSON.parse(jsonResponse);
																					if(obj.Done==false || obj.Done=='false'){
																						alert(obj.Error);
																					}
																					else{
																						var properties2 = [{"name": "ESOS_Rejected","value" : "Delete"}];
																						retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
																							payload.workItemEditable.completeStep(function(){
																								var repository=wid.getSolution().getTargetOS();
																								var index=0;
																								for(var j=0;j<wid.docsDataGrid.store._arrayOfTopLevelItems.length;j++){
																									var item=wid.docsDataGrid.store._arrayOfTopLevelItems[j];
																									repository.retrieveItem(item.GUID,function(contentItem){
																										repository.retrieveItem(item.GUID, lang.hitch(wid, function(releasedItem) {
																											var properties = [{"name": "ESOS_DocStatus","value" : "Committed"}];
																											releasedItem.saveAttributes(properties,releasedItem.template,null,null,false,function(response) {
																												if(index==wid.docsDataGrid.store._arrayOfTopLevelItems.length-1){
																													window.location.reload(false);
																												}
																												index++;
																											});
																										}),contentItem.template,"released",contentItem.vsId);
																									});
																								}
																								/*array.forEach(wid.docsDataGrid.store._arrayOfAllItems, function(item){
																									repository.retrieveItem(item.GUID,function(contentItem){
																										var properties = [{"name": "ESOS_DocStatus","value" : "Committed"}];
																										contentItem.saveAttributes(properties,contentItem.template,null,null,false,function(response) {
																										});
																									});
																								});
																								window.location.reload(false);*/
																							});
																						});
																					}
																				}
																			});
																		}
																	});
																	
			//														window.showModalDialog("http://"+ip.split(":")[0]+":500/letter/AcknowldgementLetter?jobNumber="+jobNumber+"&user="+user+"&sendMail=true&email="+email, null, 'dialogHeight=10px,dialogWidth=10px,status=no,toolbar=no,menubar=no,location=no');
																	
																}else{
																	window.showModalDialog("http://"+ip.split(":")[0]+":500/letter/AcknowldgementLetter?jobNumber="+jobNumber+"&user="+user+"&sendMail=false", null, 'dialogHeight=10px,dialogWidth=10px,status=no,toolbar=no,menubar=no,location=no');
																	var serviceParams = new Object();
																	serviceParams.input = retAtt.attributes.ESOS_JobNumber;
																	
																	Request.invokePluginService("claimCustomPlugin", "commitJobService",
																	{
																		requestParams: serviceParams,
																		synchronous:true,
																		requestCompleteCallback: function(response) {	// success
																			var jsonResponse=dojo.toJson(response, true, "  ");
																			var obj = JSON.parse(jsonResponse);
																			if(obj.Done==false || obj.Done=='false'){
																				alert(obj.Error);
																			}
																			else{
																				var properties2 = [{"name": "ESOS_Rejected","value" : "Delete"}];
																				retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
																					payload.workItemEditable.completeStep(function(){
																						var repository=wid.getSolution().getTargetOS();
																						var index=0;
																						for(var j=0;j<wid.docsDataGrid.store._arrayOfTopLevelItems.length;j++){
																							var item=wid.docsDataGrid.store._arrayOfTopLevelItems[j];
																							repository.retrieveItem(item.GUID,function(contentItem){
																								repository.retrieveItem(item.GUID, lang.hitch(wid, function(releasedItem) {
																									var properties = [{"name": "ESOS_DocStatus","value" : "Committed"}];
																									releasedItem.saveAttributes(properties,releasedItem.template,null,null,false,function(response) {
																										if(index==wid.docsDataGrid.store._arrayOfTopLevelItems.length-1){
																											window.location.reload(false);
																										}
																										index++;
																									});
																								}),contentItem.template,"released",contentItem.vsId);
																							});
																						}
																						/*array.forEach(wid.docsDataGrid.store._arrayOfAllItems, function(item){
																							
																							repository.retrieveItem(item.GUID,function(contentItem){
																								var properties = [{"name": "ESOS_DocStatus","value" : "Committed"}];
																								contentItem.saveAttributes(properties,contentItem.template,null,null,false,function(response) {
																								});
																							});
																						});*/
																						
																					});
																				});
																			}
																		}
																	});
																}
																
																	
																
																//setTimeout(
																
															}
														});
													}
												}
											});
											
											
											
										}
									}
								});
							}
							//,20000);
						});
						wid.btnPend.on("click",function(evt){
							dojo.require("dijit.form.Button");
							dojo.require("dijit.Dialog");
							dojo.require("dijit.form.Textarea");
							dojo.require("dijit.form.TextBox");
							var repository=wid.getSolution().getTargetOS();
							
							var myDialog = new dijit.Dialog({
							 title:'Pend the Job',
							 style:'width:400px;height:250px;'
							});
							
							var textarea = new dijit.form.Textarea({
								name: "myarea",
								style: "width:200px;"
							});
							textarea.startup();
							var textbox = new dijit.form.TextBox();
							var myButton = new dijit.form.Button({
								label: "Pend",
								onClick: function(){
									if(textarea.getValue() == ''){
										alert("Please enter the pend comments");
									}
									else if(textbox.getValue()==''){
										alert("Please enter the pend hours");
									}
									else{
										var properties2 = [{"name": "ESOS_Rejected","value" : "Pend"},{"name": "ESOS_RejectionReasons","value" : textarea.getValue()},{"name": "ESOS_PendTimeout","value" : textbox.getValue()},{"name": "ESOS_PendUser","value" :repository.userId},{"name": "ESOS_Status","value" :"Pended"}];
										console.log(retFol)
										//console.log(retFol.attributes["Id"])
										retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
											var workItem=payload.workItemEditable.icmWorkItem.ecmWorkItem;
											//var collectionController = ControllerManager.bind(workItem);
											//var workflowIntegration = ControllerManager.getWorkflowIntegration();
											
											//var controller = collectionController.getPropertyController("F_CaseFolder","ESOS_PendHours");
											console.log("Get Workflow Integration ");										
											//collectionController.getPropertyController("ESOS_PendHours").set("value", "20");
											workItem.setValue("ESOS_PendHours",textbox.getValue());
											workItem.setValue("ESOS_PendTimeout",textbox.getValue());
											payload.workItemEditable.completeStep(function(param){
												//alert(param);
												//console.log(param);
												myDialog.hide();
												window.location.reload(false);
												/*payload.workItemEditable.lockStep(function(){
													
												});*/
											});
										});
										/*payload.workItemEditable.icmWorkItem.moveToInbox(function(){
											var properties2 = [{"name": "ESOS_RejectionReasons","value" : textarea.getValue()}];
											
											retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
												myDialog.hide();
												window.location.reload(false);
											});
											
										});
										*/
									}
								}
							});
							myButton.startup();

							var tbl     = document.createElement("table");
							var tblBody = document.createElement("tbody");
							var row1 = document.createElement("tr");
							var row2 = document.createElement("tr");
							var row3 = document.createElement("tr");
							var cell1 = document.createElement("td");
							var cell2 = document.createElement("td");
							var cell3 = document.createElement("td");
							var cell4 = document.createElement("td");
							var cell5 = document.createElement("td");
							cell3.colspan="2";
							dojo.place(textarea.domNode,cell2);
							var cellText = document.createTextNode("Pend Comments : ");
							var cellText2 = document.createTextNode("Pend Hours : ");
							cell1.appendChild(cellText);
							cell4.appendChild(cellText2);
							dojo.place(myButton.domNode,cell3);
							dojo.place(textbox.domNode,cell5);
							
							row1.appendChild(cell1);
							row1.appendChild(cell2);
							row2.appendChild(cell3);
							row3.appendChild(cell4);
							row3.appendChild(cell5);
							tblBody.appendChild(row1);
							tblBody.appendChild(row3);
							tblBody.appendChild(row2);
							tbl.appendChild(tblBody);

							dojo.place(tbl,myDialog.containerNode);
							myDialog.show();
						});
						/*wid.btnDeleteJob.on("click",function(evt){
							
							var dialog=new ConfirmDialog({ message: "Are you sure you want to delete the current job ?",title: "Confirmation"});
							dialog.confirmAction=function(){
								var properties2 = [{"name": "ESOS_Rejected","value" : "Yes"},{"name": "ESOS_Type" ,"value" : "Deleted"}];
								retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
									payload.workItemEditable.completeStep(function(){
										window.location.reload(false);
									});
								});
							}
							dialog.show();
						
						});
						wid.btnReject.on("click",function(evt){
							dojo.require("dijit.form.Button");
							dojo.require("dijit.Dialog");
							dojo.require("dijit.form.Textarea");

							var myDialog = new dijit.Dialog({
							 title:'Reject the Job',
							 style:'width:400px;height:250px;'
							});
							
							var textarea = new dijit.form.Textarea({
								name: "myarea",
								style: "width:200px;"
							});
							textarea.startup();
							
							var myButton = new dijit.form.Button({
								label: "Reject",
								onClick: function(){
									var properties2 = [{"name": "ESOS_RejectionReasons","value" : textarea.getValue()},{"name": "ESOS_Rejected","value" : "Yes"},{"name": "ESOS_Type" ,"value" : "Rejected"}];
									retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
										payload.workItemEditable.completeStep(function(){
											myDialog.hide();
											window.location.reload(false);
										});
									});
								}
							});
							myButton.startup();

							var tbl     = document.createElement("table");
							var tblBody = document.createElement("tbody");
							var row1 = document.createElement("tr");
							var row2 = document.createElement("tr");
							var cell1 = document.createElement("td");
							var cell2 = document.createElement("td");
							var cell3 = document.createElement("td");
							cell3.colspan="2";
							dojo.place(textarea.domNode,cell2);
							var cellText = document.createTextNode("Rejection Comments : ");
							cell1.appendChild(cellText);
							dojo.place(myButton.domNode,cell3);

							row1.appendChild(cell1);
							row1.appendChild(cell2);
							row2.appendChild(cell3);
							tblBody.appendChild(row1);
							tblBody.appendChild(row2);
							tbl.appendChild(tblBody);

							dojo.place(tbl,myDialog.containerNode);
							myDialog.show();
						});*/
						wid.txtOldFillingId.on("change",function(e){
							if(wid.txtOldFillingId.getValue()!=""){
								var serviceParams = new Object();
								serviceParams.input = encodeURI(wid.txtFillingNo.value);
								serviceParams.input2=encodeURI(wid.txtIFSN.getValue());
								serviceParams.input3=encodeURI(wid.txtOldFillingId.getValue());
									//alert(repository.id);
									
								  Request.invokePluginService("claimCustomPlugin", "deptorsListService",
								  {
										requestParams: serviceParams,
										synchronous:true,
										requestCompleteCallback: function(response) {	// success
											var typesData = [];
											
											var data = {
											  items: []
											};
											
											var data2 = {
											  items: []
											};
											
											var data3 = {
											  identifier: "FilingNumber",
											  items: []
											};
											
											var data4 = {
											  identifier: "NoteId",
											  items: []
											};
											
											var jsonResponse=dojo.toJson(response, true, "  ");
											var obj = JSON.parse(jsonResponse);
											wid.txtFillingDate.setDisplayedValue(obj.FillingDate);
											wid.txtFillingTime.setDisplayedValue(obj.FilingTime);
											wid.NumPages.value=obj.NumPages;
											wid.ProcessedBy.value=obj.ProcessedBy;
											wid.VerifiedBy.value=obj.VerifiedBy;
											wid.ModifiedBy.value=obj.ModifiedBy;
											if(!obj.FormType)
												wid.txtFormType.setValue("FOS");
											else
												wid.txtFormType.setValue(obj.FormType);
											
											wid.isFoS.value=obj.IsFOS;
											if(wid.isFoS.value=='true'){
												wid.txtFillingId.setDisabled(true);
											//	wid.txtOldFillingId.setValue(obj.OldFilingNumber);
												wid.FOSId.value=obj.FOSID;
												domStyle.set(wid.txtOldFillingId.domNode, 'display', '');
												domStyle.set(wid.tdOldFillingId, 'display', '');
											}else{
												wid.txtFillingId.setDisabled(false);
												domStyle.set(wid.txtOldFillingId.domNode, 'display', 'none');
												domStyle.set(wid.tdOldFillingId, 'display', 'none');
											}
											
											wid.txtIFSN.setValue(obj.IFSN);
											wid.txtFormSaved.value="true";
											
											
											wid.txtFillingId.setValue(obj.FileID);
											
											wid.txtLapseDate.setValue(obj.LapseDate);
											wid.txtStatus.setValue(obj.Status);
											
											wid.txtFillingKey.value=obj.FillingID;
											for(i=0;i<obj.Debitors.length;i++){
												var debtorId=obj.Debitors[i].DebtorId;
												var name=obj.Debitors[i].Name;
												var address=obj.Debitors[i].Address_1;
												var fromOCR=obj.Debitors[i].FromOCR;
												var isEditable=obj.Debitors[i].IsEditable;
												var fromEsos=obj.Debitors[i].FromEsos;
												var sequence=obj.Debitors[i].Sequence;
												data.items.push({ 
													"debtorId":debtorId,
													"rowType":"old",
													"FromOCR":fromOCR,
													"IsEditable":isEditable,
													"FromEsos":fromEsos,
													"Sequence":sequence,
													"name":name.toString().toUpperCase(),
													"address" : address.toString().toUpperCase()
												});
											}
											
											var store = new ItemFileWriteStore({data: data});
											wid.debtorDataGrid.setStore(store);
											var layout = [[
											  {'name': 'Debtor Id', 'field': 'debtorId', 'hidden': true,'noresize': true},
											  {'name': 'rowType', 'field': 'rowType', 'hidden': true,'noresize': true},
											  {'name': 'FromOCR', 'field': 'FromOCR', 'hidden': true,'noresize': true},
											  {'name': 'IsEditable', 'field': 'IsEditable', 'hidden': true,'noresize': true},
											  {'name': 'FromEsos', 'field': 'FromEsos', 'hidden': true,'noresize': true},
											  {'name': 'Sequence', 'field': 'Sequence', 'hidden': true,'noresize': true},
											  {'name': 'Name', 'field': 'name', 'width': '50%','noresize': true},
											  {'name': 'Address', 'field': 'address', 'width': '50%','noresize': true}
											]];
											wid.debtorDataGrid.setStructure(layout);
											wid.debtorDataGrid.resize();
																
																		
											for(i=0;i<obj.SecuredParties.length;i++){
												var securePartyId=obj.SecuredParties[i].DebtorId;
												var name=obj.SecuredParties[i].Name;
												var address=obj.SecuredParties[i].Address_1;
												var fromOCR=obj.SecuredParties[i].FromOCR;
												var isEditable=obj.SecuredParties[i].IsEditable;
												var fromEsos=obj.SecuredParties[i].FromEsos;
												var sequence=obj.SecuredParties[i].Sequence;
												data2.items.push({ 
													"securePartyId":securePartyId,
													"rowType":"old",
													"FromOCR":fromOCR,
													"IsEditable":isEditable,
													"FromEsos":fromEsos,
													"Sequence":sequence,
													"name":name.toString().toUpperCase(),
													"address" : address.toString().toUpperCase()
												});
											}
											
											var store2 = new ItemFileWriteStore({data: data2});
											wid.securePartyDataGrid.setStore(store2);
											//alert(theDialog.getTitle());
											
											
											if(obj.FillingTypes && obj.FillingTypes.length>0){
												wid.ddlType.setDisabled(false);
												wid.ddlAction.setDisabled(true);
												wid.lapsePeriods=new Object();
												for(i=0;i<obj.FillingTypes.length;i++){
													if(obj.FillingTypes[i].Code=='FS'){
														typesData.push({ 
															"id":obj.FillingTypes[i].Name,
															"name":obj.FillingTypes[i].Name,
															"selected":true
														});
													}
													else{
														typesData.push({ 
															"id":obj.FillingTypes[i].Name,
															"name":obj.FillingTypes[i].Name
														});
													}
													
													if(obj.FillingTypes[i].LapsePeriod)
														wid.lapsePeriods[obj.FillingTypes[i].Name]=obj.FillingTypes[i].LapsePeriod.split('Y')[1];
													else
														wid.lapsePeriods[obj.FillingTypes[i].Name]=null;
												}
												var typesStore = new Memory({ data: typesData });
												wid.ddlType.store=typesStore;
												
												if(obj.Type != null)
													wid.ddlType.setValue(obj.Type);
												else
													wid.ddlType.setValue("Financing Statement");
												//wid.txtApplyAction.value='false';
												wid.ddlAction.setValue("");
											}
											else{
												if(obj.Type != null)
													wid.ddlType.setValue(obj.Type);
												else
													wid.ddlType.setValue("Financing Statement");
												
												wid.ddlType.setDisabled(true);
												wid.ddlAction.setDisabled(false);
												if(obj.Action!=null)
													wid.txtApplyAction.value='false';
												else
													wid.txtApplyAction.value='true';
												wid.ddlAction.setValue(obj.Action);
											}
											
											var layout2 = [[
											  {'name': 'Secure Party Id', 'field': 'securePartyId', 'hidden': true,'noresize': true},
											  {'name': 'rowType', 'field': 'rowType', 'hidden': true,'noresize': true},
											  {'name': 'FromOCR', 'field': 'FromOCR', 'hidden': true,'noresize': true},
											  {'name': 'IsEditable', 'field': 'IsEditable', 'hidden': true,'noresize': true},
											  {'name': 'FromEsos', 'field': 'FromEsos', 'hidden': true,'noresize': true},
											  {'name': 'Sequence', 'field': 'Sequence', 'hidden': true,'noresize': true},
											  {'name': 'Name', 'field': 'name', 'width': '50%','noresize': true},
											  {'name': 'Address', 'field': 'address', 'width': '50%','noresize': true}
											]];
											wid.securePartyDataGrid.setStructure(layout2);
											wid.securePartyDataGrid.resize();
											
											var serviceParams2 = new Object();
											serviceParams2.input = obj.IFSN;
											var jsonStr='{"ifsn":"'+obj.IFSN+'","filingNumber":"'+wid.txtFillingNo.value+'"}';
											serviceParams2.input = jsonStr;
											
											Request.invokePluginService("claimCustomPlugin", "historyService",
											{
												requestParams: serviceParams2,
												synchronous:true,
												requestCompleteCallback: function(response) {	// success
													var jsonResponse2=dojo.toJson(response, true, "  ");
													var obj2 = JSON.parse(jsonResponse2);
													for(i=0;i<obj2.length;i++){
														var action=obj2[i].Action;
														var fillingNumber=obj2[i].FilingNumber;
														var fillingDate=obj2[i].FilingDate;
														var pages=obj2[i].Pages;
														//var notes=obj2[i].Notes;
														var scannedBy=obj2[i].ScannedBy;
														var processedBy=obj2[i].ProcessedBy;
														//var verifiedBy=obj2[i].VerifiedBy;
														var GUID=obj2[i].GUID;
														var formType=obj2[i].FormType;
														var oldFilingNumber=obj2[i].OldFilingNumber;
														
														data3.items.push({ 
															"Action":action,
															"FilingNumber":fillingNumber,
															"FilingDate":fillingDate,
															"Pages":pages,
															//"Notes" : notes,
															"ScannedBy" : scannedBy,
															"ProcessedBy" : processedBy,
															//"VerifiedBy" : verifiedBy,
															"GUID" : GUID,
															"FormType" : formType,
															"OldFilingNumber" : oldFilingNumber
														});
													}
													
													var store3 = new ItemFileWriteStore({data: data3});
													wid.historyDataGrid.setStore(store3);
													var layout3 = [[
													  {'name': 'Action', 'field': 'Action', 'width': '15%','noresize': true},
													  {'name': 'Filing Number', 'field': 'FilingNumber', 'width': '14%','formatter': wid.formatURL,'noresize': true},
													  {'name': 'Filing Date', 'field': 'FilingDate', 'width': '12%','noresize': true},
													  {'name': 'Pages', 'field': 'Pages', 'width': '9%','noresize': true},
													  //{'name': 'Notes', 'field': 'Notes', 'width': '10%','noresize': true},
													  {'name': 'Receipted By', 'field': 'ScannedBy', 'width': '12%','noresize': true},
													  {'name': 'Processed By', 'field': 'ProcessedBy', 'width': '12%','noresize': true},
													  //{'name': 'Verified By', 'field': 'VerifiedBy', 'width': '10%','noresize': true},
													  {'name': 'Form Type', 'field': 'FormType', 'width': '12%','noresize': true},
													  {'name': 'Old Filing Number', 'field': 'OldFilingNumber', 'width': '14%','noresize': true},
													  {'name': 'GUID', 'field': 'GUID', 'hidden': true,'noresize': true},
													]];
													wid.historyDataGrid.setStructure(layout3);
													wid.historyDataGrid.resize();
													
												}
											});
											
											
											var serviceParams3 = new Object();
											serviceParams3.input = obj.FileID;
											serviceParams3.input2 = (wid.isFoS.value=='true')?true:false;
											Request.invokePluginService("claimCustomPlugin", "notesService",
											{
												requestParams: serviceParams3,
												synchronous:true,
												requestCompleteCallback: function(response) {	// success
													var jsonResponse3=dojo.toJson(response, true, "  ");
													var obj3 = JSON.parse(jsonResponse3);
													for(i=0;i<obj3.length;i++){
														var noteId=obj3[i].NoteId;
														var note=obj3[i].Note;
														var user=obj3[i].User;
														var creationDate=obj3[i].CreationDate;
														data4.items.push({ 
															"NoteId":noteId,
															"Note":note,
															"User":user,
															"CreationDate" : creationDate
														});
													}
													
													var store4 = new ItemFileWriteStore({data: data4});
													wid.notesDataGrid.setStore(store4);
													var layout4 = [[
													  {'name': 'NoteId', 'field': 'NoteId', 'hidden': true,'noresize': true},
													  {'name': 'User Name', 'field': 'User', 'width': '25%','noresize': true},
													  {'name': 'Creation Date', 'field': 'CreationDate', 'width': '25%','noresize': true},
													  {'name': 'Note Text', 'field': 'Note', 'width': '50%','noresize': true}
													]];
													wid.notesDataGrid.setStructure(layout4);
													wid.notesDataGrid.canSort = function(col){ return false; }; 
													wid.notesDataGrid.resize();
													
												}
											});
										}
								  });
							}
						});
						wid.txtIFSN.on("change",function(e){
							if(wid.txtIFSN.getValue()!=wid.txtFillingId.getValue() && wid.txtIFSN.getValue()!="" && wid.isFoS.value!='true'){
								
								var serviceParams = new Object();
								serviceParams.input = encodeURI(wid.txtFillingNo.value);
								serviceParams.input2=encodeURI(wid.txtIFSN.getValue());
								
									//alert(repository.id);
									
								  Request.invokePluginService("claimCustomPlugin", "deptorsListService",
								  {
										requestParams: serviceParams,
										synchronous:true,
										requestCompleteCallback: function(response) {	// success
											var typesData = [];
											
											var data = {
											  items: []
											};
											
											var data2 = {
											  items: []
											};
											
											var data3 = {
											  identifier: "FilingNumber",
											  items: []
											};
											
											var data4 = {
											  identifier: "NoteId",
											  items: []
											};
											
											var jsonResponse=dojo.toJson(response, true, "  ");
											var obj = JSON.parse(jsonResponse);
											if(obj.Done==false){
												console.log(e);
												alert(obj.Error);
												wid.txtIFSN.setValue("");
												return;
											}
											wid.txtFillingDate.setDisplayedValue(obj.FillingDate);
											wid.txtFillingTime.setDisplayedValue(obj.FilingTime);
											wid.NumPages.value=obj.NumPages;
											wid.ProcessedBy.value=obj.ProcessedBy;
											wid.VerifiedBy.value=obj.VerifiedBy;
											wid.ModifiedBy.value=obj.ModifiedBy;
											if(theDialog.get("title") == 'Tax Payer'){
												wid.txtFormType.setValue("Federal Tax Lien");
											}
											else{
												if(!obj.FormType)
													wid.txtFormType.setValue("FOS");
												else
													wid.txtFormType.setValue(obj.FormType);
											}
											wid.isFoS.value=obj.IsFOS;
											if(wid.isFoS.value=='true'){
												wid.txtFillingId.setDisabled(true);
												wid.txtOldFillingId.setValue(obj.OldFilingNumber);
												wid.FOSId.value=obj.FOSID;
												domStyle.set(wid.txtOldFillingId.domNode, 'display', '');
												domStyle.set(wid.tdOldFillingId, 'display', '');
												wid.lblFillingId.innerHTML="FOS Filing Number:";
											}else{
												wid.txtFillingId.setDisabled(false);
												domStyle.set(wid.txtOldFillingId.domNode, 'display', 'none');
												domStyle.set(wid.tdOldFillingId, 'display', 'none');
												wid.lblFillingId.innerHTML="Filing Number:";
											}
											
											if(theDialog.get("title") == 'Tax Payer' && obj.DocAction == null){
												//wid.txtIFSN.setValue("");
												wid.txtFormSaved.value="true";
											}
											else{
												wid.txtIFSN.setValue(obj.IFSN);
												wid.txtFormSaved.value="true";
											}
											
											wid.txtFillingId.setValue(obj.FileID);
											
											wid.txtLapseDate.setValue(obj.LapseDate);
											wid.txtStatus.setValue(obj.Status);
											
											wid.txtFillingKey.value=obj.FillingID;
											if(obj.Debitors != null){
												for(i=0;i<obj.Debitors.length;i++){
													var debtorId=obj.Debitors[i].DebtorId;
													var name=obj.Debitors[i].Name;
													var address=obj.Debitors[i].Address_1;
													var fromOCR=obj.Debitors[i].FromOCR;
													var isEditable=obj.Debitors[i].IsEditable;
													var fromEsos=obj.Debitors[i].FromEsos;
													var sequence=obj.Debitors[i].Sequence;
													data.items.push({ 
														"debtorId":debtorId,
														"rowType":"old",
														"FromOCR":fromOCR,
														"IsEditable":isEditable,
														"FromEsos":fromEsos,
														"Sequence":sequence,
														"name":name.toString().toUpperCase(),
														"address" : address.toString().toUpperCase()
													});
												}
												
												var store = new ItemFileWriteStore({data: data});
												wid.debtorDataGrid.setStore(store);
												var layout = [[
												  {'name': 'Debtor Id', 'field': 'debtorId', 'hidden': true,'noresize': true},
												  {'name': 'rowType', 'field': 'rowType', 'hidden': true,'noresize': true},
												  {'name': 'FromOCR', 'field': 'FromOCR', 'hidden': true,'noresize': true},
												  {'name': 'IsEditable', 'field': 'IsEditable', 'hidden': true,'noresize': true},
												  {'name': 'FromEsos', 'field': 'FromEsos', 'hidden': true,'noresize': true},
												  {'name': 'Sequence', 'field': 'Sequence', 'hidden': true,'noresize': true},
												  {'name': 'Name', 'field': 'name', 'width': '50%','noresize': true},
												  {'name': 'Address', 'field': 'address', 'width': '50%','noresize': true}
												]];
												wid.debtorDataGrid.setStructure(layout);
												wid.debtorDataGrid.resize();
											}																

											if(obj.SecuredParties != null){
												for(i=0;i<obj.SecuredParties.length;i++){
													var securePartyId=obj.SecuredParties[i].DebtorId;
													var name=obj.SecuredParties[i].Name;
													var address=obj.SecuredParties[i].Address_1;
													var fromOCR=obj.SecuredParties[i].FromOCR;
													var isEditable=obj.SecuredParties[i].IsEditable;
													var fromEsos=obj.SecuredParties[i].FromEsos;
													var sequence=obj.SecuredParties[i].Sequence;
													data2.items.push({ 
														"securePartyId":securePartyId,
														"rowType":"old",
														"FromOCR":fromOCR,
														"IsEditable":isEditable,
														"FromEsos":fromEsos,
														"Sequence":sequence,
														"name":name.toString().toUpperCase(),
														"address" : address.toString().toUpperCase()
													});
												}
												
												if(theDialog.get("title") == 'Tax Payer'){
													if(data2.items.length==0){
														data2.items.push({ 
															"securePartyId":"-1",
															"rowType":"old",
															"FromOCR":"true",
															"IsEditable":"true",
															"FromEsos":"true",
															"Sequence":"1",
															"name":"INTERNAL REVENUE SERVICE",
															"address" : "P.O BOX 145595 CINCINNATI OH 45250-5595"
														});
													}
												}
												
												var store2 = new ItemFileWriteStore({data: data2});
												wid.securePartyDataGrid.setStore(store2);
											}
											//alert(theDialog.getTitle());
											
											if(theDialog.get("title") == 'Tax Payer'){
												wid.ddlType.setDisabled(false);
												wid.ddlAction.setDisabled(true);
												var typesStore = new Memory({ data: typesData });
												wid.ddlType.store=typesStore;
												wid.lapsePeriods=new Object();
												
												typesData.push({ 
													"id":"Notice of Federal Tax Lien",
													"name":"Notice of Federal Tax Lien"
												});
												wid.lapsePeriods["Notice of Federal Tax Lien"]="10";
												
												typesData.push({ 
													"id":"Notice of Tax Lien Refiling",
													"name":"Notice of Tax Lien Refiling"
												});
												wid.lapsePeriods["Notice of Tax Lien Refiling"]="20";
												typesData.push({ 
													"id":"Notice of Tax Lien Certificate of Release",
													"name":"Notice of Tax Lien Certificate of Release"
												});
												//wid.lapsePeriods["Notice of Tax Lien Certificate of Release"]="10";
												typesData.push({ 
													"id":"Notice of Tax Lien Certificate of Subordination",
													"name":"Notice of Tax Lien Certificate of Subordination"
												});
												//wid.lapsePeriods["Notice of Tax Lien Certificate of Subordination"]="10";
												typesData.push({ 
													"id":"Notice of Tax Lien Correction",
													"name":"Notice of Tax Lien Correction"
												});
												//wid.lapsePeriods["Notice of Tax Lien Correction"]="10";
												typesData.push({ 
													"id":"Notice of Tax Lien Withdrawal",
													"name":"Notice of Tax Lien Withdrawal"
												});
												//wid.lapsePeriods["Notice of Tax Lien Withdrawal"]="10";
												typesData.push({ 
													"id":"Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien",
													"name":"Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien"
												});
												//wid.lapsePeriods["Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien"]="10";
												typesData.push({ 
													"id":"Notice of Tax Lien Certificate of Non-attachment",
													"name":"Notice of Tax Lien Certificate of Non-attachment"
												});
												//wid.lapsePeriods["Notice of Tax Lien Certificate of Non-attachment"]="10";
												typesData.push({ 
													"id":"Discharge of Property",
													"name":"Discharge of Property"
												});
												//wid.lapsePeriods["Discharge of Property"]="10";
												typesData.push({ 
													"id":"Notice of Tax Lien Withdrawal After Release",
													"name":"Notice of Tax Lien Withdrawal After Release"
												});
												//wid.lapsePeriods["Notice of Tax Lien Withdrawal After Release"]="10";
												typesData.push({ 
													"id":"Amendment",
													"name":"Amendment"
												});
												//wid.lapsePeriods["Amendment"]="10";
												//if(obj.DocAction != null)
													//wid.ddlType.setValue(obj.DocAction);
												
												
											}
											else{
												if(obj.FillingTypes && obj.FillingTypes.length>0){
													wid.ddlType.setDisabled(false);
													wid.ddlAction.setDisabled(true);
													wid.lapsePeriods=new Object();
													for(i=0;i<obj.FillingTypes.length;i++){
														if(obj.FillingTypes[i].Code=='FS'){
															typesData.push({ 
																"id":obj.FillingTypes[i].Name,
																"name":obj.FillingTypes[i].Name,
																"selected":true
															});
														}
														else{
															typesData.push({ 
																"id":obj.FillingTypes[i].Name,
																"name":obj.FillingTypes[i].Name
															});
														}
														
														if(obj.FillingTypes[i].LapsePeriod)
															wid.lapsePeriods[obj.FillingTypes[i].Name]=obj.FillingTypes[i].LapsePeriod.split('Y')[1];
														else
															wid.lapsePeriods[obj.FillingTypes[i].Name]=null;
													}
													var typesStore = new Memory({ data: typesData });
													wid.ddlType.store=typesStore;
													
													if(obj.Type != null)
														wid.ddlType.setValue(obj.Type);
													else
														wid.ddlType.setValue("Financing Statement");
													//wid.txtApplyAction.value='false';
													wid.ddlAction.setValue("");
												}
												else{
													if(obj.Type != null)
														wid.ddlType.setValue(obj.Type);
													else
														wid.ddlType.setValue("Financing Statement");
													
													wid.ddlType.setDisabled(true);
													wid.ddlAction.setDisabled(false);
													if(obj.Action!=null)
														wid.txtApplyAction.value='false';
													else
														wid.txtApplyAction.value='true';
													//wid.ddlAction.setValue(obj.Action);
													wid.ddlAction.setValue("");
												}
											}
											var layout2 = [[
											  {'name': 'Secure Party Id', 'field': 'securePartyId', 'hidden': true,'noresize': true},
											  {'name': 'rowType', 'field': 'rowType', 'hidden': true,'noresize': true},
											  {'name': 'FromOCR', 'field': 'FromOCR', 'hidden': true,'noresize': true},
											  {'name': 'IsEditable', 'field': 'IsEditable', 'hidden': true,'noresize': true},
											  {'name': 'FromEsos', 'field': 'FromEsos', 'hidden': true,'noresize': true},
											  {'name': 'Sequence', 'field': 'Sequence', 'hidden': true,'noresize': true},
											  {'name': 'Name', 'field': 'name', 'width': '50%','noresize': true},
											  {'name': 'Address', 'field': 'address', 'width': '50%','noresize': true}
											]];
											wid.securePartyDataGrid.setStructure(layout2);
											wid.securePartyDataGrid.resize();
											
											var serviceParams2 = new Object();
											serviceParams2.input = obj.IFSN;
											var jsonStr='{"ifsn":"'+obj.IFSN+'","filingNumber":"'+wid.txtFillingNo.value+'"}';
											serviceParams2.input = jsonStr;
											
											Request.invokePluginService("claimCustomPlugin", "historyService",
											{
												requestParams: serviceParams2,
												synchronous:true,
												requestCompleteCallback: function(response) {	// success
													var jsonResponse2=dojo.toJson(response, true, "  ");
													var obj2 = JSON.parse(jsonResponse2);
													for(i=0;i<obj2.length;i++){
														var action=obj2[i].Action;
														var fillingNumber=obj2[i].FilingNumber;
														var fillingDate=obj2[i].FilingDate;
														var pages=obj2[i].Pages;
														//var notes=obj2[i].Notes;
														var scannedBy=obj2[i].ScannedBy;
														var processedBy=obj2[i].ProcessedBy;
														//var verifiedBy=obj2[i].VerifiedBy;
														var GUID=obj2[i].GUID;
														var formType=obj2[i].FormType;
														var oldFilingNumber=obj2[i].OldFilingNumber;
														
														data3.items.push({ 
															"Action":action,
															"FilingNumber":fillingNumber,
															"FilingDate":fillingDate,
															"Pages":pages,
															//"Notes" : notes,
															"ScannedBy" : scannedBy,
															"ProcessedBy" : processedBy,
															//"VerifiedBy" : verifiedBy,
															"GUID" : GUID,
															"FormType" : formType,
															"OldFilingNumber" : oldFilingNumber
														});
													}
													
													var store3 = new ItemFileWriteStore({data: data3});
													wid.historyDataGrid.setStore(store3);
													var layout3 = [[
													  {'name': 'Action', 'field': 'Action', 'width': '15%','noresize': true},
													  {'name': 'Filing Number', 'field': 'FilingNumber', 'width': '14%','formatter': wid.formatURL,'noresize': true},
													  {'name': 'Filing Date', 'field': 'FilingDate', 'width': '12%','noresize': true},
													  {'name': 'Pages', 'field': 'Pages', 'width': '9%','noresize': true},
													  //{'name': 'Notes', 'field': 'Notes', 'width': '10%','noresize': true},
													  {'name': 'Receipted By', 'field': 'ScannedBy', 'width': '12%','noresize': true},
													  {'name': 'Processed By', 'field': 'ProcessedBy', 'width': '12%','noresize': true},
													  //{'name': 'Verified By', 'field': 'VerifiedBy', 'width': '10%','noresize': true},
													  {'name': 'Form Type', 'field': 'FormType', 'width': '12%','noresize': true},
													  {'name': 'Old Filing Number', 'field': 'OldFilingNumber', 'width': '14%','noresize': true},
													  {'name': 'GUID', 'field': 'GUID', 'hidden': true,'noresize': true},
													]];
													wid.historyDataGrid.setStructure(layout3);
													wid.historyDataGrid.resize();
													
												}
											});
											
											
											var serviceParams3 = new Object();
											serviceParams3.input = obj.FileID;
											serviceParams3.input2 = (wid.isFoS.value=='true')?true:false;
											Request.invokePluginService("claimCustomPlugin", "notesService",
											{
												requestParams: serviceParams3,
												synchronous:true,
												requestCompleteCallback: function(response) {	// success
													var jsonResponse3=dojo.toJson(response, true, "  ");
													var obj3 = JSON.parse(jsonResponse3);
													for(i=0;i<obj3.length;i++){
														var noteId=obj3[i].NoteId;
														var note=obj3[i].Note;
														var user=obj3[i].User;
														var creationDate=obj3[i].CreationDate;
														data4.items.push({ 
															"NoteId":noteId,
															"Note":note,
															"User":user,
															"CreationDate" : creationDate
														});
													}
													
													var store4 = new ItemFileWriteStore({data: data4});
													wid.notesDataGrid.setStore(store4);
													var layout4 = [[
													  {'name': 'NoteId', 'field': 'NoteId', 'hidden': true,'noresize': true},
													  {'name': 'User Name', 'field': 'User', 'width': '25%','noresize': true},
													  {'name': 'Creation Date', 'field': 'CreationDate', 'width': '25%','noresize': true},
													  {'name': 'Note Text', 'field': 'Note', 'width': '50%','noresize': true}
													]];
													wid.notesDataGrid.setStructure(layout4);
													wid.notesDataGrid.canSort = function(col){ return false; }; 
													wid.notesDataGrid.resize();
													
												}
											});
										}
								  });
							}
						});
						wid.btnAddDoc.on("click",function(e){
							var addContentItemDialog = new AddContentItemDialog();
							var contentItemGeneralPane = addContentItemDialog.addContentItemGeneralPane;
							domStyle.set(contentItemGeneralPane._documentOnlyArea,"display", "none");
							addContentItemDialog.showUsingTemplateItem(retFol.repository,retFol, true, false, lang.hitch(this, function(item){
								var contentType=item.id.split(',')[0];
								var intContentType=0;
								var doctype=0;
								var serviceParams = new Object();
								var jsonStr;
								
								if(contentType=='ESOS_UCC'){
									doctype=1;
									intContentType=1;
									jsonStr='{"JobType":"'+1+'","DocumentType":"'+doctype+'","FillingYear":"'+(new Date().getFullYear())+'","NumberOfPages":"'+item.attributes['NumPages']+'","JobNumber":"'+retAtt.attributes.ESOS_JobNumber+'","IFSN":"'+item.attributes['IFSN']+'","DocType":"'+intContentType+'","ScanUser":"'+item.attributes['ESOS_ScanUser']+'","FillingDate":"'+item.attributes['FillingDate']+'","FNGUID":"'+item.id.split(',')[2]+'"}';
								}
								else{
									if(contentType=='ESOS_Correspondence'){
										intContentType=2;
										//doctype=90;
									}
									else if(contentType=='ESOS_Payments'){
										intContentType=3;
										//doctype=89;
									}
									jsonStr='{"JobType":"'+1+'","DocumentType":"'+doctype+'","FillingYear":"'+(new Date().getFullYear())+'","JobNumber":"'+retAtt.attributes.ESOS_JobNumber+'","DocType":"'+intContentType+'","FNGUID":"'+item.id.split(',')[2]+'"}';
								}
								
								serviceParams.input = jsonStr;
								Request.invokePluginService("claimCustomPlugin", "saveDocService",
								{
									requestParams: serviceParams,
									synchronous:true,
									requestCompleteCallback: function(response) {
										var jsonResponse=dojo.toJson(response, true, "  ");
										var obj = JSON.parse(jsonResponse);
										var properties = [{"name": "DocumentTitle","value" : obj.DocumentNumber},{"name": "ESOS_JobNumber","value" :retAtt.attributes.ESOS_JobNumber}];
										item.saveAttributes(properties,item.template,null,null,false,function(response) {
											var myNewItem = {GUID: item.id.split(',')[2], Filing_Number: obj.NewDocument.Filing_Number,Filing_Date: obj.NewDocument.Filing_Date,Filing_Type:obj.NewDocument.Filing_Type,Reduct:obj.NewDocument.Reduct,Filing_Status:obj.NewDocument.Filing_Status,Reviewed:obj.NewDocument.Reviewed};
											wid.docsDataGrid.store.newItem(myNewItem);
										});
									}
								});
								
								
							}), null, null);
						});
						retFol.retrieveFolderContents(false, function(results) {
							var items = [];
							var itemIds = [];
							array.forEach(results.items, function(item){
								if(!item.isFolder()){
									items.push(item);
									itemIds.push(item.id.toString().split(',')[2]);
								}
							});
							var repository=wid.getSolution().getTargetOS();
							if(itemIds.length){
								var serviceInput=[];
								repository.retrieveMultiItem(itemIds,lang.hitch(this,function(retItems){
									
									array.forEach(retItems,function(item){
										serviceInput.push('{"Filing_Number":"'+item.attributes['DocumentTitle']+'","GUID":"'+item.attributes['Id']+'"}');
									});
									var jsonStr='{"JobID":"'+retAtt.attributes.ESOS_JobNumber+'",Filings:['+serviceInput.toString()+']}';
									var serviceParams = new Object();
									serviceParams.input = jsonStr;
									  Request.invokePluginService("claimCustomPlugin", "docsInfoService",
									  {
											requestParams: serviceParams,
											synchronous:true,
											requestCompleteCallback: function(response) {	// success
												var jsonResponse=dojo.toJson(response, true, "  ");
												var obj = JSON.parse(jsonResponse);
												var data = {
												  identifier: "GUID",
												  items: []
												};
												
												
												for(i=0;i<obj.length;i++){
													var GUID=obj[i].GUID;
													var filingNumber=obj[i].Filing_Number;
													var filingDate=obj[i].Filing_Date;
													var filingType=obj[i].Filing_Type;
													var reviewed=obj[i].Reviewed;
													var filingStatus=obj[i].Filing_Status;
													data.items.push({ 
														"GUID":GUID,
														"Filing_Number" : filingNumber,
														"Filing_Date"  : filingDate,
														"Filing_Type"       : filingType,
														"Reviewed": reviewed,
														"Filing_Status"       : filingStatus
													});
												}
												var store = new ItemFileWriteStore({data: data});
												wid.docsDataGrid.setStore(store);
												var layout = [[
												  {'name': 'id', 'field': 'GUID', 'hidden':true,'noresize': true},
												  {'name': 'Filing Number', 'field': 'Filing_Number', 'width': '22%','noresize': true},
												  {'name': 'Filing Date', 'field': 'Filing_Date', 'width': '22%','noresize': true},
												  {'name': 'Filing Type', 'field': 'Filing_Type', 'width': '22%','noresize': true},
												  {'name': 'Reviewed', 'field': 'Reviewed', 'width': '12%','noresize': true},
												  {'name': 'Filing Status', 'field': 'Filing_Status', 'width': '22%','noresize': true}
												]];
												wid.docsDataGrid.setStructure(layout);
												wid.docsDataGrid.resize();
											}
									  });
								}));
							}
						});
					}));
				}));
				
			},
			handleICM_SaveCaseEvent: function(payload){
				var wid=this;
				console.log(payload);
				var myCase=payload.workItemEditable.getCase();
				var repository=this.getSolution().getTargetOS();
				myCase.retrieveAttributes(lang.hitch(this,function(retAtt){
					var serviceParams = new Object();
					var emptySentTo=false;
					if(wid.txtFirstName2.getValue()=='' && wid.txtMiddleName2.getValue()=='' && wid.txtLastName2.getValue()=='' && wid.txtSuffixName2.getValue()=='' && wid.txtOrganization2.getValue()=='' && wid.txtAddress12.getValue()==''){
						emptySentTo=true;
					}
					var jsonStr='{"JobNumber":"'+retAtt.attributes.ESOS_JobNumber+'","Note":"'+wid.txtNotes.getValue()+'","Submitter":{"FirstName":"'+wid.txtFirstName.getValue()+'","MiddleInitial":"'+wid.txtMiddleName.getValue()+'","LastName":"'+wid.txtLastName.getValue()+'","Suffix":"'+wid.txtSuffixName.getValue()+'","Orgnization":"'+wid.txtOrganization.getValue()+'","Address_1":"'+wid.txtAddress1.getValue()+'","Address_2":"'+
					wid.txtAddress2.getValue()+'","City":"'+wid.txtCity.getValue()+'","Zip":"'+wid.txtZip.getValue()+'","Phone":"'+wid.txtPhone.getValue()+'","State":"'+wid.txtState.getValue()+'","Country":"'+wid.txtCountry.getValue()+'","Email":"'+wid.txtEmail.getValue()+'"}';
					if(!emptySentTo){
						jsonStr+=',"SendTo":{"FirstName":"'+wid.txtFirstName2.getValue()+'","MiddleInitial":"'+wid.txtMiddleName2.getValue()+'","LastName":"'+wid.txtLastName2.getValue()+'","Suffix":"'+wid.txtSuffixName2.getValue()+'","Orgnization":"'+wid.txtOrganization2.getValue()+'","Address_1":"'+wid.txtAddress12.getValue()+'","Address_2":"'+
						wid.txtAddress22.getValue()+'","City":"'+wid.txtCity2.getValue()+'","Zip":"'+wid.txtZip2.getValue()+'","Phone":"'+wid.txtPhone2.getValue()+'","State":"'+wid.txtState2.getValue()+'","Country":"'+wid.txtCountry2.getValue()+'","Email":"'+wid.txtEmail2.getValue()+'"}';
					}
					else{
						jsonStr+=',"SendTo":null';
					}
					jsonStr+='}';
					
					serviceParams.input = jsonStr;
					Request.invokePluginService("claimCustomPlugin", "saveJobService",
					{
						requestParams: serviceParams,
						synchronous:true,
						requestCompleteCallback: function(response) {
							//alert("The Job Saved Successfully");
						}
					});
				}));
			},
			formatURL: function (val, rowIdx){
				var rowData = this.grid.getItem(rowIdx);
				var url="window.open('DocViewer.jsp?itemId="+rowData.GUID+"\',\'\',\'width="+win.getBox().w+",height="+(win.getBox().h)+",resizable,scrollbars=yes,status=1\')";
				console.log("<a href=\"javascript:void(0)\" onclick=\""+url+"\">"+val+"</a>");
				return "<a href=\"javascript:void(0)\" onclick=\""+url+"\">"+val+"</a>";
			},
			validateEmail: function(email) {
				var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
				return re.test(email);
			},
			initDebtorSecureParty: function(fillingNumber,GUID){
				
				var wid=this;
				wid.btnSaveDeptor.setDisabled(false);
				wid.txtGUID.value=GUID;
				if(ecm.model.desktop.currentRole.name == "Supervisor"){
					wid.txtFillingId.setDisabled(false);
				}
				else{
					wid.txtFillingId.setDisabled(true);
				}
				
				
				
				var serviceParams = new Object();
				
				this.txtFillingNo.value=fillingNumber;
				serviceParams.input = fillingNumber;
					//alert(repository.id);
					
				  Request.invokePluginService("claimCustomPlugin", "deptorsListService",
				  {
						requestParams: serviceParams,
						synchronous:true,
						requestCompleteCallback: function(response) {	// success
							var typesData = [];
							
							var data = {
							  items: []
							};
							
							var data2 = {
							  items: []
							};
							
							var data3 = {
							  identifier: "FilingNumber",
							  items: []
							};
							
							var data4 = {
							  identifier: "NoteId",
							  items: []
							};
							
							var jsonResponse=dojo.toJson(response, true, "  ");
							var obj = JSON.parse(jsonResponse);
							wid.txtFillingDate.setDisplayedValue(obj.FillingDate);
							wid.txtFillingTime.setDisplayedValue(obj.FilingTime);
							wid.NumPages.value=obj.NumPages;
							wid.ProcessedBy.value=obj.ProcessedBy;
							wid.VerifiedBy.value=obj.VerifiedBy;
							wid.ModifiedBy.value=obj.ModifiedBy;
							if(theDialog.get("title") == 'Tax Payer'){
								wid.txtFormType.setValue("Federal Tax Lien");
							}
							else{
								if(!obj.FormType)
									wid.txtFormType.setValue("FOS");
								else
									wid.txtFormType.setValue(obj.FormType);
							}
							wid.isFoS.value=obj.IsFOS;
							if(wid.isFoS.value=='true'){
								wid.txtFillingId.setDisabled(true);
								wid.txtOldFillingId.setValue(obj.OldFilingNumber);
								wid.FOSId.value=obj.FOSID;
								domStyle.set(wid.txtOldFillingId.domNode, 'display', '');
								domStyle.set(wid.tdOldFillingId, 'display', '');
							}else{
								wid.txtFillingId.setDisabled(false);
								domStyle.set(wid.txtOldFillingId.domNode, 'display', 'none');
								domStyle.set(wid.tdOldFillingId, 'display', 'none');
							}
							
							if(theDialog.get("title") == 'Tax Payer' && obj.DocAction == null){
								wid.txtIFSN.setValue("");
								wid.txtFormSaved.value="false";
							}
							else{
								wid.txtIFSN.setValue(obj.IFSN);
								wid.txtFormSaved.value="true";
							}
							
							wid.txtFillingId.setValue(obj.FileID);
							
							wid.txtLapseDate.setValue(obj.LapseDate);
							wid.lastLapse=wid.txtLapseDate.getValue();
							wid.txtStatus.setValue(obj.Status);
							
							if(obj.LapseDate && obj.LapseDate != ''){
								var lapsedDate=new Date(obj.LapseDate);
								lapsedDate.setHours(23);
								lapsedDate.setMinutes(59);
								var currDate=new Date();
								if(lapsedDate<currDate){
									alert("The filing is lapsed, No more changes acceptable !!!");
									wid.btnSaveZDialog.setDisabled(true);
								}
							}
							
							wid.txtFillingKey.value=obj.FillingID;
							for(i=0;i<obj.Debitors.length;i++){
								var debtorId=obj.Debitors[i].DebtorId;
								var name=obj.Debitors[i].Name;
								var address=obj.Debitors[i].Address_1;
								var fromOCR=obj.Debitors[i].FromOCR;
								var isEditable=obj.Debitors[i].IsEditable;
								var fromEsos=obj.Debitors[i].FromEsos;
								var sequence=obj.Debitors[i].Sequence;
								data.items.push({ 
									"debtorId":debtorId,
									"rowType":"old",
									"FromOCR":fromOCR,
									"IsEditable":isEditable,
									"FromEsos":fromEsos,
									"Sequence":sequence,
									"name":name.toString().toUpperCase(),
									"address" : address.toString().toUpperCase()
								});
							}
							
							var store = new ItemFileWriteStore({data: data});
							wid.debtorDataGrid.setStore(store);
							var layout = [[
							  {'name': 'Debtor Id', 'field': 'debtorId', 'hidden': true,'noresize': true},
							  {'name': 'rowType', 'field': 'rowType', 'hidden': true,'noresize': true},
							  {'name': 'FromOCR', 'field': 'FromOCR', 'hidden': true,'noresize': true},
							  {'name': 'IsEditable', 'field': 'IsEditable', 'hidden': true,'noresize': true},
							  {'name': 'FromEsos', 'field': 'FromEsos', 'hidden': true,'noresize': true},
							  {'name': 'Sequence', 'field': 'Sequence', 'hidden': true,'noresize': true},
							  {'name': 'Name', 'field': 'name', 'width': '50%','noresize': true},
							  {'name': 'Address', 'field': 'address', 'width': '50%','noresize': true}
							]];
							wid.debtorDataGrid.setStructure(layout);
							wid.debtorDataGrid.resize();
												
														
							for(i=0;i<obj.SecuredParties.length;i++){
								var securePartyId=obj.SecuredParties[i].DebtorId;
								var name=obj.SecuredParties[i].Name;
								var address=obj.SecuredParties[i].Address_1;
								var fromOCR=obj.SecuredParties[i].FromOCR;
								var isEditable=obj.SecuredParties[i].IsEditable;
								var fromEsos=obj.SecuredParties[i].FromEsos;
								var sequence=obj.SecuredParties[i].Sequence;
								data2.items.push({ 
									"securePartyId":securePartyId,
									"rowType":"old",
									"FromOCR":fromOCR,
									"IsEditable":isEditable,
									"FromEsos":fromEsos,
									"Sequence":sequence,
									"name":name.toString().toUpperCase(),
									"address" : address.toString().toUpperCase()
								});
							}
							
							if(theDialog.get("title") == 'Tax Payer'){
								if(data2.items.length==0){
									data2.items.push({ 
										"securePartyId":"-1",
										"rowType":"old",
										"FromOCR":"true",
										"IsEditable":"true",
										"FromEsos":"true",
										"Sequence":"1",
										"name":"INTERNAL REVENUE SERVICE",
										"address" : "P.O BOX 145595 CINCINNATI OH 45250-5595"
									});
								}
							}
							
							var store2 = new ItemFileWriteStore({data: data2});
							wid.securePartyDataGrid.setStore(store2);
							//alert(theDialog.getTitle());
							
							if(theDialog.get("title") == 'Tax Payer'){
								wid.ddlType.setDisabled(false);
								wid.ddlAction.setDisabled(true);
								var typesStore = new Memory({ data: typesData });
								wid.ddlType.store=typesStore;
								wid.lapsePeriods=new Object();
								
								typesData.push({ 
									"id":"Notice of Federal Tax Lien",
									"name":"Notice of Federal Tax Lien"
								});
								wid.lapsePeriods["Notice of Federal Tax Lien"]="10";
								
								typesData.push({ 
									"id":"Notice of Tax Lien Refiling",
									"name":"Notice of Tax Lien Refiling"
								});
								wid.lapsePeriods["Notice of Tax Lien Refiling"]="20";
								typesData.push({ 
									"id":"Notice of Tax Lien Certificate of Release",
									"name":"Notice of Tax Lien Certificate of Release"
								});
								//wid.lapsePeriods["Notice of Tax Lien Certificate of Release"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Certificate of Subordination",
									"name":"Notice of Tax Lien Certificate of Subordination"
								});
								//wid.lapsePeriods["Notice of Tax Lien Certificate of Subordination"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Correction",
									"name":"Notice of Tax Lien Correction"
								});
								//wid.lapsePeriods["Notice of Tax Lien Correction"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Withdrawal",
									"name":"Notice of Tax Lien Withdrawal"
								});
								//wid.lapsePeriods["Notice of Tax Lien Withdrawal"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien",
									"name":"Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien"
								});
								//wid.lapsePeriods["Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Certificate of Non-attachment",
									"name":"Notice of Tax Lien Certificate of Non-attachment"
								});
								//wid.lapsePeriods["Notice of Tax Lien Certificate of Non-attachment"]="10";
								typesData.push({ 
									"id":"Discharge of Property",
									"name":"Discharge of Property"
								});
								//wid.lapsePeriods["Discharge of Property"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Withdrawal After Release",
									"name":"Notice of Tax Lien Withdrawal After Release"
								});
								//wid.lapsePeriods["Notice of Tax Lien Withdrawal After Release"]="10";
								typesData.push({ 
									"id":"Amendment",
									"name":"Amendment"
								});
								//wid.lapsePeriods["Amendment"]="10";
								if(obj.DocAction != null)
									wid.ddlType.setValue(obj.DocAction);
								
								
							}
							else{
								if(obj.FillingTypes && obj.FillingTypes.length>0){
									wid.ddlType.setDisabled(false);
									wid.ddlAction.setDisabled(true);
									wid.lapsePeriods=new Object();
									for(i=0;i<obj.FillingTypes.length;i++){
										if(obj.FillingTypes[i].Code=='FS'){
											typesData.push({ 
												"id":obj.FillingTypes[i].Name,
												"name":obj.FillingTypes[i].Name,
												"selected":true
											});
										}
										else{
											typesData.push({ 
												"id":obj.FillingTypes[i].Name,
												"name":obj.FillingTypes[i].Name
											});
										}
										
										if(obj.FillingTypes[i].LapsePeriod)
											wid.lapsePeriods[obj.FillingTypes[i].Name]=obj.FillingTypes[i].LapsePeriod.split('Y')[1];
										else
											wid.lapsePeriods[obj.FillingTypes[i].Name]=null;
									}
									var typesStore = new Memory({ data: typesData });
									wid.ddlType.store=typesStore;
									
									if(obj.Type != null)
										wid.ddlType.setValue(obj.Type);
									else
										wid.ddlType.setValue("Financing Statement");
									//wid.txtApplyAction.value='false';
									wid.ddlAction.setValue("");
								}
								else{
									if(obj.Type != null)
										wid.ddlType.setValue(obj.Type);
									else
										wid.ddlType.setValue("Financing Statement");
									
									wid.ddlType.setDisabled(true);
									wid.ddlAction.setDisabled(false);
									if(obj.Action!=null)
										wid.txtApplyAction.value='false';
									else
										wid.txtApplyAction.value='true';
									wid.ddlAction.setValue(obj.Action);
									console.log(wid.ddlAction);
									wid.ddlAction.onChange();
								}
							}
							var layout2 = [[
							  {'name': 'Secure Party Id', 'field': 'securePartyId', 'hidden': true,'noresize': true},
							  {'name': 'rowType', 'field': 'rowType', 'hidden': true,'noresize': true},
							  {'name': 'FromOCR', 'field': 'FromOCR', 'hidden': true,'noresize': true},
							  {'name': 'IsEditable', 'field': 'IsEditable', 'hidden': true,'noresize': true},
							  {'name': 'FromEsos', 'field': 'FromEsos', 'hidden': true,'noresize': true},
							  {'name': 'Sequence', 'field': 'Sequence', 'hidden': true,'noresize': true},
							  {'name': 'Name', 'field': 'name', 'width': '50%','noresize': true},
							  {'name': 'Address', 'field': 'address', 'width': '50%','noresize': true}
							]];
							wid.securePartyDataGrid.setStructure(layout2);
							wid.securePartyDataGrid.resize();
							
							var serviceParams2 = new Object();
							serviceParams2.input = obj.IFSN;
							var jsonStr='{"ifsn":"'+obj.IFSN+'","filingNumber":"'+fillingNumber+'"}';
							serviceParams2.input = jsonStr;
							
							Request.invokePluginService("claimCustomPlugin", "historyService",
							{
								requestParams: serviceParams2,
								synchronous:true,
								requestCompleteCallback: function(response) {	// success
									var jsonResponse2=dojo.toJson(response, true, "  ");
									var obj2 = JSON.parse(jsonResponse2);
									for(i=0;i<obj2.length;i++){
										var action=obj2[i].Action;
										var fillingNumber=obj2[i].FilingNumber;
										var fillingDate=obj2[i].FilingDate;
										var pages=obj2[i].Pages;
										//var notes=obj2[i].Notes;
										var scannedBy=obj2[i].ScannedBy;
										var processedBy=obj2[i].ProcessedBy;
										//var verifiedBy=obj2[i].VerifiedBy;
										var GUID=obj2[i].GUID;
										var formType=obj2[i].FormType;
										var oldFilingNumber=obj2[i].OldFilingNumber;
										
										data3.items.push({ 
											"Action":action,
											"FilingNumber":fillingNumber,
											"FilingDate":fillingDate,
											"Pages":pages,
											//"Notes" : notes,
											"ScannedBy" : scannedBy,
											"ProcessedBy" : processedBy,
											//"VerifiedBy" : verifiedBy,
											"GUID" : GUID,
											"FormType" : formType,
											"OldFilingNumber" : oldFilingNumber
										});
									}
									
									var store3 = new ItemFileWriteStore({data: data3});
									wid.historyDataGrid.setStore(store3);
									var layout3 = [[
									  {'name': 'Action', 'field': 'Action', 'width': '15%','noresize': true},
									  {'name': 'Filing Number', 'field': 'FilingNumber', 'width': '14%','formatter': wid.formatURL,'noresize': true},
									  {'name': 'Filing Date', 'field': 'FilingDate', 'width': '12%','noresize': true},
									  {'name': 'Pages', 'field': 'Pages', 'width': '9%','noresize': true},
									  //{'name': 'Notes', 'field': 'Notes', 'width': '10%','noresize': true},
									  {'name': 'Receipted By', 'field': 'ScannedBy', 'width': '12%','noresize': true},
									  {'name': 'Processed By', 'field': 'ProcessedBy', 'width': '12%','noresize': true},
									  //{'name': 'Verified By', 'field': 'VerifiedBy', 'width': '10%','noresize': true},
									  {'name': 'Form Type', 'field': 'FormType', 'width': '12%','noresize': true},
									  {'name': 'Old Filing Number', 'field': 'OldFilingNumber', 'width': '14%','noresize': true},
									  {'name': 'GUID', 'field': 'GUID', 'hidden': true,'noresize': true},
									]];
									wid.historyDataGrid.setStructure(layout3);
									wid.historyDataGrid.resize();
									
								}
							});
							
							
							var serviceParams3 = new Object();
							serviceParams3.input = obj.FileID;
							serviceParams3.input2 = (wid.isFoS.value=='true')?true:false;
							Request.invokePluginService("claimCustomPlugin", "notesService",
							{
								requestParams: serviceParams3,
								synchronous:true,
								requestCompleteCallback: function(response) {	// success
									var jsonResponse3=dojo.toJson(response, true, "  ");
									var obj3 = JSON.parse(jsonResponse3);
									for(i=0;i<obj3.length;i++){
										var noteId=obj3[i].NoteId;
										var note=obj3[i].Note;
										var user=obj3[i].User;
										var creationDate=obj3[i].CreationDate;
										data4.items.push({ 
											"NoteId":noteId,
											"Note":note,
											"User":user,
											"CreationDate" : creationDate
										});
									}
									
									var store4 = new ItemFileWriteStore({data: data4});
									wid.notesDataGrid.setStore(store4);
									var layout4 = [[
									  {'name': 'NoteId', 'field': 'NoteId', 'hidden': true,'noresize': true},
									  {'name': 'User Name', 'field': 'User', 'width': '25%','noresize': true},
									  {'name': 'Creation Date', 'field': 'CreationDate', 'width': '25%','noresize': true},
									  {'name': 'Note Text', 'field': 'Note', 'width': '50%','noresize': true}
									]];
									wid.notesDataGrid.setStructure(layout4);
									wid.notesDataGrid.canSort = function(col){ return false; }; 
									wid.notesDataGrid.resize();
									
								}
							});
						}
						
				  });
				  var formType=wid.txtFormType.getValue();
				  if(formType != 'UCC3' && formType != 'UCC5' && formType != 'FOS'){
					var currDate=new Date(wid.txtFillingDate.getValue());
					var lapsePeriod=wid.lapsePeriods[wid.ddlType.getValue()];
					
					if(lapsePeriod)
						currDate.setFullYear(currDate.getFullYear()+parseInt(lapsePeriod));
					else
						currDate.setFullYear(currDate.getFullYear());
					if(theDialog.get("title") == 'Tax Payer' && lapsePeriod == '10'){
						currDate.setMonth(currDate.getMonth()+1);
					}	
					var curr_day = currDate.getDate();
					var curr_month = currDate.getMonth()+1;
					var curr_year = currDate.getFullYear();
					if(curr_day<10)
						curr_day="0"+curr_day;
					if(curr_month<10)
						curr_month="0"+curr_month;
					
					if(lapsePeriod){
						wid.lastLapse=wid.txtLapseDate.getValue();
						wid.txtLapseDate.setValue(curr_month+"/"+curr_day+"/"+curr_year);
					}
					else
						wid.txtLapseDate.setValue(wid.lastLapse);
				}
			},
			initDebtorSecurePartyDetails: function(debtorId,fromEsos){
				var wid=this;
				this.txtDebtorId.value=debtorId;
				this.txtFromEsos.value=fromEsos;
				var serviceParams = new Object();
				var jsonStr='{"debitorId":"'+debtorId+'","FromEsos":"'+fromEsos+'"}'
				serviceParams.input = jsonStr;
					//alert(repository.id);
				if(debtorId == -1){
					wid.txtOrganization3.setValue("INTERNAL REVENUE SERVICE");
					wid.txtAddress13.setValue("P.O. BOX 145595");
					wid.txtCity3.setValue("CINCINNATI");
					wid.txtState3.setValue("OH");
					wid.txtZip3.setValue("45250-5595");
					wid.ddlTaxTypes.setValue("Lien Holder");
					wid.btnSaveDeptor.setDisabled(true);
				}
				else{
					wid.btnSaveDeptor.setDisabled(false);
					Request.invokePluginService("claimCustomPlugin", "deptorDetailsService",
					{
						requestParams: serviceParams,
						synchronous:true,
						requestCompleteCallback: function(response) {	// success
							var jsonResponse=dojo.toJson(response, true, "  ");
							var obj = JSON.parse(jsonResponse);
							wid.txtFirstName3.setValue(obj.Individual_Name);
							wid.txtFirstName3.setValue(obj.FirstName);
							wid.txtMiddleName3.setValue(obj.MiddleInitial);
							wid.txtLastName3.setValue(obj.LastName);
							wid.txtSuffixName3.setValue(obj.Suffix);
							wid.txtOrganization3.setValue(obj.Orgnization);
							wid.txtAddress13.setValue(obj.Address_1);
							wid.txtAddress23.setValue(obj.Address_2);
							wid.txtCity3.setValue(obj.City);
							wid.txtState3.setValue(obj.State);
							if(wid.txtState3.getValue()=='')
								wid.txtState3.setValue('NV');
							wid.txtZip3.setValue(obj.Zip);
							wid.txtCountry3.setValue(obj.Country);
							//wid.txtPhone3.setValue(obj.Phone);
							//wid.txtEmail3.setValue(obj.Email);
							if(wid.txtDialogType.value=="TaxLien"){
								if(obj.TypeCode == "1")
									wid.ddlTaxTypes.setValue("Tax Payer");
								else
									wid.ddlTaxTypes.setValue("Lien Holder");
							}
							else{
								if(obj.TypeCode == "1")
									wid.ddlDebtorTypes.setValue("Debtor");
								else
									wid.ddlDebtorTypes.setValue("Secured Party");
							}
						}
					});
				}
			}
			
        });
});