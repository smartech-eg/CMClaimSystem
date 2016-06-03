/*
This is the main widget of the application that carries all UI elements (tabs,buttons,...etc)
*/
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
					if(ecm.model.desktop.currentRole.name == "Supervisor"){
						wid.btnDeleteDoc.set("disabled",false);
						wid.btnRejectLetter.set("disabled",false);
					}
					
					repository.retrieveItem(rowData.GUID, lang.hitch(wid, function(retItem) {
						//var acn=new Action();
						/*wid.onPublishEvent("icm.SelectDocument", {
							contentItem : retItem
						});*/
						if(retItem.attributes['ESOS_DocType']=='Tax Lien'){
							wid.btnDebtor.set("disabled",true);
							wid.btnUCC11.set("disabled",true);
							wid.btnTaxLien.set("disabled",false);
						}
						else if(retItem.attributes['ESOS_DocType']=='UCC11'){
							wid.btnDebtor.set("disabled",true);
							wid.btnTaxLien.set("disabled",true);
							wid.btnUCC11.set("disabled",false);
						}
						else{
							wid.btnDebtor.set("disabled",false);
							wid.btnTaxLien.set("disabled",true);
							wid.btnUCC11.set("disabled",true);
						}
						var payload = {"contentItem": retItem, "action": "open"};
						wid.onBroadcastEvent("icm.OpenDocument", payload);
					}));
				});
				
				/*
				Row click event handler for the debtors grid
				Enables/Disables buttons (Delete/Move Up/Move Down) according to the selected debtor
				*/
				this.debtorDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex;
					var size=wid.debtorDataGrid.store._arrayOfAllItems.length;
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
				
				/*
				Event handler for the debtors grid
				Set rows colors according to the debtor type (FromEsos/From DCap)
				*/
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
				
				/*
				Row click event handler for the secured parties grid
				Enables/Disables buttons (Delete/Move Up/Move Down) according to the selected secured party
				*/
				this.securePartyDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex;
					var size=wid.securePartyDataGrid.store._arrayOfAllItems.length;
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
				
				/*
				Event handler for the secured parties grid
				Set rows colors according to the secured party type (FromEsos/From DCap)
				*/
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
				Event handler for the filings delete buton
				Deletes the selected filing after user's confirmation
				*/
				this.btnDeleteDoc.on("click",function(e){
					var dialog=new ConfirmDialog({ message: "Are you sure you want to delete the selected document(s) ?",title: "Confirmation"});
					dialog.confirmAction=function(){
						var selectedIds=new Array();
						var repository=wid.getSolution().getTargetOS();
						array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
							var serviceParams = new Object();
							serviceParams.input = row.Filing_Number;
								
							Request.invokePluginService("eSoSCustomPlugin", "deleteDocService",
							{
								requestParams: serviceParams,
								synchronous:true,
								requestCompleteCallback: function(response) {	// success
									repository.retrieveItem(row.GUID,function(contentItem){
										repository.deleteItems([contentItem],function(){
											wid.docsDataGrid.store.deleteItem(row);
										},true);
									});
								}
							});
						});
					}
					dialog.show();
				});
				
				/*
				Event handler for the notes grid
				Enable/Disable notes delete button according to the selected note index
				*/
				this.notesDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex;
					var rowData = wid.notesDataGrid.getItem(idx);
					if((wid.notesDataGrid.store._arrayOfAllItems.length == (idx+1)) && rowData.User==wid.getSolution().getTargetOS().userId)
						wid.btnDltNote.set("disabled",false);
					else
						wid.btnDltNote.set("disabled",true);
				});
				
				/*
				Event handler for the secured parties move down button
				Moves the selected secured party down
				*/
				this.btnMoveSecuredPartyDown.on("click",function(evt){
					var fromRow = wid.securePartyDataGrid.selection.getSelected()[0];
					var fromIndex=fromRow._0;
					var toRow = wid.securePartyDataGrid.store._arrayOfAllItems[fromIndex+1];
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
					var size=wid.securePartyDataGrid.store._arrayOfAllItems.length;
					
					if((fromIndex+1) == (size -1))
						wid.btnMoveSecuredPartyDown.set("disabled",true);
					wid.btnMoveSecuredPartyUp.set("disabled",false);
				});
				
				/*
				Event handler for the secured parties move up button
				Moves the selected secured party up
				*/
				this.btnMoveSecuredPartyUp.on("click",function(evt){
					var fromRow = wid.securePartyDataGrid.selection.getSelected()[0];
					var fromIndex=fromRow._0;
					var toRow = wid.securePartyDataGrid.store._arrayOfAllItems[fromIndex-1];
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
					var size=wid.securePartyDataGrid.store._arrayOfAllItems.length;
					
					if((fromIndex-1) == 0)
						wid.btnMoveSecuredPartyUp.set("disabled",true);
					wid.btnMoveSecuredPartyDown.set("disabled",false);
				});
				
				/*
				Event handler for the debtor move down button
				Moves the selected debtor down
				*/
				this.btnMoveDebtorDown.on("click",function(evt){
					var fromRow = wid.debtorDataGrid.selection.getSelected()[0];
					var fromIndex=fromRow._0;
					var toRow = wid.debtorDataGrid.store._arrayOfAllItems[fromIndex+1];
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
					var size=wid.debtorDataGrid.store._arrayOfAllItems.length;
					
					if((fromIndex+1) == (size -1))
						wid.btnMoveDebtorDown.set("disabled",true);
					wid.btnMoveDebtorUp.set("disabled",false);
				});
				
				/*
				Event handler for the debtor move up button
				Moves the selected debtor up
				*/
				this.btnMoveDebtorUp.on("click",function(evt){
					var fromRow = wid.debtorDataGrid.selection.getSelected()[0];
					var fromIndex=fromRow._0;
					var toRow = wid.debtorDataGrid.store._arrayOfAllItems[fromIndex-1];
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
					var size=wid.debtorDataGrid.store._arrayOfAllItems.length;
					
					if((fromIndex-1) == 0)
						wid.btnMoveDebtorUp.set("disabled",true);
					wid.btnMoveDebtorDown.set("disabled",false);
				});
				/*
				Event handler for the history grid
				Displays the Filenet ID of the selected row to the Filenet ID text field
				*/
				this.historyDataGrid.on("RowClick", function(evt){
					var idx = evt.rowIndex;
					var rowData = wid.historyDataGrid.getItem(idx);
					wid.txtFilenetId.setValue(rowData.GUID);
				});
				
				/*
				Event handler for the notes delete buton
				Deletes the selected note after user's confirmation
				*/
				this.btnDltNote.on("click",function(e){
					var dialog=new ConfirmDialog({ message: "Are you sure you want to delete the selected note ?",title: "Confirmation"});
					dialog.confirmAction=function(){
						var selectedIds=new Array();
						var repository=wid.getSolution().getTargetOS();
						array.forEach(wid.notesDataGrid.selection.getSelected(), function(row){
							var serviceParams = new Object();
							serviceParams.input = row.NoteId;
							serviceParams.input2 = wid.isFoS.value=='true'?true:false;
							
							Request.invokePluginService("eSoSCustomPlugin", "deleteNoteService",
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
				
				/*
				Event handler for the debtors delete buton
				Deletes the selected debtor after user's confirmation
				*/
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
							
							Request.invokePluginService("eSoSCustomPlugin", "deptorDeleteService",
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
				
				/*
				Event handler for the secured parties delete buton
				Deletes the selected secured party after user's confirmation
				*/
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
							
							Request.invokePluginService("eSoSCustomPlugin", "deptorDeleteService",
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
				
				/*
				Event handler for the debtors/secured parties buton
				Retrieves debtors and secured parties lists and open the dialog
				*/
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
					var serviceParams2 = new Object();
					serviceParams2.input = selectedIds[0].Filing_Number;
						
					Request.invokePluginService("eSoSCustomPlugin", "reviewDocService",
					{
						requestParams: serviceParams2,
						synchronous:true,
						requestCompleteCallback: function(response) {	// success
							var store = wid.docsDataGrid.store;
							store.setValue(selectedIds[0], 'Reviewed', 'Yes');
							wid.docsDataGrid.update();
						}				
					});
					
					wid.initDebtorSecureParty(selectedIds[0].Filing_Number,selectedIds[0].GUID);
					theDialog.show();
					wid.securePartyDataGrid.resize();
					wid.debtorDataGrid.resize();
					wid.historyDataGrid.resize();
					wid.notesDataGrid.resize();
				});
				
				/*
				Event handler for the UCC11 buton
				Opens UCC11 dialog
				*/
				this.btnUCC11.on("click",function(e){
					var selectedIds=new Array();
					array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row);
					});
					
					var serviceParams2 = new Object();
					serviceParams2.input = selectedIds[0].Filing_Number;
						
					Request.invokePluginService("eSoSCustomPlugin", "reviewDocService",
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
				
				/*
				Event handler for the rejection letter buton
				Opens rejection letter dialog
				*/
				this.btnRejectLetter.on("click",function(e){
					rejectionDialog.show();
				});
				
				
				/*
				Event handler for the rejection letter reset buton
				Resets all rejection letter controls
				*/
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
				
				/*
				Event handler for the rejection letter generate buton
				Generates the rejection letter based on the entered information
				*/
				this.btnDoRejection.on("click",function(e){
					var selectedIds=new Array();
					var repository=wid.getSolution().getTargetOS();
					array.forEach(wid.docsDataGrid.selection.getSelected(), function(row){
						selectedIds.push(row);
					});
					
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
					alert("http://"+ip.split(":")[0]+":500/letter/RejectionLetter?filingNo="+filingNo+"&user="+user+"&rejectionNotes="+wid.txtRejectionNotes.getValue()+"&reasons="+reasons.join(","));
					window.showModalDialog("http://"+ip.split(":")[0]+":500/letter/RejectionLetter?filingNo="+filingNo+"&user="+user+"&rejectionNotes="+wid.txtRejectionNotes.getValue()+"&formOfPayment="+wid.txtFormOfPayment.getValue()+"&reasons="+reasons.join(","), "", 'dialogHeight=10px,dialogWidth=10px,status=no,toolbar=no,menubar=no,location=no');
					
					
					var serviceParams = new Object();
					serviceParams.input = selectedIds[0].Filing_Number;
					
					//setTimeout(
					Request.invokePluginService("eSoSCustomPlugin", "deleteDocService",
					{
						requestParams: serviceParams,
						synchronous:true,
						requestCompleteCallback: function(response) {	// success
							repository.retrieveItem(selectedIds[0].GUID,function(contentItem){
								repository.deleteItems([contentItem],function(){
									wid.docsDataGrid.store.deleteItem(selectedIds[0]);
									rejectionDialog.hide();
								},true);
							});
						}
					});
				});
				
				/*
				Event handler for organization text box of the debtors details screen
				Enable/Disable individual name fields according to wheither there is a value in the organization field or not
				*/
				this.txtOrganization3.on("change",function(e){
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
				
				/*
				Event handler for first name text box of the debtors details screen
				Enable/Disable organization text box according to wheither there is a value in the individual name fields or not
				*/
				this.txtFirstName3.on("change",function(e){
					if(wid.txtFirstName3.getValue()=='' && wid.txtLastName3.getValue()=='' && wid.txtSuffixName3.getValue()=='' && wid.txtMiddleName3.getValue()==''){
						wid.txtOrganization3.setDisabled(false);
					}
					else{
						wid.txtOrganization3.setDisabled(true);
					}
				});
				
				/*
				Event handler for last name text box of the debtors details screen
				Enable/Disable organization text box according to wheither there is a value in the individual name fields or not
				*/
				this.txtLastName3.on("change",function(e){
					if(wid.txtFirstName3.getValue()=='' && wid.txtLastName3.getValue()=='' && wid.txtSuffixName3.getValue()=='' && wid.txtMiddleName3.getValue()==''){
						wid.txtOrganization3.setDisabled(false);
					}
					else{
						wid.txtOrganization3.setDisabled(true);
					}
				});
				
				/*
				Event handler for suffix name text box of the debtors details screen
				Enable/Disable organization text box according to wheither there is a value in the individual name fields or not
				*/
				this.txtSuffixName3.on("change",function(e){
					if(wid.txtFirstName3.getValue()=='' && wid.txtLastName3.getValue()=='' && wid.txtSuffixName3.getValue()=='' && wid.txtMiddleName3.getValue()==''){
						wid.txtOrganization3.setDisabled(false);
					}
					else{
						wid.txtOrganization3.setDisabled(true);
					}
				});
				
				/*
				Event handler for middle name text box of the debtors details screen
				Enable/Disable organization text box according to wheither there is a value in the individual name fields or not
				*/
				this.txtMiddleName3.on("change",function(e){
					if(wid.txtFirstName3.getValue()=='' && wid.txtLastName3.getValue()=='' && wid.txtSuffixName3.getValue()=='' && wid.txtMiddleName3.getValue()==''){
						wid.txtOrganization3.setDisabled(false);
					}
					else{
						wid.txtOrganization3.setDisabled(true);
					}
				});
				
				/*
				Event handler for the tax lien button
				Retrieves tax payers and lien holders lists and open the dialog
				*/
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
						
					Request.invokePluginService("eSoSCustomPlugin", "reviewDocService",
					{
						requestParams: serviceParams2,
						synchronous:true,
						requestCompleteCallback: function(response) {	// success
							var store = wid.docsDataGrid.store;
							store.setValue(selectedIds[0], 'Reviewed', 'Yes');
							wid.docsDataGrid.update();
						}				
					});
					
					wid.initDebtorSecureParty(selectedIds[0].Filing_Number,selectedIds[0].GUID);
					theDialog.show();
					wid.securePartyDataGrid.resize();
					wid.debtorDataGrid.resize();
					wid.historyDataGrid.resize();
					wid.notesDataGrid.resize();
				});
				
				/*
				Event handler for the double click action of debtors grid 
				Retrieves the details of the selected debtor and opens the dialog
				*/
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
					
				/*
				Event handler for add debtor button
				Opens dialog to capture the information of the new debtor to be added
				*/
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
					deptorDetailsDialog.show();
					wid.txtDebtorType.value="Debitor";
					wid.txtDebtorId.value="0";
				});
				
				/*
				Event handler for the double click action of secured parties grid 
				Retrieves the details of the selected secured party and opens the dialog
				*/
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
				
				/*
				Event handler for add secured party button
				Opens dialog to capture the information of the new secured party to be added
				*/
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
				
				/*
				Event handler for copy debtor button
				Retrieves the details of the selected debtor and open a dialog displaying that details to be added as a secured party
				*/
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
				
				/*
				Event handler for copy secured party button
				Retrieves the details of the selected secured party and open a dialog displaying that details to be added as a debtor
				*/
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
					wid.txtDebtorId.value="1";
					if(wid.txtDialogType.value=="TaxLien")
						wid.ddlTaxTypes.setValue("Tax Payer");
					else
						wid.ddlDebtorTypes.setValue("Debtor");
				});
				
				/*
				Event handler for copy to sentto button
				Copies the information of submitter tab to sentto tab
				*/
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
				
				/*
				Event handler for find submitter button
				Opens a dialog to search for submitter
				*/
				this.btnFindSubmitter.on("click",function(e){
					wid.txtSearchType.value="Submitter";
					searchDeptorDialog.set("title","Find a Submitter");
					searchDeptorDialog.show();
				});
				
				/*
				Event handler for find sentto button
				Opens a dialog to search for sentto
				*/
				this.btnFindSentTo.on("click",function(e){
					wid.txtSearchType.value="SentTo";
					searchDeptorDialog.set("title","Find a Submitter");
					searchDeptorDialog.show();
				});
				
				/*
				Event handler for find submitter button
				Opens a dialog to search for debtor
				*/
				this.btnSearchDeptor.on("click",function(e){
					wid.txtSearchType.value="Debtor";
					searchDeptorDialog.show();
				});
				
				/*
				Event handler for copy to submitter button
				Copy the information of a debtor to the submitter tab
				*/
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
				
				/*
				Event handler for save debtor button
				Adding a new debtor using the entered information
				*/
				this.btnSaveDeptor.on("click",function(e){
					if(wid.txtCity3.getValue()=="" || wid.txtState3.getValue()=="")
						alert("State and City can't be empty");
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
						+'","TypeCode":"'+typeCode+'","TypeName":"'+typeName+'","FillingId":"'+wid.txtFillingKey.value+'","DebtorId":"'+wid.txtDebtorId.value+'","FromEsos":'+(wid.isFoS.value=='true'?true:false)+',"ModifiedBy":"'+repository.userId+'"}';
						serviceParams.input = jsonStr;
						Request.invokePluginService("eSoSCustomPlugin", "saveDebtorService",
						{
							requestParams: serviceParams,
							synchronous:true,
							requestCompleteCallback: function(response) {
								var jsonResponse=dojo.toJson(response, true, "  ");
								var obj = JSON.parse(jsonResponse);
								deptorDetailsDialog.hide();
								var newName=wid.txtOrganization3.getValue();
								var address=wid.txtAddress13.getValue();
								if(wid.txtAddress23.getValue() && wid.txtAddress23.getValue() != '')
									address=address+" "+wid.txtAddress23.getValue();
								if(wid.txtCity3.getValue() && wid.txtCity3.getValue() != '')
									address=address+" "+wid.txtCity3.getValue();
								if(wid.txtState3.getValue() && wid.txtState3.getValue() != '')
									address=address+" "+wid.txtState3.getValue();
								if(wid.txtCountry3.getValue() && wid.txtCountry3.getValue() != '')
									address=address+" "+wid.txtCountry3.getValue();
								if(wid.txtZip3.getValue() && wid.txtZip3.getValue() != '')
									address=address+" "+wid.txtZip3.getValue();
								
								if(!newName || newName== ''){
									newName=wid.txtFirstName3.getValue()+" "+wid.txtMiddleName3.getValue()+" "+wid.txtLastName3.getValue()+" "+wid.txtSuffixName3.getValue();
								}
								if(deptorDetailsDialog.get("title").toString().contains("Add New") ){
									if(typeCode=="1"){
										var newSequence;
										if(wid.debtorDataGrid.store._arrayOfAllItems.length==0)
											newSequence=1;
										else{
											var lastItem=wid.debtorDataGrid.store._arrayOfAllItems[wid.debtorDataGrid.store._arrayOfAllItems.length-1];
											newSequence=parseInt(lastItem.Sequence)+1;
										}
										var myNewItem = {debtorId: obj.DebitorId, rowType: "new",name: newName.toString().toUpperCase(),address:address.toString().toUpperCase(),FromEsos:"false",IsEditable:"true",Sequence:newSequence};
										wid.debtorDataGrid.store.newItem(myNewItem);
									}
									else{
										var newSequence;
										if(wid.securePartyDataGrid.store._arrayOfAllItems.length==0)
											newSequence=1;
										else{
											var lastItem=wid.securePartyDataGrid.store._arrayOfAllItems[wid.securePartyDataGrid.store._arrayOfAllItems.length-1];
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
				
				/*
				Event handler for filing details save button
				Save the information of the filing
				*/
				this.btnSaveZDialog.on("click",function(e){
					if(theDialog.get("title") == 'Tax Payer' && (wid.ddlType.getValue()==null || wid.ddlType.getValue() == '')){
						alert("Please select a type");
					}
					else if(wid.txtIFSN.getValue()==null || wid.txtIFSN.getValue() == ''){
						alert("Please enter IFSN");
					}
					else if(wid.ddlAction.disabled==false &&(wid.ddlAction.getValue()==null || wid.ddlAction.getValue() == '')){
						alert("Please select an action");
					}
					else{
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
						for(var i=0;i<wid.debtorDataGrid.store._arrayOfAllItems.length;i++){
							var currItem=wid.debtorDataGrid.store._arrayOfAllItems[i];
							var fromOCR=currItem.FromOCR;
							if(!fromOCR || fromOCR=="")
								fromOCR="false";
							jsonStr+='{"DebtorId":'+currItem.debtorId+',"Name":"'+currItem.name+'","Address_1":"'+currItem.address+'","IsEditable":'+currItem.IsEditable+',"FromEsos":'+currItem.FromEsos+',"FromOCR":'+fromOCR+',"Sequence":'+currItem.Sequence+'}';
							if(i!=(wid.debtorDataGrid.store._arrayOfAllItems.length-1))
								jsonStr+=',';
						}
						jsonStr+='],"SecuredParties":[';
						for(var j=0;j<wid.securePartyDataGrid.store._arrayOfAllItems.length;j++){
							var currItem=wid.securePartyDataGrid.store._arrayOfAllItems[j];
							var fromOCR=currItem.FromOCR;
							if(!fromOCR || fromOCR=="")
								fromOCR="false";
							jsonStr+='{"DebtorId":'+currItem.securePartyId+',"Name":"'+currItem.name+'","Address_1":"'+currItem.address+'","IsEditable":'+currItem.IsEditable+',"FromEsos":'+currItem.FromEsos+',"FromOCR":'+fromOCR+',"Sequence":'+currItem.Sequence+'}';
							if(j!=(wid.securePartyDataGrid.store._arrayOfAllItems.length-1))
								jsonStr+=',';
						}
						jsonStr+=']}';
						serviceParams.input = jsonStr;
						repository.retrieveItem(wid.txtGUID.value, lang.hitch(wid, function(retItem) {
							var properties = [{"name": "DocumentTitle","value" : wid.txtFillingId.getValue()}];
							retItem.saveAttributes(properties,retItem.template,null,null,false,function(response) {
								Request.invokePluginService("eSoSCustomPlugin", "saveDebitorsService",
								{
									requestParams: serviceParams,
									synchronous:true,
									requestCompleteCallback: function(response) {
										var jsonResponse=dojo.toJson(response, true, "  ");
										var obj = JSON.parse(jsonResponse);
										if(obj.done==false || obj.done=='false'){
											alert(obj.error);
										}
										else{
											var store = wid.docsDataGrid.store;
											store.setValue(wid.docsDataGrid.selection.getSelected()[0], 'Filing_Number', wid.txtFillingId.getValue());
											store.setValue(wid.docsDataGrid.selection.getSelected()[0], 'Filing_Date', wid.txtFillingDate.getDisplayedValue()+", "+wid.txtFillingTime.getDisplayedValue());
											store.setValue(wid.docsDataGrid.selection.getSelected()[0], 'Filing_Status', wid.txtStatus.getValue());
											wid.docsDataGrid.update();
											theDialog.hide();
										}
									}
								});
							});
						}));
					}
				});
				
				/*
				Event handler for find debtor button
				Search for customer using the entered search criteria
				*/
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
					var jsonStr='{"IsOrganization":'+wid.organizationRadio.checked+',"SearchType":'+searchType+',"IsName":'+wid.nameRadio.checked+',"WildCard":'+wid.wildcardCheck.checked+',"Soundex":'+wid.soundexCheck.checked+',"OrganizationName":"'+wid.txtOrganizationSearch.getValue()+'","FirstName":"'+wid.txtFirstNameSearch.getValue()+'","Initial":"'+
					wid.txtMiddleNameSearch.getValue()+'","LastName":"'+wid.txtLastNameSearch.getValue()+'","AccountNumber":"'+wid.txtAccountNumberSearch.getValue()+'"}';
					serviceParams.input = jsonStr;
					Request.invokePluginService("eSoSCustomPlugin", "searchDebtorService",
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
							  {'name': 'id', 'field': 'CustomerId', 'hidden':true},
							  {'name': 'First Name', 'field': 'FirstName', 'width': '10%'},
							  {'name': 'Last Name', 'field': 'LastName', 'width': '10%'},
							  {'name': 'Middle Initial', 'field': 'MiddleInitial', 'width': '10%'},
							  {'name': 'Suffix', 'field': 'Suffix', 'width': '10%'},
							  {'name': 'Organization', 'field': 'Orgnization', 'width': '10%'},
							  {'name': 'Address 1', 'field': 'Address_1', 'width': '10%'},
							  {'name': 'Address 2', 'field': 'Address_2', 'width': '10%'},
							  {'name': 'Country', 'field': 'Country', 'width': '10%'},
							  {'name': 'City', 'field': 'City', 'width': '10%'},
							  {'name': 'State', 'field': 'State', 'width': '10%'},
							  {'name': 'Zip', 'field': 'Zip', 'width': '10%'},
							  {'name': 'Phone', 'field': 'Phone', 'width': '10%'},
							  {'name': 'Email', 'field': 'Email', 'width': '10%'}
							  
							]];
							wid.searchDataGrid.setStructure(layout);
						}
					});
				});
				
				/*
				Event handler for add note button
				Add a new note using the entered information
				*/
				this.btnAddNote.on("click",function(e){
					var serviceParams = new Object();
					var jsonStr='{"FillingId":'+wid.txtFillingKey.value+',"User":"'+wid.getSolution().getTargetOS().userId+'","IsFOS":'+(wid.isFoS.value=='true'?true:false)+',"Note":"'+wid.txtNewNote.getValue()+'"}';
					serviceParams.input = jsonStr;
					Request.invokePluginService("eSoSCustomPlugin", "addNoteService",
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
				
				/*
				Event handler for filing type drop down list
				Change the lapse date according to the selected type
				In case of tax lien filings set IFSN according to the selected type
				*/
				this.ddlType.on("change",function(newValue){
					var currDate=new Date(wid.txtFillingDate.getDisplayedValue());
					var lapsePeriod=wid.lapsePeriods[newValue];
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
					if(lapsePeriod)
						wid.txtLapseDate.setValue(curr_month+"/"+curr_day+"/"+curr_year);
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
					
				});
				
				/*
				Event handler for filing date field
				Change the lapse date according to the selected filing date
				*/
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
					if(lapsePeriod)
						wid.txtLapseDate.setValue(curr_month+"/"+curr_day+"/"+curr_year);
				});
				
				/*
				Event handler for individual radio button
				When checked hide the organization search criteria field and show individual name search criteria fields
				*/
				this.individualRadio.on("change",function(newValue){
					if(wid.individualRadio.checked){
						domStyle.set(wid.individualSearch1, 'display', '');
						domStyle.set(wid.individualSearch2, 'display', '');
						domStyle.set(wid.individualSearch3, 'display', '');
						domStyle.set(wid.organizationSearch, 'display', 'none');
					}
				});
				
				/*
				Event handler for organization radio button
				When checked hide the individual name search criteria fields and show organization search criteria field
				*/
				this.organizationRadio.on("change",function(newValue){
					if(wid.organizationRadio.checked){
						domStyle.set(wid.individualSearch1, 'display', 'none');
						domStyle.set(wid.individualSearch2, 'display', 'none');
						domStyle.set(wid.individualSearch3, 'display', 'none');
						domStyle.set(wid.organizationSearch, 'display', '');
					}
				});
				
				/*
				Event handler for name radio button
				When checked hide search by account number field and show organization or individual name search criteria fields
				*/
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
				
				
				/*
				Event handler for Billing Account Number radio button
				When checked hide organization and individual name search criteria fields and show search by account number field
				*/
				this.billingRadio.on("change",function(newValue){
					if(wid.billingRadio.checked){
						domStyle.set(wid.individualSearch1, 'display', 'none');
						domStyle.set(wid.individualSearch2, 'display', 'none');
						domStyle.set(wid.individualSearch3, 'display', 'none');
						domStyle.set(wid.organizationSearch, 'display', 'none');
						domStyle.set(wid.accountNumberSearch, 'display', '');
					}
				});
				
				/*
				Event handler for search results grid double click
				Set information of submitter,debtor or secured party using the information of the clicked row
				*/
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
					searchDeptorDialog.hide();
				});
            },

			/*
			This function retrieves the submitter information of a job and set it to submitter and sentto tabs
			*/
			fillSecondTab: function(jobId){
				var wid=this;
				var serviceParams = new Object();
				serviceParams.jobId = jobId;
				  Request.invokePluginService("eSoSCustomPlugin", "submitterInfoService",
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
			
			/*
			This function called automatically passing job information to the widget
			*/
			handleICM_eSoSCaseEvent: function(payload){
				var wid=this;
				var myCase=payload.workItemEditable.getCase();
				this.myCase=myCase;
				myCase.retrieveAttributes(lang.hitch(this,function(retAtt){
					wid.fillSecondTab(retAtt.attributes.ESOS_JobNumber);
					console.log(retAtt.attributes.ESOS_JobNumber);
					wid.jobNumber=retAtt.attributes.ESOS_JobNumber;
					wid.txtJobNumber.setValue(retAtt.attributes.ESOS_JobNumber);
					myCase.retrieveCaseFolder(lang.hitch(this,function(retFol){
						var properties = [{"name": "ESOS_AssignedTo","value" : retFol.repository.userId}];
						retFol.saveAttributes(properties,retFol.template,null,null,false,function(response) {
						});
						
						/*
						Event handler for delete job button
						Deleting the job after got user confirmation
						*/
						wid.btnConfirmDelete.on("click",function(evt){
							var dialog=new ConfirmDialog({ message: "Are you sure you want to confirm job deletion ?",title: "Confirmation"});
							dialog.confirmAction=function(){
								var selectedIds=new Array();
								var repository=wid.getSolution().getTargetOS();
								var properties2 = [{"name": "ESOS_Rejected","value" : "Delete"}];
									
								retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
									
									var serviceParams = new Object();
									serviceParams.input = retAtt.attributes.ESOS_JobNumber;
										
									Request.invokePluginService("eSoSCustomPlugin", "deleteJobService",
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
						
						/*
						Event handler for charges & payments tab
						Opens the charges & payments dialog
						*/
						wid.chargesTab.on("show",function(e){
							wid.paymentsIFrame.set("content", dojo.create("iframe", {
								"src": "http://"+ip.split(":")[0]+":600/Payments?jnum="+retAtt.attributes.ESOS_JobNumber,
								"style": "border: 0; width: 100%; height: 100%"
							}));
							paymentsDialog.show();
							
						});
						
						/*
						Event handler for charges & payments close button
						Close charges and payments dialog
						*/
						wid.btnCnclPayment.on("click",function(evt){
							paymentsDialog.hide();
							wid.mainTabs.selectChild(wid.fillingsTab);
						});
						
						/*
						Event handler for comit job button
						Generate the aknowlegment letter and then comit the job
						*/
						wid.btnCommit.on("click",function(evt){
							var notReviewed=new Array();
							if(wid.docsDataGrid.store !=null){
								array.forEach(wid.docsDataGrid.store._arrayOfAllItems, function(item){
									if(item && item['Reviewed'] != 'Yes'){
										notReviewed.push(item);
									}
								});
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
							var invalidTaxLien=false;
							for(var j=0;j<wid.docsDataGrid.store._arrayOfAllItems.length;j++){
								var currItem=wid.docsDataGrid.store._arrayOfAllItems[j];
								if(currItem.Filing_Type.toString().contains("Tax Lien")){
									var serviceParams5 = new Object();
									serviceParams5.input = currItem.Filing_Number;
							   	    Request.invokePluginService("eSoSCustomPlugin", "deptorsListService",
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
								if(invalidTaxLien){
									break;
								}
							}
							
							if(invalidTaxLien){
								alert("Tax lien fillings must have at least one tax payer");
							}
							else{
								var serviceParams4 = new Object();
								serviceParams4.input = retAtt.attributes.ESOS_JobNumber;
								
								Request.invokePluginService("eSoSCustomPlugin", "fullPaidService",
								{
									requestParams: serviceParams4,
									synchronous:true,
									requestCompleteCallback: function(response) {	// success
										var jsonResponse=dojo.toJson(response, true, "  ");
										var obj = JSON.parse(jsonResponse);
										
										if(obj.Result==false){
											alert("This job is not fully paid yet");
										}else{
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
											Request.invokePluginService("eSoSCustomPlugin", "saveJobService",
											{
												requestParams: serviceParams2,
												synchronous:true,
												requestCompleteCallback: function(response) {
													var jobNumber=retAtt.attributes.ESOS_JobNumber,user=wid.getSolution().getTargetOS().userId;
													var url = window.location.href;
													var ip = url.split("/")[2];
													window.showModalDialog("http://"+ip.split(":")[0]+":500/letter/AcknowldgementLetter?jobNumber="+jobNumber+"&user="+user, null, 'dialogHeight=10px,dialogWidth=10px,status=no,toolbar=no,menubar=no,location=no');
												}
											});
											
											var serviceParams = new Object();
											serviceParams.input = retAtt.attributes.ESOS_JobNumber;
												
											Request.invokePluginService("eSoSCustomPlugin", "commitJobService",
											{
												requestParams: serviceParams,
												synchronous:true,
												requestCompleteCallback: function(response) {	// success
													var properties2 = [{"name": "ESOS_Rejected","value" : "Delete"}];
													retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
														payload.workItemEditable.completeStep(function(){
															window.location.reload(false);
														});
													});
												}
											});
										}
									}
								});
							}
						});
						
						/*
						Event handler for pend job button
						Show pend job dialog and then pend the job after fetching the required information from the user
						*/
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
										retFol.saveAttributes(properties2,retFol.template,null,null,false,function(response) {
											var workItem=payload.workItemEditable.icmWorkItem.ecmWorkItem;
											workItem.setValue("ESOS_PendHours",textbox.getValue());
											workItem.setValue("ESOS_PendTimeout",textbox.getValue());
											payload.workItemEditable.completeStep(function(param){
												myDialog.hide();
												window.location.reload(false);
											});
										});
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
						
						/*
						Event handler for add document button
						Open dialog to add correspondence or payment document
						*/
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
								Request.invokePluginService("eSoSCustomPlugin", "saveDocService",
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
						
						/*
						Retrieves the job details information
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
									  Request.invokePluginService("eSoSCustomPlugin", "docsInfoService",
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
													var reduct=obj[i].Reduct;
													var reviewed=obj[i].Reviewed;
													var filingStatus=obj[i].Filing_Status;
													data.items.push({ 
														"GUID":GUID,
														"Filing_Number" : filingNumber,
														"Filing_Date"  : filingDate,
														"Filing_Type"       : filingType,
														"Reduct"       : reduct,
														"Reviewed": reviewed,
														"Filing_Status"       : filingStatus
													});
												}
												var store = new ItemFileWriteStore({data: data});
												wid.docsDataGrid.setStore(store);
												var layout = [[
												  {'name': 'id', 'field': 'GUID', 'hidden':true},
												  {'name': 'Filing Number', 'field': 'Filing_Number', 'width': '15%'},
												  {'name': 'Filing Date', 'field': 'Filing_Date', 'width': '15%'},
												  {'name': 'Filing Type', 'field': 'Filing_Type', 'width': '15%'},
												  {'name': 'Redacted', 'field': 'Reduct', 'width': '10%'},
												  {'name': 'Reviewed', 'field': 'Reviewed', 'width': '10%'},
												  {'name': 'Filing Status', 'field': 'Filing_Status', 'width': '15%'}
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
			/*
			This function called automatically when the save job button clicked
			Saved submitter and sentto information
			*/
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
					Request.invokePluginService("eSoSCustomPlugin", "saveJobService",
					{
						requestParams: serviceParams,
						synchronous:true,
						requestCompleteCallback: function(response) {
							//alert("The Job Saved Successfully");
						}
					});
				}));
			},
			/*
			a helper function to put history grid filling number field in a URL format to open the document viewer
			*/
			formatURL: function (val, rowIdx){
				var rowData = this.grid.getItem(rowIdx);
				var url="window.open('DocViewer.jsp?itemId="+rowData.GUID+"\',\'\',\'width="+win.getBox().w+",height="+(win.getBox().h)+",resizable,scrollbars=yes,status=1\')";
				console.log("<a href=\"javascript:void(0)\" onclick=\""+url+"\">"+val+"</a>");
				return "<a href=\"javascript:void(0)\" onclick=\""+url+"\">"+val+"</a>";
			},
			
			/*
			Gets list of debtors and secured parties
			*/
			initDebtorSecureParty: function(fillingNumber,GUID){
				
				var wid=this;
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
				  Request.invokePluginService("eSoSCustomPlugin", "deptorsListService",
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
							  {'name': 'Debtor Id', 'field': 'debtorId', 'hidden': true},
							  {'name': 'rowType', 'field': 'rowType', 'hidden': true},
							  {'name': 'FromOCR', 'field': 'FromOCR', 'hidden': true},
							  {'name': 'IsEditable', 'field': 'IsEditable', 'hidden': true},
							  {'name': 'FromEsos', 'field': 'FromEsos', 'hidden': true},
							  {'name': 'Sequence', 'field': 'Sequence', 'hidden': true},
							  {'name': 'Name', 'field': 'name', 'width': '50%'},
							  {'name': 'Address', 'field': 'address', 'width': '50%'}
							]];
							wid.debtorDataGrid.setStructure(layout);
							wid.debtorDataGrid.resize();
												
							if(theDialog.get("title") == 'Tax Payer'){
								data2.items.push({ 
									"securePartyId":"1000",
									"rowType":"old",
									"FromOCR":"true",
									"IsEditable":"true",
									"FromEsos":"true",
									"Sequence":"1",
									"name":"INTERNAL REVENUE SERVICE",
									"address" : "P.O BOX 145595 CINCINNATI OH 45250-5595"
								});
							}							
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
								wid.lapsePeriods["Notice of Tax Lien Certificate of Release"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Certificate of Subordination",
									"name":"Notice of Tax Lien Certificate of Subordination"
								});
								wid.lapsePeriods["Notice of Tax Lien Certificate of Subordination"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Correction",
									"name":"Notice of Tax Lien Correction"
								});
								wid.lapsePeriods["Notice of Tax Lien Correction"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Withdrawal",
									"name":"Notice of Tax Lien Withdrawal"
								});
								wid.lapsePeriods["Notice of Tax Lien Withdrawal"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien",
									"name":"Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien"
								});
								wid.lapsePeriods["Notice of Tax Lien Revocation of Certificate of Release of Federal Tax Lien"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Certificate of Non-attachment",
									"name":"Notice of Tax Lien Certificate of Non-attachment"
								});
								wid.lapsePeriods["Notice of Tax Lien Certificate of Non-attachment"]="10";
								typesData.push({ 
									"id":"Discharge of Property",
									"name":"Discharge of Property"
								});
								wid.lapsePeriods["Discharge of Property"]="10";
								typesData.push({ 
									"id":"Notice of Tax Lien Withdrawal After Release",
									"name":"Notice of Tax Lien Withdrawal After Release"
								});
								wid.lapsePeriods["Notice of Tax Lien Withdrawal After Release"]="10";
								typesData.push({ 
									"id":"Amendment",
									"name":"Amendment"
								});
								wid.lapsePeriods["Amendment"]="10";
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
									wid.ddlAction.setValue("");
								}
								else{
									if(obj.Type != null)
										wid.ddlType.setValue(obj.Type);
									else
										wid.ddlType.setValue("Financing Statement");
									
									wid.ddlType.setDisabled(true);
									wid.ddlAction.setDisabled(false);
									wid.ddlAction.setValue(obj.Action);
								}
							}
							var layout2 = [[
							  {'name': 'Secure Party Id', 'field': 'securePartyId', 'hidden': true},
							  {'name': 'rowType', 'field': 'rowType', 'hidden': true},
							  {'name': 'FromOCR', 'field': 'FromOCR', 'hidden': true},
							  {'name': 'IsEditable', 'field': 'IsEditable', 'hidden': true},
							  {'name': 'FromEsos', 'field': 'FromEsos', 'hidden': true},
							  {'name': 'Sequence', 'field': 'Sequence', 'hidden': true},
							  {'name': 'Name', 'field': 'name', 'width': '50%'},
							  {'name': 'Address', 'field': 'address', 'width': '50%'}
							]];
							wid.securePartyDataGrid.setStructure(layout2);
							wid.securePartyDataGrid.resize();
							
							var serviceParams2 = new Object();
							serviceParams2.input = obj.IFSN;
							var jsonStr='{"ifsn":"'+obj.IFSN+'","filingNumber":"'+fillingNumber+'"}';
							serviceParams2.input = jsonStr;
							
							Request.invokePluginService("eSoSCustomPlugin", "historyService",
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
										var notes=obj2[i].Notes;
										var scannedBy=obj2[i].ScannedBy;
										var processedBy=obj2[i].ProcessedBy;
										var verifiedBy=obj2[i].VerifiedBy;
										var GUID=obj2[i].GUID;
										var formType=obj2[i].FormType;
										var oldFilingNumber=obj2[i].OldFilingNumber;
										
										data3.items.push({ 
											"Action":action,
											"FilingNumber":fillingNumber,
											"FilingDate":fillingDate,
											"Pages":pages,
											"Notes" : notes,
											"ScannedBy" : scannedBy,
											"ProcessedBy" : processedBy,
											"VerifiedBy" : verifiedBy,
											"GUID" : GUID,
											"FormType" : formType,
											"OldFilingNumber" : oldFilingNumber
										});
									}
									
									var store3 = new ItemFileWriteStore({data: data3});
									wid.historyDataGrid.setStore(store3);
									var layout3 = [[
									  {'name': 'Action', 'field': 'Action', 'width': '10%'},
									  {'name': 'Filing Number', 'field': 'FilingNumber', 'width': '10%','formatter': wid.formatURL},
									  {'name': 'Filing Date', 'field': 'FilingDate', 'width': '10%'},
									  {'name': 'Pages', 'field': 'Pages', 'width': '10%'},
									  {'name': 'Notes', 'field': 'Notes', 'width': '10%'},
									  {'name': 'Scanned By', 'field': 'ScannedBy', 'width': '10%'},
									  {'name': 'Processed By', 'field': 'ProcessedBy', 'width': '10%'},
									  {'name': 'Verified By', 'field': 'VerifiedBy', 'width': '10%'},
									  {'name': 'Form Type', 'field': 'FormType', 'width': '10%'},
									  {'name': 'Old Filing Number', 'field': 'OldFilingNumber', 'width': '10%'},
									  {'name': 'GUID', 'field': 'GUID', 'hidden': true},
									]];
									wid.historyDataGrid.setStructure(layout3);
									wid.historyDataGrid.resize();
									
								}
							});
							
							
							var serviceParams3 = new Object();
							serviceParams3.input = obj.FileID;
							serviceParams3.input2 = (wid.isFoS.value=='true')?true:false;
							Request.invokePluginService("eSoSCustomPlugin", "notesService",
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
									  {'name': 'NoteId', 'field': 'NoteId', 'hidden': true},
									  {'name': 'User Name', 'field': 'User', 'width': '25%'},
									  {'name': 'Creation Date', 'field': 'CreationDate', 'width': '25%'},
									  {'name': 'Note Text', 'field': 'Note', 'width': '50%'}
									]];
									wid.notesDataGrid.setStructure(layout4);
									wid.notesDataGrid.canSort = function(col){ return false; }; 
									wid.notesDataGrid.resize();
									
								}
							});
						}
				  });
			},
			/*
			Gets the details of a specific debtor or secured party
			*/
			initDebtorSecurePartyDetails: function(debtorId,fromEsos){
				var wid=this;
				this.txtDebtorId.value=debtorId;
				this.txtFromEsos.value=fromEsos;
				var serviceParams = new Object();
				var jsonStr='{"debitorId":"'+debtorId+'","FromEsos":"'+fromEsos+'"}'
				serviceParams.input = jsonStr;
					//alert(repository.id);
					
				Request.invokePluginService("eSoSCustomPlugin", "deptorDetailsService",
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
			
        });
});