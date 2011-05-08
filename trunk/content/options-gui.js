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
	var utils = GFT.Utils;
	var db = GFT.Globals.Database;
	
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
			$("showBashingWarning").checked = GTFpreferences.getValue("options.tabs.main.showBashingWarning", true);
			$("showBattlePopupMenu").checked = GTFpreferences.getValue("options.tabs.main.showBattlePopupMenu", false);
			$("collapseBattleOverlayAfterBattle").checked = GTFpreferences.getValue("options.tabs.main.collapseBattleOverlayAfterBattle", false);
			$("defaultDoubleClickAction").selectedIndex = utils.getMenuItemIndexById("defaultDoubleClickAction", GTFpreferences.getValue("options.tabs.others.defaultDoubleClickAction", "location-arena"));
			// enable/disable double click action menu if show battle menu over the battle overlay table is allowed/disallowed
			if($("showBattlePopupMenu").checked) {
				$("defaultDoubleClickActionLabel").disabled = false;
				$("defaultDoubleClickAction").disabled = false;
			} else {
				$("defaultDoubleClickActionLabel").disabled = true;
				$("defaultDoubleClickAction").disabled = true;
			}			
			
			$("showLevelBashingWarning").checked = GTFpreferences.getValue("options.tabs.main.showLevelBashingWarning", false);
			$("levelBashingLimit").value = GTFpreferences.getValue("options.tabs.main.levelBashingLimit", 10);
			$("levelBashingRemoveButtons").checked = GTFpreferences.getValue("options.tabs.main.levelBashingRemoveButtons", false);
			if($("showLevelBashingWarning").checked) {
				$("levelBashingLimit").disabled = false;
				$("levelBashingRemoveButtons").disabled = false;
			} else {
				$("levelBashingLimit").disabled = true;
				$("levelBashingRemoveButtons").disabled = true;
			}
			
			// TAB  - BattlesTable
			$("btDefaultSearchPeriod").selectedIndex = utils.getMenuItemIndexById("btDefaultSearchPeriod", GTFpreferences.getValue("options.tabs.battlesTable.btDefaultSearchPeriod", "oneday"));
			$("btDefaultSearchLocation").selectedIndex = utils.getMenuItemIndexById("btDefaultSearchLocation", GTFpreferences.getValue("options.tabs.battlesTable.btDefaultSearchLocation", "location-arena"));
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
			
			// TAB - Others
			$("showCircusTurmaButton").checked = GTFpreferences.getValue("options.tabs.others.showCircusTurmaButton", true);
			$("markMyAllies").checked = GTFpreferences.getValue("options.tabs.others.markMyAllies", true);
			$("advancedOptionsExpandedDefault").checked = GTFpreferences.getValue("options.tabs.others.advancedOptionsExpandedDefault", false);
			$("excludeMyAlliesDefault").checked = GTFpreferences.getValue("options.tabs.others.excludeMyAlliesDefault", true);
			$("battlesTablePosition").selectedIndex = utils.getMenuItemIndexById("battlesTablePosition", GTFpreferences.getValue("options.tabs.others.battlesTablePosition", "before"));
			$("defaultSortColumn").selectedIndex = utils.getMenuItemIndexById("defaultSortColumn", GTFpreferences.getValue("options.tabs.others.defaultSortColumn", "rName"));
			$("defaultSortDirection").selectedIndex = utils.getMenuItemIndexById("defaultSortDirection", GTFpreferences.getValue("options.tabs.others.defaultSortDirection", "asc"));
			$("searchByPeriodDefault").selectedIndex = utils.getMenuItemIndexById("searchByPeriodDefault", GTFpreferences.getValue("options.tabs.others.searchByPeriodDefault", "oneday"));
			$("searchByLocationDefault").selectedIndex = utils.getMenuItemIndexById("searchByLocationDefault", GTFpreferences.getValue("options.tabs.others.searchByLocationDefault", "location-arena"));
			$("searchByAttackTypeDefault").selectedIndex = utils.getMenuItemIndexById("searchByAttackTypeDefault", GTFpreferences.getValue("options.tabs.others.searchByAttackTypeDefault", "atype-all"));

			$("searchByLowLevelDefault").value = GTFpreferences.getValue("options.tabs.others.searchByLowLevelDefault", "");
			$("searchByHighLevelDefault").value = GTFpreferences.getValue("options.tabs.others.searchByHighLevelDefault", "");
			
			var activeServers = db.getAllActiveServers();
			for(var i = 0; i < activeServers.length; i++) {
				utils.appendToDD("options-servers", activeServers[i]);
			}
			$("searchByServer").selectedIndex = utils.getMenuItemIndexById("searchByServer", GTFpreferences.getValue("options.tabs.others.searchByServer", "allServers"));
		} catch (e) { utils.reportError("Failed to init options window", e);}
	}
	
	function applyMain() {
		GTFpreferences.setValue("options.tabs.main.iconposition", $("gftIconPositionRadiogroup").selectedItem.id);
		GTFpreferences.setValue("options.tabs.main.bashing.strategy", $("gftBashingRadiogroup").selectedItem.id);
		checkAndSetIntegerPref("options.tabs.main.bashing.onedayattacks", 5, "bashingOneDayAttacks", "errBashingOneDay");
		checkAndSetIntegerPref("options.tabs.main.bashing.customdays", 4, "bashingCustomDays", "errBashingCustomDays");
		checkAndSetIntegerPref("options.tabs.main.bashing.customdaysattacks", 20, "bashingCustomDaysAttacks", "errBashingCustomDays");
		GTFpreferences.setValue("options.tabs.main.showBashingWarning", $("showBashingWarning").checked);
		GTFpreferences.setValue("options.tabs.main.showBattlePopupMenu", $("showBattlePopupMenu").checked);
		if($("showBattlePopupMenu").checked) {
			$("defaultDoubleClickActionLabel").disabled = false;
			$("defaultDoubleClickAction").disabled = false;
			GTFpreferences.setValue("options.tabs.main.defaultDoubleClickAction", $("defaultDoubleClickAction").selectedItem.id);
		} else {
			$("defaultDoubleClickActionLabel").disabled = true;
			$("defaultDoubleClickAction").disabled = true;
		}
		GTFpreferences.setValue("options.tabs.main.collapseBattleOverlayAfterBattle", $("collapseBattleOverlayAfterBattle").checked);
		
		GTFpreferences.setValue("options.tabs.main.showLevelBashingWarning", $("showLevelBashingWarning").checked);
		checkAndSetIntegerPref("options.tabs.main.levelBashingLimit", 10, "levelBashingLimit", "errLevelBashingLimit", false);
		GTFpreferences.setValue("options.tabs.main.levelBashingRemoveButtons", $("levelBashingRemoveButtons").checked);
		if($("showLevelBashingWarning").checked) {
			$("levelBashingLimit").disabled = false;
			$("levelBashingRemoveButtons").disabled = false;
		} else {
			$("levelBashingLimit").disabled = true;
			$("levelBashingRemoveButtons").disabled = true;
		}
	}
	
	function applyBattleTable() {
		GTFpreferences.setValue("options.tabs.battlesTable.btDefaultSearchPeriod", $("btDefaultSearchPeriod").selectedItem.id);
		GTFpreferences.setValue("options.tabs.battlesTable.btDefaultSearchLocation", $("btDefaultSearchLocation").selectedItem.id);
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
	
	function applyOthers() {
		GTFpreferences.setValue("options.tabs.others.showCircusTurmaButton", $("showCircusTurmaButton").checked);
		GTFpreferences.setValue("options.tabs.others.markMyAllies", $("markMyAllies").checked);		
		GTFpreferences.setValue("options.tabs.others.advancedOptionsExpandedDefault", $("advancedOptionsExpandedDefault").checked);
		GTFpreferences.setValue("options.tabs.others.excludeMyAlliesDefault", $("excludeMyAlliesDefault").checked);
		GTFpreferences.setValue("options.tabs.others.battlesTablePosition", $("battlesTablePosition").selectedItem.id);
		GTFpreferences.setValue("options.tabs.others.defaultSortColumn", $("defaultSortColumn").selectedItem.id);
		GTFpreferences.setValue("options.tabs.others.defaultSortDirection", $("defaultSortDirection").selectedItem.id);
		GTFpreferences.setValue("options.tabs.others.searchByPeriodDefault", $("searchByPeriodDefault").selectedItem.id);
		GTFpreferences.setValue("options.tabs.others.searchByLocationDefault", $("searchByLocationDefault").selectedItem.id);
		GTFpreferences.setValue("options.tabs.others.searchByAttackTypeDefault", $("searchByAttackTypeDefault").selectedItem.id);
		GTFpreferences.setValue("options.tabs.others.searchByServer", $("searchByServer").selectedItem.id);
		setSearchByLevelDefaults("searchByLowLevelDefault");
		setSearchByLevelDefaults("searchByHighLevelDefault");
	}
	
	function setSearchByLevelDefaults(itemId) {
		if($(itemId).value == "") {
			GTFpreferences.setValue("options.tabs.others." + itemId, $(itemId).value);
		} else if(isInteger($(itemId).value)) {
			if(isInteger($("searchByLowLevelDefault").value) && isInteger($("searchByHighLevelDefault").value)) {
				if(parseInt($("searchByLowLevelDefault").value) <= parseInt($("searchByHighLevelDefault").value)) {
					GTFpreferences.setValue("options.tabs.others." + itemId, $(itemId).value);
				} else {
					$(itemId).value = GTFpreferences.getValue("options.tabs.others." + itemId, "");
				}
			} else {
				GTFpreferences.setValue("options.tabs.others." + itemId, $(itemId).value);
			}
		} else {
			$(itemId).value = GTFpreferences.getValue("options.tabs.others." + itemId, "");
		}
	}
	
	function checkAndSetIntegerPref(prefName, defaultValue, elemId, errElemId, allowEmpty) {
		var elem = $(elemId);
		if(elem.value == "" && allowEmpty) {
			GTFpreferences.setValue(prefName, elem.value);
			return;
		}
		
		var errElem = $(errElemId);
		if(isInteger(elem.value)) {
			errElem.value = "";
			GTFpreferences.setValue(prefName, parseInt(elem.value));
		} else {
			errElem.value = utils.getString("options.wrongValue"); 
			elem.value = GTFpreferences.getValue(prefName, defaultValue);
		}
	}
	
	function isInteger(value) {
		return /^\d+$/.test(value);
	}
	
	return {
		init: function() {
			GFT.Globals.init();
			initPrefs();
		},
		
		apply: function(tab) {
			switch(tab) {
				case "main":{ applyMain(); break;}
				case "battleTable":{ applyBattleTable(); break;}
				case "others" : { applyOthers(); break; }
				case "versions" : { showVersion(); break; }
				default: {break;}
			}
		}
	};
})();
