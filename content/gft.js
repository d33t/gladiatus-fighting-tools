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

GFT.Main = (function(){
	this.initialized = false;
	var utils = GFT.Utils;
	var console = GFT.Utils.console;
	var validator = GFT.Utils.validator;
	var db = GFT.DB;
	var statusbar = GFT.Statusbar;
	var trimmer = GFT.Utils.trimmer; //TODO replace by String.prototype.trim
	var prefMan = new GFT.PrefManager();
	
	function load() {
		if(this.initialized) {
			return;	
		}
		
		window.removeEventListener("load", function(e) { GFT.onLoad(e); }, false);
		init();
	};
	
	function unload() {
		prefMan.setValue("init", false);
		this.initialized = false;
		window.removeEventListener("load", function (e) { gBrowser.removeEventListener("load", GFT.onPageLoad(e), true);},false);
	};
	
	function init() { 
		//initialize
		//prefMan.setValue("debug", true);
		if(!prefMan.getValue("init", false))
		{
			prefMan.setValue("sessionstart", utils.getTime() + "");
			prefMan.setValue("init", true);
		}
		// init the db
		db.init();
		this.initialized = true;
		
		/* make db table for each server and then init counter if user is on gladiatus page
		var server = utils.getServer();
		var lastopponent = prefMan.getValue(server + ".lastopponent", "");
		if(lastopponent)
		{
			document.getElementById("timer-fighter-tooltip-lastopponent").value = lastopponent;
			var atacks = db.getNumberOfBattlesWithin(lastopponent, utils.getServer(), "name", 1, "oneday");
			document.getElementById("timer-fighter-tooltip-lastdaybattles").value = atacks;
			document.getElementById("timer-fighter-tooltip-nextpossiblebattletime").value = getNextPossibleAtack(db.getPidForName(lastopponent, utils.getServer()), atacks);
		}
		
		updateStatusbarTimer();
		document.getElementById("statusmenu-tooltip-atacks-since-session-start").value = 0;
		document.getElementById("statusmenu-tooltip-atacks-since-start-of-the-day").value = db.getAllAtacksSinceTodayAndDefDaysBack(0, utils.getServer());
		document.getElementById("statusmenu-tooltip-atacks-since-definied-period").value = db.getAllAtacksSinceTodayAndDefDaysBack(6, utils.getServer());
		*/	
	};
	
	function insertBattle(pid, opp, server, atype, beid, winner, gold, exp) {		
		var exists = db.battleExists(beid, server);
		console.log("Debug[insertBattle(" + pid + ", " + beid + ", " + opp + ", " +  server + ")]: Exists: " + exists); //debug

		if(!exists) {
			var battleid = db.insertBattle(pid, server, "pid", atype);
			if(battleid && battleid > -1) {
				if(db.insertBattleDetails(battleid, beid, server, winner, gold, exp)) {
					console.log("Debug[insertBattle]: Battle was stored successful.");
				}
			}
		}
		
		return exists;
	};
	
	function getNextPossibleAtackTime(identifier, server, by, day) {
		if(day) {
			var firstBattleInLastDay = db.getFirstBattleInLastDay(identifier, server, by);
			return (firstBattleInLastDay > -1) ? db.unixtimeToHumanReadable(firstBattleInLastDay + 86400) : "no atacks";
		}
		else {
			var lastBattleInLastDay = db.getLastBattleInLastDay(identifier, server, by);
			var nextAtack = lastBattleInLastDay + 3600;
			var now = (utils.getTime())/1000;
			var nowString = utils.getStrings().getString("nextpossiblefightnow");
			return (lastBattleInLastDay > -1) ? (now > nextAtack) ? nowString : utils.unixtimeToHumanReadable(nextAtack) : nowString;
		}
	};
	
	function getNextPossibleAtack(identifier, server, by, atacks) {
		if(atacks >= 5) { //TODO preference number
			if(atacks > 5) {
				atacks += " " + utils.getStrings().getString("bashingmsg");
			}
			return getNextPossibleAtackTime(identifier, server, by, true);
		}
		return getNextPossibleAtackTime(identifier, server, by, false);
	};
	
	function validateUrl(event) {
		if(!validator.isValidHtmlDocument(event)
				|| !validator.isValidTarget(event)
				|| !validator.isGladiatusPage()) {
			return false;
		}
		return true;
	}
	
	function pageload(event) {
		if(!validateUrl(event)) {
			return;
		}
		
		var loc = utils.getBrowser().location+"";
		var waitTime = 5*60*1000; //TODO parse time, check preference if reverse counter enabled
		
		if(validator.isPlayerOverviewPage(loc)) {
			if(!db.isServerActive(utils.getServer())) {
				parseAndStoreMyData();
			}
		}
		else if(validator.isCombatReportPage(loc)) {
			prefMan.setValue("nextbattletime", (utils.getTime() +  waitTime) + "");
			// statusbar.showReverseCounter(waitTime);
			// updateStatusBarToolTip();
		}	
		else if(validator.isPlayerReportPage(loc)) {
			if(!db.isServerActive(utils.getServer())) {
				return;
			}
			
			var nodesSnapshot = evaluateXPath("//span[@class='playername_achievement']");
			var myPlayerNode = nodesSnapshot.snapshotItem(0);
			var opponentNode = nodesSnapshot.snapshotItem(1);
			
			if(opponentNode) {
//				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[1]/div");
//				var battleDateTime = nodesSnapshot.snapshotItem(0).textContent;
//				battleDateTime = battleDateTime.match(/\d{2}\.\d{2}.\d{4}\s{1}\d{2}:\d{2}:\d{2}/) + "";
//				var battleDate = battleDateTime.split(" ")[0].split["."];
//				var battleTime = battleDateTime.split(" ")[1].split[":"];
//				var d = new Date();
//				d.setFullYear(battleDate[2], battleDate[1], battleDate[0]);
//				d.setHours(battleTime[2], battleTime[1], battleTime[0], 0);
//					
//				console.log("Battle time: " + d);
				
				var atacker = trimmer.trim(myPlayerNode.textContent); //TODO
				var defender = trimmer.trim(opponentNode.textContent); //TODO
				
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[2]/div/table/tbody/tr[2]/td[1]/a");
				if(!nodesSnapshot.snapshotItem(0))
					return;
				var atackerID = utils.getPidFromUrl(nodesSnapshot.snapshotItem(0).getAttribute('href'));
				//console.log("Atacker: " + atacker + "[" + atackerID + "]");
				
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[2]/div/table/tbody/tr[3]/td[1]/a");
				var defenderID = utils.getPidFromUrl(nodesSnapshot.snapshotItem(0).getAttribute('href'));
				//console.log("Defender: " + defender + "[" + defenderID + "]");
				
				//nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[4]/div/table/tbody/tr/td/p");
				var server = utils.getServer(); // domain + pid = primary key

				var repid = utils.getRepIdFromUrl(loc);
				
				// parse levels
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/table[2]/tbody/tr[2]/td[1]/div/div[2]/span[2]");
				var atackerLevel = trimmer.trim(nodesSnapshot.snapshotItem(0).textContent);
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/table[2]/tbody/tr[2]/td[2]/div/div[2]/span[2]");
				var defenderLevel = trimmer.trim(nodesSnapshot.snapshotItem(0).textContent);
				
				// parse opponent guild
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[2]/div/table/tbody/tr[2]/td[2]/a");
				var atackerGuild = (nodesSnapshot.snapshotItem(0)) ? trimmer.trim(nodesSnapshot.snapshotItem(0).textContent) : "none";				
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[2]/div/table/tbody/tr[3]/td[2]/a");
				var defenderGuild = (nodesSnapshot.snapshotItem(0)) ? trimmer.trim(nodesSnapshot.snapshotItem(0).textContent) : "none";
				
				// experience and gold raised or lost
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[4]/div/table/tbody/tr/td/p");
				var raisedGold = 0;
				var raisedExp = 0;
				if(nodesSnapshot.snapshotLength > 1) {
					raisedGold = (nodesSnapshot.snapshotItem(0)) ? parseInt(nodesSnapshot.snapshotItem(0).textContent.replace(/\./, "").match(/\s+\d+\s+/g)[0]) : 0;
					raisedExp = (nodesSnapshot.snapshotItem(1)) ? parseInt(nodesSnapshot.snapshotItem(1).textContent.match(/\s+\d+\s+/g)[0]) : 0;	
				}
				else {
					raisedExp = (nodesSnapshot.snapshotItem(0)) ? parseInt(nodesSnapshot.snapshotItem(0).textContent.match(/\s+\d+\s+/g)[0]) : 0;
				}
				
				// who is the winner ? 
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[3]/div/span[2]/a");
				var winner = ""; 
				if(nodesSnapshot.snapshotItem(0)) {
					winner = trimmer.trim(nodesSnapshot.snapshotItem(0).textContent);
				}
				
				console.log("Gold: " + utils.partitionateNumber(raisedGold) + "\n"
							+ "Exp: " +  raisedExp + "\n"
							+ "Winner: " +  winner + "\n"
							+ "Server: " +  server);
							
				var mypid = db.getMyPid(server);
				if(defenderID != mypid) {
					db.updatePlayerData(defenderID, defender, server, defenderLevel, defenderGuild);
					
					if(insertBattle(defenderID, defender, server, 1, repid, winner, raisedGold, raisedExp)) {
						prefMan.setValue(utils.getServer() + ".lastopponent", defender);
						prefMan.setValue("nextbattletime", (utils.getTime() +  waitTime) + ""); 
						//statusbar.showReverseCounter(waitTime);
						//updateStatusBarToolTip();
					}
				}
				else {
					console.log(atacker + " has atacked me.");
					db.updatePlayerData(atackerID, atacker, server, atackerLevel, atackerGuild);
					insertBattle(atackerID, atacker, server, 0, repid, winner, raisedGold, raisedExp);
				}
			}
			else {
				console.log("quest log");
			}
		}
	};
	
	function parseAndStoreMyData()
	{		
		var nodesSnapshot = evaluateXPath("//span[@class='playername_achievement']");
		var playerNameNode = nodesSnapshot.snapshotItem(0);
		var name = trimmer.trim(playerNameNode.textContent);
		
		nodesSnapshot = evaluateXPath("//p[@class='huntlink']/b");
		var huntLinkNode = nodesSnapshot.snapshotItem(0);
		var huntLink = trimmer.trim(huntLinkNode.textContent);
		huntLink.match(/c\.php\?uid=(\d+)/);
		var pid = RegExp.$1;
		
		nodesSnapshot = evaluateXPath("//span[@id='char_level']");
		var levelNode = nodesSnapshot.snapshotItem(0);
		var level = trimmer.trim(levelNode.textContent);
		
		db.insertMyData(pid, name, utils.getServer(), level, "#none#", 1); 
	};
	
	function evaluateXPath(path) {
		var browser = utils.getBrowser();
		return browser.evaluate(path, browser, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	};
	
	function updateStatusBarToolTip() { //TODO
		//update tooltip of statusbar timer
		var lastOpponent = prefMan.setValue(utils.getServer() + ".lastopponent");
		var atacks = db.getBattlesForNameWithin(lastOpponent, "oneday");
		document.getElementById("timer-fighter-tooltip-lastopponent").value = lastOpponent;
		document.getElementById("timer-fighter-tooltip-lastdaybattles").value = atacks;
		document.getElementById("timer-fighter-tooltip-nextpossiblebattletime").value = getNextPossibleAtack(lastOpponent, utils.getServer(), "name", atacks);
		
		//update tooltip of statusbar ico
		document.getElementById("statusmenu-tooltip-atacks-since-session-start").value = db.getAllAtacksSinceCustomPeriod(prefMan.getValue("sessionstart"), utils.getTime());
		document.getElementById("statusmenu-tooltip-atacks-since-start-of-the-day").value = db.getAllAtacksSinceTodayAndDefDaysBack(0);
		document.getElementById("statusmenu-tooltip-atacks-since-definied-period").value = db.getAllAtacksSinceTodayAndDefDaysBack(6);
	};
	
	function updateStatusbarTimer() {		
		var nextFightTime = getNextFightTime();
		
		if(nextFightTime > 0) {
			statusbar.showReverseCounter(nextFightTime);
			console.log("Debug[startFight()]: waiting " + utils.millisToHumanReadable(nextFightTime) + " !");
		}
	};
	
	function getNextFightTime() { //TODO nextbattletime + server
		var nextPossibleAtackTime = parseInt(prefMan.getValue("nextbattletime"), utils.getTime());
		var now = utils.getTime();
		return nextPossibleAtackTime - now;
	};
	
	return {
		onPageLoad: function(e) {
			pageload(e);
		},
		onLoad: function(e) {
			load(e);
		},
		onUnLoad: function(e) {
			unload(e);
		},
		getNextPossibleAtack: getNextPossibleAtack
	};
})();

(function(){
	window.addEventListener(
	  "load",
	  function () {
	    // Add a callback to be run every time a document loads.
	    // note that this includes frames/iframes within the document
	    gBrowser.addEventListener("load", function(e) { GFT.Main.onPageLoad(e); }, true);
	  } ,
	  false
	);
	
	//TODO tab selection .... probably server changes ... if so notify
	// During initialisation
	//var container = gBrowser.tabContainer;
	//container.addEventListener("TabSelect", function(e) { gft.tabSelected(e); }, false);
	
	window.addEventListener("load", function(e) { GFT.Main.onLoad(e); }, false);
	window.addEventListener("unload", function(e) { GFT.Main.onUnLoad(e); }, false);
})();