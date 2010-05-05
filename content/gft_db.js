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

var gft_db = {
	gft_dbConn: null,
	init: function() 
	{
		if (!this.gft_dbConn)
		{
			var oFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
			oFile.append("gft.sqlite");
			var oStorageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
			this.gft_dbConn = oStorageService.openDatabase(oFile);
			this.createDB();

		}
	},
	
	createDB: function()
	{
		try { this.gft_dbConn.executeSimpleSQL("SELECT apid, pid, name, server, level, guild, lastupdate FROM player"); }
		catch (e)
		{
			//Create pinfo database
			console.log("Debug[createDB()]: Creating table player...");
			this.gft_dbConn.executeSimpleSQL("DROP TABLE IF EXISTS player;" +
												"CREATE TABLE player (" +
												"apid INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, " +
												"pid INTEGER NOT NULL, " +
												"name VARCHAR(30) NOT NULL, " +
												"server VARCHAR(40) NOT NULL, " +
												"level INTEGER NOT NULL, " +
												"guild VARCHAR(40) DEFAULT '#none#', " +
												"lastupdate DATETIME DEFAULT (strftime('%s', 'now')))");
		}	
		
		try { this.gft_dbConn.executeSimpleSQL("SELECT myid, activated FROM myinfo"); }
		catch (e)
		{
			//Create pinfo database
			console.log("Debug[createDB()]: Creating table myinfo...");
			this.gft_dbConn.executeSimpleSQL("DROP TABLE IF EXISTS myinfo;" +
												"CREATE TABLE myinfo (" +
												"myid INTEGER NOT NULL," +
												"activated INTEGER DEFAULT 0)");
		}			
		
		try { this.gft_dbConn.executeSimpleSQL("SELECT oid, inwar FROM oinfo"); }
		catch (e)
		{
			//Create pinfo database
			console.log("Debug[createDB()]: Creating table oinfo...");
			this.gft_dbConn.executeSimpleSQL("DROP TABLE IF EXISTS oinfo; " +
												"CREATE TABLE oinfo (" +
												"oid INTEGER NOT NULL, " +
												"inwar INTEGER DEFAULT 0)");
		}
		
		try {this.gft_dbConn.executeSimpleSQL("SELECT battleid, myid, oid, atype, atime FROM battles");}
		catch (e)
		{
			//Create battles database
			//atype: a bit showing if I'm atacking or defending (value 1 if atacking, 0 if defending)
			console.log("Debug[createDB()]: Creating table battles...");
			this.gft_dbConn.executeSimpleSQL("DROP TABLE IF EXISTS battles; " +
												"CREATE TABLE battles (" +
												"battleid INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, " +
												"myid INTEGER NOT NULL , " +
												"oid INTEGER NOT NULL, " +
												"atype INTEGER DEFAULT 1, " +
												"atime DATETIME DEFAULT (strftime('%s', 'now')))");
		}
		
		try {this.gft_dbConn.executeSimpleSQL("SELECT battleid, beid, winnerid, gold, exp FROM reports");}
		catch (e)
		{
			//Create battles database
			console.log("Debug[createDB()]: Creating table reports...");
			this.gft_dbConn.executeSimpleSQL("DROP TABLE IF EXISTS reports; " +
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
			this.gft_dbConn.executeSimpleSQL("SELECT myid FROM myinfo");
			this.gft_dbConn.executeSimpleSQL("SELECT oid FROM oinfo");
			this.gft_dbConn.executeSimpleSQL("SELECT battleid FROM battles");
			this.gft_dbConn.executeSimpleSQL("SELECT battleid FROM reports");
			console.log("Debug[createDB()]: DB was successful intialized...");
		}
		catch (e) {alert("Could not create the database\n" + e);}
	},
	
	insertBattle: function(identifier, server, by, atype) 
	{
		console.log("Debug[insertBattle()]: Identifier: " + identifier + ", server: " + server + ", by: " + by + ", atype: " + atype);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(identifier, server, by);
			var myid = this.getMyId(server);
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("INSERT INTO battles (myid, oid, atype) " + 
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
		console.log("Debug[insertBattleDetails()]: battleid: " + battleid + ", beid: " + beid + ", server: " + server + ", winner: " + winner + ", gold: " + gold + ", exp:" + exp);
		if (this.gft_dbConn)
		{
			var winnerid = -1;
			if(winner != "")
				winnerid = this.getPlayerId(winner, server, "name");
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("INSERT INTO reports (battleid, beid, winnerid, gold, exp) " + 
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
		console.log("Debug[getLastBattleId()]");
		var bid = -1;
		if (this.gft_dbConn)
		{
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT max(battleid) as LastBattleId from battles");
				
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
		console.log("Debug[getLastPlayerId()]");
		var apid = -1;
		if (this.gft_dbConn)
		{			
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT max(apid) as LastBattleId from player");
				
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
		console.log("Debug[insertPlayer()]: pid: " + pid + ", pname: " + pname + ", server: " + server + ", plevel: " + plevel + ", pguild: " + pguild);
		if (this.gft_dbConn)
		{
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("INSERT INTO player (pid, name, server, level, guild) " +  
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
		console.log("Debug[insertOpponent()]: pid: " + pid + ", pname: " + pname + ", server: " + server + ", plevel: " + plevel + ", pguild: " + pguild + ", inwar: " + inwar);
		if (this.gft_dbConn)
		{
			try 
			{
				console.log("Inserting profile...\n " + pname + "[" + pid + "]" + ", Level:" + plevel + ", Guild: " + pguild + ", Inwar" + inwar);
				
				this.insertPlayer(pid, pname, server, plevel, pguild);
				var apid = this.getLastPlayerId();
				
				var oStatement = this.gft_dbConn.createStatement("INSERT INTO oinfo (oid, inwar) VALUES (:a_pid, :p_inwar)");
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
		console.log("Debug[insertMyData()]: pid: " + pid + ", pname: " + pname + ", server: " + server + ", plevel: " + plevel + ", pguild: " + pguild + ", activated: " + activated);
		if (this.gft_dbConn)
		{
			try 
			{
				console.log("Inserting profile...\n " + pname + "[" + pid + "]" + ", Level:" + plevel + ", Guild: " + pguild);
				
				this.insertPlayer(pid, pname, server, plevel, pguild);
				var apid = this.getLastPlayerId();
				
				var oStatement = this.gft_dbConn.createStatement("INSERT INTO myinfo (myid, activated) VALUES (:a_pid, :p_activated)");
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
		console.log("Debug[getMyId()]: Server - " + server);
		var id = -1;
		
		if (this.gft_dbConn)
		{
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT myid FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
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
		console.log("Debug[getMyPid()]: Server - " + server);
		var id = -1;
		
		if (this.gft_dbConn)
		{
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT pid FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
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
		console.log("Debug[isServerActive()]: Server - " + server);
		var active = -1;
		
		if (this.gft_dbConn)
		{
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT activated FROM myinfo INNER JOIN player ON myinfo.myid=player.apid where player.server=:p_server");
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
		console.log("Debug[getPlayerId()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		if (this.gft_dbConn)
		{
			var id = -1;
			try 
			{
				var query = "SELECT apid FROM player where " + by + "=:identifier AND server=:p_server";		
				var oStatement = this.gft_dbConn.createStatement(query);
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
		console.log("Debug[deletePlayer()]: pid: " + pid + ", server: " + server);
		if (this.gft_dbConn)
		{
			try 
			{
				var apid = this.getPlayerId(pid, server, "pid");
				
				var oStatement = this.gft_dbConn.createStatement("DELETE FROM oinfo WHERE oid=:a_pid");
				oStatement.params.a_pid = apid;
				oStatement.execute();
				oStatement.reset();
				
				oStatement = this.gft_dbConn.createStatement("DELETE FROM player WHERE apid=:a_pid");
				oStatement.params.a_pid = apid;
				oStatement.execute();
				oStatement.reset();
			}
			catch (e) {alert("DB query failed. Could not delete " + server + " - " +pid + "\n" + e);}
		}
	},

	updatePlayer: function(apid, pname, plevel, pguild)
	{
		console.log("Debug[updatePlayer()]: apid: " + apid + ", pname: " + pname + ", plevel: " + plevel + ", pguild: " + pguild);
		if (this.gft_dbConn)
		{
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("UPDATE player SET name=:p_name, level=:p_level, guild=:p_guild " +
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
		console.log("Debug[updatePlayerData()]: pid: " + pid + ", pname: " + pname + ", server: " + server + ", plevel: " + plevel + ", pguild: " + pguild);
		if (this.gft_dbConn)
		{
			var update;
			try 
			{
				var apid = this.getPlayerId(pid, server, "pid");
				var oStatement = this.gft_dbConn.createStatement("SELECT lastupdate from player where apid=:a_pid");
				oStatement.params.a_pid = apid;
				
				while (oStatement.executeStep())
				{
					update = oStatement.row.lastupdate;
				}
				
				oStatement.reset();

				if(!update)
				{
					console.log("Debug[updatePlayerData()]: Inserting data for " + server + " - " + pname + "[" + pid + "]..." + 
								"\nData: Level: " + plevel + "; Guild: " + pguild);
					this.insertPlayer(pid, pname, server, plevel, pguild);
				} else if (update < this.getTimePeriod("oneweek"))
				{
					console.log("Debug[updatePlayerData()]: Inserting data for " + server + " - " + pname + "[" + pid + "]..." + 
								"\nData: Level: " + plevel + "; Guild: " + pguild);// + "; In war?: " + (inwar == 1 ? "yes" : "no"));
					this.updatePlayer(apid, pname, plevel, pguild);
				}
				else
					console.log("Debug[updatePlayerData()]: Skipping update for " + server + " - " + pname + "[" + pid + "]...");
			}
			catch (e) {alert("DB query failed. Could not update player data\n" + e);}
		}
	},
	
	setInWar: function(pid, server, value)
	{
		console.log("Debug[setInWar()]: pid: " + pid + ", server: " + server + ", value: " + value);
		if (this.gft_dbConn)
		{
			try 
			{
				var apid = this.getPlayerId(pid, server, "pid");
				var oStatement = this.gft_dbConn.createStatement("UPDATE oinfo SET inwar=:p_inwar where apid=:a_pid");
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
		console.log("Debug[getNumberOfBattlesWithin()]: identifier: " + identifier + ", server: " + server + ", by: " + by + ", atype: " + atype + ", period: " + period);
		if (this.gft_dbConn)
		{
			var n_battles = 0;
			try 
			{
				var oid = this.getPlayerId(identifier, server, by);
				
				// precondition: addon should be activated for this server
				var myid = this.getMyId(server);
				
				if(oid < 0)
				{
					console.log("Debug[getNumberOfBattlesWithin()]: Opponent doesn't exists in the DB.");
					console.log("MyID: " + myid + ", OID: " +oid);
					return 0;
				}
				
				var oStatement = this.gft_dbConn.createStatement("SELECT count(battleid) AS nBattles from battles " + 
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
		console.log("Debug[getFirstBattleInLastDay()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(identifier, server, by);
			var myid = this.getMyId(server);
			
			var firstBattleInLastDay = -1;
			
			if(oid < 0)
			{
				console.log("Debug[getFirstBattleInLastDay()]: Opponent doesn't exists in the DB.");
				return firstBattleInLastDay;
			}
			try 
			{
				// returns the first battle time in last 24h 
				var oStatement = this.gft_dbConn.createStatement("SELECT min(atime) as FirstBattle FROM battles where myid=:my_id AND oid=:o_id AND atype=1 AND atime >= :b_time");
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
		console.log("Debug[getLastBattleForPidInLastDay()]: identifier: " + identifier + ", server: " + server + ", by: " + by);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(identifier, server, by);
			var myid = this.getMyId(server);
			
			var lastBattleInLastDay = -1;
			if(oid < 0)
			{
				console.log("Debug[getLastBattleForPidInLastDay()]: Opponent doesn't exists in the DB.");
				return lastBattleInLastDay;
			}
			try 
			{
				// returns the first battle time in last 24h 
				var oStatement = this.gft_dbConn.createStatement("SELECT max(atime) as LastBattle FROM battles where myid=:my_id AND oid = :o_id AND atype=1 AND atime >= :b_time");
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
		console.log("Debug[battleExists()]: repid: " + repid + ", server: " + server);
		if (this.gft_dbConn)
		{
			var rExists = false;
			try 
			{
				var rID = 0;
				// returns if the report repid for pid exists
				var oStatement = this.gft_dbConn.createStatement("SELECT battles.battleid FROM myinfo " +
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
		console.log("Debug[isInWar()]: value: " + value + ", server: " + server + ", by: " + by);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(value, server, by);
			try 
			{
				var	oStatement = this.gft_dbConn.createStatement("SELECT oinfo.inwar FROM oinfo where oinfo.oid=:o_id");
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
			console.log("Cannot establish connection to the DB.");
			return false;
		}		
	},
	
	getPidForName: function(cOpponent, server) 
	{
		console.log("Debug[getPidForName()]: cOpponent: " + cOpponent + ", server: " + server);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(cOpponent, server, "name");
			
			var pid = -1;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT pid from player where apid=:a_pid");
				oStatement.params.a_pid = oid;
				
				while (oStatement.executeStep())
				{
					pid = oStatement.row.pid;
				}
				oStatement.reset();
				
				console.log("Debug[getPidForName()]: Name:" + cOpponent + ", PID=" + pid);
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
		console.log("Debug[getNameForPid()]: pid: " + pid + ", server: " + server);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(pid, server, "pid");
			var oName = "";
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT name FROM player where apid = :o_id");
				oStatement.params.o_id = oid; 
				while (oStatement.executeStep())
				{
					oName = oStatement.row.pname;
				}
				oStatement.reset();
				
				console.log("Debug[getNameForPid()]: Name:" + oName + ", PID=" + pid + " - " + server);
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
		console.log("Debug[getGuild()]: value: " + value + ", server: " + server + ", by: " + by);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(value, server, by);
			var guild = "#none#";
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT guild FROM player WHERE apid = :o_id");
				oStatement.params.o_id = oid; 
				while (oStatement.executeStep())
				{
					guild = oStatement.row.pguild;
				}
				oStatement.reset();
				
				console.log("Debug[getGuild()]: Guild:" + guild + ", PID=" + oid);
				if(guild == null)
					guild = "#none#";
				return guild;
			}
			catch (e) {alert("DB query failed. Could not get guild for pid " + oid + "\n" + e);}
		}
		return "none";
	},
	
	//TODO !!!
	getOpponentsWithCriteria: function(period, orderBy, orderDirection, level, player)
	{
		console.log("Debug[getOpponentsWithCriteria()]: period: " + period + ", orderBy: " + orderBy + ", orderDirection: " + orderDirection + ", level: " + level + ", player: " + player);
		// create query
		var query = "";

		var where = false;
		
		// add to query where criteria player name
		if(level && level != "")
		{
			where = true;
			query +=  " where p.plevel > " + level;
		}
		
		// add to query where criteria level abave
		if(player && player != "")
		{
			if(where)
				query += " and";
			else
				query += " where";
			
			query += " p.pname LIKE \'%" + player + "%\'";
		}
		// add to query order by orderBy orderDirection
		query += " order by " + orderBy + " " + orderDirection; 
		
		console.log("Debug[getOpponentsWithCriteria()]: Query = \"" +  query + "\"");
 		if (this.gft_dbConn)
		{
			var result = new Array();
			try 
			{
				var oStatement = this.gft_dbConn.createStatement(query);

				var step = 0;
				while (oStatement.executeStep())
				{
					var pid = oStatement.row.pid;
					var player = oStatement.row.pname;
					var guild = oStatement.row.pguild;
					var battlesCount = oStatement.row.battlesCount;
					result[step] = new DBPlayerData(pid, player, guild, battlesCount);
					step++;
				}
				oStatement.reset();
	
				return result;
			}
			catch (e) {alert("DB query failed. Could not get opponents list with criteria\n Period: " + period + "\nOrder by: " + orderBy + "\nDirection: " + orderDirection + "\nException: " + e);}
		}
	},
	
	/**
	* returns number of battles( atacks or defences) since specified time 
	* @param time - user defined time
	* @param server - server played on
	* @param atype - 1 if atacks, 0 if defences
	*/
	getNumberOfBattlesSinceCustomTime: function(time, server, atype)
	{
		console.log("Debug[getNumberOfBattlesSinceCustomTime()]: time: " + time + ", server: " + server + ", atype: " + atype);
		if (this.gft_dbConn)
		{
			var myid = this.getMyId(server);
			var n_battles = -1;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT count(battleid) AS nBattles from battles " + 
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
		console.log("Debug[getAllAtacksSinceTodayAndDefDaysBack()]: days: " + days + ", server: " + server);
		if (this.gft_dbConn)
		{
			var myid = this.getMyId(server);
			var n_battles = -1;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT count(battleid) AS nBattles from battles " + 
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
		console.log("Debug[getBattlesWon()]: server: " + server + ", atype: " + atype + ", period: " + period);
		
		if (this.gft_dbConn)
		{
			var myid = this.getMyId(server);
			
			var battlesWon = 0;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT count(b.battleid) as battlesWon " +
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
		console.log("Debug[getGoldRaised()]: pid: " + pid + ", server: " + server + ", atype: " + atype + ", period: " + period);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(pid, server, "pid");
			
			var gold = 0;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT sum(r.gold) as RaisedGold from reports r inner join battles b on r.battleid=b.battleid " + 
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
		console.log("Debug[getAllGoldRaised()]: server: " + server + ", atype: " + atype + ", period: " + period);
		if (this.gft_dbConn)
		{			
			var gold = 0;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT sum(r.gold) as RaisedGold from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE b.atype=:a_type AND atime >= :period");
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
		console.log("Debug[getMaxGold()]: pid: " + pid + ", server: " + server + ", atype: " + atype + ", period: " + period);
		if (this.gft_dbConn)
		{
			var oid = this.getPlayerId(pid, server, "pid");
			
			var gold = 0;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT max(r.gold) as RaisedGold from reports r inner join battles b on r.battleid=b.battleid " + 
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
		console.log("Debug[getWinChance()]: pid: " + pid + ", server: " + server);
		if (this.gft_dbConn)
		{
			var myid = this.getMyId(server);
			var oid = this.getPlayerId(pid, server, "pid");
			
			var battlesWon = 0;
			var allBattles = 0;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT count(b.battleid) as battlesWon, " + 
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
		console.log("Debug[getWinChance()]: pid: " + pid + ", server: " + server);
		if (this.gft_dbConn)
		{
			var myid = this.getMyId(server);
			var oid = this.getPlayerId(pid, server, "pid");
			
			var battlesWon = 0;
			var allBattles = 0;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT count(b.battleid) as battlesWon, " + 
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
		console.log("Debug[getExpRaised()]: pid: " + pid + ", server: " + server + ", period: " + period);
		if (this.gft_dbConn)
		{			
			var exp = 0;
			try 
			{
				var oStatement = this.gft_dbConn.createStatement("SELECT sum(r.exp) as RaisedExp from reports r inner join battles b on r.battleid=b.battleid " + 
																	"WHERE b.atype=1 AND atime >= :period" + ((pid > 0) ? " AND b.oid=:o_id" : ""));
				if(pid > 0)
				{
					var oid = this.getPlayerId(pid, server, "pid");
					oStatement.params.o_id = oid;
				}
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
		console.log("Debug[getTimePeriod()]: period: " + period);
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