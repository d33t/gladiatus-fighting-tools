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

GFT.PlayerPageContent = function() {
	var utils = GFT.Utils;
	var db = GFT.DB;
	var console = GFT.Utils.console;
	
	function splitNumberInGroups(value)
	{
		var tmp = "";
		var separator = ".";
		value = (value+"").split("").reverse();
		
		for(var i = 0; i < value.length; i++)
		{
			if(i > 0 && i % 3 == 0)
				tmp += separator + value[i];
			else
				tmp += value[i];
		}
		
		tmp = tmp.split("").reverse().join("");
		return tmp;
	}
	
	function getGoldEntry(value, infoMsg) {
		var gold = utils.getString("goldImg");
		return utils.createTableEntry(utils.getString(infoMsg), splitNumberInGroups(value) +
				' <img border="0" align="absmiddle" title="' + gold + '" alt="' + gold + '" src="img/res2.gif">');
	}
	
	function getGold(pid, server, atype, period, infoMsg) {
		return getGoldEntry(db.getGoldRaised(pid, server, atype, period), infoMsg);
	}
	
	function getMaxGold(pid, server, atype, period, infoMsg) {
		return getGoldEntry(db.getMaxGold(pid, server, atype, period), infoMsg);
	}
	
	function getExpRaised(pid, server, period) {
		return utils.createTableEntry(utils.getString("expRaised"), 
				splitNumberInGroups(db.getExpRaised(pid, server, period)));
	}
	
	function getAllExpRaised(server, period) {
		return utils.createTableEntry(utils.getString("allExpRaised"),
				splitNumberInGroups(db.getAllExpRaised(server, period)));
	}
	
	function getWinChance(pid, server) {
		var winChance = db.getWinChance(pid, server);
		var lastDayWinChance = db.getLastDayWinChance(pid, server);
		
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
	
	this.getContent = function(doc, period) {//TODO options
		var server = doc.domain+"";
		var pid = utils.getPidFromUrl(doc.location+"");
		console.log("[getContent]: Pid: " + pid + ", Server: " + server);
		var attackForLastDay = db.getNumberOfBattlesWithin(pid, server, "pid", 1, "oneday");
		var attacks = db.getNumberOfBattlesWithin(pid, server, "pid", 1, period);
		var defenses = db.getNumberOfBattlesWithin(pid, server, "pid", 0, period);
		var nextAtack = GFT.Main.getNextPossibleAtack(pid, server, "pid", attackForLastDay);

		return	utils.createTableEntry(utils.getString("nextpossiblefight"), nextAtack) +
				utils.createTableEntry(utils.getString("attackssinceperiod"), attacks) +
				utils.createTableEntry(utils.getString("defensessinceperiod"), defenses) +
				getGold(pid, server, 1, period, "goldRaised") +
				getGold(pid, server, 0, period, "goldLost") +
				getMaxGold(pid, server, 1, period, "maxGoldRaised") +
				getMaxGold(pid, server, 0, period, "maxGoldLost") +
				getExpRaised(pid, server, period) +
				getWinChance(pid, server);
	};
	
	this.getMyStats = function(doc, period) {//TODO options
		var server = doc.domain+"";
		console.log("[getMyStats]: Server" +  server);
		var todayattacks = db.getAllAtacksSinceTodayAndDefDaysBack(0, server);
		var attacks = db.getNumberOfBattlesSinceCustomTime(period, server, 1);
		var defenses = db.getNumberOfBattlesSinceCustomTime(period, server, 0);
		var battlesWon = db.getBattlesWon(server, period);
		var winRatio = (battlesWon/(attacks + defenses))*100;
		var winRatioSpan = utils.getString("noData");
		if(winRatio && winRatio != "none") {
			winRatioSpan = '<span style="color: ';
			if(winRatio >= 50) {
				winRatioSpan += 'green; font-weight: bold;">+';
			}
			else {
				winRatioSpan += 'red; font-weight: bold;">';
			}
			winRatioSpan += winRatio.toFixed(1) + '%</span>';
		}
		return	utils.createTableEntry(utils.getString("todayattacks"), todayattacks) +
				utils.createTableEntry(utils.getString("attackssinceperiod"), attacks) +
				utils.createTableEntry(utils.getString("defensessinceperiod"), defenses) +
				getGoldEntry(db.getAllGoldRaised(server, 1, period), "goldRaised") +
				getGoldEntry(db.getAllGoldRaised(server, 0, period), "goldLost") +
				getAllExpRaised(server, period) +
				utils.createTableEntry(utils.getString("winratio"), winRatioSpan);	
	};
	
	this.getString = function(string) { return utils.getString(string); };	
};