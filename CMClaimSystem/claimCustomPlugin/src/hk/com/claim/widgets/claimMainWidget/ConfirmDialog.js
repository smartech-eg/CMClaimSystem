define([
"dojo/_base/declare",
"dijit/Dialog",
"dijit/layout/ContentPane",
"dijit/form/Button"
],
function(declare, Dialog){
	return declare("hk.com.claim.widgets.mainWidget.ConfirmDialog", Dialog, {
		message : "Vous avez modifié vos données"+ "\n" + "Souhaitez-vous les enregistrer ?",
		position : "right",
		refocus: false,
		autofocus: false,
		buttons : [{
				label : "Yes",
				value : true,
				hasFocus: true,
				id : null
			},
			{
				label : "No",
				value : false,
				id : null
			}
		],
		confirmAction: function(){
			alert("yes");
		},
		defaultReturnValue : null,
		iconClass : null,
		_hasReturned : false,
		_returnedValue : false,
		_firstFocus : null,
		postCreate : function(){
			this.inherited(arguments);
			this.title="Confirmation";
			if(null == this.defaultReturnValue){
				this.defaultReturnValue = false;
			}
			this._createMessageContainer();
			if(null != this.iconClass && "" != this.iconClass){
				dojo.addClass(this.titleNode, this.iconClass + "_16");
				dojo.addClass(messagePane.containerNode, this.iconClass);
			}
			var buttonPane = new dijit.layout.ContentPane({
				style: "text-align:" + this.position + ";"
			}, dojo.create("div"));
			buttonPane.startup();
			this.addChild(buttonPane);
			var wid=this;
			dojo.forEach(this.buttons, function(bouton){
				if(null == bouton.id){
					//bouton.id = bouton.label;
				}
				var button = new dijit.form.Button(bouton, dojo.create("div"));
				dojo.addClass(button.domNode, "dialogContainer");
				dojo.place(button.domNode, buttonPane.containerNode, "last");
				if(button.label == 'No'){
					this.connect(button, "onClick", function(){
						this.onButtonClick(button.get("value"));
						this.hide();
					}, this);
				}
				else {
					this.connect(button, "onClick", function(){
						this.confirmAction();
						this.hide();
					}, this);
				}
				// by default we give focus to the first button
				// then when we meet a focus : true in a button property
				// we update
				if(null == this._firstFocus|| (!!button.hasOwnProperty("hasFocus") && !!button.hasFocus)){
					this._firstFocus = button;
					this._firstFocus.focus();
				}
			}, this);
		},
		_createMessageContainer: function(){
			var messagePane = new dijit.layout.ContentPane({
				content : this.message
			}, dojo.create("div"));
			this.addChild(messagePane);
		},
		onButtonClick : function(value){
			this._hasReturned = true;
			this._returnedValue = value;
			return value;
		},
		onBeforeHide : function(){
			if(!this._hasReturned){
				this.onButtonClick(this.defaultReturnValue);
			}
			var onHidden = null;
			onHidden = this.connect(this, 'onHide',dojo.hitch(this, function(){
				this.disconnect(onHidden);
					setTimeout(dojo.hitch(this, function(){
						this.destroyRecursive();
					}), 0);
				}));
			return true;
		}
	});
});