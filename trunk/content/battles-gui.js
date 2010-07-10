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

GFT.Battles = (function() {
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
	var opponentsStore = null;
	var lastOrderBy = "name";
	var lastSortDirection = "asc";
	const HTTP_PROTOCOL = "http://";
	const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
	const ROWS_PER_PAGE = 20;
	var currentPage = 0;
	var infoTimeOut = -1;
	var battleLogTimeOut = -1;
	var utils = GFT.Utils;
	var console = GFT.Utils.console;
	var db = GFT.DB;
	
	function sortBy(type) {
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
		lastOrderBy = type;
		lastSortDirection = orderDirection;
	}
	
	function togleNavigationButtons() {
		var prevBtn = document.getElementById("prevPageBtn");
		var nextBtn = document.getElementById("nextPageBtn");
		var firstBtn = document.getElementById("firstPageBtn");
		var lastBtn = document.getElementById("lastPageBtn");
		
		if(currentPage <= 0) {
			prevBtn.disabled = true;
			firstBtn.disabled = true;
		} else {
			prevBtn.disabled = false;
			firstBtn.disabled = false;
		}
		
		if((currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE) > opponentsStore.length) {
			nextBtn.disabled = true;
			lastBtn.disabled = true;
		} else {
			nextBtn.disabled = false;
			lastBtn.disabled = false;
		}
	}
	
	function showFirstPage() {
		currentPage = 0;
		showTable();		
	}
	
	function showLastPage() {
		currentPage = Math.floor(opponentsStore.length/ROWS_PER_PAGE);
		console.log("Current page: " + currentPage);
		showTable();	
	}
	
	function showNextPage() {
		currentPage++;
		togleNavigationButtons();
		showTable();
	}
	
	function showPreviousPage() {
		currentPage--;
		if(currentPage < 0) {
			currentPage = 0;
		}
		togleNavigationButtons();
		showTable();
	}

	function clearTable() {
		if(document.getElementById("battles-rows").firstChild) {
			removeAllTreeChildren();
		}		
	}
	
	function showTable() {
		clearTable();
		
		var startIndex = currentPage * ROWS_PER_PAGE;
		var endIndex = currentPage * ROWS_PER_PAGE +  ROWS_PER_PAGE;
		
		if(startIndex > opponentsStore.length) {
			currentPage = 0;
			startIndex = 0; 
			endIndex = currentPage * ROWS_PER_PAGE +  ROWS_PER_PAGE;
		}
		if(endIndex > opponentsStore.length) {
			endIndex = opponentsStore.length;
		}
		
		for(var i = startIndex; i < endIndex; i++) {
			var playerData = opponentsStore[i];
			createTreeRow(playerData);
		}
		
		togleNavigationButtons();
		document.getElementById("pageInfo").value = utils.getString("from") + " " +  (Math.floor(startIndex/ROWS_PER_PAGE) + 1)  
													+ " " + utils.getString("to") + " " + (Math.floor(endIndex/ROWS_PER_PAGE) + 1)
													+ " " + utils.getString("total") + " " + Math.ceil(opponentsStore.length/ROWS_PER_PAGE); 
	}
	
	function search(orderBy, orderDirection) {
		clearTable();
		if(infoTimeOut != -1) {
			window.clearTimeout(infoTimeOut);
		}
		
		var name = document.getElementById("search-by-name").value;
		var level = document.getElementById("search-by-level").value;
		var period = document.getElementById("search-by-period").selectedItem.id;
		var server = document.getElementById("search-by-server").selectedItem.id;
		
		opponentsStore = db.getOpponentsWithCriteria(period, orderBy, orderDirection, name, level, server);
		
		var info = document.getElementById("load-info");
		info.hidden = false;
		info.value = opponentsStore.length + " " + utils.getString("loadedEntries") + ".";
		
		showTable();
		infoTimeOut = window.setTimeout(function(e) { info.hidden = true; }, 5000);
	}
	
	function createTreeCell(labelValue) {
		var treeCell = document.createElement("treecell");
		treeCell.setAttribute("label", labelValue);
		return treeCell;
	}
	
	function createTreeRow(playerData) {
		var treechildren = document.getElementById("battles-rows");
		var treeitem = document.createElement("treeitem");
		treeitem.setAttribute("id", playerData.server + "#" + playerData.pid + "#" + playerData.name);
		var treerow = document.createElement("treerow");
		
		var nameCell = createTreeCell(playerData.name);
		var guildCell = createTreeCell(renderGuild(playerData.guild));
		var levelCell = createTreeCell(playerData.level);
		var serverCell = createTreeCell(playerData.server);
		var attacksCell = createTreeCell(renderNumberValue(playerData.attacks));
		var defensesCell = createTreeCell(renderNumberValue(playerData.defenses));
		var goldRaisedCell = createTreeCell(renderNumberValue(playerData.goldRaised));
		var goldLostCell = createTreeCell(renderNumberValue(playerData.goldLost));
		var maxGoldRaisedCell = createTreeCell(renderNumberValue(playerData.maxGoldRaised));
		var maxGoldLostCell = createTreeCell(renderNumberValue(playerData.maxGoldLost));
		var expRaisedCell = createTreeCell(renderNumberValue(playerData.expRaised));
		var nextPossibleAttackValue;
		if(renderNumberValue(playerData.attacks) > 0) {
			nextPossibleAttackValue = GFT.Main.getNextPossibleAtack(playerData.pid, playerData.server, "pid", true);
		} else {
			nextPossibleAttackValue = utils.getString("nextpossiblefightnow");
		}
		var nextPossibleAttack = createTreeCell(nextPossibleAttackValue);
		
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
		treerow.appendChild(nextPossibleAttack);
		treeitem.appendChild(treerow);
		treechildren.appendChild(treeitem);
	}
	
	function renderNumberValue(value) {
		return (value && value != "" ? value : 0);
	}
	
	function renderGuild(value) {
		return (value != "none" ? value : utils.getString("none"));
	}
	
	function removeAllTreeChildren() {
		var treechildren = document.getElementById("battles-rows");
		while (treechildren.firstChild) {
			treechildren.removeChild(treechildren.firstChild);
		}
	}
	
	function getSelectedItemId() {
		var tree = document.getElementById("gft-battles-tree");
		if(tree.currentIndex >= 0) {
			return tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex).id;
		}
		return false;
	}
	
	function getFightUrl(id, isArena) {
		id = id.split("#");
		server = id[0];
		pid = id[1];
		if(isArena) {
			return HTTP_PROTOCOL + server + "/game/ajax/doArenaFight.php?did=" + pid + "&a=" + utils.getTime();
		} else {
			return HTTP_PROTOCOL + server + "/game/ajax/doGroupFight.php?did=" + pid + "&a=" + utils.getTime();
		}
	}
	
	function evaluateResponse(responseDetails, server, isArena) {//TODO translate
		if(battleLogTimeOut != -1) {
			window.clearTimeout(battleLogTimeOut);
		}
		var response = responseDetails.responseText;
		var errorPage = /errorText/i.test(response);
		var workPageRedirect = /document\.location\.href=\"index\.php\?mod=work&sh.*/.test(response);
		var foundBashText = /bashtext/i.test(response);
		var notLoggedIn = /document\.location\.href=document\.location\.href;/i.test(response);
		var msg = "";
		var battleLog = document.getElementById("battleLog");
		battleLog.setAttribute("class", "battlelog-failure");
		if(notLoggedIn) { //not logged in	
			msg = utils.getString("notLoggedInOrNoSuchNameWarning");
		} 
		else if(workPageRedirect) { // the gladiator is working
			msg = utils.getString("workingInTheStableWarning");
		} else if(response == "") { // cooldown not finished
			msg = utils.getString("cooldownWarning");
		} else if(errorPage){ // the opponent has fight recently
			msg = utils.getString("restingOrNotEnoughGoldWarning");
		}
		else if(foundBashText) { // the gladiator is about to bash the opponent
			msg = utils.getString("aboutToBashWarning");
		} else { // battle was successful
			battleLog.setAttribute("class", "battlelog-success");
			msg = utils.getString("fightSuccessful");
			response = response.split("'");
			var url = HTTP_PROTOCOL + server + "/game/" + utils.trimmer.trim(response[1]);
			if(server != utils.getServer()) {
				utils.loadUrl(url, true);
			} else {
				utils.loadUrl(url, false);
			}
		}
		
		battleLog.value = msg;
		battleLogTimeOut = window.setTimeout(function(e) { battleLog.value = ""; }, 10000);
	}
	
	return {
		init: function() {
			document.getElementById("battles-rows").addEventListener('dblclick',this.handleRowClick,true);
			var activeServers = db.getAllActiveServers();
			var serversDropDown = document.getElementById("serversMenu");
			for(var i = 0; i < activeServers.length; i++) {
				console.log("Creating item: " + activeServers[i]);
				var menuItem = document.createElementNS(XUL_NS, "menuitem");
				menuItem.setAttribute("id", activeServers[i]);
				menuItem.setAttribute("label", activeServers[i]);
				serversDropDown.appendChild(menuItem);
			}
			sortBy("name");
			togleNavigationButtons();
		},
		defaultSearch: function() {
			search(lastOrderBy, lastSortDirection);
		},
		nextPage: showNextPage,
		previousPage: showPreviousPage,
		firstPage: showFirstPage,
		lastPage: showLastPage,
		sort: function(type) {
			var activeServers = db.getAllActiveServers();
			sortBy(type);
		},
		handleRowClick: function(event) {
			var itemId = getSelectedItemId();
			if(itemId) {
				console.log("Fighting on arena with " + itemId.split("#")[2]);
				utils.doHttpRequest({
				    method: "GET",
				    url: getFightUrl(itemId, true),
				    onload: function(responseDetails) {
						evaluateResponse(responseDetails, itemId.split("#")[0], true);
					}
			    });
			}
		},
		handleRowMenu: function(event) {
			var action = event.target.id;
			var itemId = getSelectedItemId();
			if(itemId) {
				var server = itemId.split("#")[0];
				var opponent = itemId.split("#")[2];
				switch (action) {
					case "fightArena": {
						console.log("Fighting on " + action + " with " +  opponent);
						utils.doHttpRequest({
						    method: "GET",
						    url: getFightUrl(itemId, true),
						    onload: function(responseDetails) {
								evaluateResponse(responseDetails, server, true);
							}
					    });
						break;
					}
					case "fightCirkus": {
						console.log("Fighting on " + action + " with " +  itemId.split("#")[2]);
						utils.doHttpRequest({
						    method: "GET",
						    url: getFightUrl(itemId, false),
						    onload: function(responseDetails) {
								evaluateResponse(responseDetails, server, false);
							}
					    });
						break;
					}
					case "showProfile": {
						console.log("Showing profile for id: " + itemId);
					}
				}
			}
		}
	};
})();