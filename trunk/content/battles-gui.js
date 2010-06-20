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

GFT.Battles = (function()
{
	var orderByName = false;
	var orderByGuild = false;
	var orderByLevel = false;
	var orderByServer = false;
	var orderByAttacks = false;
	var orderByDefenses = false;
	var orderByGoldRaised = false;
	var orderByGoldLost = false;
	var orderByMaxGoldRaised = false;
	var orderByMaxGoldLost = false;
	var orderByExpRaised = false;
	var infoTimeOut = -1;
	var utils = GFT.Utils;
	var console = GFT.Utils.console;
	var db = GFT.DB;
	
	function initDB()
	{
		db.init();
		sortBy("name");
		document.getElementById("search-name").focus();
	}
	
	function sortBy(type)
	{
		var orderDirection = "asc";
		switch (type)
		{
			case "name": { 
				orderByName = !orderByName;
				orderByName ? orderDirection = "asc" : orderDirection = "desc"; 
				search("name", orderDirection);
				break;
				}
			case "guild": { 
				orderByGuild = !orderByGuild;
				orderByGuild ? orderDirection = "asc" : orderDirection = "desc"; 
				search("guild", orderDirection);
				break;
				}
			case "level": { 
				orderByLevel = !orderByLevel;
				orderByLevel ? orderDirection = "asc" : orderDirection = "desc"; 
				search("level", orderDirection);
				break;
			}
			case "server": { 
				orderByServer = !orderByServer;
				orderByServer ? orderDirection = "asc" : orderDirection = "desc"; 
				search("server", orderDirection);
				break;
			}
			case "attacks": { 
				orderByAttacks = !orderByAttacks;
				orderByAttacks ? orderDirection = "asc" : orderDirection = "desc"; 
				search("a.attacks", orderDirection);
				break;
			}
			case "defenses": { 
				orderByDefenses = !orderByDefenses;
				orderByDefenses ? orderDirection = "asc" : orderDirection = "desc"; 
				search("d.defenses", orderDirection);
				break;
			}
			case "goldRaised": { 
				orderByGoldRaised = !orderByGoldRaised;
				orderByGoldRaised ? orderDirection = "asc" : orderDirection = "desc"; 
				search("a.goldRaised", orderDirection);
				break;
			}
			case "goldLost": { 
				orderByGoldLost = !orderByGoldLost;
				orderByGoldLost ? orderDirection = "asc" : orderDirection = "desc"; 
				search("d.goldLost", orderDirection);
				break;
			}
			case "maxGoldRaised": { 
				orderByMaxGoldRaised = !orderByMaxGoldRaised;
				orderByMaxGoldRaised ? orderDirection = "asc" : orderDirection = "desc"; 
				search("a.maxGoldRaised", orderDirection);
				break;
			}
			case "maxGoldLost": { 
				orderByMaxGoldLost = !orderByMaxGoldLost;
				orderByMaxGoldLost ? orderDirection = "asc" : orderDirection = "desc"; 
				search("d.maxGoldLost", orderDirection);
				break;
			}
			case "expRaised": { 
				orderByExpRaised = !orderByExpRaised;
				orderByExpRaised ? orderDirection = "asc" : orderDirection = "desc"; 
				search("a.expRaised", orderDirection);
				break;
			}
			default: console.log("nothing clicked"); break;
		}
	}
	
	function search(orderBy, orderDirection)
	{	
		if(document.getElementById("battles-rows").firstChild)
			removeAllTreeChildren();
		
		if(infoTimeOut != -1)
			window.clearTimeout(infoTimeOut);
		
		//TODO search servers
		var name = document.getElementById("search-name").value;
		var level = document.getElementById("search-level").value;
		var period = document.getElementById("search-period").selectedItem.id;
		
		var opponents = db.getOpponentsWithCriteria(period, orderBy, orderDirection, name, level);
		
		var info = document.getElementById("load-info");
		info.hidden = false;
		info.value = opponents.length + " " + utils.getString("loadedEntries") + ".";
		
		for(var i = 0; i < opponents.length; i++)
		{
			var playerData = opponents[i];
			createTreeRow(playerData);
		} 
		infoTimeOut = window.setTimeout(function(e) { info.hidden = true; }, 10000);
	}
	
	function createTreeCell(labelValue)
	{
		var treeCell = document.createElement("treecell");
		treeCell.setAttribute("label", labelValue);
		return treeCell;
	}
	
	function createTreeRow(playerData)
	{
		var treechildren = document.getElementById("battles-rows");
		var treeitem = document.createElement("treeitem");
		var treerow = document.createElement("treerow");
		
		var nameCell = createTreeCell(playerData.name);
		var guildCell = createTreeCell(getValueOrNone(playerData.guild));
		var levelCell = createTreeCell(playerData.level);
		var serverCell = createTreeCell(playerData.server);
		var attacksCell = createTreeCell(getValueOrZero(playerData.attacks));
		var defensesCell = createTreeCell(getValueOrZero(playerData.defenses));
		var goldRaisedCell = createTreeCell(getValueOrZero(playerData.goldRaised));
		var goldLostCell = createTreeCell(getValueOrZero(playerData.goldLost));
		var maxGoldRaisedCell = createTreeCell(getValueOrZero(playerData.maxGoldRaised));
		var maxGoldLostCell = createTreeCell(getValueOrZero(playerData.maxGoldLost));
		var expRaisedCell = createTreeCell(getValueOrZero(playerData.expRaised));
		
		treerow.appendChild(nameCell);
		treerow.appendChild(guildCell);
		treerow.appendChild(levelCell);
		treerow.appendChild(serverCell);
		treerow.appendChild(attacksCell);
		treerow.appendChild(defensesCell);
		treerow.appendChild(goldRaisedCell);
		treerow.appendChild(goldLostCell);
		treerow.appendChild(maxGoldRaisedCell);
		treerow.appendChild(maxGoldLostCell);
		treerow.appendChild(expRaisedCell);
		treeitem.appendChild(treerow);
		treechildren.appendChild(treeitem);
	}
	
	function getValueOrZero(value)
	{
		return (value && value != "" ? value : "0");
	}
	
	function getValueOrNone(value)
	{
		return (value != "none" ? value : utils.getString("none"));
	}
	
	function removeAllTreeChildren()
	{
		var treechildren = document.getElementById("battles-rows");
		while (treechildren.firstChild) 
			treechildren.removeChild(treechildren.firstChild);
	}
	
	return {
		init: function()
		{
			initDB();
		},
		defaultSearch: function()
		{
			sortBy("name");
		},
		sort: function(type)
		{
			sortBy(type);
		}
	};
})();