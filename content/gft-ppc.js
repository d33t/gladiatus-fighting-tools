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

GFT.PlayerPageContent = function() {
	var utils = GFT.Utils;
	var db = GFT.Globals.Database;
	var console = GFT.Utils.console;
	var prefMan = new GFT.PrefManager();
	
	function getRowOrNothing(row, prefValue, expand) {
		if(expand) {
			return row;
		} else {
			var display = prefMan.getValue(prefValue, false);
			if(!display) {
				return "";
			}
			return row;
		}
	}
	
	function getGoldEntry(value, infoMsg) {
		var gold = utils.getString("goldImg");
		if(value == null) {
			value = 0;
		}
		return utils.createTableEntry(utils.getString(infoMsg), utils.partitionateNumber(value) +
				' <img border="0" align="absmiddle" title="' + gold + '" alt="' + gold + '" src="img/res2.gif">');
	}
	
	function getAllExpRaised(attackStatsView, defenseStatsView) {
		return utils.createTableEntry(utils.getString("allExpRaised"),
				utils.partitionateNumber(attackStatsView.expRaised + (defenseStatsView.battlesWon * 2)));
	}
	
	function getWinChance(pid, server, location) {
		var winChance = db.getWinChance(pid, server, location);
		var lastDayWinChance = db.getLastDayWinChance(pid, server, location);
		
		var diff = 0;
		var diffSpan = '';
		if(winChance != "none" && lastDayWinChance != "none") {
			diff = winChance - lastDayWinChance;
			diffSpan = '<span style="color: ';
			if(diff == 0) {
				diffSpan += 'orange; font-weight: bold;">';
			}
			else if(diff > 0) {
				diffSpan += 'green; font-weight: bold;">+';
			}
			else {
				diffSpan += 'red; font-weight: bold;">';
			}
			diffSpan += diff.toFixed(2) + '%</span>';
		}
			
		winChance = (winChance != "none" ? winChance.toFixed(1) + "%&nbsp;&nbsp;" + diffSpan : utils.getString("noData"));
		return utils.createTableEntry(utils.getString("realWinChance"),  winChance);
	}
	
	this.getEnemyStats = function(doc, period, expand, location) {
		var server = doc.domain+"";
		if(!db.isServerActive(server)) {
			return '<tr><td colspan="6" style="padding-left: 3px; white-space: nowrap;" class="stats_value">' + utils.getString("serverNotActiveError") + '</td></tr>';
		}
		
		var pid = utils.getPidFromUrl(doc.location+"");
		console.debug("[getEnemyStats]: Pid: " + pid + ", Server: " + server);
		
		var attackStatsView = db.getEnemyStats(pid, server, "pid", period, 1, location);
		var defenseStatsView = db.getEnemyStats(pid, server, "pid", period, 0, location);
		var nextPossibleAttack = GFT.Main.getNextPossibleAtack(pid, server, "pid", false, true);
		if(location == 1) {
			attackStatsView.expRaised = 0;
			defenseStatsView.expRaised = 0;
		}
		return	getRowOrNothing(utils.createTableEntry(utils.getString("nextpossiblefight"), nextPossibleAttack),"options.tabs.battlesTable.oNextPossibleAttack",expand) +
				getRowOrNothing(utils.createTableEntry(utils.getString("attackssinceperiod"), utils.partitionateNumber(attackStatsView.attacks) + " (" + utils.getString("battlesWon") + " " + utils.partitionateNumber(attackStatsView.battlesWon) + ")"),"options.tabs.battlesTable.oBattlesInAttacksCount",expand) +
				getRowOrNothing(utils.createTableEntry(utils.getString("defensessinceperiod"), utils.partitionateNumber(defenseStatsView.attacks) + " (" + utils.getString("battlesWon") + " " + utils.partitionateNumber(defenseStatsView.battlesWon) + ")"),"options.tabs.battlesTable.oBattlesInDefenceCount",expand) +
				getRowOrNothing(getGoldEntry(attackStatsView.goldRaised, "goldRaised"),"options.tabs.battlesTable.oGoldRaised",expand) +
				getRowOrNothing(getGoldEntry(defenseStatsView.goldRaised, "goldLost"),"options.tabs.battlesTable.oGoldLost",expand) +
				getRowOrNothing(getGoldEntry(attackStatsView.maxGoldRaised, "maxGoldRaised"),"options.tabs.battlesTable.oMaxGoldRaised",expand) +
				getRowOrNothing(getGoldEntry(defenseStatsView.maxGoldRaised, "maxGoldLost"),"options.tabs.battlesTable.oMaxGoldLost",expand) +
				getRowOrNothing(getAllExpRaised(attackStatsView, defenseStatsView),"options.tabs.battlesTable.oExperienceRaised",expand) +
				getRowOrNothing(getWinChance(pid, server, location),"options.tabs.battlesTable.oRealChanceForWin",expand);
	};
	
	this.getMyStats = function(doc, period, expand, location) {
		var server = doc.domain+"";
		console.debug("[getMyStats]: Server" +  server);
		if(!db.isServerActive(server)) {
			return '<tr><td colspan="6" style="padding: 5px 2px 0 2px; word-wrap:break-word;" class="stats_value">' + utils.getString("serverNotActiveError") + '</td></tr>';
		}
		var attackStatsView = db.getMyStats(server, period, 1, location);
		var defenseStatsView = db.getMyStats(server, period, 0, location);
		if(location == 1) {
			attackStatsView.expRaised = 0;
			defenseStatsView.expRaised = 0;
		}
		var todayattacks = db.getAllAtacksSinceTodayAndDefDaysBack(0, server, location);
		var allBattles = attackStatsView.attacks + defenseStatsView.attacks;
		allBattles = allBattles > 0 ? allBattles : 1;
		var winRatio = ((attackStatsView.battlesWon + defenseStatsView.battlesWon)/allBattles)*100;
		var winRatioSpan = utils.getString("noData");
		if(winRatio != "undefined") {
			winRatioSpan = '<span style="color: ';
			if(winRatio >= 50) {
				winRatioSpan += 'green; font-weight: bold;">';
			}
			else {
				winRatioSpan += 'red; font-weight: bold;">';
			}
			winRatioSpan += winRatio.toFixed(1) + '%</span>';
		}
		return	getRowOrNothing(utils.createTableEntry(utils.getString("todayattacks"), todayattacks),"options.tabs.battlesTable.pTodayBattles",expand) +
				getRowOrNothing(utils.createTableEntry(utils.getString("attackssinceperiod"), utils.partitionateNumber(attackStatsView.attacks) + " (" + utils.getString("battlesWon") + " " + utils.partitionateNumber(attackStatsView.battlesWon) + ")"),"options.tabs.battlesTable.pBattlesInAttacksCount",expand) +
				getRowOrNothing(utils.createTableEntry(utils.getString("defensessinceperiod"), utils.partitionateNumber(defenseStatsView.attacks) + " (" + utils.getString("battlesWon") + " " + utils.partitionateNumber(defenseStatsView.battlesWon) + ")"),"options.tabs.battlesTable.pBattlesInDefenceCount",expand) +
				getRowOrNothing(getGoldEntry(attackStatsView.goldRaised, "goldRaised"),"options.tabs.battlesTable.pGoldRaised",expand) +
				getRowOrNothing(getGoldEntry(defenseStatsView.goldRaised, "goldLost"),"options.tabs.battlesTable.pGoldLost",expand) +
				getRowOrNothing(getAllExpRaised(attackStatsView, defenseStatsView),"options.tabs.battlesTable.pExperienceRaised",expand) +
				getRowOrNothing(utils.createTableEntry(utils.getString("winratio"), winRatioSpan),"options.tabs.battlesTable.pChanceForWin",expand);	
	};
	
	this.getString = function(string) { return utils.getString(string); };

	this.getFightResponseResult = utils.getFightResponseResult;
	
	this.isMyAlly = function(guild, doc) {
		var server = doc.domain +  "";
		if(!db.isServerActive(server)) {
			return false;
		}
		guild = utils.trim(guild);
		return db.getMyGuild(server) == guild;
	};
	
	this.isMyProfilePage = function(doc) {
		var server = doc.domain +  "";
		if(!db.isServerActive(server)) {
			return false; // it doen't matter if you return true or false
		}
		var pid = utils.getPidFromUrl(doc.location+"");
		var myPid = db.getMyPid(server);
		return pid == myPid;
	};
	
	this.isServerActive = function(doc) {
		var server = doc.domain +  "";
		if(!db.isServerActive(server)) {
			return false;
		}
		return true;
	};
	
	this.isLevelBashed = GFT.Main.isLevelBashed;
};