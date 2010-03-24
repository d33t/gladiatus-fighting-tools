var console = {
	log: function(msg) 
	{
		if(!gft_utils.getPrefBranch().getBoolPref("debug"))
			return;
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
									 .getService(Components.interfaces.nsIConsoleService);
		var currMillis = gft_utils.getTime();
		consoleService.logStringMessage("[" + gft_utils.millisToHumanReadable(currMillis, true) + "] " + msg);
	}
};

var parser = {
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
};

function PlayerInfoRequest(reqUrl, handler) 
{	
	this.url = reqUrl;
	this.makeRequest = function()
	{
		var http_request = false;
		if (window.XMLHttpRequest) 
		{
			http_request = new XMLHttpRequest();
			if (http_request.overrideMimeType) 
			{
				http_request.overrideMimeType('text/xml');         
			}  
		}
		
		if(http_request)
		{
			http_request.onreadystatechange = function() { playerInfoHandler(http_request, handler); }; 
			http_request.open('GET', this.url, true);
			http_request.send(null);
		} else 
			console.log("Error[doObtainPlayerInfoRequest()]: Cannot create an XMLHTTP instance:\n " + http_request);	
	},
	
	this.parseHTML = function(aHTMLString){
	   var parseDOM = content.document.createElement('div');
	   parseDOM.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
		  .getService(Components.interfaces.nsIScriptableUnescapeHTML)
		  .parseFragment(aHTMLString, false, null, parseDOM));
	   return parseDOM;
	}
	
	//this.getPlayerData = function() { return this.player; };
}

function playerInfoHandler(http_request, handler)
{
	if (http_request.readyState == 4) 
	{
		if (http_request.status == 200) 
		{
			// this.player.name = parser.parsePlayerName(http_request);
			// this.player.lifepoints = parser.getPlayerCurrentLifePoint(http_request);
			// this.player.level = parser.parsePlayerLevel(http_request);
			// this.player.guild = parser.parsePlayerGuild(http_request);
			var httpPlayer = new HttpPlayerData(parser.parsePlayerName(http_request),
							parser.parsePlayerGuild(http_request),
							parser.parsePlayerLevel(http_request),
							parser.getPlayerCurrentLifePoint(http_request));
			switch(handler)
			{
				case "pinfo": battles.showPlayerInfo(httpPlayer); break;
				// case default: console.log("Request handler. Doing nothing..."); 
			}
		} else 
		{
			console.log("Error[playerInfoHandler()]: error reponse status: " + http_request.status);
		}
   } 
}

gft_utils = {
	getPrefBranch: function()
    {
        var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                       .getService(Components.interfaces.nsIPrefService);
        return prefService.getBranch("extensions.gft.");
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
		var pidRegEx = /mod=player&p=(\d+).*&sh=.*/
		url.match(pidRegEx);
		var pid = RegExp.$1;
		if(pid)
			return pid;
		else
		{
			console.log("Error[getRepIdFromUrl()]: Cannot parse pid from url:\n " +  url);
			return -1;
		}
	},
	
	getRepIdFromUrl: function(url)
	{
		var repidRegEx = /mod=report&beid=(\d+)&sh=.*/
		url.match(repidRegEx);
		var repid = RegExp.$1;
		if(repid)
			return repid;
		else
		{
			console.log("Error[getRepIdFromUrl()]: Cannot parse repId from url:\n " +  url);
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
	}
	
};


var validator = {
	validateHtmlDocument: function(event)
	{
		return event.originalTarget instanceof HTMLDocument;
	},
	
	validateTarget: function(event)
	{
		if(gBrowser.getBrowserForDocument(event.originalTarget) == null)
			return false;
		else if(gBrowser.getBrowserForDocument(event.originalTarget).contentDocument.location != gft_utils.getBrowser().location)
				return false;
		return true;
	},
	
	validateGladiatusPage: function()
	{
		try
		{
			var loc = gft_utils.getBrowser().location + "";
			var retVal = /http:\/\/s\d+.*\.gladiatus\..*\/game\/.*&sh=.*/.test(loc);
			return retVal;
		} catch(e) { console.log(e); return false; }
	},
	
	validatePlayerOverviewPage: function(url)
	{
		var retVal = /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=overview&sh=.*/.test(url);
		return retVal;
	},
	
	validatePlayerPage: function(url)
	{
		var retVal = /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=player&p=\d+&sh=.*/.test(url);
		return retVal;
	},
	
	validatePlayerReportPage: function(url)
	{
		var retVal = /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=report&beid=\d+&sh=.*/.test(url);
		return retVal;
	},
	
	validateCombatReportPage: function(url)
	{
		var retVal = /http:\/\/s\d+.*\.gladiatus\..*\/game\/index\.php\?mod=report&beid=\d+&submod=combatReport&sh=.*/.test(url);
		return retVal;
	}
};

var trimmer = {
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
};

