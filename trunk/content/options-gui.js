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

GFTOptions = (function()
{
	var GTFpreferences = null;
	
	function $(element) {
		return document.getElementById(element);
	}
	
	function initPrefs() {
		try {
			GTFpreferences = new GFT.PrefManager();
			
			// TAB - Main
			$("gftIconPositionRadiogroup").selectedItem = $(GTFpreferences.getValue("options.tabs.main.iconposition", "iconPosRM"));
			$("gftBashingRadiogroup").selectedItem = $(GTFpreferences.getValue("options.tabs.main.bashing.strategy", "startOfDay"));
			$("bashingOneDayAttacks").value = GTFpreferences.getValue("options.tabs.main.bashing.onedayattacks", 5);
			$("bashingCustomDays").value = GTFpreferences.getValue("options.tabs.main.bashing.customdays", 4);
			$("bashingCustomDaysAttacks").value = GTFpreferences.getValue("options.tabs.main.bashing.customdaysattacks", 20);
			
			// TAB  - BattlesTable
			$("pTodayBattles").checked = GTFpreferences.getValue("options.tabs.battlesTable.pTodayBattles", true);
			$("pBattlesInAttacksCount").checked = GTFpreferences.getValue("options.tabs.battlesTable.pBattlesInAttacksCount", true);
			$("pBattlesInDefenceCount").checked = GTFpreferences.getValue("options.tabs.battlesTable.pBattlesInDefenceCount", true);
			$("pGoldRaised").checked = GTFpreferences.getValue("options.tabs.battlesTable.pGoldRaised", true);
			$("pGoldLost").checked = GTFpreferences.getValue("options.tabs.battlesTable.pGoldLost", true);
			$("pExperienceRaised").checked = GTFpreferences.getValue("options.tabs.battlesTable.pExperienceRaised", true);
			$("pChanceForWin").checked = GTFpreferences.getValue("options.tabs.battlesTable.pChanceForWin", true);
			$("oNextPossibleAttack").checked = GTFpreferences.getValue("options.tabs.battlesTable.oNextPossibleAttack", true);
			$("oBattlesInAttacksCount").checked = GTFpreferences.getValue("options.tabs.battlesTable.oBattlesInAttacksCount", true);
			$("oBattlesInDefenceCount").checked = GTFpreferences.getValue("options.tabs.battlesTable.oBattlesInDefenceCount", true);
			$("oGoldRaised").checked = GTFpreferences.getValue("options.tabs.battlesTable.oGoldRaised", true);
			$("oGoldLost").checked = GTFpreferences.getValue("options.tabs.battlesTable.oGoldLost", true);
			$("oMaxGoldRaised").checked = GTFpreferences.getValue("options.tabs.battlesTable.oMaxGoldRaised", true);
			$("oMaxGoldLost").checked = GTFpreferences.getValue("options.tabs.battlesTable.oMaxGoldLost", true);
			$("oExperienceRaised").checked = GTFpreferences.getValue("options.tabs.battlesTable.oExperienceRaised", true);
			$("oRealChanceForWin").checked = GTFpreferences.getValue("options.tabs.battlesTable.oRealChanceForWin", true);
			
			showVersion();
		} catch (e) { alert("Failed to init options window\n" + e); }
	}
	
	function applyMain() {
		GTFpreferences.setValue("options.tabs.main.iconposition", $("gftIconPositionRadiogroup").selectedItem.id);
		GTFpreferences.setValue("options.tabs.main.bashing.strategy", $("gftBashingRadiogroup").selectedItem.id);
		checkAndSetIntegerPref("options.tabs.main.bashing.onedayattacks", 5, "bashingOneDayAttacks", "errBashingOneDay");
		checkAndSetIntegerPref("options.tabs.main.bashing.customdays", 4, "bashingCustomDays", "errBashingCustomDays");
		checkAndSetIntegerPref("options.tabs.main.bashing.customdaysattacks", 20, "bashingCustomDaysAttacks", "errBashingCustomDays");
	}
	
	function applyBattleTable() {
		GTFpreferences.setValue("options.tabs.battlesTable.pTodayBattles", $("pTodayBattles").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.pBattlesInAttacksCount", $("pBattlesInAttacksCount").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.pBattlesInDefenceCount", $("pBattlesInDefenceCount").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.pGoldRaised", $("pGoldRaised").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.pGoldLost", $("pGoldLost").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.pExperienceRaised", $("pExperienceRaised").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.pChanceForWin", $("pChanceForWin").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oNextPossibleAttack", $("oNextPossibleAttack").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oBattlesInAttacksCount", $("oBattlesInAttacksCount").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oBattlesInDefenceCount", $("oBattlesInDefenceCount").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oGoldRaised", $("oGoldRaised").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oGoldLost", $("oGoldLost").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oMaxGoldRaised", $("oMaxGoldRaised").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oMaxGoldLost", $("oMaxGoldLost").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oExperienceRaised", $("oExperienceRaised").checked);
		GTFpreferences.setValue("options.tabs.battlesTable.oRealChanceForWin", $("oRealChanceForWin").checked);
	}
	
	function showVersion() {//TODO read from file
		var version = $('versionsmenu').selectedItem.value;
		var textarea = $('versionsarea');
		
		var v14 = "FIXED: The values displayed in the battle overlay were completly wrong.\n"
			+ "ADDED: Ability to fight on the arena or cirkus turma directly from the battle overlay(double click or right click use the context menu).\n"
			+ "ADDED: Almost all visual elements could be managed now through the options.\n"
			+ "ADDED: Two different fight strategies can be choosen according to the specific rules of your server.\n"
			+ "ADDED: The bashing rules can be manually adjusted.\n"
			+ "ADDED: The whole addon is placed under single global namespace (GFT) avoiding possible conflicts with other addons.\n"
			+ "FIXED: Battle time is now parsed from the reports. Different timezones are also respected.\n"
			+ "ADDED: French translation. Thanks to Sébastien BAILLY!\n"
			+ "FIXED: Various visual and logical bugs.";
			
		var v13 = "ADDED: Battle GUI added. It allows you to search battles\n"
			+ "UPDATE: Some visual changes\n"
			+ "UPDATE: The addon was adjusted for gladiatus v0.6.0";
		var v122 = "CHANGED: wrong locale string caused bug in displaying of the battle table";
		var v121 = "FIXED: various database function, returning incorrect data for multiple servers";
		var v12 = "CHANGED: Design of the battle statistic table has changed (opponent and own player pages)\n"
			+ 	"ADDED: One more period column in the battle statistics menu (opponent and own player pages)\n"
			+ 	"CHANGED: Battles for last 24h was removed and replaced by attacks count for the chosen time period (opponent page)\n"
			+ 	"ADDED: Defenses attack count (opponent page)\n"
			+ 	"ADDED: The chosen time period is now highlighted, default is always one day (later should be an option)\n"
			+ 	"ADDED: Attacks count and defenses count for the chosen time period (own player page)\n"
			+ 	"ADDED: Gold raised and lost for the chosen time period (own player page)\n"
			+ 	"ADDED: Chance for win depending on the battles for the chosen time period (own player page)\n"
			+ 	"REMOVED: The options link in the addons view, because options are still not available";
		
		var v11 = "FIXED: fixed display bug of the battle table on the player page which caused the values to be showed next to the headers\n"
				+ "ADDED: now can be chosen the time period for the battle table statistics\n"
				+ "ADDED: real chance change. it shows if your real chance for win compared with the previous day chance for win become better or worser\n"
				+ "FIXED: the statistics on your own gladiator page are now corrected ";
		var v101 = "ADD: Multiple server support\n"
				+ "ADD: Bulgarian and german languages ";
		var v10 = "Initial version";
		
		var all = v14 + "\n" + v13 + "\n" + v122  + "\n" + v121 + "\n" + v12 + "\n" + v11 + "\n" + v101 + "\n" + v10;
		
		switch(version) {
			case "all": {textarea.innerHTML = getVersion(all); break;}
			case "v14": {textarea.innerHTML =  getVersion(v14); break;}
			case "v13": {textarea.innerHTML =  getVersion(v13); break;}
			case "v122": {textarea.innerHTML =  getVersion(v122); break;}
			case "v121":{textarea.innerHTML =  getVersion(v121); break;}
			case "v12":{textarea.innerHTML = getVersion(v12); break;}
			case "v11": {textarea.innerHTML = getVersion(v11); break;}
			case "v101": {textarea.innerHTML = getVersion(v101); break;}
			case "v10": {textarea.innerHTML = getVersion(v10); break;}
			default: {textarea.innerHTML = getVersion(all); break;}
		}
	}
	
	function checkAndSetIntegerPref(prefName, defaultValue, elemId, errElemId) {
		var elem = $(elemId);
		var errElem = $(errElemId);
		if(isInteger(elem.value)) {
			errElem.value = "";
			GTFpreferences.setValue(prefName, parseInt(elem.value));
		} else {
			errElem.value = "Specify correct value!";
			elem.value = GTFpreferences.getValue(prefName, defaultValue);
		}
	}
	
	function getVersion(content) {
		var ulOpen = "<html:ul>";
		var ulClose = "</html:ul>";
		var liOpen = "<html:li>";
		var liClose = "</html:li>";
		
		content = content.split("\n");
		var result = ulOpen;
		for(i = 0; i < content.length; i++) {
			result += liOpen + content[i] + liClose;
		}
		result += ulClose;
		
		return result;
	}
	
	function isInteger(value) {
		return /^\d+$/.test(value);
	}
	
	return {
		init: function() {
			initPrefs();
		},
		
		apply: function(tab) {
			switch(tab) {
				case "main":{ applyMain(); break;}
				case "battleTable":{ applyBattleTable(); break;}
				case "versions" : { showVersion(); break; }
				default: {break;}
			}
		}
	};
})();
