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
	var MAX_EXP_RAISED = 6;
	var utils = GFT.Utils;
	var console = GFT.Utils.console;
	var validator = GFT.Utils.validator;
	var db = GFT.Globals.Database;
	var statusbar = GFT.Statusbar;
	var prefMan = new GFT.PrefManager();
	var trim = GFT.Utils.trim;
	var ARENA_XPATHS = {
		GLADIATORS : new GFT.ElementPath("ARENA_GLADIATORS", "//span[@class='playername_achievement']"),
		BATTLE_TIME : new GFT.ElementPath("ARENA_BATTLE_TIME", "//div[@id='battlerep']/div[*]/div[1]/div", null, /\d{2}\.\d{2}.\d{4}\s{1}\d{2}:\d{2}:\d{2}/),
		ATTACKER_ID : new GFT.ElementPath("ARENA_ATTACKER_ID", "//div[@id='battlerep']/div[*]/div[2]/div/table/tbody/tr[2]/td[1]/a"),
		DEFENDER_ID : new GFT.ElementPath("ARENA_DEFENDER_ID", "//div[@id='battlerep']/div[*]/div[2]/div/table/tbody/tr[3]/td[1]/a"),
		ATTACKER_LEVEL : new GFT.ElementPath("ARENA_ATTACKER_LEVEL", "//div[@id='battlerep']/table[2]/tbody/tr[2]/td[1]/div/div[2]/span[2]"),
		DEFENDER_LEVEL : new GFT.ElementPath("ARENA_DEFENDER_LEVEL", "//div[@id='battlerep']/table[2]/tbody/tr[2]/td[2]/div/div[2]/span[2]"),
		ATTACKER_GUILD : new GFT.ElementPath("ARENA_ATTACKER_GUILD", "//div[@id='battlerep']/div[*]/div[2]/div/table/tbody/tr[2]/td[2]/a"),
		DEFENDER_GUILD : new GFT.ElementPath("ARENA_DEFENDER_GUILD", "//div[@id='battlerep']/div[*]/div[2]/div/table/tbody/tr[3]/td[2]/a"),
		WINNER_ID : new GFT.ElementPath("ARENA_WINNER_ID", "//div[@id='battlerep']//div[3]/div/span[2]/a", "//div[@id='battlerep']/div[3]/div[2]/div/table/tbody/tr[3]/td[1]/a"),
		REWARD : new GFT.ElementPath("ARENA_REWARD", "//div[@id='battlerep']/div[*]/div[2]/div/table/tbody/tr/td/p")	
	};	
	var CIRCUS_XPATHS = {
		ATTACKER : new GFT.ElementPath("CIRCUS_ATTACKER", "//div[@id='attackername0']/span[1]"),
		DEFENDER : new GFT.ElementPath("CIRCUS_DEFENDER", "//div[@id='defendername0']/span[1]"),
		ATTACKER_LEVEL : new GFT.ElementPath("CIRCUS_ATTACKER_LEVEL", "//div[@id='attackerstats0']/div[2]/span[2]"),
		DEFENDER_LEVEL : new GFT.ElementPath("CIRCUS_DEFENDER_LEVEL", "//div[@id='defenderstats0']/div[2]/span[2]"),
		WINNER : new GFT.ElementPath("CIRCUS_WINNER", "//td[@id='content']/div[2]"),
		REWARD : new GFT.ElementPath("CIRCUS_REWARD", "//td[@id='content']/div[3]/div[2]/div/table/tbody/tr/td/p")	
	};	

	var OVERVIEW_XPATHS = {
		PLAYER_NAME : new GFT.ElementPath("OVERVIEW_PLAYER_NAME", "//span[@class='playername_achievement']"),
		HUNT_LINK : new GFT.ElementPath("OVERVIEW_HUNT_LINK", "//p[@class='huntlink']/b"),
		PLAYER_LEVEL : new GFT.ElementPath("OVERVIEW_PLAYER_LEVEL", "//span[@id='char_level']")
	};
	
	var PROFILE_XPATHS = {
		PLAYER_NAME : new GFT.ElementPath("PROFILE_PLAYER_NAME", "//td[@id='content']/table/tbody/tr/td[1]/div[1]/span[1]"),
		PLAYER_LEVEL : new GFT.ElementPath("PROFILE_PLAYER_LEVEL", "//span[@id='char_level']"),
		PLAYER_GUILD : new GFT.ElementPath("PROFILE_PLAYER_GUILD", "//td[@id='content']/table/tbody/tr/td[2]/div[2]/b/a")
	};
	
	function load() {
		if(this.initialized) {
			return;	
		}
		
		window.removeEventListener("load", function(e) { GFT.onLoad(e); }, false);
		init();
	};
	
	function unload() {
		prefMan.setValue("init", false);
		prefMan.remove("secureHash");
		unregisterPreferenceObservers();
		this.initialized = false;
		window.removeEventListener("load", function (e) { gBrowser.removeEventListener("load", GFT.onPageLoad(e), true);},false);
	};
	
	function init() { 
		//updates for GFT version 1.5.3
		if(!prefMan.getValue("updates.v153", false)) {
			prefMan.setValue("updates.v153", true);
			prefMan.setValue("options.tabs.others.defaultSortColumn", "rName");
		}
		prefMan.setValue("sessionstart", utils.getTime() + "");
		registerPreferenceObservers();
		adjustIconPosition();
		GFT.Globals.init();
		GFT.Battles.init();
		this.initialized = true;
	};
	
	function registerPreferenceObservers(){
		prefMan.watch("options.tabs.main.iconposition", adjustIconPosition);
	};
	
	function unregisterPreferenceObservers(){
		prefMan.unwatch("options.tabs.main.iconposition", adjustIconPosition);
	};
	
	function adjustIconPosition() { // Firefox 4 status-bar doesn't exists anymore, replace with addon-bar or put the icon in the navigation bar
		console.debug("Adjusting icon position");
	    try {
	        var statusbar = document.getElementById("addon-bar");
			if(!statusbar) {
				statusbar = document.getElementById("status-bar");
			}
			
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
	                throw new Error("Invalid icon position");
	            }
	        }
	        if(element) {
	        	statusbar.insertBefore(gftStatusIcon,element);
	        }
	    } catch(e) { utils.reportError("Failed to set icon position",e); }
	};
	
	function insertReport(report) {
		var attacker = report.getAttacker();
		var defender = report.getDefender();
		var amITheAttacker = false;
		
		if(report.isArenaReport() && (defender.getId() != report.getMyPid())) {
				amITheAttacker = true;
		} else {
			if(defender.getName() != report.getMyName()) {
				amITheAttacker = true;
			}	
		}

		if(amITheAttacker) { // I'm the attacker
			db.insertBattle(defender, report, 1);
		} else { // I'm the defender
			db.insertBattle(attacker, report, 0);
		}		
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
		var msg = attacks + ' ' + utils.getString('attacks') + ' '
					+ utils.getString('for') + ' ' + days  + ' '
					+ ((days > 1) ? utils.getString('days') : utils.getStrings().getString('day'))
					+ '. ' + utils.getString('bashingmsg');
		if(plainText) {
			return msg;
		}
		return '<span style="color:red;">' + msg + '</span>';		
	};
	
	function getNextPossibleAtack(identifier, server, by, plainText, showWarning) { 
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
				var showWarningOptionsValue = prefMan.getValue("options.tabs.main.showBashingWarning", true);
				if(showWarning && showWarningOptionsValue && ((attackForLastDay + 1) > allowedAttacksInOneDay ||
					(attackForXDays + 1) > allowedAttacksInXDays)) {
					utils.showWarning(utils.getString("bashingWarningMsg"), true);
				}
				return getNextPossibleAttackTime(identifier, server, by, true);
			}
		}
		return getNextPossibleAttackTime(identifier, server, by, false);
	};
	
	function checkLevelBashing(opponentLevel, server) {
		var server = server || utils.getServer();
		console.debug("checkLevelBashing(): level: " + opponentLevel + ", server: " + server);
		var levelBashingEnabled = prefMan.getValue("options.tabs.main.showLevelBashingWarning", false);
		var levelBashingLimit = prefMan.getValue("options.tabs.main.levelBashingLimit", 10);
		if(levelBashingEnabled) {
			var myGladiator = db.getMyGladiator(server);
			if((opponentLevel + levelBashingLimit) < myGladiator.getLevel()) {
				return true;
			}
		}
		return false;
	}
	
	function validateUrl(event) {
		if(!validator.isValidHtmlDocument(event)
				|| !validator.isValidTarget(event)
				|| !validator.isGladiatusPage()) {
			return false;
		}
		return true;
	};
	
	function evaluateXPath(path) {
		var browser = utils.getBrowser();
		return browser.evaluate(path, browser, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	};	
	
	function verifyResult(nodesSnapshot, expectedResultLength, nullable, regExp) {
		if(!nodesSnapshot) {
			return false;
		}
		
		var validResult = false;
		var snapshotItems = new Array();
		for(var i = 0; i < nodesSnapshot.snapshotLength; i++) {
			var snapshotItem = nodesSnapshot.snapshotItem(i);
			if(snapshotItem == null) {
				continue;
			}
			if(regExp != null) {
				if(snapshotItem.textContent.match(regExp) == null && !nullable) {
					continue;
				}
			}
			console.debug("pushing valid result... " + snapshotItem.textContent);
			validResult = true;
			snapshotItems.push(snapshotItem);
		}
		console.debug("Validating... V: " + validResult + ", N: " + nullable + ", L: " + snapshotItems.length + ", EL: " + expectedResultLength);
		if(!validResult && !nullable) {
			return false;
		} else {
			if(snapshotItems.length != expectedResultLength) {
				if(nullable) {
					return snapshotItems;
				} else {
					return false;
				}
			} else {
				return snapshotItems;
			}
		}
		
	};
	
	function getNodeContent(xObj, expectedResultLength, nullable) {
		var nodesSnapshot;
		var ret;
		try {
			nodesSnapshot = evaluateXPath(xObj.getXpath());
			ret = verifyResult(nodesSnapshot, expectedResultLength, nullable, xObj.getRegExp());
			if(!ret) {
				throw new Error(xObj.getName() + " cannot be parsed.\nXPath \"" + xObj.getXpath() + "\" is invalid.");
			}
		} catch(ex1) {
			nodesSnapshot = evaluateXPath(xObj.getAlternativeXpath());
			ret = verifyResult(nodesSnapshot, expectedResultLength, nullable, xObj.getRegExp());
			if(!ret) {
				throw new Error(ex1 + "\nAlternative XPath \"" + xObj.getAlternativeXpath() + "\" is invalid also.");
			}			
		}
		return ret;
	};
	
	function pageload(event) {
		if(!validateUrl(event)) {
			return;
		}
		var loc = utils.getBrowser().location+"";
		var isServerActive = db.isServerActive(utils.getServer());
		if(isServerActive) {
			var secureHash = utils.getSecureHash();
			if(secureHash) {
				prefMan.setValue("secureHash." + utils.getServer(), secureHash);
			}
		}
		
		if(validator.isPlayerProfilePage(loc)) {
			if(!isServerActive) { return; }	
			if(parseGladiatorProfile()) {
				GFT.Battles.defaultSearch();
			}
		} else if(validator.isPlayerOverviewPage(loc)) {
			if(!isServerActive) {
				parseAndStoreMyData();
			}
		} else if(validator.isCombatReportPage(loc)) {
			if(!isServerActive) { return; }			
			if(parseCircusTurmaReport()) {
				GFT.Battles.defaultSearch();
			}
		} else if(validator.isPlayerReportPage(loc)) {
			if(!isServerActive) { return; }			
			if(parseArenaReport()) {
				GFT.Battles.defaultSearch();
			}
		}
	};
	
	function parseArenaReport() {
		try {
			var arenaReport = new GFT.BattleReport(true);
			var attacker = new GFT.Gladiator();
			var defender = new GFT.Gladiator();
			
			arenaReport.setRepId(utils.getRepIdFromUrl(utils.getBrowser().location + ""));

 			// if report already exists no need to parse it again
			if(db.battleExists(arenaReport.getRepId(), arenaReport.getServer())) {
				console.log("Battle report exists. Skipping...");
				return;
			} 
			
			var snapshotItems = getNodeContent(ARENA_XPATHS.GLADIATORS, 2, false);
			
			attacker.setName(trim(snapshotItems[0].textContent));
			defender.setName(trim(snapshotItems[1].textContent));
			
			snapshotItems = getNodeContent(ARENA_XPATHS.BATTLE_TIME, 1, false);
			var battleDateTime = snapshotItems[0].textContent;
			arenaReport.setBattleTime(utils.dateToGMTUnixTime(battleDateTime));
			
			snapshotItems = getNodeContent(ARENA_XPATHS.ATTACKER_ID, 1, false);
			attacker.setId(utils.getPidFromUrl(snapshotItems[0].getAttribute('href')));
			
			snapshotItems = getNodeContent(ARENA_XPATHS.DEFENDER_ID, 1, false);
			defender.setId(utils.getPidFromUrl(snapshotItems[0].getAttribute('href')));
			
			// parse levels
			snapshotItems = getNodeContent(ARENA_XPATHS.ATTACKER_LEVEL, 1, false);
			attacker.setLevel(trim(snapshotItems[0].textContent));
			snapshotItems = getNodeContent(ARENA_XPATHS.DEFENDER_LEVEL, 1, false);
			defender.setLevel(trim(snapshotItems[0].textContent));
			
			// parse guild
			snapshotItems = getNodeContent(ARENA_XPATHS.ATTACKER_GUILD, 1, true);
			attacker.setGuild(snapshotItems.length > 0 ? trim(snapshotItems[0].textContent) : GFT.Constants.DEFAULT_GUILD);
			snapshotItems = getNodeContent(ARENA_XPATHS.DEFENDER_GUILD, 1, true);
			defender.setGuild(snapshotItems.length > 0 ? trim(snapshotItems[0].textContent) : GFT.Constants.DEFAULT_GUILD);

			// who is the winner ? 
			snapshotItems = getNodeContent(ARENA_XPATHS.WINNER_ID, 1, true);
			if(snapshotItems.length > 0) {
				arenaReport.setWinner(utils.getPidFromUrl(snapshotItems[0].getAttribute('href')));
			}
			
			// experience and gold raised or lost
			snapshotItems = getNodeContent(ARENA_XPATHS.REWARD, 2, true);
			var raisedGold = 0;
			var raisedExp = 0;
			if(snapshotItems.length == 2) {
				raisedGold = parseInt(snapshotItems[0].textContent.replace(/\./, "").match(/\s+\d+\s+/g)[0]);
				raisedExp = parseInt(snapshotItems[1].textContent.match(/\s+\d+\s+/g)[0]);	
			}
			else if(snapshotItems.length == 1){
				var tmpReward = parseInt(snapshotItems[0].textContent.replace(/\./, "").match(/\s+\d+\s+/g)[0]);
				if(snapshotItems[0].textContent.indexOf(":") > -1) { // gold
					raisedGold = tmpReward;
				} else {
					raisedExp = tmpReward;
				}
			}
			if(arenaReport.getMyPid() == defender.getId()) {
				if(arenaReport.getWinner() != arenaReport.getMyPid()) {
					raisedExp = 0; // you was defeated by the attacker, the raised experience doesn't matter, because the attacker get it
				} else {
					raisedExp = 2; // you won the battle and in this case you get always 2 expierence points
				}
			}
			arenaReport.setAttacker(attacker);
			arenaReport.setDefender(defender);
			arenaReport.setRaisedExp(raisedExp);
			arenaReport.setRaisedGold(raisedGold);
			
			console.log(arenaReport.toString());
			
			db.updatePlayerData(arenaReport.getServer(), arenaReport.getAttacker());
			db.updatePlayerData(arenaReport.getServer(), arenaReport.getDefender());
			
			insertReport(arenaReport);
			
		} catch (ex) { utils.reportError("Cannot parse arena report!", ex, true); return false;}
		return true;
	};
	
	function parseCircusTurmaReport() {
		try {
			var circusTurmaReport = new GFT.BattleReport(false);	
			circusTurmaReport.setRepId(utils.getRepIdFromUrl(utils.getBrowser().location + ""));

			// if report already exists no need to parse it again
			if(db.battleExists(circusTurmaReport.getRepId(), circusTurmaReport.getServer())) {
				console.log("Battle report exists. Skipping...");
				return;
			}
			var attacker = new GFT.Gladiator();
			var defender = new GFT.Gladiator();
			
			var snapshotItems = getNodeContent(CIRCUS_XPATHS.ATTACKER, 1, false);
			attacker.setName(trim(snapshotItems[0].textContent));
			
			snapshotItems = getNodeContent(CIRCUS_XPATHS.DEFENDER, 1, false);
			defender.setName(trim(snapshotItems[0].textContent));			
			
			// parse levels
			snapshotItems = getNodeContent(CIRCUS_XPATHS.ATTACKER_LEVEL, 1, false);
			attacker.setLevel(trim(snapshotItems[0].textContent));
			snapshotItems = getNodeContent(CIRCUS_XPATHS.DEFENDER_LEVEL, 1, false);
			defender.setLevel(trim(snapshotItems[0].textContent));
			
			circusTurmaReport.setAttacker(attacker);
			circusTurmaReport.setDefender(defender);
			// who is the winner ? 
			snapshotItems = getNodeContent(CIRCUS_XPATHS.WINNER, 1, true);
			circusTurmaReport.setWinner(trim(snapshotItems[0].textContent.split(" ")[1]));
			
			// experience and gold raised or lost
			snapshotItems = getNodeContent(CIRCUS_XPATHS.REWARD, 1, true);
			if(snapshotItems.length > 0) {
				circusTurmaReport.setRaisedGold(parseInt(snapshotItems[0].textContent.replace(/\./, "").match(/\s+\d+\s+/g)[0]));
			}
			
			circusTurmaReport.setBattleTime(utils.getGMTTime());
			
			console.log(circusTurmaReport.toString());
			
			insertReport(circusTurmaReport);
			
		} catch (ex) { utils.reportError("Cannot parse circus turma report!", ex, true); return false; }
		return true;
	};
	
	function parseAndStoreMyData() {
		try {
			var gladiator = new GFT.Gladiator();	
			
			var snapshotItems = getNodeContent(OVERVIEW_XPATHS.PLAYER_NAME, 1, false);
			gladiator.setName(trim(snapshotItems[0].textContent));
			
			snapshotItems = getNodeContent(OVERVIEW_XPATHS.HUNT_LINK, 1, false);
			var huntLink = trim(snapshotItems[0].textContent);
			huntLink.match(/c\.php\?uid=(\d+)/);
			gladiator.setId(RegExp.$1);
			
			snapshotItems = getNodeContent(OVERVIEW_XPATHS.PLAYER_LEVEL, 1, false);
			gladiator.setLevel(trim(snapshotItems[0].textContent));
			
			gladiator.setGuild(GFT.Constants.DEFAULT_MY_GUILD); // guild will be parsed later
			
			db.insertMyData(utils.getServer(), gladiator, 1);
			utils.appendToDD("serversMenu", utils.getServer());
			console.log("Gladiator profile: " + gladiator.toString());
		} catch (ex) { utils.reportError("I was unable to store your gladiator data. The server cannot be initialized!", ex, true);}
	};
	
	function parseGladiatorProfile() {
		try {
			var gladiator = new GFT.Gladiator();
			gladiator.setId(utils.getPidFromUrl(utils.getBrowser().location + ""));
			
			var snapshotItems = getNodeContent(PROFILE_XPATHS.PLAYER_NAME, 1, false);
			gladiator.setName(trim(snapshotItems[0].textContent));
			
			snapshotItems = getNodeContent(PROFILE_XPATHS.PLAYER_LEVEL, 1, false);
			gladiator.setLevel(trim(snapshotItems[0].textContent));

			snapshotItems = getNodeContent(PROFILE_XPATHS.PLAYER_GUILD, 1, true);
			gladiator.setGuild(snapshotItems.length > 0 ? trim(snapshotItems[0].textContent.split(" ")[0]) : GFT.Constants.DEFAULT_GUILD);
			
			db.updatePlayerData(utils.getServer(), gladiator);
			if(checkLevelBashing(gladiator.getLevel())) {
				utils.showWarning(utils.getString("notification.levelbashing.message"), true);
			}
			console.log("Gladiator profile: " + gladiator.toString());			
		} catch (ex) { console.error("Cannot parse gladiator profile: " + ex); return false;}
		return true;
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
		getNextPossibleAtack: getNextPossibleAtack,
		isLevelBashed: checkLevelBashing
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