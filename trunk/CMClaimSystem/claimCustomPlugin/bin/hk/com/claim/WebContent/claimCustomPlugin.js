var claimContextRoot = "/claimCustomWidgets";

var loadCSS = function(cssFileUrl){
	if (dojo.isIE) {
		document.createStyleSheet(cssFileUrl);
	} else {
		var head = document.getElementsByTagName("head")[0];
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = cssFileUrl;
		head.appendChild(link);
	}
};

var loadJS = function(scriptUri){
	try{
		dojo._loadUri(scriptUri);
	}catch(e){
		console.log("claimCustomPlugin loading script fail ... "+scriptUri);
	}
};

//not sure which one is necessary, test and remove ...
var cssFileUris = [
	"./dojox/form/resources/RangeSlider.css",
	claimContextRoot + "/hk/com/claim/css/common.css",
	"./digit/themes/claro/claro.css",
	"./dojox/grid/resources/claroGrid.css"
                   ];

for(var i in cssFileUris){
	var cssFileUri = cssFileUris[i];
	loadCSS(cssFileUri);
}

var jsFileUris = [
                  //"dojo/dojo-all.js"
                  ];

for(var i in jsFileUris){
	var jsFileUri = jsFileUris[i];
	loadJS(jsFileUri);
}

//setup ICM runtime
dojo.setObject("ecmwdgt.contextRoot", claimContextRoot);

var paths = {
		"hk/com/claim":"/claimCustomWidgets/hk/com/claim",
		"icm":"/ICMClient/icm"
	};
require({paths:paths});

console.log("Claim Plugin Scope: start to require files");
//icmglobal = {};

//is debug mode?
var currentLocation = location.href;
//icmglobal.isDebug = false;
if(currentLocation.indexOf("debug=true") > 0) {
//	icmglobal.isDebug = true;
}

	console.log("debug start");

	require(["dojo/_base/declare","dijit/_Widget", "dijit/_Templated","dijit/_WidgetsInTemplateMixin", "dojo/parser", "icm/util/Util", "dojo/domReady!"], function(declare, _Widget, _Templated, _WidgetsInTemplateMixin, parser, utils){
		console.log("Claim Plugin Scope: end to require files");

//		icmglobal.modulePath = "icm";

		console.log("Claim Plugin Scope - End");
	});
	console.log("debug end");