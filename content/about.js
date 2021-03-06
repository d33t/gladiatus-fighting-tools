﻿/*
 * Copyright (c) <2009> <Rusi Rusev>
 *
  * Permission is hereby granted, free of charge, to any person
  * obtaining a copy of this software and associated documentation
  * files (the "Software"), to deal in the Software without
  * restriction, including without limitation the rights to use,
  * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
*/
try {
	Components.utils.import("resource://gre/modules/AddonManager.jsm");
} catch(e) {}

GFTVersions = (function()
{
	var versions = [];
	var utils = GFT.Utils;
	
	function VersionItem(versionName) {
		var name = versionName;
		var content = new Array();
		this.getName = function() { return name; };
		this.addLine = function(line) { content.push(line); };
		this.getContent = function() { return content; };
	}
	
	function showSelectedVersion() {
		var version = document.getElementById('versionsmenu').selectedItem.label;
		var textarea = document.getElementById('versionsarea');
		if(version == "all") {
			textarea.innerHTML = getAllVersionsHTML();
		} else { 
			textarea.innerHTML = getVersionHTML(getVersion(version), false);
		}
	}
	
	function getVersion(version) {
		for(var i = 0; i < versions.length; i++) {
			if(versions[i].getName() == version) {
				return versions[i];
			}
		}
		return false;
	}

	function getAllVersionsHTML() {
		var result = "";
		for(var i = 0; i < versions.length; i++) {
			result += getVersionHTML(versions[i], true);
		}
		return result;
	}
	
	function getVersionHTML(version, printHeader) {
		if(!version) {
			return getAllVersionsHTML();
		}
		
		var ulOpen = "<html:ul>";
		var ulClose = "</html:ul>";
		var liOpen = "<html:li>";
		var liClose = "</html:li>";
		
		var result = ulOpen;
		var content = version.getContent();
		for(i = 0; i < content.length; i++) {
			result += liOpen + content[i] + liClose;
		}
		result += ulClose;
		
		if(printHeader) {
			result = "<html:h3>" + version.getName() + "</html:h3>" + result;
		}
		
		return result;
	}
	
	function initVersions(file) {
		/*var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
								createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(file, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);
		*/
		// First, get and initialize the converter
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                          .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";

		// This assumes that 'file' is a variable that contains the file you want to read, as an nsIFile
		var fis = Components.classes["@mozilla.org/network/file-input-stream;1"]
                    .createInstance(Components.interfaces.nsIFileInputStream);
		fis.init(file, -1, -1, 0);
		var lis = fis.QueryInterface(Components.interfaces.nsILineInputStream);
		var lineData = {}, hasmore, currentPos = 0;
		do {
		  hasmore = lis.readLine(lineData);
		  var value = converter.ConvertToUnicode(lineData.value);
		  if(value == "") {
			continue;
		  }
		  if(value.charAt(0) == '#') {
			versions[currentPos++] = new VersionItem("v" + value.split(" ")[1]);
			continue;
		  } else {
			  versions[currentPos-1].addLine(value);
		  }
		} while(hasmore);
		lis.close();
		initVersionsDDMenu();
	}
	
	function initVersionsDDMenu() {
		for(var i = 0; i < versions.length; i++) {
			utils.appendToDD("versions-popup", versions[i].getName());
		}
		document.getElementById("versionsmenu").selectedIndex = utils.getMenuItemIndexById("versionsmenu", "v" + GFT.Constants.VERSION);
		showSelectedVersion();
	}
	
	return {
		init: function() {
			document.getElementById("gft-version").innerHTML = GFT.Constants.VERSION;
			try { // firefox 3,6,*
				var em = Components.classes["@mozilla.org/extensions/manager;1"].
					 getService(Components.interfaces.nsIExtensionManager);
				var f1 = em.getInstallLocation(GFT.Constants.ADDON_ID).getItemFile(GFT.Constants.ADDON_ID, "VERSIONS");
				initVersions(f1);
			} catch(e) { // firefox 4
				AddonManager.getAddonByID(GFT.Constants.ADDON_ID, function(addon) {
					var f2 = addon.getResourceURI("VERSIONS").QueryInterface(Components.interfaces.nsIFileURL).file;
					initVersions(f2);
				});
			}
		},
		
		changeVersion: showSelectedVersion
	};
})();
