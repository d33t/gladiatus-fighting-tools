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

var gftScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
gftScriptLoader.loadSubScript("chrome://gft/content/objects.js");
if(!gft_db)
	gftScriptLoader.loadSubScript("chrome://gft/content/gft_db.js");
if(!gft_utils)
	gftScriptLoader.loadSubScript("chrome://gft/content/gft_utils.js");
if(!statusbar)
	gftScriptLoader.loadSubScript("chrome://gft/content/statusbar.js");

var gft = {
	initialized: false,
	
	onLoad: function() 
	{
		if(this.initialized || gft_utils.getPrefBranch().getBoolPref("init"))
			return;	
			
		window.removeEventListener("load", function(e) { gft.onLoad(e); }, false);
		this.init();
	},
	
	onUnLoad: function() 
	{
		gft_utils.getPrefBranch().setBoolPref("init", false);
		this.initialized = false;
		var container = gBrowser.tabContainer;
		window.removeEventListener("load", function (e) { gBrowser.removeEventListener("load", gft.onPageLoad(e), true);},false);
	},
	
	init: function() 
	{
		//initialize
		//gft_utils.getPrefBranch().setBoolPref("debug", true);
		gft_utils.getPrefBranch().setCharPref("sessionstart", gft_utils.getTime() + "");
		// init the db
		gft_db.init();
		/* make db table for each server and then init counter if user is on gladiatus page
		var server = gft_utils.getServer();
		var lastopponent = gft_utils.getPrefBranch().getCharPref(server + ".lastopponent")
		if(lastopponent)
		{
			document.getElementById("timer-fighter-tooltip-lastopponent").value = lastopponent;
			var atacks = gft_db.getNumberOfBattlesWithin(lastopponent, gft_utils.getServer(), "name", 1, "oneday");
			document.getElementById("timer-fighter-tooltip-lastdaybattles").value = atacks;
			document.getElementById("timer-fighter-tooltip-nextpossiblebattletime").value = this.getNextPossibleAtack(gft_db.getPidForName(lastopponent, gft_utils.getServer()), atacks);
		}
		
		this.updateStatusbarTimer();
		document.getElementById("statusmenu-tooltip-atacks-since-session-start").value = 0;
		document.getElementById("statusmenu-tooltip-atacks-since-start-of-the-day").value = gft_db.getAllAtacksSinceTodayAndDefDaysBack(0, gft_utils.getServer());
		document.getElementById("statusmenu-tooltip-atacks-since-definied-period").value = gft_db.getAllAtacksSinceTodayAndDefDaysBack(6, gft_utils.getServer());
		*/
		this.initialized = true;
		gft_utils.getPrefBranch().setBoolPref("init", true);
	},
	
	insertBattle: function(pid, opp, server, atype, beid, winner, gold, exp)
	{		
		var exists = gft_db.battleExists(beid, server);
		console.log("Debug[insertBattle(" + pid + ", " + beid + ", " + opp + ", " +  server + ")]: Exists: " + exists); //debug

		if(!exists)
		{
			var battleid = gft_db.insertBattle(pid, server, "pid", atype);
			if(battleid && battleid > -1)
			{
				if(gft_db.insertBattleDetails(battleid, beid, server, winner, gold, exp))
					console.log("Debug[insertBattle]: Battle was stored successful.");
			}
		}
		
		return exists;
	},
	
	getNextPossibleAtackTime: function(identifier, server, by, day) //TODO
	{
		if(day)
		{
			var firstBattleInLastDay = gft_db.getFirstBattleInLastDay(identifier, server, by);
			return (firstBattleInLastDay > -1) ? gft_utils.unixtimeToHumanReadable(firstBattleInLastDay + 86400) : "no atacks";
		}
		else
		{
			var lastBattleInLastDay = gft_db.getLastBattleInLastDay(identifier, server, by);
			var nextAtack = lastBattleInLastDay + 3600;
			var now = (gft_utils.getTime())/1000;
			var nowString = gft_utils.getStrings().getString("nextpossiblefightnow");
			return (lastBattleInLastDay > -1) ? (now > nextAtack) ? nowString : gft_utils.unixtimeToHumanReadable(nextAtack) : nowString;
		}
	},
	
	getNextPossibleAtack: function(identifier, server, by, atacks) //TODO
	{
		var nextAtack = "undefined";
		
		if(atacks >= 5) //TODO preference number
		{
			if(atacks > 5)
				atacks += " " + gft_utils.getStrings().getString("bashingmsg");
			nextAtack = this.getNextPossibleAtackTime(identifier, server, by, true);
		}
		else nextAtack = this.getNextPossibleAtackTime(identifier, server, by, false);
		
		return nextAtack;
	},
	
	onPageLoad: function(event)
	{	
		if(!validator.validateHtmlDocument(event))
			return;
		if(!validator.validateTarget(event))
			return;
		if(!validator.validateGladiatusPage())
			return;
		
		var loc = gft_utils.getBrowser().location+"";
		var waitTime = 5*60*1000; //TODO parse time, check preference if reverse counter enabled
		
		if(validator.validatePlayerOverviewPage(loc))
		{
			if(!gft_db.isServerActive(gft_utils.getServer()))
			{
				this.parseAndStoreMyData();
			}
		}
		else if(validator.validateCombatReportPage(loc))
		{
			gft_utils.getPrefBranch().setCharPref("nextbattletime", (gft_utils.getTime() +  waitTime) + "");
			// gft_statusbar.showReverseCounter(waitTime);
			// this.updateStatusBarToolTip();
		}	
		else if(validator.validatePlayerReportPage(loc))
		{
			var nodesSnapshot = this.evaluateXPath("//span[@class='playername_achievement']");
			var myPlayerNode = nodesSnapshot.snapshotItem(0);
			var opponentNode = nodesSnapshot.snapshotItem(1);
			
			if(opponentNode)
			{
				var atacker = trimmer.trim(myPlayerNode.textContent);
				var defender = trimmer.trim(opponentNode.textContent);
				
				nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/div[2]/div[2]/div/table/tbody/tr[2]/td[1]/a");
				if(!nodesSnapshot.snapshotItem(0))
					return;
				var atackerID = gft_utils.getPidFromUrl(nodesSnapshot.snapshotItem(0).getAttribute('href'));
				//console.log("Atacker: " + atacker + "[" + atackerID + "]");
				
				nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/div[2]/div[2]/div/table/tbody/tr[3]/td[1]/a");
				var defenderID = gft_utils.getPidFromUrl(nodesSnapshot.snapshotItem(0).getAttribute('href'));
				//console.log("Defender: " + defender + "[" + defenderID + "]");
				
				//nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/div[2]/div[4]/div/table/tbody/tr/td/p");
				var server = gft_utils.getServer(); // domain + pid = primary key

				var repid = gft_utils.getRepIdFromUrl(loc);
				
				// parse levels
				nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/table[2]/tbody/tr[2]/td[1]/div/div[2]/span[2]");
				var atackerLevel = trimmer.trim(nodesSnapshot.snapshotItem(0).textContent);
				nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/table[2]/tbody/tr[2]/td[2]/div/div[2]/span[2]");
				var defenderLevel = trimmer.trim(nodesSnapshot.snapshotItem(0).textContent);
				
				// parse opponent guild
				nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/div[2]/div[2]/div/table/tbody/tr[2]/td[2]/a");
				var atackerGuild = (nodesSnapshot.snapshotItem(0)) ? trimmer.trim(nodesSnapshot.snapshotItem(0).textContent) : "none";				
				nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/div[2]/div[2]/div/table/tbody/tr[3]/td[2]/a");
				var defenderGuild = (nodesSnapshot.snapshotItem(0)) ? trimmer.trim(nodesSnapshot.snapshotItem(0).textContent) : "none";
				
				// experience and gold raised or lost
				nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/div[2]/div[4]/div/table/tbody/tr/td/p");
				var raisedGold = 0;
				var raisedExp = 0;
				if(nodesSnapshot.snapshotLength > 1)
				{
					raisedGold = (nodesSnapshot.snapshotItem(0)) ? parseInt(nodesSnapshot.snapshotItem(0).textContent.replace(/\./, "").match(/\s+\d+\s+/g)[0]) : 0;
					raisedExp = (nodesSnapshot.snapshotItem(1)) ? parseInt(nodesSnapshot.snapshotItem(1).textContent.match(/\s+\d+\s+/g)[0]) : 0;	
				}
				else
				{
					raisedExp = (nodesSnapshot.snapshotItem(0)) ? parseInt(nodesSnapshot.snapshotItem(0).textContent.match(/\s+\d+\s+/g)[0]) : 0;
				}
				
				// who is the winner ?
				nodesSnapshot = this.evaluateXPath("//div[@id='battlerep']/div[2]/div[3]/div/span[2]/a");
				var winner = trimmer.trim(nodesSnapshot.snapshotItem(0).textContent);
				
				console.log("Gold: " + gft_utils.partitionateNumber(raisedGold) + "\n"
							+ "Exp: " +  raisedExp + "\n"
							+ "Winner: " +  winner + "\n"
							+ "Server: " +  server);
							
				var mypid = gft_db.getMyPid(server);
				if(defenderID != mypid) //TODO somebody has atacked me
				{
					gft_db.updatePlayerData(defenderID, defender, server, defenderLevel, defenderGuild);
					
					if(this.insertBattle(defenderID, defender, server, 1, repid, winner, raisedGold, raisedExp))
					{
						gft_utils.getPrefBranch().setCharPref(gft_utils.getServer() + ".lastopponent", defender);
						gft_utils.getPrefBranch().setCharPref("nextbattletime", (gft_utils.getTime() +  waitTime) + ""); 
						//gft_statusbar.showReverseCounter(waitTime);
						//this.updateStatusBarToolTip();
					}
				}
				else
				{
					console.log(atacker + " has atacked me.");
					gft_db.updatePlayerData(atackerID, atacker, server, atackerLevel, atackerGuild);
					this.insertBattle(atackerID, atacker, server, 0, repid, winner, raisedGold, raisedExp)
				}
			}
			else
				console.log("quest log");
		}
	},
	
	parseAndStoreMyData: function()
	{		
		var nodesSnapshot = this.evaluateXPath("//span[@class='playername_achievement']");
		var playerNameNode = nodesSnapshot.snapshotItem(0);
		var name = trimmer.trim(playerNameNode.textContent);
		
		nodesSnapshot = this.evaluateXPath("//p[@class='huntlink']/b");
		var huntLinkNode = nodesSnapshot.snapshotItem(0);
		var huntLink = trimmer.trim(huntLinkNode.textContent);
		huntLink.match(/c\.php\?uid=(\d+)/);
		var pid = RegExp.$1;
		
		nodesSnapshot = this.evaluateXPath("//span[@id='char_level']");
		var levelNode = nodesSnapshot.snapshotItem(0);
		var level = trimmer.trim(levelNode.textContent);
		
		gft_db.insertMyData(pid, name, gft_utils.getServer(), level, "#none#", 1); 
	},
	
	evaluateXPath: function(path)
	{
		return gft_utils.getBrowser().evaluate(path, gft_utils.getBrowser(), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	},
	
	updateStatusBarToolTip: function() //TODO
	{
		//update tooltip of statusbar timer
		var lastOpponent = gft_utils.getPrefBranch().getCharPref(gft_utils.getServer() + ".lastopponent");
		var atacks = gft_db.getBattlesForNameWithin(lastOpponent, "oneday");
		document.getElementById("timer-fighter-tooltip-lastopponent").value = lastOpponent;
		document.getElementById("timer-fighter-tooltip-lastdaybattles").value = atacks;
		document.getElementById("timer-fighter-tooltip-nextpossiblebattletime").value = this.getNextPossibleAtack(lastOpponent, gft_utils.getServer(), "name", atacks);
		
		//update tooltip of statusbar ico
		document.getElementById("statusmenu-tooltip-atacks-since-session-start").value = gft_db.getAllAtacksSinceCustomPeriod(gft_utils.getPrefBranch().getCharPref("sessionstart"));
		document.getElementById("statusmenu-tooltip-atacks-since-start-of-the-day").value = gft_db.getAllAtacksSinceTodayAndDefDaysBack(0);
		document.getElementById("statusmenu-tooltip-atacks-since-definied-period").value = gft_db.getAllAtacksSinceTodayAndDefDaysBack(6);
	},
	
	updateStatusbarTimer: function()
	{		
		var nextFightTime = this.getNextFightTime();
		
		if(nextFightTime > 0)
		{
			gft_statusbar.showReverseCounter(nextFightTime);
			console.log("Debug[startFight()]: waiting " + gft_utils.millisToHumanReadable(nextFightTime) + " !");
		}
	},
	
	getNextFightTime: function() //TODO nextbattletime + server
	{
		var nextPossibleAtackTime = parseInt(gft_utils.getPrefBranch().getCharPref("nextbattletime"));
		var now = gft_utils.getTime();
		return nextPossibleAtackTime - now;
	},
	
	createTableEntry: function(name, value)
	{
		return '<tr><th>' + name + ':</th> <td style="white-space: nowrap;" class="stats_value">' + value + '</td></tr>\n';
	}
};

function PlayerPageContent() //TODO
{
	this.getGold = function(doc, atype, period, infoMsg)
	{
		var server = doc.domain+"";
		var pid = gft_utils.getPidFromUrl(doc.location+"");
		var gold = gft_utils.getString("goldImg");
		return gft.createTableEntry(gft_utils.getString(infoMsg), 
				gft_db.getGoldRaised(pid, server, atype, period) +
				' <img border="0" align="absmiddle" title="' + gold + '" alt="' + gold + '" src="img/res2.gif">');
	};
	
	this.getMaxGold = function(doc, atype, period, infoMsg)
	{
		var server = doc.domain+"";
		var pid = gft_utils.getPidFromUrl(doc.location+"");	
		var gold = gft_utils.getString("goldImg");
		return gft.createTableEntry(gft_utils.getString(infoMsg), 
				gft_db.getMaxGold(pid, server, atype, period) +
				' <img border="0" align="absmiddle" title="' + gold + '" alt="' + gold + '" src="img/res2.gif">');
	};
	
	this.getContent = function(doc, period) 
	{
		if(!period)
			period = "oneday";
		var server = doc.domain+"";
		var pid = gft_utils.getPidFromUrl(doc.location+"");
		var atacks = gft_db.getNumberOfBattlesWithin(pid, server, "pid", 1, period); //identifier, server, by, atype, period
		var nextAtack = gft.getNextPossibleAtack(pid, server, "pid", atacks);
		return gft.createTableEntry(gft_utils.getString("battlesforlast24h"), atacks) +
				gft.createTableEntry(gft_utils.getString("nextpossiblefight"), nextAtack) +
				this.getGoldRaised(doc, period) +
				this.getGoldLost(doc, period) +
				this.getMaxGoldRaised(doc, period) +
				this.getMaxGoldLost(doc, period) +
				this.getExpRaised(doc, period) +
				this.getWinChance(doc);
	};
	
	this.getMyStats = function(doc, period)
	{
		if(!period)
			period = "oneday";
		var todayAtacks = gft_db.getAllAtacksSinceTodayAndDefDaysBack(0, doc.domain);
		var oneWeekAtacks = gft_db.getAllAtacksSinceTodayAndDefDaysBack(6, doc.domain);
		return gft.createTableEntry(gft_utils.getString("atackssincestartoftheday"), todayAtacks) +
				gft.createTableEntry(gft_utils.getString("atackssinceoneweek"), oneWeekAtacks) +
				this.getAllExpRaised(doc, period);	
	};

	this.getGoldRaised = function(doc, period)
	{
		return this.getGold(doc, 1, period, "goldRaised");
	};
	
	this.getGoldLost = function(doc, period)
	{
		return this.getGold(doc, 0, period, "goldLost");
	};
	
	this.getMaxGoldRaised = function(doc, period)
	{
		return this.getMaxGold(doc, 1, period, "maxGoldRaised");
	};
	
	this.getMaxGoldLost = function(doc, period)
	{
		return this.getMaxGold(doc, 0, period, "maxGoldLost");
	};

	this.getExpRaised = function(doc, period)
	{
		var server = doc.domain+"";
		var pid = gft_utils.getPidFromUrl(doc.location+"");
		return gft.createTableEntry(gft_utils.getString("expRaised"), gft_db.getExpRaised(pid, server, period));
	};
	
	this.getAllExpRaised = function(doc, period)
	{
		var server = doc.domain+"";
		return gft.createTableEntry(gft_utils.getString("allExpRaised"), gft_db.getAllExpRaised(server, period));
	};
	
	this.getWinChance = function(doc)
	{
		var server = doc.domain+"";
		var pid = gft_utils.getPidFromUrl(doc.location+"");	
		var winChance = gft_db.getWinChance(pid, server);
		return gft.createTableEntry(gft_utils.getString("realWinChance"),  winChance + (winChance != "none" ? " %" : ""));
	};
	
	this.getString = function(string) { return gft_utils.getStrings().getString(string) };
	
	this.insertPlayer = function(pid, pname, plevel, inwar, pguild) { gft_db.updatePlayerData(pid, pname, plevel, inwar, pguild) };
	
	this.getPidFromUrl = function(url) { return gft_utils.getPidFromUrl(url); };
	
	this.trim = function(string) { return trimmer.trim(string); };
}

window.addEventListener(
  "load",
  function () {
    // Add a callback to be run every time a document loads.
    // note that this includes frames/iframes within the document
    gBrowser.addEventListener("load", function(e) { gft.onPageLoad(e); }, true);
  } ,
  false
);

//TODO tab selection .... probably server changes ... if so notify
// During initialisation
//var container = gBrowser.tabContainer;
//container.addEventListener("TabSelect", function(e) { gft.tabSelected(e); }, false);

window.addEventListener("load", function(e) { gft.onLoad(e); }, false);
window.addEventListener("unload", function(e) { gft.onUnLoad(e); }, false);