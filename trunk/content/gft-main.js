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
	var MAX_EXP_RAISED = 12;
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
		unregisterPreferenceObservers();
		this.initialized = false;
		window.removeEventListener("load", function (e) { gBrowser.removeEventListener("load", GFT.onPageLoad(e), true);},false);
	};
	
	function init() { 
		prefMan.setValue("sessionstart", utils.getTime() + "");
		registerPreferenceObservers();
		adjustIconPosition();
		db.init();
		GFT.Battles.init();
		this.initialized = true;
	};
	
	function registerPreferenceObservers(){
		prefMan.watch("options.tabs.main.iconposition", adjustIconPosition);
	};
	
	function unregisterPreferenceObservers(){
		prefMan.unwatch("options.tabs.main.iconposition", adjustIconPosition);
	};
	
	function adjustIconPosition() {
		console.log("Adjusting icon position");
	    try
	    {
	        var statusbar = document.getElementById("status-bar");
	        var gftStatusIcon = document.getElementById("gft-status");
	        if(gftStatusIcon.hidden == true) {
	        	gftStatusIcon.hidden = false;
	        }
	        var element;
	        var pos = prefMan.getValue("options.tabs.main.iconposition", "iconPosRM");
	        switch (pos) { 
	            case "iconPosL": {
	                element = document.getElementById("statusbar-display");
	                break;
	            }
	            case "iconPosR": {
	                element = document.getElementById("statusbar-progresspanel").nextSibling;
	                break;
	            }
	            case "iconPosRM": {
	                element = statusbar.lastChild;
	                break;
	            }
	            case "iconPosHide": {
	            	gftStatusIcon.hidden = true;
	            	break;
	            }
	            default: {
	                throw "Invalid icon position";
	            }
	        }
	        if(element) {
	        	statusbar.insertBefore(gftStatusIcon,element);
	        }
	    }
	    catch(e) { utils.reportError("Failed to set icon position",e); }
	}
	
	function insertBattle(pid, opp, server, atype, beid, winner, gold, exp, battleTime) {		
		var exists = db.battleExists(beid, server);
		console.log("Debug[insertBattle(" + pid + ", " + beid + ", " + opp + ", " +  server + ")]: Exists: " + exists); //debug

		if(!exists) {
			var battleid = db.insertBattle(pid, server, "pid", atype, battleTime);
			if(battleid && battleid > -1) {
				if(db.insertBattleDetails(battleid, beid, server, winner, gold, exp)) {
					console.log("Debug[insertBattle]: Battle was stored successful.");
				}
			}
		}
		
		return exists;
	};
	
	function getNextPossibleAttackTime(identifier, server, by, day) {
		if(day) {
			var firstBattleInLastDay = db.getFirstBattleInLastDay(identifier, server, by);
			return (firstBattleInLastDay > -1) ? utils.unixtimeToHumanReadable(firstBattleInLastDay + 86400) : "no atacks";
		}
		else {
			var lastBattleInLastDay = db.getLastBattleInLastDay(identifier, server, by);
			var nextAtack = lastBattleInLastDay + 3600;
			var now = utils.getGMTTime();
			var nowString = utils.getString("nextpossiblefightnow");
			return (lastBattleInLastDay > -1) ? (now > nextAtack) ? nowString : utils.unixtimeToHumanReadable(nextAtack) : nowString;
		}
	};
	
	function getBashingMessage(days, attacks, plainText) {
		var msg = attacks + ' ' + utils.getStrings().getString('attacks') + ' '
					+ utils.getStrings().getString('for') + ' ' + days  + ' '
					+ ((days > 1) ? utils.getStrings().getString('days') : utils.getStrings().getString('day'))
					+ '. ' + utils.getStrings().getString('bashingmsg');
		if(plainText) {
			return msg;
		}
		return '<span style="color:red;">' + msg + '</span>';		
	}
	
	function getNextPossibleAtack(identifier, server, by, plainText) { 
		var customDays = prefMan.getValue('options.tabs.main.bashing.customdays', 4);
		var allowedAttacksInXDays = prefMan.getValue('options.tabs.main.bashing.customdaysattacks', 20);
		var allowedAttacksInOneDay = prefMan.getValue('options.tabs.main.bashing.onedayattacks', 5);
		
		var attackForLastDay = db.getNumberOfBattlesWithin(identifier, server, by, 1, "oneday");
		var attackForXDays = db.getNumberOfBattlesWithin(identifier, server, by, 1, customDays);
		
		if(attackForLastDay >= allowedAttacksInOneDay || attackForXDays >= allowedAttacksInXDays) {
			if(attackForLastDay > allowedAttacksInOneDay) {
				return getBashingMessage(1, attackForLastDay, plainText);
			} else if(attackForXDays > allowedAttacksInXDays) {
				return getBashingMessage(customDays, attackForXDays, plainText);
			} else {
				return getNextPossibleAttackTime(identifier, server, by, true);
			}
		}
		return getNextPossibleAttackTime(identifier, server, by, false);
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
		
		if(validator.isPlayerOverviewPage(loc)) {
			if(!db.isServerActive(utils.getServer())) {
				parseAndStoreMyData();
			}
		}
		else if(validator.isCombatReportPage(loc)) {
			//TODO parse and store dungeon fight
		}	
		else if(validator.isPlayerReportPage(loc)) {
			if(!db.isServerActive(utils.getServer())) {
				return;
			}
			
			var nodesSnapshot = evaluateXPath("//span[@class='playername_achievement']");
			var myPlayerNode = nodesSnapshot.snapshotItem(0);
			var opponentNode = nodesSnapshot.snapshotItem(1);
			
			if(opponentNode) {
				nodesSnapshot = evaluateXPath("//div[@id='battlerep']/div[2]/div[1]/div");
				var battleDateTime = nodesSnapshot.snapshotItem(0).textContent;
				var battleUnixTime = utils.dateToGMTUnixTime(battleDateTime);
				console.log("Battle time: " + battleUnixTime + " : " + utils.unixtimeToHumanReadable(battleUnixTime));
				
				var atacker = trimmer.trim(myPlayerNode.textContent);
				var defender = trimmer.trim(opponentNode.textContent);
				
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
					if(raisedExp > MAX_EXP_RAISED) { //TODO find better solution (RegExp)
						raisedGold = raisedExp;
						raisedExp = 0;
					} 
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
				
				var battleExists = false;
				if(defenderID != mypid) {
					db.updatePlayerData(defenderID, defender, server, defenderLevel, defenderGuild);
					
					battleExists = insertBattle(defenderID, defender, server, 1, repid, winner, raisedGold, raisedExp, battleUnixTime);
					//prefMan.setValue(utils.getServer() + ".lastopponent", defender);
				}
				else {
					console.log(atacker + " has atacked me.");
					db.updatePlayerData(atackerID, atacker, server, atackerLevel, atackerGuild);
					battleExists = insertBattle(atackerID, atacker, server, 0, repid, winner, raisedGold, raisedExp, battleUnixTime);
				}
				
				if(!battleExists) {
					GFT.Battles.defaultSearch();
				}
			}
			else {
				console.log("quest log");
			}
		}
	};
	
	function parseAndStoreMyData() //TODO
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
	  },
	  false
	);
	
	window.addEventListener("load", function(e) { GFT.Main.onLoad(e); }, false);
	window.addEventListener("unload", function(e) { GFT.Main.onUnLoad(e); }, false);
})();