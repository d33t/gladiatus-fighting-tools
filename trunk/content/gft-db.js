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

GFT.DB = function(){
	var dbConn = null;
	var prefMan = new GFT.PrefManager();
	var console = GFT.Utils.console;
	var utils = GFT.Utils;
	// Constants
	var ZERO = 0;
	var ONE_DAY_IN_SEC = 86400;
	var ONE_DAY = 1;
	var TWO_DAYS = 2;
	var THREE_DAYS = 3;
	var FOUR_DAYS = 4;
	var FIVE_DAYS = 5;
	var SIX_DAYS = 6;
	var ONE_WEEK = 7;
	var ONE_MONTH = 30;

	/* ----------- DB PRIVATE FUNCTIONS  ----------- */ 	
	
	var createDB = function() {
		try { dbConn.executeSimpleSQL("SELECT apid, pid, name, server, level, guild, lastupdate FROM player"); }
		catch (e) {
			//Create pinfo database
			console.debug("Debug[createDB()]: Creating table player...");
			dbConn.executeSimpleSQL("DROP TABLE IF EXISTS player;" +
												"CREATE TABLE player (" +
												"apid INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, " +
												"pid INTEGER NOT NULL, " +
												"name VARCHAR(30) NOT NULL, " +
												"server VARCHAR(40) NOT NULL, " +
												"level INTEGER NOT NULL, " +
												"guild VARCHAR(40) DEFAULT '" + GFT.Constants.DEFAULT_GUILD + "', " +
												"lastupdate DATETIME DEFAULT (strftime('%s', 'now')))");
		}	
		
		try { dbConn.executeSimpleSQL("SELECT myid, activated FROM myinfo"); }
		catch (e) {
			//Create pinfo database
			console.debug("Debug[createDB()]: Creating table myinfo...");
			dbConn.executeSimpleSQL("DROP TABLE IF EXISTS myinfo;" +
												"CREATE TABLE myinfo (" +
												"myid INTEGER NOT NULL," +
												"activated INTEGER DEFAULT 0)");
		}			
		
		try { dbConn.executeSimpleSQL("SELECT oid, inwar FROM oinfo"); }
		catch (e) {
			//Create pinfo database
			console.debug("Debug[createDB()]: Creating table oinfo...");
			dbConn.executeSimpleSQL("DROP TABLE IF EXISTS oinfo; " +
												"CREATE TABLE oinfo (" +
												"oid INTEGER NOT NULL, " +
												"inwar INTEGER DEFAULT 0)");
		}
		
		try {dbConn.executeSimpleSQL("SELECT battleid, myid, oid, atype, atime FROM battles");}
		catch (e) {
			//Create battles database
			//atype: a bit showing if I'm atacking or defending (value 1 if atacking, 0 if defending)
			console.debug("Debug[createDB()]: Creating table battles...");
			dbConn.executeSimpleSQL("DROP TABLE IF EXISTS battles; " +
												"CREATE TABLE battles (" +
												"battleid INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, " +
												"myid INTEGER NOT NULL , " +
												"oid INTEGER NOT NULL, " +
												"atype INTEGER DEFAULT 1, " +
												"atime DATETIME DEFAULT (strftime('%s', 'now')))");
		}
		
		//database updates for GFT v1.5
 		try {dbConn.executeSimpleSQL("SELECT location FROM battles");}
		catch (e) {
			console.debug("Debug[createDB()]: Adding column battles.location ...");
			dbConn.executeSimpleSQL("ALTER TABLE battles ADD location INTEGER NOT NULL DEFAULT(0)");
		} 
		
		try {dbConn.executeSimpleSQL("SELECT battleid, beid, winnerid, gold, exp FROM reports");}
		catch (e) {
			//Create battles database
			console.debug("Debug[createDB()]: Creating table reports...");
			dbConn.executeSimpleSQL("DROP TABLE IF EXISTS reports; " +
												"CREATE TABLE reports (" +
												"battleid INTEGER NOT NULL, " +
												"beid INTEGER NOT NULL, " +
												"winnerid INTEGER NOT NULL, " +
												"gold INTEGER DEFAULT 0, " +
												"exp INTEGER DEFAULT 0)");
		}
		
		try {
			// check if tables exists
			dbConn.executeSimpleSQL("SELECT myid FROM myinfo");
			dbConn.executeSimpleSQL("SELECT oid FROM oinfo");
			dbConn.executeSimpleSQL("SELECT battleid FROM battles");
			dbConn.executeSimpleSQL("SELECT battleid FROM reports");
			console.log("[createDB()]: DB was successful intialized...");
		} catch (e) {utils.reportError("Could not create the database", e);}
	};
	
	var insertBattleDetails = function(battleid, report) {
		console.debug("[insertBattleDetails()]: battleid: " + battleid 
						+ ", beid: " + report.getRepId() + ", winnerid: " + report.getWinner() + ", gold: " + report.getRaisedGold() + ", exp:" + report.getRaisedExp());
		try {
			checkConnection();
			var winnerId = -1;
			if(report.isArenaReport()) {
				winnerId = getPlayerId(report.getWinner(), report.getServer(), "pid");
			} else {
				winnerId = getPlayerId(report.getWinner(), report.getServer(), "name");
			}
			if(winnerId < 0) {
				winnerId = 0; // battle result was equal
				//throw "Cannot find the winner id. No data stored for the winner gladiator!";
			}
			
			var oStatement = dbConn.createStatement("INSERT INTO reports (battleid, beid, winnerid, gold, exp) " + 
															"VALUES (:p_battleid , :p_beid, :p_winnerid, :p_gold, :p_exp)");
			oStatement.params.p_battleid = battleid;
			oStatement.params.p_beid = report.getRepId();
			oStatement.params.p_winnerid = winnerId;
			oStatement.params.p_gold = report.getRaisedGold();
			oStatement.params.p_exp = report.getRaisedExp();
			oStatement.execute();
			oStatement.reset();
			
			return true;
		} catch (e) {utils.reportError("Could not insert battle details.", e);}
		return false;
	};
	
	var deleteLastBattle = function(battleid) {
		console.debug("[deleteLastBattle()]: Rolling back...");
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("DELETE FROM battles WHERE battleid=:battle_id");
			oStatement.params.battle_id = battleid;
			oStatement.execute();
			oStatement.reset();
		} catch (e) {utils.reportError("DB query failed. Could not roll back changes for last battle.", e);}		
	};
	
	var getLastBattleId = function() {
		console.debug("[getLastBattleId()]");
		var bid = -1;
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT max(battleid) as LastBattleId from battles");
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.LastBattleId, -1);
			}
			oStatement.reset();
			bid = resultSet.uniqueResult();
		} catch (e) {utils.reportError("Could not select last battleid", e);}
			
		return bid;
	};

	var getMyId = function(server) {
		console.debug("[getMyId()]: Server - " + server);
		var id = -1;
		
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT myid FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
			oStatement.params.p_server = server;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.myid, -1);
			}
			oStatement.reset();
			id = resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not select myid for " + server, e);}
		
		return id;
	};
	
	var getLastPlayerId = function() {
		console.debug("[getLastPlayerId()]");
		var apid = -1;		
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT max(apid) as LastBattleId from player");
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.LastBattleId, -1);
			}
			oStatement.reset();
			apid = resultSet.uniqueResult();
		} catch (e) {utils.reportError("Could not select last battleid", e);}
		return apid;
	};

	/**
	* returns the intern  db player id
	* @param identifier  - pid or name
	* @param by - string with value 'pid' or 'name'
	* @param server - the server played on
	*/	
	var getInternId = function(identifier, server, by) {
		console.debug("[getInternId()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		var id = -1;
		if(by == "pid" && identifier < 0) {
			return id;
		}	
		try {
			checkConnection();
			var query = "SELECT apid FROM player where " + by + "=:identifier AND server=:p_server";	
			var oStatement = dbConn.createStatement(query);
			oStatement.params.identifier = identifier;
			oStatement.params.p_server = server;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.apid, -1);
			}
			oStatement.reset();
			id = resultSet.uniqueResultOrNull();
			if(id == null) {
				return -1;
			}
		} catch (e) {utils.reportError("DB query failed. Could not select apid for " + identifier + " at "+ server, e);}
		
		return id;
	};
	
	var getPlayerId = function(identifier, server, by) {
		console.debug("[getPlayerId()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		return getInternId(identifier, server, by);
	};
	
	var getGladiatorId = function(gladiator, server) {
		console.debug("[getGladiatorId()]: Gladiator: " + gladiator.toString());
		console.debug("[getGladiatorId()]: Searching intern id by pid...");
		var apid = getInternId(gladiator.getId(), server, "pid");
		if(apid < 0) {
			console.debug("[getGladiatorId()]: Invalid id. Searching intern id by name...");
			apid = getInternId(gladiator.getName(), server, "name");			
		}
		console.debug("[getGladiatorId()]: Return value: " + apid);
		return apid;
	};
	
	var insertPlayer = function(server, gladiator) {
		console.debug("[insertPlayer()]: Server: " + server + ", Player: " + gladiator.toString());
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("INSERT INTO player (pid, name, server, level, guild) " +  
															"VALUES (:p_id , :p_name, :p_server, :p_level, :p_guild)");
			oStatement.params.p_id = gladiator.getId();
			oStatement.params.p_name = gladiator.getName();
			oStatement.params.p_server = server;
			oStatement.params.p_level = gladiator.getLevel();
			oStatement.params.p_guild = gladiator.getGuild();
			oStatement.execute();
			oStatement.reset();
			var apid = getGladiatorId(gladiator, server);
			if(apid < 0) {
				throw new Error("Error occurs while trying to insert player data.");
			}			
			return apid;
		} catch (e) {utils.reportError("Could not insert player data\nServer: " + server + ", Player: " + gladiator.toString(), e);}
	};	

	var updatePlayer = function(apid, gladiator) {
		console.debug("[updatePlayer()]: apid: " + apid + "\nGladiator: " + gladiator.toString());
		try 
		{
			checkConnection();
			var oStatement = dbConn.createStatement("UPDATE player SET pid=:p_pid, name=:p_name, level=:p_level, guild=:p_guild, lastupdate=:last_update where apid=:a_pid");
			oStatement.params.a_pid = apid;
			oStatement.params.p_pid = gladiator.getId();
			oStatement.params.p_name = gladiator.getName();
			oStatement.params.p_level = gladiator.getLevel();
			oStatement.params.p_guild = gladiator.getGuild();
			oStatement.params.last_update = Math.round((utils.getTime()/1000));
			oStatement.execute();
			oStatement.reset();
			return apid;
		} catch (e) {utils.reportError("Could not update player \nPlayer: " + gladiator.toString(), e);}	
	};

	var deletePlayer = function(pid, server) {
		console.debug("[deletePlayer()]: pid: " + pid + ", server: " + server);
		try {
			checkConnection();
			var apid = getPlayerId(pid, server, "pid");
			if(apid < 0) {
				console.log("[deletePlayer()]: The player doesn't exists.");
				return;
			}
			
			var oStatement = dbConn.createStatement("DELETE FROM oinfo WHERE oid=:a_pid");
			oStatement.params.a_pid = apid;
			oStatement.execute();
			oStatement.reset();
			
			oStatement = dbConn.createStatement("DELETE FROM player WHERE apid=:a_pid");
			oStatement.params.a_pid = apid;
			oStatement.execute();
			oStatement.reset();
		} catch (e) {utils.reportError("DB query failed. Could not delete " + server + " - " + pid, e);}
	};
	
	var insertEnemy = function(apid, inwar) {
		console.debug("[insertEnemy()]: Server: " + server + ", Player pid: " + pid + ", inwar: " + inwar);
		try {
			checkConnection();			
			var oStatement = dbConn.createStatement("INSERT INTO oinfo (oid, inwar) VALUES (:a_pid, :p_inwar)");
			oStatement.params.a_pid = apid;
			oStatement.params.p_inwar = inwar;
			oStatement.execute();
			oStatement.reset();
		} catch (e) {utils.reportError("Could not insert player data\nServer: " + server + ", Player: " + gladiator.toString() + ", inwar: " + inwar, e);}
	};
	
	var enemyExists = function(apid) {
		console.debug("[checkIfEnemy()]: pid: " + pid + ", server: " + server + ", value: " + value);
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT inwar from oinfo where oid=:a_pid");
			oStatement.params.a_pid = apid;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.inwar);
			}
			oStatement.reset();
			return resultSet.uniqueResultOrNull() != null;
		} catch (e) {utils.reportError("Could not check enemy status.", e);}
		return false;
	};

	/* ----------- DB PRIVATE UTILITIES FUNCTIONS ----------- */ 
	
	var checkConnection = function() {
		if (!dbConn) {
			throw new Error("No connection to the database! Please restart your browser!");
		}
	};
	
	var isEmpty = function(str) {
		return !str || str == "";
	};
	
	var periodToNumber = function(period) {
		switch (period) {
			case "oneday":		return ONE_DAY;
			case "twodays":		return TWO_DAYS;
			case "threedays":	return THREE_DAYS;
			case "fourdays":	return FOUR_DAYS;
			case "fivedays":	return FIVE_DAYS;
			case "sixdays":		return SIX_DAYS;
			case "oneweek":		return ONE_WEEK;
			case "onemonth":	return ONE_MONTH;
			default: return period;
		}
	};
	
	var getDayPeriodInSec = function(amount) {
		return amount * ONE_DAY_IN_SEC;
	};
	
	var getTimePeriod = function(period) {
		console.debug("[getTimePeriod()]: period: " + period);
		if(period == "none") {
			return ZERO;
		}
		
		var now = utils.getGMTTime();
		return now - getDayPeriodInSec(periodToNumber(period));
	};
	
	var getStartOfDay = function() {
		var startOfDay;
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT strftime('%s', date('now', 'start of day')) as StartOfDay");
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.StartOfDay, 0);
			}
			oStatement.reset();
			startOfDay = resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not get start of the day", e);}
		return startOfDay;
	};
	
	var getDiffStartOfDayToNow = function() {
		var now = Math.round((utils.getTime()/1000)) - utils.getTimeZoneOffset(true);
		return now - getStartOfDay();
	};
	
	/**
	 * Returns difference in seconds within custom period of time using start of day strategy
	 */
	var getStartOfDayToCustom = function(period) {
		if(period == "none") {
			return ZERO;
		}
		var now = Math.round((utils.getTime()/1000)) - utils.getTimeZoneOffset(true);
		
		return now - (getDayPeriodInSec(periodToNumber(period)-1) + getDiffStartOfDayToNow());
	};
	
	var getPeriodRespectingStrategy = function(period) {
		var strategy = prefMan.getValue("options.tabs.main.bashing.strategy", "startOfDay");
		var period;
		if(strategy == "startOfDay") {
			period =  getStartOfDayToCustom(period); 
		} else {
			period =  getTimePeriod(period);
		}
		console.debug("Search period is: " + period);
		return period;
	};
	
	/* ----------- DB PUBLIC FUNCTIONS  ----------- */ 

	this.init = function() {
		try {
			checkConnection();
		} catch(ex) {
			try {
				var oFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
				oFile.append("gft.sqlite");
				var oStorageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
				dbConn = oStorageService.openDatabase(oFile);
				createDB();
			} catch(ex1) {
				utils.reportError("Could not initialize database!", ex1);
			}
		}
	};
	
	/**
	   * @param location - 0 if the battle was made on the arena, 1 on circus turma
	   */
	this.insertBattle = function(gladiator, report, atype) {
		console.debug("[insertBattle()]: Report: " + report.toString());
		try {
			checkConnection();
			var oid = getGladiatorId(gladiator, report.getServer());
			if(oid < 0) {
				oid = insertPlayer(report.getServer(), gladiator);
				if(oid < 0) {
					throw new Error("Cannot insert battle. Opponent doesn't exists in the database!");
				}
			}
			
			var myid = getMyId(report.getServer());
			var battleTime = report.getBattleTime();
			var location = (report.isArenaReport() ? 0 : 1);
			var oStatement = dbConn.createStatement("INSERT INTO battles (myid, oid, atype, atime, location) " + 
															"VALUES (:my_id , :o_id, :a_type, :a_time, :loc)");
			oStatement.params.my_id = myid;
			oStatement.params.o_id = oid;
			oStatement.params.a_type = atype;
			oStatement.params.a_time = battleTime;
			oStatement.params.loc = location;
			oStatement.execute();
			oStatement.reset();
			
			var battleid = getLastBattleId();
			var ret = false;
			if(battleid && battleid > -1) {
				ret = insertBattleDetails(battleid, report);
				if(ret) {
					console.log("[insertBattle]: Battle was stored successful.");
				} else {
					deleteLastBattle(battleid);
				}
			} else {
				throw new Error("Battle report cannot be inserted.\nPlease try to open the battle report again or report this error!");
			}
			return ret;
		} catch (e) {utils.reportError("Could not insert battle log", e); return false;}
		return false;
	};

	this.battleExists = function(repid, server) {
		console.debug("[battleExists()]: repid: " + repid + ", server: " + server);
		
		var rExists = false;
		try {
			checkConnection();
			// returns if the report repid for pid exists
			var oStatement = dbConn.createStatement("SELECT battles.battleid FROM myinfo " +
															"INNER JOIN player ON myinfo.myid = player.apid " +
															"INNER JOIN battles ON myinfo.myid = battles.myid " +
															"INNER JOIN reports ON battles.battleid = reports.battleid " +																
															"where reports.beid = :report_id AND player.server = :p_server");
			//oStatement.params.p_id = pid;
			oStatement.params.report_id = repid;
			oStatement.params.p_server = server; 
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.battleid, -1);
			}
			oStatement.reset();
			
			rExists = resultSet.uniqueResultOrNull() != null;
			
		} catch (e) {utils.reportError("DB query failed. Could not check if the report(" +repid + ") on server " + server + " exists", e);}
		
		return rExists;
	};

	/**
	* returns the first battle time for specific opponent referenced by pid or name for the last 24h
	* @param identifier  - value of pid or name
	* @param by - string with value 'pid' or 'name'
	* @param server - the server played on
	* @return firstBattleInLastDay - first battle time in last day, otherwise -1
	*/		
	this.getFirstBattleInLastDay = function(identifier, server, by) {
		console.debug("[getFirstBattleInLastDay()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		var firstBattleInLastDay = -1;
		try {
			checkConnection();
			var oid = getPlayerId(identifier, server, by);
			var myid = getMyId(server);
			
			if(oid < 0) {
				console.log("[getFirstBattleInLastDay()]: Opponent doesn't exists in the DB.");
				return firstBattleInLastDay;
			}
			// returns the first battle time in last 24h 
			var oStatement = dbConn.createStatement("SELECT min(atime) as FirstBattle FROM battles where myid=:my_id AND oid=:o_id AND atype=1 AND atime >= :b_time");
			oStatement.params.my_id = myid;
			oStatement.params.o_id = oid;
			oStatement.params.b_time = getPeriodRespectingStrategy("oneday");
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.FirstBattle, -1);
			}
			oStatement.reset();
			firstBattleInLastDay = resultSet.uniqueResult();
		}
		catch (e) {utils.reportError("DB query failed. Could not select first battle for last day", e);}
		return firstBattleInLastDay;
	};
	
	/**
	* returns the last battle time for specific opponent referenced by pid or name for the last 24h
	* @param identifier  - value of pid or name
	* @param by - string with value 'pid' or 'name'
	* @param server - the server played on
	* @return firstBattleInLastDay - first battle time in last day, otherwise -1
	*/			
	this.getLastBattleInLastDay = function(identifier, server, by) {
		console.debug("[getLastBattleInLastDay()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
			
		var lastBattleInLastDay = -1;
		try {
			checkConnection();
			var oid = getPlayerId(identifier, server, by);
			var myid = getMyId(server);
			if(oid < 0) {
				console.log("[getLastBattleInLastDay()]: Opponent doesn't exists in the DB.");
				return lastBattleInLastDay;
			}
			
			// returns the first battle time in last 24h 
			var oStatement = dbConn.createStatement("SELECT max(atime) as LastBattle FROM battles where myid=:my_id AND oid = :o_id AND atype=1 AND atime >= :b_time");
			oStatement.params.my_id = myid;
			oStatement.params.o_id = oid;
			oStatement.params.b_time = getPeriodRespectingStrategy("oneday");
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.LastBattle, -1);
			}
			oStatement.reset();
			lastBattleInLastDay = resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not select last battle for last day", e);}
		
		return lastBattleInLastDay;
	};
	
	this.getMyPid = function(server) {
		console.debug("[getMyPid()]: Server - " + server);
		var id = -1;
		
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT pid FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
			oStatement.params.p_server = server;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.pid, -1);
			}
			oStatement.reset();
			id = resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not select myid for " + server, e);}
		
		return id;	
	};

	this.getMyName = function(server) {
		console.debug("[getMyName()]: Server - " + server);
		var name = -1;
		
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT name FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
			oStatement.params.p_server = server;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.name, "");
			}
			oStatement.reset();
			name = resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not select myid for " + server, e);}
		
		return name;	
	};
	
	this.getGladiator = function(value, server, by) {
		console.debug("[getNameForPid()]: value: " + value + ", server: " + server + ", by: " + by);
		try {
			checkConnection();
			var oid = getPlayerId(value, server, by);

			var oStatement = dbConn.createStatement("SELECT pid, name, level, guild FROM player where apid = :o_id");
			oStatement.params.o_id = oid;
			
			var resultSet = new GFT.ResultSet();
			var gladiator = new GFT.Gladiator();
			while (oStatement.executeStep()) {
				gladiator.setId(oStatement.row.pid);
				gladiator.setName(oStatement.row.name);
				gladiator.setGuild(oStatement.row.guild);
				gladiator.setLevel(oStatement.row.level);
				resultSet.add(gladiator);
			}
			oStatement.reset();
			console.debug("[getGladiator()]: Gladiator: " + gladiator.toString());
			
			return resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not get name for pid " + pid, e);}
		return null;
	};
	
	this.getMyGladiator = function(server) {
		return this.getGladiator(this.getMyPid(server), server, "pid");
	};
	
	this.isGladiatorInfoOutOfDate = function(server, gladiator, period) {
		var result = {needUpdate: true, lastUpdate: null, exists: false, incomplete: true, apid: -1};
		try {
			checkConnection();
			var apid = getGladiatorId(gladiator, server);
			
			var oStatement = dbConn.createStatement("SELECT pid, lastupdate from player where apid=:a_pid");
			oStatement.params.a_pid = apid;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.addById("pid", oStatement.row.pid);
				resultSet.addById("lastupdate", oStatement.row.lastupdate);
			}
			oStatement.reset();
			
			var pid = resultSet.getById("pid", -1);
			result.apid = apid;
			result.lastUpdate = resultSet.getById("lastupdate", null);			
			
			if(!result.lastUpdate) {
				result.needUpdate = true;
				result.exists = false;
				result.incomplete = true;
			} else if (result.lastUpdate < getTimePeriod(period) || pid < 0) {
				result.needUpdate = true;
				result.exists = true;
				result.incomplete = true;
			} else {
				result.needUpdate = false;
				result.exists = true;
				result.incomplete = false;
			}
		} catch (e) {utils.reportError("DB query failed. Could not get gladiator update information", e); return result;}
		return result;;
	};
	
	/**
	   * Updates player data or inserts new entry in the database if the player doesn't exists.
	   * @return - returns gladiators intern id if information exists, otherwise -1
	   */
	this.updatePlayerData = function(server, gladiator) {	
		//params: pid, pname, server, plevel, pguild
		console.debug("[updatePlayerData()]: Server: " + server + "\nGladiator: " + gladiator.toString());
		
		var info = this.isGladiatorInfoOutOfDate(server, gladiator, "oneday");
		
		if(!info.exists) {
			console.log("[updatePlayerData()]: Inserting data for " + gladiator.getName() + " [" + gladiator.getId() + "] - " + server);
			return insertPlayer(server, gladiator);
		} else if (info.needUpdate || info.incomplete) {
			if(this.getMyPid(server) == gladiator.getId() && gladiator.getGuild() == GFT.Constants.DEFAULT_MY_GUILD) {
				console.log("[updatePlayerData()]: Skipping update for my gladiator " + gladiator.getName() + " [" + gladiator.getId() + "] - " + server);
				return info.apid;
			}
			console.log("[updatePlayerData()]: Updating data for " + gladiator.getName() + " [" + gladiator.getId() + "] - " + server);
			updatePlayer(info.apid, gladiator);
		} else {
			console.log("[updatePlayerData()]: Skipping update for " + gladiator.getName() + " [" + gladiator.getId() + "] - " + server);
		}
		return info.apid;;
	};
	
	this.isInWar = function(value, server, by) {
		console.debug("[isInWar()]: value: " + value + ", server: " + server + ", by: " + by);
		try {
			checkConnection();
			var oid = getPlayerId(value, server, by);
			var	oStatement = dbConn.createStatement("SELECT oinfo.inwar FROM oinfo where oinfo.oid=:o_id");
			oStatement.params.o_id = oid;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.inwar, -1);
			}
			oStatement.reset();
			var inwar = resultSet.uniqueResult();
			
			if(inwar == 1) { return true; }
			
		} catch (e) {utils.reportError("DB query failed. Could not determine if there is a war with " + value, e); return false;}
		return false;		
	};
	
	this.updateEnemyStatus = function(pid, server, inwar) {
		console.debug("[updateEnemyStatus()]: pid: " + pid + ", server: " + server + ", value: " + value);
		try {
			checkConnection();
			var apid = getPlayerId(pid, server, "pid");
			if(!enemyExists()) {
				insertEnemy(apid, inwar);
			} else {
				var oStatement = dbConn.createStatement("UPDATE oinfo SET inwar=:p_inwar where oid=:a_pid");
				oStatement.params.a_pid = apid;
				oStatement.params.p_inwar = inwar;
				oStatement.execute();
				oStatement.reset();
			}
		} catch (e) {utils.reportError("Could not switch war " + ((value == 1) ? "on" : "off") + " for " + pid + " on server " + server, e);}	
	};

	this.insertMyData = function(server, gladiator, activated) {
		console.debug("[insertMyData()]: Server: " + server + ", Player: " + gladiator.toString() + ", activated: " + activated);
		try {
			checkConnection();
			var apid = this.updatePlayerData(server, gladiator);
			
			var oStatement = dbConn.createStatement("INSERT INTO myinfo (myid, activated) VALUES (:a_pid, :p_activated)");
			oStatement.params.a_pid = apid;
			oStatement.params.p_activated = activated;
			oStatement.execute();
			oStatement.reset();
		} catch (e) {utils.reportError("Could not insert player data\nServer: " + server + ", Player: " + gladiator.toString(), e);}
	};
	
	/**
	* returns the number of battles for identifier (pid or name) within user defined period
	* @param identifier  - pid or name
	* @param by - string with value 'pid' or 'name'
	* @param atype - 1 atack over opponent, 0 defence from opponent
	* @return n_battles - number of battles within specified period,  0 otherwise
	*/	
	this.getNumberOfBattlesWithin = function(identifier, server, by, atype, period) {
		console.debug("[getNumberOfBattlesWithin()]: identifier: " + identifier + ", server: " + server + ", by: " + by + ", atype: " + atype + ", period: " + period);
		var n_battles = 0;
		try {
			checkConnection();
			var oid = getPlayerId(identifier, server, by);
			
			// precondition: addon should be activated for this server
			var myid = getMyId(server);
			
			if(oid < 0) {
				console.log("[getNumberOfBattlesWithin()]: Opponent doesn't exists in the DB.");
				console.debug("MyID: " + myid + ", OID: " +oid);
				return 0;
			}
			
			var oStatement = dbConn.createStatement("SELECT count(battleid) AS nBattles from battles " + 
															"WHERE myid=:my_id AND oid=:o_id AND atype=:a_type AND atime >= :b_time");
			oStatement.params.my_id = myid;
			oStatement.params.o_id = oid;
			oStatement.params.a_type = atype;
			oStatement.params.b_time = getPeriodRespectingStrategy(period);
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.nBattles, 0);
			}
			oStatement.reset();
			n_battles = resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not select battles for period", e);}
		
		return n_battles;
	};
	
	this.isServerActive = function(server) {
		console.debug("[isServerActive()]: Server - " + server);
		
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT activated FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
			oStatement.params.p_server = server;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.activated, -1);
			}
			oStatement.reset();
			var active = resultSet.uniqueResultOrNull();
			if(active != null && active > 0) { return true; }
			
		} catch (e) {utils.reportError("DB query failed. Could not select myid for " + server, e);}
		
		return false;		
	};
	
	this.getAllActiveServers = function() {
		var servers;
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT distinct(server) as activeServer FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where myinfo.activated = 1");
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.activeServer);
			}
			oStatement.reset();
			servers = resultSet.getResults();
			
			console.log("Active servers count: " + servers.length);			
		} catch (e) {utils.reportError("DB query failed. Could not select active servers.", e);}
		return servers;	
	};

	this.getMyGuild = function(server) {
		console.debug("[getMyGuild()]: Server - " + server);
		var guild = GFT.Constants.DEFAULT_MY_GUILD;
		
		try {
			checkConnection();
			var oStatement = dbConn.createStatement("SELECT guild FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
			oStatement.params.p_server = server;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.guild, GFT.Constants.DEFAULT_MY_GUILD);
			}
			oStatement.reset();
			guild = resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not select myid for " + server, e);}
		
		return guild;	
	};

	this.getMyStats = function(server, period, atype, location) {
		console.debug("[getMyStats()]: server: " + server + ", period: " + period + ", atype: " + atype + ", loc code: " + location);
		
		try {
			checkConnection();
			var myid = getMyId(server);
			var unixTime = getPeriodRespectingStrategy(period);
			var query = "select count(b.battleid) as attacks, sum(r.gold) as goldRaised, sum(r.exp) as expRaised, max(r.gold) as maxGoldRaised, max(b.aTime) as lastAttackTime,"
					+ "(SELECT count(b1.battleid) from reports r inner join battles b1 on r.battleid=b1.battleid WHERE r.winnerid = :winner_id AND b1.atime > :period and b1.atype = :a_type"
					+ ((location >= 0) ? " and b1.location = " + location : "")  + ") as battlesWon"
					+ " from battles b inner join reports r on b.battleid = r.battleid"
					+ " where b.atime > :period  and b.atype = :a_type and b.myid = :winner_id" + ((location >= 0) ? " and b.location = " + location : "");
			var oStatement = dbConn.createStatement(query);
			oStatement.params.winner_id = myid; 
			oStatement.params.period = unixTime; 
			oStatement.params.a_type = atype; 
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(new GFT.StatsView(oStatement.row.attacks,
												oStatement.row.goldRaised,
												oStatement.row.maxGoldRaised,
												oStatement.row.expRaised,
												oStatement.row.battlesWon,
												oStatement.row.lastAttackTime));
			}
			oStatement.reset();
			return resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not get my stats for server " + server, e);}
	};
	
	this.getEnemyStats = function(value, server, by, period, atype, location) {
		console.debug("[getEnemyStats()]: value: " + value + ", server: " + server + ", by: " + by + ", period: " + period + ", atype: " + atype + ", loc code: " + location);	

		try {
			checkConnection();
			var myid = getMyId(server);
			var oid = getPlayerId(value, server, by);
			var unixTime = getPeriodRespectingStrategy(period);
			
			var query = "select count(b.battleid) as attacks, sum(r.gold) as goldRaised, sum(r.exp) as expRaised, max(r.gold) as maxGoldRaised, max(b.aTime) as lastAttackTime,"
					+ " (SELECT count(b1.battleid) from reports r inner join battles b1 on r.battleid=b1.battleid WHERE r.winnerid = :my_id and b1.oid = :o_id AND b1.atime > :period and b1.atype = :a_type"
					+ ((location >= 0) ? " and b1.location = " + location : "")  + ") as battlesWon" 
					+ " from player p inner join battles b on p.apid=b.oid inner join reports r on b.battleid = r.battleid"
					+ " where b.atime > :period and b.atype = :a_type and b.myid = :my_id and b.oid = :o_id" + ((location >= 0) ? " and b.location = " + location : "");						
			var oStatement = dbConn.createStatement(query);
			oStatement.params.my_id = myid; 
			oStatement.params.o_id = oid; 
			oStatement.params.period = unixTime; 
			oStatement.params.a_type = atype; 
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(new GFT.StatsView(oStatement.row.attacks,
												oStatement.row.goldRaised,
												oStatement.row.maxGoldRaised,
												oStatement.row.expRaised,
												oStatement.row.battlesWon,
												oStatement.row.lastAttackTime));
			}
			oStatement.reset();
			return resultSet.uniqueResult();				
		} catch (e) {utils.reportError("DB query failed. Could not get enemy stats for pid " + value, e);}
	};
		
	this.getOpponentsWithCriteria = function(period, orderBy, orderDirection, name, lowLevel, highLevel, server, location, excludeAllies, attackType) {
		console.debug("[getOpponentsWithCriteria()]: period: " + period 
													+ ", orderBy: " + orderBy 
													+ ", orderDirection: " + orderDirection 
													+ ", level low: " + lowLevel 
													+ ", level high: " + highLevel 
													+ ", player: " + name 
													+ ", server: " + server
													+ ", location: " + location
													+ ", excludeAllies: " + excludeAllies);
		
		var loc = "";
		if(location != "location-all") {
			loc = "and b.location = " + location;
		}
		
		var unixTime = getPeriodRespectingStrategy(period);
		var select = "select pid as rPid, name as rName, guild as rGuild, level as rLevel, server as rServer, a.attacks as rAttacks, d.defenses as rDefenses, a.goldRaised as rGoldRaised, d.goldLost as rGoldLost, a.maxGoldRaised as rMaxGoldRaised, d.maxGoldLost as rMaxGoldLost, a.expRaised as rExpRaised, a.lastAttackTime as rLastAttackTime"
		+ " from";
		var attacksTable = " (select p.pid, p.apid, p.name, p.guild, p.level, p.server, b.atime as aTime, b.location, count(b.battleid) as attacks, sum(r.gold) as goldRaised, sum(r.exp) as expRaised, max(r.gold) as maxGoldRaised, max(b.aTime) as lastAttackTime"
		+ " from player p inner join battles b on p.apid=b.oid inner join reports r on b.battleid = r.battleid where b.atype=1 and b.atime > " + unixTime + " " + loc + " group by b.oid) a";
		var leftJoin = " left join";
		var defensesTable = " (select p.pid, p.apid, p.name, p.guild, p.level, p.server, b.atime as aTime, b.location, count(b.battleid) as defenses, sum(r.gold) as goldLost, max(r.gold) as maxGoldLost"
		+ " from player p inner join battles b on p.apid=b.oid inner join reports r on b.battleid = r.battleid where b.atype=0 and b.atime > " + unixTime + " " + loc + " group by b.oid) d";
		var joinOn =  " on d.apid = a.apid";
		var whereClause = " where aTime > " + unixTime;
		
		var query1 = select.replace("pid", "a.pid").
							replace("name", "a.name").
							replace("guild", "a.guild").
							replace("level", "a.level").
							replace("server", "a.server")
							+ attacksTable + leftJoin + defensesTable + joinOn
							+ whereClause.replace("aTime", "a.aTime");
		var query2 = select.replace("pid", "d.pid").
							replace("name", "d.name").
							replace("guild", "d.guild").
							replace("level", "d.level").
							replace("server", "d.server") 
							+ defensesTable + leftJoin + attacksTable + joinOn 
							+ whereClause.replace("aTime", "d.aTime");

		if(!isEmpty(lowLevel)) {
			query1 +=  " and a.level > " + lowLevel;
			query2 +=  " and d.level > " + lowLevel;
		}
		
		if(!isEmpty(highLevel)) {
			query1 +=  " and a.level < " + highLevel;
			query2 +=  " and d.level < " + highLevel;
		}
		
		if(!isEmpty(name)) {
			query1 += " and a.name LIKE '%" + name + "%'";
			query2 += " and d.name LIKE '%" + name + "%'";
			
		}

		if(location != "location-all") {
			query1 += " and a.location = " + location;
			query2 += " and d.location = " + location;
			
		}
		
		if(excludeAllies) {
			query1 += " and a.guild not in (SELECT guild FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where guild <> '" + GFT.Constants.DEFAULT_MY_GUILD + "')";
			query2 += " and d.guild not in (SELECT guild FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where guild <> '" + GFT.Constants.DEFAULT_MY_GUILD + "')";			
		}	
		
		if(!isEmpty(server) && server != "allServers") {
			query1 += " and a.server = '" + server + "'";
			query2 += " and d.server = '" + server + "'";		
		}
		var orderByClause = " order by " + orderBy + " " + orderDirection; 
		
		var query =  query2 + " UNION " + query1;
		
		if(attackType == "atype-offense") {
			query = query1 + orderByClause;
		} else if(attackType == "atype-defense") {
			query = query2 + orderByClause;
		} else {
			query =  query2 + " UNION " + query1 + orderByClause;
		}
		
		console.debug("[getOpponentsWithCriteria()]: Query = \"" +  query + "\"");
		var result;
		try {
			checkConnection();
			var oStatement = dbConn.createStatement(query);
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(new GFT.DBPlayerData(oStatement.row.rPid,
												oStatement.row.rName,
												oStatement.row.rGuild,
												oStatement.row.rLevel,
												oStatement.row.rServer,
												oStatement.row.rAttacks,
												oStatement.row.rDefenses,
												oStatement.row.rGoldRaised,
												oStatement.row.rGoldLost,
												oStatement.row.rMaxGoldRaised,
												oStatement.row.rMaxGoldLost,
												oStatement.row.rExpRaised,
												oStatement.row.rLastAttackTime));
			}
			oStatement.reset();
			result = resultSet.getResults();
		} catch (e) {utils.reportError("DB query failed. Could not get opponents list with custom criteria.", e);}
		return result;
	};
	
	this.getAllAtacksSinceTodayAndDefDaysBack = function(days, server, location) { // find better name
		console.debug("[getAllAtacksSinceTodayAndDefDaysBack()]: days: " + days + ", server: " + server + ", loc code: " + location);

		var n_battles = -1;
		try {
			checkConnection();
			var myid = getMyId(server);
			var oStatement = dbConn.createStatement("SELECT count(battleid) AS nBattles from battles " 
												+ " where myid=:my_id AND atime > (strftime('%s', date('now', 'start of day')) - :b_time)"
												+ ((location >= 0) ? " and location = " + location : ""));
			oStatement.params.my_id = myid;
			oStatement.params.b_time = getDayPeriodInSec(days);
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add(oStatement.row.nBattles, -1);
			}
			oStatement.reset();
			n_battles = resultSet.uniqueResult();
		} catch (e) {utils.reportError("DB query failed. Could not compute the atacks since start of the day and " + days + " days back.", e);}
		return n_battles;
	};
	
	this.getWinChance = function(pid, server, location) {
		console.debug("[getWinChance()]: pid: " + pid + ", server: " + server + ", loc code: " + location);
		
		try {
			checkConnection();
			var myid = getMyId(server);
			var oid = getPlayerId(pid, server, "pid");
			var oStatement = dbConn.createStatement("SELECT count(b.battleid) as battlesWon,"
												+ " (select count(battleid) from battles where oid=:o_id"
												+ ((location >= 0) ? " and location = " + location : "") + ") as allBattles"
												+ " from reports r inner join battles b on r.battleid=b.battleid"
												+ " WHERE r.winnerid=:my_id AND b.oid=:o_id"
												+ ((location >= 0) ? " and b.location = " + location : ""));
			oStatement.params.my_id = myid;
			oStatement.params.o_id = oid;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add([oStatement.row.battlesWon, oStatement.row.allBattles]);
			}
			oStatement.reset();
			var result = resultSet.uniqueResult();
			
			var battlesWon = result[0];
			var allBattles = result[1];
			if(allBattles <= 0) { return "none"; }
			
			return (battlesWon/allBattles)*100;
		} catch (e) {utils.reportError("DB query failed. Could not compute win chance", e);}
		return "none";		
	};
	
	this.getLastDayWinChance = function(pid, server, location) {
		console.debug("[getLastDayWinChance()]: pid: " + pid + ", server: " + server + ", loc code: " + location);
		
		try {
			checkConnection();
			var myid = getMyId(server);
			var oid = getPlayerId(pid, server, "pid");
			var oStatement = dbConn.createStatement("SELECT count(b.battleid) as battlesWon," 
												+ " (select count(battleid) from battles where oid=:o_id and atime < strftime('%s', date('now', 'start of day'))"
												+ ((location >= 0) ? " and location = " + location : "") + ") as allBattles"
												+ " from reports r inner join battles b on r.battleid=b.battleid"
												+ " WHERE r.winnerid=:my_id AND b.oid=:o_id and b.atime < strftime('%s', date('now', 'start of day'))"
												+ ((location >= 0) ? " and b.location = " + location : ""));
			oStatement.params.my_id = myid;
			oStatement.params.o_id = oid;
			
			var resultSet = new GFT.ResultSet();
			while (oStatement.executeStep()) {
				resultSet.add([oStatement.row.battlesWon, oStatement.row.allBattles]);
			}
			oStatement.reset();
			var result = resultSet.uniqueResult();
			
			var battlesWon = result[0];
			var allBattles = result[1];			
			if(allBattles <= 0) { return "none"; }
			
			return (battlesWon/allBattles)*100;
		} catch (e) {utils.reportError("DB query failed. Could not compute last day win chance", e);}
		return "none";
	};
};