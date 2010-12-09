GFT.gmCompiler={

// getUrlContents adapted from Greasemonkey Compiler
// http://www.letitblog.com/code/python/greasemonkey.py.txt
// used under GPL permission
//
// most everything else below based heavily off of Greasemonkey
// http://greasemonkey.devjavu.com/
// used under GPL permission
console: GFT.Utils.console,

getUrlContents: function(aUrl){
	var	ioService=Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	var	scriptableStream=Components
		.classes["@mozilla.org/scriptableinputstream;1"]
		.getService(Components.interfaces.nsIScriptableInputStream);
	var unicodeConverter=Components
		.classes["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	unicodeConverter.charset="UTF-8";
	
	var	input, str;
	try {
		input=ioService.newChannel(aUrl, null, null).open();
		scriptableStream.init(input);
		str=scriptableStream.read(input.available());
		scriptableStream.close();
		input.close();
	} catch (e) {
		this.console.log("[ERROR] Cannot load script at " +  aUrl + "\n" + e);
		return false;
	}

	try {
		return unicodeConverter.ConvertToUnicode(str);
	} catch (e) {
		return str;
	}
},

isGreasemonkeyable: function(url) {
	var scheme=Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService)
		.extractScheme(url);
	return (
		(scheme == "http" || scheme == "https" || scheme == "file") &&
		!/hiddenWindow\.html$/.test(url)
	);
},

contentLoad: function(e) {
	var unsafeWin=e.target.defaultView;
	if (unsafeWin.wrappedJSObject) unsafeWin=unsafeWin.wrappedJSObject;

	var unsafeLoc=new XPCNativeWrapper(unsafeWin, "location").location;
	var href=new XPCNativeWrapper(unsafeLoc, "href").href;
	if (
		GFT.gmCompiler.isGreasemonkeyable(href)
		&& (( /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=player&p=\d+&sh=.*/.test(href) )
		|| ( /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=player&p=\d+&doll=1&sh=.*/.test(href) ))
		&& true
	) {
		var script=GFT.gmCompiler.getUrlContents(
			'chrome://gft/content/gft-injected.js'
		);
		
		if(script) {
			GFT.gmCompiler.injectScript(script, href, unsafeWin);
		}
	}
},

injectScript: function(script, url, unsafeContentWin) {
	var sandbox, script, logger, storage, xmlhttpRequester;
	var safeWin=new XPCNativeWrapper(unsafeContentWin);

	sandbox=new Components.utils.Sandbox(safeWin);

	var storage=new GFT.PrefManager();
	xmlhttpRequester=new GFT.xmlhttpRequester(
		unsafeContentWin, window//appSvc.hiddenDOMWindow
	);

	sandbox.window=safeWin;
	sandbox.document=sandbox.window.document;
	sandbox.unsafeWindow=unsafeContentWin;

	// patch missing properties on xpcnw
	sandbox.XPathResult=Components.interfaces.nsIDOMXPathResult;

	// add our own APIs
	//sandbox.GM_addStyle=function(css) { GFT.gmCompiler.addStyle(sandbox.document, css); };
	sandbox.GM_setValue=GFT.gmCompiler.hitch(storage, "setValue");
	sandbox.GM_getValue=GFT.gmCompiler.hitch(storage, "getValue");
	var ppc = new GFT.PlayerPageContent();
	sandbox.GM_getEnemyStats=GFT.gmCompiler.hitch(ppc, "getEnemyStats");
	sandbox.GM_getMyStats=GFT.gmCompiler.hitch(ppc, "getMyStats");
	sandbox.GM_getString=GFT.gmCompiler.hitch(ppc, "getString");
	sandbox.GM_getFightResponseResult=GFT.gmCompiler.hitch(ppc, "getFightResponseResult");
	sandbox.GM_isMyAlly=GFT.gmCompiler.hitch(ppc, "isMyAlly");
	sandbox.GM_isMyProfilePage=GFT.gmCompiler.hitch(ppc, "isMyProfilePage");
	sandbox.GM_isLevelBashed=GFT.gmCompiler.hitch(ppc, "isLevelBashed");
	sandbox.GM_isServerActive=GFT.gmCompiler.hitch(ppc, "isServerActive");
	sandbox.GM_openInTab=GFT.gmCompiler.hitch(this, "openInTab", unsafeContentWin);
	sandbox.GM_xmlhttpRequest=GFT.gmCompiler.hitch(
		xmlhttpRequester, "contentStartRequest"
	);
	sandbox.GM_getFightResponseUrl=GFT.Utils.getFightResponseUrl;
	sandbox.GM_log=GFT.Utils.console.log;
	
	//unsupported
	sandbox.GM_registerMenuCommand=function(){};
	sandbox.GM_getResourceURL=function(){};
	sandbox.GM_getResourceText=function(){};

	sandbox.__proto__=sandbox.window;

	try {
		this.evalInSandbox(
			"(function(){"+script+"})()",
			url,
			sandbox);
	} catch (e) {
		var e2=new Error(typeof e=="string" ? e : e.message);
		e2.fileName=script.filename;
		e2.lineNumber=0;
		//GM_logError(e2);
		this.console.log(e2);
	}
},

evalInSandbox: function(code, codebase, sandbox) {
	if (Components.utils && Components.utils.Sandbox) {
		// DP beta+
		Components.utils.evalInSandbox(code, sandbox);
	} else if (Components.utils && Components.utils.evalInSandbox) {
		// DP alphas
		Components.utils.evalInSandbox(code, codebase, sandbox);
	} else if (Sandbox) {
		// 1.0.x
		evalInSandbox(code, sandbox, codebase);
	} else {
		throw new Error("Could not create sandbox.");
	}
},

openInTab: function(unsafeContentWin, url) {
	var tabBrowser = getBrowser(), browser, isMyWindow = false;
	for (var i = 0; browser = tabBrowser.browsers[i]; i++)
		if (browser.contentWindow == unsafeContentWin) {
			isMyWindow = true;
			break;
		}
	if (!isMyWindow) return;
 
	var loadInBackground, sendReferrer, referrer = null;
	loadInBackground = tabBrowser.mPrefs.getBoolPref("browser.tabs.loadInBackground");
	sendReferrer = tabBrowser.mPrefs.getIntPref("network.http.sendRefererHeader");
	if (sendReferrer) {
		var ios = Components.classes["@mozilla.org/network/io-service;1"]
							.getService(Components.interfaces.nsIIOService);
		referrer = ios.newURI(content.document.location.href, null, null);
	 }
	 tabBrowser.loadOneTab(url, referrer, null, null, loadInBackground);
 },
 
 hitch: function(obj, meth) {
	var unsafeTop = new XPCNativeWrapper(unsafeContentWin, "top").top;

	for (var i = 0; i < this.browserWindows.length; i++) {
		this.browserWindows[i].openInTab(unsafeTop, url);
	}
},

apiLeakCheck: function(allowedCaller) {
	var stack=Components.stack;

	var leaked=false;
	do {
		if (2==stack.language) {
			if ('chrome'!=stack.filename.substr(0, 6) &&
				allowedCaller!=stack.filename 
			) {
				leaked=true;
				break;
			}
		}

		stack=stack.caller;
	} while (stack);

	return leaked;
},

hitch: function(obj, meth) {
	if (!obj[meth]) {
		throw "method '" + meth + "' does not exist on object '" + obj + "'";
	}

	var hitchCaller=Components.stack.caller.filename;
	var staticArgs = Array.prototype.splice.call(arguments, 2, arguments.length);

	return function() {
		if (GFT.gmCompiler.apiLeakCheck(hitchCaller)) {
			return;
		}
		
		// make a copy of staticArgs (don't modify it because it gets reused for
		// every invocation).
		var args = staticArgs.concat();

		// add all the new arguments
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		// invoke the original function with the correct this obj and the combined
		// list of static and dynamic arguments.
		return obj[meth].apply(obj, args);
	};
},

addStyle:function(doc, css) {
	var head, style;
	head = doc.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = doc.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
},

onLoad: function(e) {
	var	appcontent=window.document.getElementById("appcontent");
	if (appcontent && !appcontent.greased_gft_gmCompiler) {
		appcontent.greased_gft_gmCompiler=true;
		appcontent.addEventListener("DOMContentLoaded", GFT.gmCompiler.contentLoad, false);
	}
},

onUnLoad: function() {
	//remove now unnecessary listeners
	window.removeEventListener('load', GFT.gmCompiler.onLoad, false);
	window.removeEventListener('unload', GFT.gmCompiler.onUnLoad, false);
	window.document.getElementById("appcontent")
		.removeEventListener("DOMContentLoaded", GFT.gmCompiler.contentLoad, false);
}

}; //object gmCompiler

window.addEventListener('load', GFT.gmCompiler.onLoad, false);
window.addEventListener('unload', GFT.gmCompiler.onUnLoad, false);