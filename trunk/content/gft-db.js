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

GFT.DB = {
	dbConn: null,
	console: GFT.Utils.console,
	
	init: function() 
	{
		if (!this.dbConn)
		{
			var oFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
			oFile.append("gft.sqlite");
			var oStorageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
			this.dbConn = oStorageService.openDatabase(oFile);
			this.createDB();

		}
	},
	
	createDB: function()
	{
		try { this.dbConn.executeSimpleSQL("SELECT apid, pid, name, server, level, guild, lastupdate FROM player"); }
		catch (e)
		{
			//Create pinfo database
			this.console.log("Debug[createDB()]: Creating table player...");
			this.dbConn.executeSimpleSQL("DROP TABLE IF EXISTS player;" +
												"CREATE TABLE player (" +
												"apid INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, " +
												"pid INTEGER NOT NULL, " +
												"name VARCHAR(30) NOT NULL, " +
												"server VARCHAR(40) NOT NULL, " +
												"level INTEGER NOT NULL, " +
												"guild VARCHAR(40) DEFAULT '#none#', " +
												"lastupdate DATETIME DEFAULT (strftime('%s', 'now')))");
		}	
		
		try { this.dbConn.executeSimpleSQL("SELECT myid, activated FROM myinfo"); }
		catch (e)
		{
			//Create pinfo database
			this.console.log("Debug[createDB()]: Creating table myinfo...");
			this.dbConn.executeSimpleSQL("DROP TABLE IF EXISTS myinfo;" +
												"CREATE TABLE myinfo (" +
												"myid INTEGER NOT NULL," +
												"activated INTEGER DEFAULT 0)");
		}			
		
		try { this.dbConn.executeSimpleSQL("SELECT oid, inwar FROM oinfo"); }
		catch (e)
		{
			//Create pinfo database
			this.console.log("Debug[createDB()]: Creating table oinfo...");
			this.dbConn.executeSimpleSQL("DROP TABLE IF EXISTS oinfo; " +
												"CREATE TABLE oinfo (" +
												"oid INTEGER NOT NULL, " +
												"inwar INTEGER DEFAULT 0)");
		}
		
		try {this.dbConn.executeSimpleSQL("SELECT battleid, myid, oid, atype, atime FROM battles");}
		catch (e)
		{
			//Create battles database
			//atype: a bit showing if I'm atacking or defending (value 1 if atacking, 0 if defending)
			this.console.log("Debug[createDB()]: Creating table battles...");
			this.dbConn.executeSimpleSQL("DROP TABLE IF EXISTS battles; " +
												"CREATE TABLE battles (" +
												"battleid INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, " +
												"myid INTEGER NOT NULL , " +
												"oid INTEGER NOT NULL, " +
												"atype INTEGER DEFAULT 1, " +
												"atime DATETIME DEFAULT (strftime('%s', 'now')))");
		}
		
		try {this.dbConn.executeSimpleSQL("SELECT battleid, beid, winnerid, gold, exp FROM reports");}
		catch (e)
		{
			//Create battles database
			this.console.log("Debug[createDB()]: Creating table reports...");
			this.dbConn.executeSimpleSQL("DROP TABLE IF EXISTS reports; " +
												"CREATE TABLE reports (" +
												"battleid INTEGER NOT NULL, " +
												"beid INTEGER NOT NULL, " +
												"winnerid INTEGER NOT NULL, " +
												"gold INTEGER DEFAULT 0, " +
												"exp INTEGER DEFAULT 0)");
		}
		
		try
		{
			// check if tables exists
			this.dbConn.executeSimpleSQL("SELECT myid FROM myinfo");
			this.dbConn.executeSimpleSQL("SELECT oid FROM oinfo");
			this.dbConn.executeSimpleSQL("SELECT battleid FROM battles");
			this.dbConn.executeSimpleSQL("SELECT battleid FROM reports");
			this.console.log("Debug[createDB()]: DB was successful intialized...");
		}
		catch (e) {alert("Could not create the database\n" + e);}
	},
	
	insertBattle: function(identifier, server, by, atype) 
	{
		this.console.log("Debug[insertBattle()]: Identifier: " + identifier + ", server: " + server + ", by: " + by + ", atype: " + atype);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(identifier, server, by);
			var myid = this.getMyId(server);
			try 
			{
				var oStatement = this.dbConn.createStatement("INSERT INTO battles (myid, oid, atype) " + 
																"VALUES (:my_id , :o_id, :a_type)");
				oStatement.params.my_id = myid;
				oStatement.params.o_id = oid;
				oStatement.params.a_type = atype;
				oStatement.execute();
				oStatement.reset();
				return this.getLastBattleId();
			}
			catch (e) {alert("Could not insert battle log\n" + e);}
		}
		return -1;
	},

	insertBattleDetails: function(battleid, beid, server,  winner, gold, exp) 
	{
		this.console.log("Debug[insertBattleDetails()]: battleid: " + battleid + ", beid: " + beid + ", server: " + server + ", winner: " + winner + ", gold: " + gold + ", exp:" + exp);
		if (this.dbConn)
		{
			var winnerid = -1;
			if(winner != "")
				winnerid = this.getPlayerId(winner, server, "name");
			try 
			{
				var oStatement = this.dbConn.createStatement("INSERT INTO reports (battleid, beid, winnerid, gold, exp) " + 
																"VALUES (:p_battleid , :p_beid, :p_winnerid, :p_gold, :p_exp)");
				oStatement.params.p_battleid = battleid;
				oStatement.params.p_beid = beid;
				oStatement.params.p_winnerid = winnerid;
				oStatement.params.p_gold = gold;
				oStatement.params.p_exp = exp;
				oStatement.execute();
				oStatement.reset();
				
				return true;
			}
			catch (e) {alert("Could not insert battle log\n" + e);}
		}
		return false;
	},
	
	getLastBattleId: function()
	{
		this.console.log("Debug[getLastBattleId()]");
		var bid = -1;
		if (this.dbConn)
		{
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT max(battleid) as LastBattleId from battles");
				
				while (oStatement.executeStep())
				{
					bid = oStatement.row.LastBattleId;
				}
				
				oStatement.reset();
			}
			catch (e) {alert("Could not select last battleid\n" + e);}
		}
		
		return bid;
	},
	
	getLastPlayerId: function()
	{
		this.console.log("Debug[getLastPlayerId()]");
		var apid = -1;
		if (this.dbConn)
		{			
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT max(apid) as LastBattleId from player");
				
				while (oStatement.executeStep())
				{
					apid = oStatement.row.LastBattleId;
				}
				
				oStatement.reset();
			}
			catch (e) {alert("Could not select last battleid\n" + e);}
		}
		return apid;
	},
	
	insertPlayer: function(pid, pname, server, plevel, pguild)
	{
		this.console.log("Debug[insertPlayer()]: pid: " + pid + ", pname: " + pname + ", server: " + server + ", plevel: " + plevel + ", pguild: " + pguild);
		if (this.dbConn)
		{
			try 
			{
				var oStatement = this.dbConn.createStatement("INSERT INTO player (pid, name, server, level, guild) " +  
																"VALUES (:p_id , :p_name, :p_server, :p_level, :p_guild)");
				oStatement.params.p_id = pid;
				oStatement.params.p_name = pname;
				oStatement.params.p_server = server;
				oStatement.params.p_level = plevel;
				oStatement.params.p_guild = pguild;
				oStatement.execute();
				oStatement.reset();
			}
			catch (e) {alert("Could not insert player data\nPlayer: " + server + " - " + pname + "[" + pid + "]" + ", Level:" + plevel + ", Guild: " + pguild + "\n" + e);}
		}	
	},
	
	insertOpponent: function(pid, pname, server, plevel, pguild, inwar) 
	{
		this.console.log("Debug[insertOpponent()]: pid: " + pid + ", pname: " + pname + ", server: " + server + ", plevel: " + plevel + ", pguild: " + pguild + ", inwar: " + inwar);
		if (this.dbConn)
		{
			try 
			{
				this.console.log("Inserting profile...\n " + pname + "[" + pid + "]" + ", Level:" + plevel + ", Guild: " + pguild + ", Inwar" + inwar);
				
				this.insertPlayer(pid, pname, server, plevel, pguild);
				var apid = this.getLastPlayerId();
				
				var oStatement = this.dbConn.createStatement("INSERT INTO oinfo (oid, inwar) VALUES (:a_pid, :p_inwar)");
				oStatement.params.a_pid = apid;
				oStatement.params.p_inwar = inwar;
				oStatement.execute();
				oStatement.reset();
			}
			catch (e) {alert("Could not insert player data\nPlayer: " + server + " - " + pname + "[" + pid + "]" + ", Level:" + plevel + ", Guild: " + pguild + ", Inwar" + inwar + "\n" + e);}
		}
	},

	insertMyData: function(pid, pname, server, plevel, pguild, activated) 
	{
		this.console.log("Debug[insertMyData()]: pid: " + pid + ", pname: " + pname + ", server: " + server + ", plevel: " + plevel + ", pguild: " + pguild + ", activated: " + activated);
		if (this.dbConn)
		{
			try 
			{
				this.console.log("Inserting profile...\n " + pname + "[" + pid + "]" + ", Level:" + plevel + ", Guild: " + pguild);
				
				this.insertPlayer(pid, pname, server, plevel, pguild);
				var apid = this.getLastPlayerId();
				
				var oStatement = this.dbConn.createStatement("INSERT INTO myinfo (myid, activated) VALUES (:a_pid, :p_activated)");
				oStatement.params.a_pid = apid;
				oStatement.params.p_activated = activated;
				oStatement.execute();
				oStatement.reset();
			}
			catch (e) {alert("Could not insert player data\nPlayer: " + server + " - " + pname + "[" + pid + "]" + ", Level:" + plevel + ", Guild: " + pguild + "\n" + e);}
		}
	},
	
	getMyId: function(server)
	{
		this.console.log("Debug[getMyId()]: Server - " + server);
		var id = -1;
		
		if (this.dbConn)
		{
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT myid FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
				oStatement.params.p_server = server;
				
				while (oStatement.executeStep())
				{
					id = oStatement.row.myid;
				}
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not select myid for " + server + " -\n" + e);}
		}	
		
		return id;
	},

	getMyPid: function(server)
	{
		this.console.log("Debug[getMyPid()]: Server - " + server);
		var id = -1;
		
		if (this.dbConn)
		{
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT pid FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
				oStatement.params.p_server = server;
				
				while (oStatement.executeStep())
				{
					id = oStatement.row.pid;
				}
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not select myid for " + server + " -\n" + e);}
		}	
		
		return id;
	},
	
	isServerActive: function(server)
	{
		this.console.log("Debug[isServerActive()]: Server - " + server);
		var active = -1;
		
		if (this.dbConn)
		{
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT activated FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
				oStatement.params.p_server = server;
				
				while (oStatement.executeStep())
				{
					active = oStatement.row.activated;
				}
				oStatement.reset();
				
				if(active > 0)
					return true;
			}
			catch (e) {alert("DB query failed. Could not select myid for " + server + " -\n" + e);}
		}	
		
		return false;		
	},
	
	/**
	* returns the intern  db player id
	* @param identifier  - pid or name
	* @param by - string with value 'pid' or 'name'
	* @param server - the server played on
	*/	
	getPlayerId: function(identifier, server, by)
	{
		this.console.log("Debug[getPlayerId()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		if (this.dbConn)
		{
			var id = -1;
			try 
			{
				var query = "SELECT apid FROM player where " + by + "=:identifier AND server=:p_server";		
				var oStatement = this.dbConn.createStatement(query);
				oStatement.params.identifier = identifier;
				oStatement.params.p_server = server;
				
				while (oStatement.executeStep())
				{
					id = oStatement.row.apid;
				}
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not select apid for " + server + " -\n" + e);}
			
			return id;
		}	
	},
	
	deletePlayer: function(pid, server) 
	{
		this.console.log("Debug[deletePlayer()]: pid: " + pid + ", server: " + server);
		if (this.dbConn)
		{
			try 
			{
				var apid = this.getPlayerId(pid, server, "pid");
				
				var oStatement = this.dbConn.createStatement("DELETE FROM oinfo WHERE oid=:a_pid");
				oStatement.params.a_pid = apid;
				oStatement.execute();
				oStatement.reset();
				
				oStatement = this.dbConn.createStatement("DELETE FROM player WHERE apid=:a_pid");
				oStatement.params.a_pid = apid;
				oStatement.execute();
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not delete " + server + " - " +pid + "\n" + e);}
		}
	},

	updatePlayer: function(apid, pname, plevel, pguild)
	{
		this.console.log("Debug[updatePlayer()]: apid: " + apid + ", pname: " + pname + ", plevel: " + plevel + ", pguild: " + pguild);
		if (this.dbConn)
		{
			try 
			{
				var oStatement = this.dbConn.createStatement("UPDATE player SET name=:p_name, level=:p_level, guild=:p_guild " +
																"where apid=:a_pid");
				oStatement.params.a_pid = apid;
				oStatement.params.p_name = pname;
				oStatement.params.p_level = plevel;
				oStatement.params.p_guild = pguild;
				oStatement.execute();
				oStatement.reset();
			}
			catch (e) {alert("Could not update player \nPlayer: " + pname + ", Level:" + plevel + ", Guild: " + pguild + "\n" + e);}
		}	
	},
	
	updatePlayerData: function(pid, pname, server, plevel, pguild)
	{	
		this.console.log("Debug[updatePlayerData()]: pid: " + pid + ", pname: " + pname + ", server: " + server + ", plevel: " + plevel + ", pguild: " + pguild);
		if (this.dbConn)
		{
			var update;
			try 
			{
				var apid = this.getPlayerId(pid, server, "pid");
				var oStatement = this.dbConn.createStatement("SELECT lastupdate from player where apid=:a_pid");
				oStatement.params.a_pid = apid;
				
				while (oStatement.executeStep())
				{
					update = oStatement.row.lastupdate;
				}
				
				oStatement.reset();

				if(!update)
				{
					this.console.log("Debug[updatePlayerData()]: Inserting data for " + server + " - " + pname + "[" + pid + "]..." + 
								"\nData: Level: " + plevel + "; Guild: " + pguild);
					this.insertPlayer(pid, pname, server, plevel, pguild);
				} else if (update < this.getTimePeriod("oneday"))
				{
					this.console.log("Debug[updatePlayerData()]: Inserting data for " + server + " - " + pname + "[" + pid + "]..." + 
								"\nData: Level: " + plevel + "; Guild: " + pguild);// + "; In war?: " + (inwar == 1 ? "yes" : "no"));
					this.updatePlayer(apid, pname, plevel, pguild);
				}
				else
					this.console.log("Debug[updatePlayerData()]: Skipping update for " + server + " - " + pname + "[" + pid + "]...");
			}
			catch (e) {alert("DB query failed. Could not update player data\n" + e);}
		}
	},
	
	setInWar: function(pid, server, value)
	{
		this.console.log("Debug[setInWar()]: pid: " + pid + ", server: " + server + ", value: " + value);
		if (this.dbConn)
		{
			try 
			{
				var apid = this.getPlayerId(pid, server, "pid");
				var oStatement = this.dbConn.createStatement("UPDATE oinfo SET inwar=:p_inwar where apid=:a_pid");
				oStatement.params.a_pid = apid;
				oStatement.params.p_inwar = value;
				oStatement.execute();
				oStatement.reset();
			}
			catch (e) {alert("Could not switch war " + ((value == 1) ? "on" : "off") + " for " + pid + " on server " + server + "\n" + e);}
		}	
	},
	
	/**
	* returns the number of battles for identifier (pid or name) within user defined period
	* @param identifier  - pid or name
	* @param by - string with value 'pid' or 'name'
	* @param atype - 1 atack over opponent, 0 defence from opponent
	* @return n_battles - number of battles within specified period,  0 otherwise
	*/	
	getNumberOfBattlesWithin: function(identifier, server, by, atype, period) 
	{
		this.console.log("Debug[getNumberOfBattlesWithin()]: identifier: " + identifier + ", server: " + server + ", by: " + by + ", atype: " + atype + ", period: " + period);
		if (this.dbConn)
		{
			var n_battles = 0;
			try 
			{
				var oid = this.getPlayerId(identifier, server, by);
				
				// precondition: addon should be activated for this server
				var myid = this.getMyId(server);
				
				if(oid < 0)
				{
					this.console.log("Debug[getNumberOfBattlesWithin()]: Opponent doesn't exists in the DB.");
					this.console.log("MyID: " + myid + ", OID: " +oid);
					return 0;
				}
				
				var oStatement = this.dbConn.createStatement("SELECT count(battleid) AS nBattles from battles " + 
																"WHERE myid=:my_id AND oid=:o_id AND atype=:a_type AND atime >= :b_time");
				oStatement.params.my_id = myid;
				oStatement.params.o_id = oid;
				oStatement.params.a_type = atype;
				oStatement.params.b_time = this.getTimePeriod(period);
				
				while (oStatement.executeStep())
				{
					n_battles = oStatement.row.nBattles;
				}
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not select battles for period\n" + e);}
			
			return n_battles;
		}
	},

	/**
	* returns the first battle time for specific opponent referenced by pid or name for the last 24h
	* @param identifier  - value of pid or name
	* @param by - string with value 'pid' or 'name'
	* @param server - the server played on
	* @return firstBattleInLastDay - first battle time in last day, otherwise -1
	*/		
	getFirstBattleInLastDay: function(identifier, server, by) 
	{
		this.console.log("Debug[getFirstBattleInLastDay()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(identifier, server, by);
			var myid = this.getMyId(server);
			
			var firstBattleInLastDay = -1;
			
			if(oid < 0)
			{
				this.console.log("Debug[getFirstBattleInLastDay()]: Opponent doesn't exists in the DB.");
				return firstBattleInLastDay;
			}
			try 
			{
				// returns the first battle time in last 24h 
				var oStatement = this.dbConn.createStatement("SELECT min(atime) as FirstBattle FROM battles where myid=:my_id AND oid=:o_id AND atype=1 AND atime >= :b_time");
				oStatement.params.my_id = myid;
				oStatement.params.o_id = oid;
				oStatement.params.b_time = this.getTimePeriod("oneday");
				while (oStatement.executeStep())
				{
					firstBattleInLastDay = oStatement.row.FirstBattle;
				}
				if(firstBattleInLastDay == null)
					firstBattleInLastDay = -1;
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not select first battle for last day\n" + e);}
			return firstBattleInLastDay;
		}
	},
	
	/**
	* returns the last battle time for specific opponent referenced by pid or name for the last 24h
	* @param identifier  - value of pid or name
	* @param by - string with value 'pid' or 'name'
	* @param server - the server played on
	* @return firstBattleInLastDay - first battle time in last day, otherwise -1
	*/			
	getLastBattleInLastDay: function(identifier, server, by) 
	{
		this.console.log("Debug[getLastBattleForPidInLastDay()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(identifier, server, by);
			var myid = this.getMyId(server);
			
			var lastBattleInLastDay = -1;
			if(oid < 0)
			{
				this.console.log("Debug[getLastBattleForPidInLastDay()]: Opponent doesn't exists in the DB.");
				return lastBattleInLastDay;
			}
			try 
			{
				// returns the first battle time in last 24h 
				var oStatement = this.dbConn.createStatement("SELECT max(atime) as LastBattle FROM battles where myid=:my_id AND oid = :o_id AND atype=1 AND atime >= :b_time");
				oStatement.params.my_id = myid;
				oStatement.params.o_id = oid;
				oStatement.params.b_time = this.getTimePeriod("oneday");
				while (oStatement.executeStep())
				{
					lastBattleInLastDay = oStatement.row.LastBattle;
				}
				if(lastBattleInLastDay == null)
					lastBattleInLastDay = -1;
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not select last battle for last day\n" + e);}
			return lastBattleInLastDay;
		}
	},
	
	battleExists: function(repid, server) 
	{
		this.console.log("Debug[battleExists()]: repid: " + repid + ", server: " + server);
		if (this.dbConn)
		{
			var rExists = false;
			try 
			{
				var rID = 0;
				// returns if the report repid for pid exists
				var oStatement = this.dbConn.createStatement("SELECT battles.battleid FROM myinfo " +
																"INNER JOIN player ON myinfo.myid = player.apid " +
																"INNER JOIN battles ON myinfo.myid = battles.myid " +
																"INNER JOIN reports ON battles.battleid = reports.battleid " +																
																"where reports.beid = :report_id AND player.server = :p_server");
				//oStatement.params.p_id = pid;
				oStatement.params.report_id = repid;
				oStatement.params.p_server = server; 
				while (oStatement.executeStep())
				{
					rID = oStatement.row.battleid;
				}
				if(rID != null && rID != -1 && rID != 0)
					rExists = true;
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not check if the report(" +repid + ") on server " + server + " exists\n" + e);}
			return rExists;
		}
	},
	
	isInWar: function(value, server, by)
	{
		this.console.log("Debug[isInWar()]: value: " + value + ", server: " + server + ", by: " + by);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(value, server, by);
			try 
			{
				var	oStatement = this.dbConn.createStatement("SELECT oinfo.inwar FROM oinfo where oinfo.oid=:o_id");
				oStatement.params.o_id = oid;
				
				var inwar = -1;
				while (oStatement.executeStep())
				{
					inwar = oStatement.row.inwar;
				}
				oStatement.reset();
				
				if(inwar == 1)
					return true;
				return false;
			}
			catch (e) {alert("DB query failed. Could not determine if there is a war with " + value + "\n. Additional is exception is throwed: "+ e); return false;}
		}
		else
		{
			this.console.log("Cannot establish connection to the DB.");
			return false;
		}		
	},
	
	getPidForName: function(cOpponent, server) 
	{
		this.console.log("Debug[getPidForName()]: cOpponent: " + cOpponent + ", server: " + server);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(cOpponent, server, "name");
			
			var pid = -1;
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT pid from player where apid=:a_pid");
				oStatement.params.a_pid = oid;
				
				while (oStatement.executeStep())
				{
					pid = oStatement.row.pid;
				}
				oStatement.reset();
				
				this.console.log("Debug[getPidForName()]: Name:" + cOpponent + ", PID=" + pid);
				if(pid == null)
					pid = -1;
				return pid;
			}
			catch (e) {alert("DB query failed. Could not get pid for name " + cOpponent + "\n" + e);}
		}
		return -1;
	},
	
	getNameForPid: function(pid, server) 
	{
		this.console.log("Debug[getNameForPid()]: pid: " + pid + ", server: " + server);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(pid, server, "pid");
			var oName = "";
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT name FROM player where apid = :o_id");
				oStatement.params.o_id = oid; 
				while (oStatement.executeStep())
				{
					oName = oStatement.row.pname;
				}
				oStatement.reset();
				
				this.console.log("Debug[getNameForPid()]: Name:" + oName + ", PID=" + pid + " - " + server);
				if(oName == null)
					oName = "";
				return oName;
			}
			catch (e) {alert("DB query failed. Could not get name for pid " + pid + "\n" + e);}
		}
		return "";
	},
	
	getGuild: function(value, server, by) 
	{
		this.console.log("Debug[getGuild()]: value: " + value + ", server: " + server + ", by: " + by);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(value, server, by);
			var guild = "#none#";
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT guild FROM player WHERE apid = :o_id");
				oStatement.params.o_id = oid; 
				while (oStatement.executeStep())
				{
					guild = oStatement.row.pguild;
				}
				oStatement.reset();
				
				this.console.log("Debug[getGuild()]: Guild:" + guild + ", PID=" + oid);
				if(guild == null)
					guild = "#none#";
				return guild;
			}
			catch (e) {alert("DB query failed. Could not get guild for pid " + oid + "\n" + e);}
		}
		return "none";
	},
	
	//TODO !!!
	getOpponentsWithCriteria: function(period, orderBy, orderDirection, name, level, server)
	{
		this.console.log("Debug[getOpponentsWithCriteria()]: period: " + period + ", orderBy: " + orderBy + ", orderDirection: " + orderDirection + ", level: " + level + ", player: " + name + ", server: " + server);
		// create query
//		var query = "select a.name, a.guild, a.level, a.server, a.attacks, d.defenses, a.goldRaised, d.goldLost, a.maxGoldRaised, d.maxGoldLost, a.expRaised"
//		+ " from"
//		+ " (select p.apid, p.name, p.guild, p.level, p.server, b.atime as aTime, count(b.battleid) as attacks, sum(r.gold) as goldRaised, sum(r.exp) as expRaised, max(r.gold) as maxGoldRaised"
//		+ " from player p inner join battles b on p.apid=b.oid inner join reports r on b.battleid = r.battleid where b.atype=1 group by b.oid) a"
//		+ " left join"
//		+ " (select p.apid, p.name, p.guild, p.level, p.server, b.atime as aTime, count(b.battleid) as defenses, sum(r.gold) as goldLost, max(r.gold) as maxGoldLost"
//		+ " from player p inner join battles b on p.apid=b.oid inner join reports r on b.battleid = r.battleid where b.atype=0 group by b.oid) d"
//		+ " on d.apid = a.apid"
//		+ " where a.aTime > " + this.getTimePeriod(period);

		var select = "select name as rName, guild as rGuild, level as rLevel, server as rServer, a.attacks as rAttacks, d.defenses as rDefenses, a.goldRaised as rGoldRaised, d.goldLost as rGoldLost, a.maxGoldRaised as rMaxGoldRaised, d.maxGoldLost as rMaxGoldLost, a.expRaised as rExpRaised"
		+ " from";
		var attacksTable = " (select p.apid, p.name, p.guild, p.level, p.server, b.atime as aTime, count(b.battleid) as attacks, sum(r.gold) as goldRaised, sum(r.exp) as expRaised, max(r.gold) as maxGoldRaised"
		+ " from player p inner join battles b on p.apid=b.oid inner join reports r on b.battleid = r.battleid where b.atype=1 group by b.oid) a";
		var leftJoin = " left join";
		var defensesTable = " (select p.apid, p.name, p.guild, p.level, p.server, b.atime as aTime, count(b.battleid) as defenses, sum(r.gold) as goldLost, max(r.gold) as maxGoldLost"
		+ " from player p inner join battles b on p.apid=b.oid inner join reports r on b.battleid = r.battleid where b.atype=0 group by b.oid) d";
		var joinOn =  " on d.apid = a.apid";
		var whereClause = " where aTime > " + this.getTimePeriod(period);
		
		var query1 = select.replace("name", "a.name").
							replace("guild", "a.guild").
							replace("level", "a.level").
							replace("server", "a.server")
							+ attacksTable + leftJoin + defensesTable + joinOn
							+ whereClause.replace("aTime", "a.aTime");
		var query2 = select.replace("name", "d.name").
							replace("guild", "d.guild").
							replace("level", "d.level").
							replace("server", "d.server") 
							+ defensesTable + leftJoin + attacksTable + joinOn 
							+ whereClause.replace("aTime", "d.aTime");
		
		if(!this.isEmpty(level))
		{
			query1 +=  " and a.level > " + level;
			query2 +=  " and d.level > " + level;
		}
		
		if(!this.isEmpty(name))
		{
			query1 += " and a.name LIKE '%" + name + "%'";
			query2 += " and d.name LIKE '%" + name + "%'";
			
		}
		
		if(!this.isEmpty(server))
		{
			query1 += " and a.server = '" + server + "'";
			query2 += " and d.server = '" + server + "'";
		}
		query1 += " order by " + ((orderBy.indexOf("a.") > 0 ||  orderBy.indexOf("d.") > 0) ? orderBy: 'a.' + orderBy) + " " + orderDirection; 
		
		var query =  query2 + " UNION " + query1;
		this.console.log("Debug[getOpponentsWithCriteria()]: Query = \"" +  query + "\"");
 		if (this.dbConn)
		{
			var result = new Array();
			try 
			{
				var oStatement = this.dbConn.createStatement(query);

				var step = 0;
				while (oStatement.executeStep())
				{
					result[step] = new GFT.DBPlayerData(oStatement.row.rName,
													oStatement.row.rGuild,
													oStatement.row.rLevel,
													oStatement.row.rServer,
													oStatement.row.rAttacks,
													oStatement.row.rDefenses,
													oStatement.row.rGoldRaised,
													oStatement.row.rGoldLost,
													oStatement.row.rMaxGoldRaised,
													oStatement.row.rMaxGoldLost,
													oStatement.row.rExpRaised);
					step++;
				}
				oStatement.reset();
	
				return result;
			}
			catch (e) {alert("DB query failed. Could not get opponents list with criteria.\nException: " + e);}
		}
	},
	
	/**
	* returns number of battles( attacks or defenses) since specified time 
	* @param time - user defined time
	* @param server - server played on
	* @param atype - 1 if attacks, 0 if defenses
	*/
	getNumberOfBattlesSinceCustomTime: function(time, server, atype)
	{
		this.console.log("Debug[getNumberOfBattlesSinceCustomTime()]: time: " + time + ", server: " + server + ", atype: " + atype);
		if (this.dbConn)
		{
			var myid = this.getMyId(server);
			var n_battles = -1;
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT count(battleid) AS nBattles from battles " + 
																"WHERE myid=:my_id AND atype=:a_type AND atime >= :b_time");
				oStatement.params.my_id = myid;
				oStatement.params.a_type = atype;
				oStatement.params.b_time = this.getTimePeriod(time);
				while (oStatement.executeStep())
				{
					n_battles = oStatement.row.nBattles;
				}
				oStatement.reset();
				
				return n_battles;
			}
			catch (e) {alert("DB query failed. Could not compute the atacks since custom period \n" + e);}
		}
		return -1;
	},
	
	getAllAtacksSinceTodayAndDefDaysBack: function(days, server) // find better name
	{
		this.console.log("Debug[getAllAtacksSinceTodayAndDefDaysBack()]: days: " + days + ", server: " + server);
		if (this.dbConn)
		{
			var myid = this.getMyId(server);
			var n_battles = -1;
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT count(battleid) AS nBattles from battles " + 
																"where myid=:my_id AND atime > (strftime('%s', date('now', 'start of day')) - :b_time)");
				oStatement.params.my_id = myid;
				oStatement.params.b_time = this.getDayPeriodInSec(days);
				while (oStatement.executeStep())
				{
					n_battles = oStatement.row.nBattles;
				}
				oStatement.reset();

				return n_battles;
			}
			catch (e) {alert("DB query failed. Could not compute the atacks since start of the day and " + days + " days back.\n" + e);}
		}
		return -1;
	},
	
	/**
	 * Returns all battles won for defined period of time depending from attack type. <br />
	 * Atype parameter specifies the attack type and it's optional.
	 * 
	 * @param server - gladiatus server
	 * @param atype - optional parameter. if 1 battles in attack, 0 in defense, if not defined all both attack types
	 * @param period - period of time
	 * @return - all battles won, or 'none' if no battles exists
	 */
	getBattlesWon: function(server, period, atype)
	{
		this.console.log("Debug[getBattlesWon()]: server: " + server + ", atype: " + atype + ", period: " + period);
		
		if (this.dbConn)
		{
			var myid = this.getMyId(server);
			
			var battlesWon = 0;
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT count(b.battleid) as battlesWon " +
																	"from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE r.winnerid=:my_id AND b.atime > :a_time" + (atype ? (" AND b.atype=" + atype) : ""));
				oStatement.params.my_id = myid;
				oStatement.params.a_time = this.getTimePeriod(period);
				while (oStatement.executeStep())
				{
					battlesWon = oStatement.row.battlesWon;
				}
				oStatement.reset();
				
				if(battlesWon <= 0)
					return "none";
				return battlesWon;
			}
			catch (e) {alert("DB query failed. Could not get battles won\n" + e);}
		}
		return "none";		
	},
	
	getGoldRaised: function(pid, server, atype, period)
	{
		this.console.log("Debug[getGoldRaised()]: pid: " + pid + ", server: " + server + ", atype: " + atype + ", period: " + period);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(pid, server, "pid");
			
			var gold = 0;
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT sum(r.gold) as RaisedGold from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE b.atype=:a_type AND b.oid=:o_id AND atime >= :period");
				oStatement.params.o_id = oid;
				oStatement.params.a_type = atype;
				oStatement.params.period = this.getTimePeriod(period);
				while (oStatement.executeStep())
				{
					gold = oStatement.row.RaisedGold;
				}
				oStatement.reset();
				
				if(!gold || gold == null)
					return 0;
				return gold;
			}
			catch (e) {alert("DB query failed. Could not compute gold raised\n" + e);}
		}
		return 0;
	},
	
	getAllGoldRaised: function(server, atype, period)
	{
		this.console.log("Debug[getAllGoldRaised()]: server: " + server + ", atype: " + atype + ", period: " + period);
		if (this.dbConn)
		{			
			var gold = 0;
			var myid = this.getMyId(server);
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT sum(r.gold) as RaisedGold from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE b.myid=:my_id AND b.atype=:a_type AND atime >= :period");
				oStatement.params.my_id = myid;
				oStatement.params.a_type = atype;
				oStatement.params.period = this.getTimePeriod(period);
				
				while (oStatement.executeStep())
				{
					gold = oStatement.row.RaisedGold;
				}
				oStatement.reset();
				
				if(!gold || gold == null)
					return 0;
				return gold;
			}
			catch (e) {alert("DB query failed. Could not compute all gold raised\n" + e);}
		}
		return 0;
	},
	
	getMaxGold: function(pid, server, atype, period)
	{
		this.console.log("Debug[getMaxGold()]: pid: " + pid + ", server: " + server + ", atype: " + atype + ", period: " + period);
		if (this.dbConn)
		{
			var oid = this.getPlayerId(pid, server, "pid");
			
			var gold = 0;
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT max(r.gold) as RaisedGold from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE b.atype=:a_type AND b.oid=:o_id AND atime >= :period");
				oStatement.params.o_id = oid;
				oStatement.params.a_type = atype;
				oStatement.params.period = this.getTimePeriod(period);
				while (oStatement.executeStep())
				{
					gold = oStatement.row.RaisedGold;
				}
				oStatement.reset();
				
				if(!gold || gold == null)
					return 0;
				return gold;
			}
			catch (e) {alert("DB query failed. Could not compute max gold\n" + e);}
		}
		return 0;		
	},

	getWinChance: function(pid, server)
	{
		this.console.log("Debug[getWinChance()]: pid: " + pid + ", server: " + server);
		if (this.dbConn)
		{
			var myid = this.getMyId(server);
			var oid = this.getPlayerId(pid, server, "pid");
			
			var battlesWon = 0;
			var allBattles = 0;
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT count(b.battleid) as battlesWon, " + 
																	"(select count(battleid) from battles where oid=:o_id) as allBattles " + 
																	"from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE r.winnerid=:my_id AND b.oid=:o_id");
				oStatement.params.my_id = myid;
				oStatement.params.o_id = oid;
				while (oStatement.executeStep())
				{
					battlesWon = oStatement.row.battlesWon;
					allBattles = oStatement.row.allBattles;
				}
				oStatement.reset();
				
				if(allBattles <= 0)
					return "none";
				return (battlesWon/allBattles)*100;
			}
			catch (e) {alert("DB query failed. Could not compute win chance\n" + e);}
		}
		return "none";		
	},
	
	getLastDayWinChance: function(pid, server)
	{
		this.console.log("Debug[getWinChance()]: pid: " + pid + ", server: " + server);
		if (this.dbConn)
		{
			var myid = this.getMyId(server);
			var oid = this.getPlayerId(pid, server, "pid");
			
			var battlesWon = 0;
			var allBattles = 0;
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT count(b.battleid) as battlesWon, " + 
																	"(select count(battleid) from battles where oid=:o_id and atime < strftime('%s', date('now', 'start of day'))) as allBattles " + 
																	"from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE r.winnerid=:my_id AND b.oid=:o_id and b.atime < strftime('%s', date('now', 'start of day'))");
				oStatement.params.my_id = myid;
				oStatement.params.o_id = oid;
				while (oStatement.executeStep())
				{
					battlesWon = oStatement.row.battlesWon;
					allBattles = oStatement.row.allBattles;
				}
				oStatement.reset();
				
				if(allBattles <= 0)
					return "none";
				return (battlesWon/allBattles)*100;
			}
			catch (e) {alert("DB query failed. Could not compute max gold\n" + e);}
		}
		return 0;
	},
	
	getExpRaised: function(pid, server, period)
	{
		this.console.log("Debug[getExpRaised()]: pid: " + pid + ", server: " + server + ", period: " + period);
		if (this.dbConn)
		{			
			var exp = 0;
			var myid = this.getMyId(server);
			
			try 
			{
				var oStatement = this.dbConn.createStatement("SELECT sum(r.exp) as RaisedExp from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE b.myid=:my_id AND b.atype=1 AND atime >= :period" + ((pid > 0) ? " AND b.oid=:o_id" : ""));
				if(pid > 0)
				{
					var oid = this.getPlayerId(pid, server, "pid");
					oStatement.params.o_id = oid;
				}
				oStatement.params.my_id = myid;
				oStatement.params.period = this.getTimePeriod(period);
				while (oStatement.executeStep())
				{
					exp = oStatement.row.RaisedExp;
				}
				oStatement.reset();
				
				if(!exp)
					return 0;
				return exp;
			}
			catch (e) {alert("DB query failed. Could not compute gold raised\n" + e);}
		}
		return 0;
	},
	
	getAllExpRaised: function(server, period)
	{
		return this.getExpRaised(-1, server, period);
	},
	
	isEmpty: function(str)
	{
		return !str || str == "";
	},
	
	getTimePeriod: function(period)
	{
		this.console.log("Debug[getTimePeriod()]: period: " + period);
		var now = Math.round((new Date().getTime()/1000));
		
		switch (period)
		{
			case "oneday":    return now - this.getDayPeriodInSec(1);
			case "twodays":   return now - this.getDayPeriodInSec(2);
			case "threedays": return now - this.getDayPeriodInSec(3);
			case "fivedays": return now - this.getDayPeriodInSec(5);
			case "oneweek":   return now - this.getDayPeriodInSec(7);
			case "onemonth":  return now - this.getDayPeriodInSec(30);
			case "none": return 0;
			default: return Math.round((parseInt(period)/1000));
		}
	},
	
	getDayPeriodInSec: function(amount)
	{
		return amount*86400;
	}
};