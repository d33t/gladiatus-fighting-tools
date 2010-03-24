var gftScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
gftScriptLoader.loadSubScript("chrome://gft/content/gft_utils.js");
gftScriptLoader.loadSubScript("chrome://gft/content/objects.js");
gftScriptLoader.loadSubScript("chrome://gft/content/gft_db.js");

var battles = {
	initialized: false,
	orderPlayer: false,
	orderGuild: false,
	orderBattles: false,
	infoTimeOut: -1,
	
	init: function()
	{
		this.initialized = true;
		gft_db.init();
		this.defaultSearch();
		document.getElementById("searchplayername").focus();	
	},
	
	onLoad: function() 
	{
		if(this.initialized)
			return;	

		window.removeEventListener("load", function(e) { battles.onLoad(e); }, false);
		this.init();
	},
	
	onUnLoad: function() 
	{
		this.initialized = false;
	},
	
	defaultSearch: function()
	{
		this.sort("player");
	},
	
	sort: function(type)
	{
		var order = "asc";
		switch (type)
		{
			case "player": { 
							this.orderPlayer = !this.orderPlayer;
							this.orderPlayer ? order = "asc" : order = "desc"; 
							this.search("p.pname", order);
							break;
						}
			case "guild": { 
							this.orderGuild = !this.orderGuild;
							this.orderGuild ? order = "asc" : order = "desc"; 
							this.search("p.pguild", order);
							break;
						}
			case "battlescount": { 
							this.orderBattles = !this.orderBattles;
							this.orderBattles ? order = "asc" : order = "desc"; 
							this.search("c.battlesCount", order);
							break;
						}
			default: console.log("nothing clicked"); break;
		}
	},
	
	search: function(orderBy, orderDirection)
	{	
		if(document.getElementById("showbattlestreechildren").firstChild)
			this.removeAllTreeChildren();
		
		if(this.infoTimeOut != -1)
			window.clearTimeout(this.infoTimeOut);
		
		var player = document.getElementById("searchplayername").value;
		var abovelvl = document.getElementById("searchplayerlevel").value;
		var period = document.getElementById("selectsearchtimeperiod").selectedItem.value;
		
		var opponents = gft_db.getOpponentsWithCriteria(period, orderBy, orderDirection, abovelvl, player);
		
		var info = document.getElementById("loadinginfo");
		info.hidden = false;
		info.value = opponents.length + " " + gft_utils.getString("loadedEntries") + ".";
		
		for(var i = 0; i < opponents.length; i++)
		{
			var playerData = opponents[i];
			var pid = playerData.pid;
			var pname = playerData.name;
			var pGuild = playerData.guild;
			var battlesCount = playerData.battlesCount;
			this.createTreeItemElement((pname && pname != "") ? pname : "undefined[" + pid + "]", pGuild, battlesCount);
		} 
		this.infoTimeOut = window.setTimeout(function(e) { info.hidden = true; }, 10000);
	},
	
	createTreeItemElement: function(playerdata, guilddata, battlescountdata)
	{
		var treechildren = document.getElementById("showbattlestreechildren");
		var treeitem = document.createElement("treeitem");
		var treerow = document.createElement("treerow");
		
		var treecellplayer = document.createElement("treecell");
		treecellplayer.setAttribute("label", playerdata);
		
		var treecellguild = document.createElement("treecell");
		treecellguild.setAttribute("label", guilddata);
		
		var treecellbattlescount = document.createElement("treecell");
		treecellbattlescount.setAttribute("label", battlescountdata);
		
		treerow.appendChild(treecellplayer);
		treerow.appendChild(treecellguild);
		treerow.appendChild(treecellbattlescount);
		treeitem.appendChild(treerow);
		treechildren.appendChild(treeitem);
	},
	
	removeAllTreeChildren: function()
	{
		var treechildren = document.getElementById("showbattlestreechildren");
		while (treechildren.firstChild) 
			treechildren.removeChild(treechildren.firstChild);
	}
};

window.addEventListener("load", function(e) { battles.onLoad(e); }, false);