/*
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
GFT.Utils = {
	console: {
		log: function(msg) {
			var prefMan = new GFT.PrefManager();
			if(!prefMan.getValue("debug", false)) {
				return;
			}
			var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
										 .getService(Components.interfaces.nsIConsoleService);
			var currMillis = GFT.Utils.getTime();
			consoleService.logStringMessage("[" + GFT.Utils.millisToHumanReadable(currMillis, true) + "] " + msg);
		}
	},
	
	validator: {
		isValidHtmlDocument: function(event) {
			return event.originalTarget instanceof HTMLDocument;
		},
		
		isValidTarget: function(event) {
			if(gBrowser.getBrowserForDocument(event.originalTarget) == null)
				return false;
			else if(gBrowser.getBrowserForDocument(event.originalTarget).contentDocument.location != GFT.Utils.getBrowser().location)
					return false;
			return true;
		},
		
		isGladiatusPage: function() {
			try {
				return /http:\/\/s\d+.*\.gladiatus\..*\/game\/.*&sh=.*/.test(GFT.Utils.getBrowser().location + "");
			} catch(e) { this.console.log(e); return false; }
		},
		
		isPlayerOverviewPage: function(url) {
			return /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=overview&sh=.*/.test(url);
		},
		
		isPlayerPage: function(url) {
			return /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=player&p=\d+&sh=.*/.test(url);
		},
		
		isPlayerReportPage: function(url) {
			return /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=report&beid=\d+&sh=.*/.test(url)
						|| /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=report&beid=\d+&t=2&sh=.*/.test(url);
		},
		
		isCombatReportPage: function(url) {
			return /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=report&beid=\d+&submod=combatReport&sh=.*/.test(url)
						|| /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=report&beid=\d+&t=3&sh=.*/.test(url);
		}
	},
	
	//TODO merge
	trimmer: {
		trim: function(str, chars) {
			return this.ltrim(this.rtrim(str, chars), chars);
		},
		 
		ltrim: function(str, chars) {
			chars = chars || "\\s";
			return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
		},
		 
		rtrim: function(str, chars) {
			chars = chars || "\\s";
			return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
		}
	},
	
	getStrings: function() { // not used recently
		return document.getElementById("gft-strings");
	},
	
	getString: function(string) {
		return this.getStrings().getString(string);
	},
	
	getPidFromUrl: function(url) {
		var pidRegEx = /mod=player&p=(\d+).*&sh=.*/;
		url.match(pidRegEx);
		var pid = RegExp.$1;
		if(pid) {
			return pid;
		}
		else {
			this.console.log("Error[getRepIdFromUrl()]: Cannot parse pid from url:\n " +  url);
			return -1;
		}
	},
	
	getRepIdFromUrl: function(url) {
		var repidRegEx = /mod=report&beid=(\d+).*&sh=.*/;
		url.match(repidRegEx);
		var repid = RegExp.$1;
		if(repid) {
			return repid;
		}
		else {
			this.console.log("Error[getRepIdFromUrl()]: Cannot parse repId from url:\n " +  url);
			return -1;
		}
	},
	
	getTime: function() {
		return new Date().getTime();
	},
	
	getGMTTime: function() {
		var currDate = new Date(); //in utc format
		var offsetToGMT = (currDate.getTimezoneOffset()*60*(-1)) - this.getTimeZoneOffset(true);
		return Math.round((currDate.getTime()/1000)) + offsetToGMT;
	},
	
	getBrowser: function() {
		return gBrowser.selectedBrowser.contentDocument;
	},

	getServer: function() {
		return gBrowser.selectedBrowser.contentDocument.domain;
	},
	
	dateToGMTUnixTime: function(stringDate) {
		var dateFormatRegEx = /\d{2}\.\d{2}.\d{4}\s{1}\d{2}:\d{2}:\d{2}/;
		if(!dateFormatRegEx.test(stringDate)) {
			return Math.round(this.getTime()/1000.0);
		}
		
		stringDate = stringDate.match(dateFormatRegEx) + "";
		stringDate = stringDate.split(" ");
		var datePart = stringDate[0].split(".");
		var timePart = stringDate[1].split(":");
		var humDate = new Date(Date.UTC(datePart[2], (datePart[1]-1), datePart[0],
				timePart[0], timePart[1], timePart[2]));
		
		var germanTimeOffset = 60*60;
		return (humDate.getTime()/1000.0) - germanTimeOffset;
	},	
	
	millisToHumanReadable: function(millis, log) {
		var date = new Date(parseInt(millis));
		
		var time = "";
		
		time = this.to2digits(date.getMinutes()) + ":";	
		time += this.to2digits(date.getSeconds());		
		if(log) {
			time = this.to2digits(date.getHours()) + ":" + time;
			time += "." + date.getMilliseconds();
		}
		return time;
	},

	to2digits: function(n) {
		if (n > 9) return n;
		return "0" + n;
	},
  
	unixtimeToHumanReadable: function(unixtime) {
		var localTimeOffset = this.getTimeZoneOffset(true);
		this.console.log("TZO: " + localTimeOffset);
		var theDate = new Date((unixtime + localTimeOffset) * 1000);
		
		return this.to2digits(theDate.getUTCDate()) + "." + 
				this.to2digits(theDate.getUTCMonth()+1) + "." + 
				theDate.getUTCFullYear() + " - " + 
				this.to2digits(theDate.getUTCHours()) + ":" +
				this.to2digits(theDate.getUTCMinutes()) + ":" +
				this.to2digits(theDate.getUTCSeconds());
		
	},
	
	reverse: function(string) {
		splitext = string.split("");
		revertext = splitext.reverse();
		reversed = revertext.join("");
		return reversed;
	},
	
	/**
	* Partitionate number of form x.xxx.xxx
	*/
	partitionateNumber: function(number) {
		number = this.reverse(number+"");
		var ret = "";
		for(var i = 0; i < number.length; i++) {
			if(i > 0 && i%3 == 0)
				ret += ".";
			ret += number.charAt(i);
		}
		number = this.reverse(ret);
		
		return number;
	},
		
	createTableEntry: function(name, value) {
		return '<tr><th colspan="4">' + name + ':</th> <td colspan="2" style="padding-left: 3px; white-space: nowrap;" class="stats_value">' + value + '</td></tr>\n';
	},
	
	doHttpRequest: function(details) {
		var unsafeWin=this.getBrowser().defaultView;
		if (unsafeWin.wrappedJSObject) unsafeWin=unsafeWin.wrappedJSObject;
		var xmlhttpRequester=new GFT.xmlhttpRequester(
				unsafeWin, window
		);
		xmlhttpRequester.contentStartRequest(details);
	},
	
	reportError: function(message, exception) {
		if(!message && !exception) {
			this.reportError("Unknown error. Bad error handling", null);
		}
		var msg = "";
		if(message) {
			msg += "Message: " + message;
		}
		if(exception) {
			if(msg != "") {
				msg += "\n";
			}
			msg += "Exception: " + exception;
		}
		
        try {
            const prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                      .getService(Components.interfaces.nsIPromptService);
            const flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_OK +
                          prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING +
                          prompts.BUTTON_POS_0_DEFAULT;
            var button = prompts.confirmEx( null, "Info", message, flags, "", "Report", "", null, {} );

            if (button == 1) { // "Report" button
        		this.loadUrl("http://code.google.com/p/gladiatus-fighting-tools/issues/list");
            }
        }
        catch (e) { this.console.log("Failed to handle info prompt\n" + e); }		
	},
	
	loadUrl: function(url, newTab) {
		if(newTab) {
            const currentBrowser = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                                      .getService(Components.interfaces.nsIWindowMediator)
                                                      .getMostRecentWindow("navigator:browser")
                                                      .getBrowser();
            currentBrowser.selectedTab = currentBrowser.addTab(url,null,null);		
		} else {
			this.getBrowser().location.href = url;
		}
	},

	/**
	 * Returns the timezone offset in hours or in seconds.
	 * 
	 * The original function Date.getTimezoneOffset is too buggy!
	 * The function was originally written by Josh Fraser (http://www.onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/)
	 * 
	 * @param inSeconds - if true returns TZO in seconds, otherwise in hours
	 * @returns TZO in hours or seconds depending on parameter inSeconds
	 */
	getTimeZoneOffset: function(inSeconds) {
		var rightNow = new Date();
		var jan1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);  // jan 1st
		var june1 = new Date(rightNow.getFullYear(), 6, 1, 0, 0, 0, 0); // june 1st
		var temp = jan1.toGMTString();
		var jan2 = new Date(temp.substring(0, temp.lastIndexOf(" ")-1));
		temp = june1.toGMTString();
		var june2 = new Date(temp.substring(0, temp.lastIndexOf(" ")-1));
		var std_time_offset = (jan1 - jan2) / (1000 * 60 * 60);
		var daylight_time_offset = (june1 - june2) / (1000 * 60 * 60);
		var dst;
		if (std_time_offset == daylight_time_offset) {
			dst = "0"; // daylight savings time is NOT observed
		} else {
			// positive is southern, negative is northern hemisphere
			var hemisphere = std_time_offset - daylight_time_offset;
			if (hemisphere >= 0)
				std_time_offset = daylight_time_offset;
			dst = "1"; // daylight savings time is observed
		}
		
		if(inSeconds) {
			var value = std_time_offset;
			var hours = parseInt(value);
		   	value -= parseInt(value);
			value *= 60;
			var mins = parseInt(value);
			return (hours*60 + mins)*60;			
		} else {
			return std_time_offset;
		}
	}
};
