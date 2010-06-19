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
	
	trimmer: {
		trim: function(str, chars) 
		{
			return this.ltrim(this.rtrim(str, chars), chars);
		},
		 
		ltrim: function(str, chars) 
		{
			chars = chars || "\\s";
			return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
		},
		 
		rtrim: function(str, chars) 
		{
			chars = chars || "\\s";
			return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
		}
	},
	
	parser: {
			parsePlayerName: function(http_request)
			{
				var pNameRegEx = /playername_achievement\"\>/i;
				var html = http_request.responseText;
				var pos = html.search(pNameRegEx);	
				var namehtml = html.substring(pos, pos + 80);
				var nameRegExp = />\s+[\w\;\:\?\)\(\*\-\.\@\-\!\`]+\s+</i; //TODO
				var pName = nameRegExp.exec(namehtml) + "";
				if(pos != -1)
					return trimmer.trim(pName.substring(1, pName.length-1));
				else
				{
					document.getElementById("gft-battles-errors").value += "cannot parse playername \'" + pName + "\'\n";
					return "wrong playername";
				}
			},
			
			parsePlayerLevel: function(http_request)
			{
				var pLvlRegExp = /charstats_value22\"\>/i;
				var html = http_request.responseText;
				var pos = html.search(pLvlRegExp);	
				html.substring(pos + 19, pos + 22).match(/(\d+)/);
				if(pos != -1)
					return RegExp.$1;
				else
				{
					document.getElementById("gft-battles-errors").value += "cannot parse player level \n";
					return "wrong player level";
				}	
			},
			
			parsePlayerGuild: function(http_request)
			{
				var pGuildRegExp = /mod=guild&i=\d+&sh=\w+/i;
				var html = http_request.responseText;
				var pos = html.search(pGuildRegExp);
				if(pos != -1)
				{
					var guildhtml = html.substring(pos, pos + 100);
					var guildRegExp = /\w+\s\[[\w\`\'\*\.\^\!\[\]\-\@\`\=\$]+\]/i; //TODO
					if(pos != -1)
						return trimmer.trim(guildRegExp.exec(guildhtml)+"");
					else
					{
						document.getElementById("gft-battles-errors").value += "cannot parse player guild \'" + guildhtml + "\'\n";
						return "wrong player guild";
					}
				}
				else
					return "none";
			},
			
			parsePlayerLifePointsInfo: function(http_request)
			{
				var pLifePointRegExp = />\d{1,4}\s\/\s\d{4}</;
				var html = http_request.responseText;
				var lifepoints = pLifePointRegExp.exec(html) + "";	
				return lifepoints.substring(1, lifepoints.length-1);
			},
			
			getPlayerCurrentLifePoint: function(http_request)
			{
				var lifepoints = this.parsePlayerLifePointsInfo(http_request);
				var currLifePointsRegExp = /\d{1,4}\s/i;
				return trimmer.trim(currLifePointsRegExp.exec(lifepoints)+"");
			},
			
			parseTime: function()
			{ 
				return "unsupported function";
				// var doc = http_request.responseXML;
				// var xPath = "//span[@id='bx0']";
				// var nodesSnapshot = doc.evaluate(xPath, doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
				// var timeUntilBattleNode = nodesSnapshot.snapshotItem(0);
				// if(timeUntilBattleNode)
				// {
					// var timeUntilBattle = trimmer.trim(timeUntilBattleNode.textContent);
					// var tt = timeUntilBattle.split(":").reverse(); 
					// return (tt[0] * 1000)+(tt[1] * 60000);
				// }
				// else
					// return new Date().getTime();
			}
	},
	
	getStrings: function() // not used recently
	{
		return document.getElementById("gft-strings");
	},
	
	getString: function(string)
	{
		return this.getStrings().getString(string);
	},
	
	getPidFromUrl: function(url)
	{
		var pidRegEx = /mod=player&p=(\d+).*&sh=.*/;
		url.match(pidRegEx);
		var pid = RegExp.$1;
		if(pid)
			return pid;
		else
		{
			this.console.log("Error[getRepIdFromUrl()]: Cannot parse pid from url:\n " +  url);
			return -1;
		}
	},
	
	getRepIdFromUrl: function(url)
	{
		var repidRegEx = /mod=report&beid=(\d+).*&sh=.*/;
		url.match(repidRegEx);
		var repid = RegExp.$1;
		if(repid)
			return repid;
		else
		{
			this.console.log("Error[getRepIdFromUrl()]: Cannot parse repId from url:\n " +  url);
			return -1;
		}
	},
	
	getTime: function()
	{
		return new Date().getTime();
	},

	getBrowser: function()
	{
		return gBrowser.selectedBrowser.contentDocument;
	},

	getServer: function()
	{
		return gBrowser.selectedBrowser.contentDocument.domain;
	},
	
	millisToHumanReadable: function(millis, log)
	{
		var date = new Date(parseInt(millis));
		
		var time = "";
		
		time = this.to2digits(date.getMinutes()) + ":";	
		time += this.to2digits(date.getSeconds());		
		if(log)
		{
			time = this.to2digits(date.getHours()) + ":" + time;
			time += "." + date.getMilliseconds();
		}
		return time;
	},

	to2digits: function(n)
	{
		if (n > 9) return n;
		return "0" + n;
	},
  
	unixtimeToHumanReadable: function(unixtime) 
	{
		var theDate = new Date(unixtime * 1000);
		return this.to2digits(theDate.getDate()) + "." + 
				this.to2digits(theDate.getMonth()+1) + "." + 
				theDate.getFullYear() + " - " + 
				this.to2digits(theDate.getHours()) + ":" +
				this.to2digits(theDate.getMinutes()) + ":" +
				this.to2digits(theDate.getSeconds());
		// return	theDate.toLocaleString();
	},
	
	reverse: function(string)
	{
		splitext = string.split("");
		revertext = splitext.reverse();
		reversed = revertext.join("");
		return reversed;
	},
	
	/**
	* Partitionate number of form x.xxx.xxx
	*/
	partitionateNumber: function(number)
	{
		number = this.reverse(number+"");
		var ret = "";
		for(var i = 0; i < number.length; i++)
		{
			if(i > 0 && i%3 == 0)
				ret += ".";
			ret += number.charAt(i);
		}
		number = this.reverse(ret);
		
		return number;
	},
		
	createTableEntry: function(name, value) {
		return '<tr><th colspan="4">' + name + ':</th> <td colspan="2" style="padding-left: 3px; white-space: nowrap;" class="stats_value">' + value + '</td></tr>\n';
	}
};
