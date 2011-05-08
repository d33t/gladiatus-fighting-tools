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

GFT.DBPlayerData = function(pid, name, guild, level, server, attacks, defenses, goldRaised, goldLost, maxGoldRaised, maxGoldLost, expRaised, lastAttackTime) {
	this.pid = pid;
	this.name = name;
	this.guild = guild;
	this.level = level;
	this.server = server;
	this.attacks = attacks;
	this.defenses = defenses;
	this.goldRaised = goldRaised;
	this.goldLost = goldLost;
	this.maxGoldRaised = maxGoldRaised;
	this.maxGoldLost = maxGoldLost;
	this.expRaised = expRaised;
	this.lastAttackTime = lastAttackTime;
};

GFT.StatsView = function(attacks, goldRaised, maxGoldRaised, expRaised, battlesWon, lastAttackTime) {
	this.attacks = attacks;
	this.goldRaised = goldRaised;
	this.maxGoldRaised = maxGoldRaised;
	this.expRaised = expRaised;
	this.battlesWon = battlesWon;
	this.lastAttackTime = lastAttackTime;
	this.toString = function() {
		return "Attacks: " + this.attacks + " (won " + this.battleWon + ")"
			+ "\nGold raised: " + this.goldRaised
			+ "\nMax gold: " + this.maxGoldRaised
			+ "\nExp raised: " + this.expRaised
			+ "\nLast attack: " + (this.lastAttackTime ? GFT.Utils.unixtimeToHumanReadable(this.lastAttackTime) : "none");
	};
};

GFT.ResultSet = function() {
	var results = new Array();
	
	var getSafeResult = function(value, defaultValue) {
		return ((typeof(value) == "undefined" || value == null) ? defaultValue : value);
	};
	
	this.add = function(value, defaultValue) {
		if(typeof(defaultValue) != "undefined") {
			value = getSafeResult(value, defaultValue);
		}
		results.push(value);
	};
	
	this.addById = function(id, value, defaultValue) {
		if(typeof(defaultValue) != "undefined") {
			value = getSafeResult(value, defaultValue);
		}
		results[id] = value;
	};

	this.get = function(index) {
		if(index < 0 || index > results.length) {
			throw new Error("Wrong index. No object at index: " + index);
		}
		
		return results[index];
	};
	
	this.getById = function(id, defaultValue) {
		if(typeof(results[id]) == "undefined" && typeof(defaultValue) != "undefined") {
			return defaultValue;
		}
		if(typeof(results[id]) == "undefined") {
			throw new Error("Wrong identifier: " + id + ", data: " + results);
		}
		
		return results[id];
	};
	
	this.isEmpty = function() {
		return results.length == 0;
	};
	
	this.clear = function() {
		results = new Array();
	};
	
	this.getResults = function() {
		return results;
	};
	
	this.size = function() {
		return results.length;
	};
	
	this.uniqueResult = function() {
		if(this.size() != 1) {
			throw new Error("Expected unique result but got " + this.size() + " results.");
		}
		return this.get(0);
	};
	
	this.uniqueResultOrNull = function() {
		if(this.size() > 1) {
			throw new Error("Expected unique result but got " + this.size() + " results.");
		} else if(this.size() == 0) {
			return null;
		} else {
			return this.get(0);
		}
	};	
};

GFT.ElementPath = function(name, xpaths, regExp) {
	var _name = name; //used for better exception handling
	var _xpaths = xpaths;
	var _regExp = regExp || null;
	
	this.getName = function() {
		return _name;
	};
	
	this.getXpaths = function() {
		return _xpaths;
	};
	
	this.getRegExp = function() {
		return _regExp;
	};
};

GFT.Gladiator = function() {
	var id = -1;	
	var name;
	var guild = GFT.Constants.DEFAULT_GUILD;
	var level;

	this.setName = function(gName) { name = gName; };
	this.getName = function() { return name; };
	
	this.setId = function(gId) { id = parseInt(gId); };
	this.getId = function() { return id; };
		
	this.setGuild = function(gGuild) { guild = gGuild; };
	this.getGuild = function() { return guild; };
		
	this.setLevel = function(gLevel) { level = parseInt(gLevel); };
	this.getLevel = function() { return level; };
	
	this.toString = function() {
		return name + (id ? " [" + id + "]" : "")
			+ (level ? ",Level: " + level : "")
			+ (guild ? ",Guild: " + guild : "");	
	};
};

GFT.BattleReport = function(reportType) {
	var db = GFT.Globals.Database;
	var arenaReport = reportType;
	var server = GFT.Utils.getServer();
	var myPid = db.getMyPid(server);
	var myName = db.getMyName(server);
	var repId;
	var attacker;
	var defender;
	var battleTime;
	var raisedGold = 0;
	var raisedExp = 0;
	/** winner could be id or name */
	var winner = -1;
	
	this.isArenaReport = function() { return arenaReport; };
	
	this.getServer = function() { return server; };
	
	this.getMyPid = function() { return myPid; };
	
	this.getMyName = function() { return myName; };
	
	this.setRepId = function(id) { repId = parseInt(id); };
	this.getRepId = function() { return repId; };

	this.setAttacker = function(gladiator) { attacker = gladiator; };
	this.getAttacker = function() { return attacker; };
	
	this.setDefender = function(gladiator) { defender = gladiator; };
	this.getDefender = function() {	return defender; };
		
	this.setBattleTime = function(unixtime) { battleTime = unixtime; };
	this.getBattleTime = function() { return battleTime; };
		
	this.setRaisedGold = function(gold) { raisedGold = parseInt(gold); };
	this.getRaisedGold = function() { return raisedGold; };
		
	this.setRaisedExp = function(exp) { raisedExp = parseInt(exp); };
	this.getRaisedExp = function() { return raisedExp; };
		
	this.setWinner = function(value) { winner = value; };
	this.getWinner = function() { return winner; };

	this.toString = function() {
		return (arenaReport ? "Arena" : "Circus Turma") + " report <" + repId + ">"
				+ "\nAttacker: " + attacker.toString()
				+ "\nDefender: " + defender.toString()
				+ "\nGold: " + GFT.Utils.partitionateNumber(raisedGold)
				+ "\nExp: " +  raisedExp
				+ "\nWinner: " +  winner
				+ "\nBattle time: " + battleTime + " : " + GFT.Utils.unixtimeToHumanReadable(battleTime)
				+ "\nServer: " +  server
				+ "\nMy pid: " +  myPid;
	};
};