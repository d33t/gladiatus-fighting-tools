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
	var orderByLastAttack = false;
	var opponentsStore = null;
	var lastOrderBy = "name";
	var lastSortDirection = "asc";
	const ROWS_PER_PAGE = 20;
	var currentPage = 0;
	var infoTimeOut = -1;
	var battleLogTimeOut = -1;
	var utils = GFT.Utils;
	var console = GFT.Utils.console;
	var db = GFT.Globals.Database;
	var prefMan = new GFT.PrefManager();
	
	function initPreferences() {
		var advancedOptionsChecked = prefMan.getValue("options.tabs.others.advancedOptionsExpandedDefault", false);
		if(advancedOptionsChecked) {
			toogleAdvancedOptions(false);
		}
		document.getElementById("exclude-allies").checked = prefMan.getValue("options.tabs.others.excludeMyAlliesDefault", true);
		document.getElementById("search-by-period").selectedIndex = utils.getMenuItemIndexById("search-by-period", prefMan.getValue("options.tabs.others.searchByPeriodDefault", "oneday"));
		document.getElementById("search-by-server").selectedIndex = utils.getMenuItemIndexById("search-by-server", prefMan.getValue("options.tabs.others.searchByServer", "allServers"));
		document.getElementById("search-by-location").selectedIndex = utils.getMenuItemIndexById("search-by-location", prefMan.getValue("options.tabs.others.searchByLocationDefault", "location-arena"));
		document.getElementById("search-by-attack-type").selectedIndex = utils.getMenuItemIndexById("search-by-attack-type", prefMan.getValue("options.tabs.others.searchByAttackTypeDefault", "atype-all"));
		document.getElementById("search-by-level-high").value = prefMan.getValue("options.tabs.others.searchByHighLevelDefault", "");
		document.getElementById("search-by-level-low").value = prefMan.getValue("options.tabs.others.searchByLowLevelDefault", "");
	}
	
	function getOrderDirection(orderByType) {
		return orderByType ? "asc" : "desc"; 
	}
	
	function sortBy(type) {
		var orderDirection = "asc";
		switch (type) {
			case "rName": { 
				orderByName = !orderByName;
				orderDirection = getOrderDirection(orderByName);
				break;
				}
			case "rGuild": { 
				orderByGuild = !orderByGuild;
				orderDirection = getOrderDirection(orderByGuild);
				break;
				}
			case "rLevel": { 
				orderByLevel = !orderByLevel;
				orderDirection = getOrderDirection(orderByLevel);
				break;
			}
			case "rServer": { 
				orderByServer = !orderByServer;
				orderDirection = getOrderDirection(orderByServer);
				break;
			}
			case "rAttacks": { 
				orderByAttacks = !orderByAttacks;
				orderDirection = getOrderDirection(orderByAttacks);
				break;
			}
			case "rDefenses": { 
				orderByDefenses = !orderByDefenses;
				orderDirection = getOrderDirection(orderByDefenses);
				break;
			}
			case "rGoldRaised": { 
				orderByGoldRaised = !orderByGoldRaised;
				orderDirection = getOrderDirection(orderByGoldRaised);
				break;
			}
			case "rGoldLost": { 
				orderByGoldLost = !orderByGoldLost;
				orderDirection = getOrderDirection(orderByGoldLost);
				break;
			}
			case "rMaxGoldRaised": { 
				orderByMaxGoldRaised = !orderByMaxGoldRaised;
				orderDirection = getOrderDirection(orderByMaxGoldRaised);
				break;
			}
			case "rMaxGoldLost": { 
				orderByMaxGoldLost = !orderByMaxGoldLost;
				orderDirection = getOrderDirection(orderByMaxGoldLost);
				break;
			}
			case "rExpRaised": { 
				orderByExpRaised = !orderByExpRaised;
				orderDirection = getOrderDirection(orderByExpRaised);
				break;
			}
			case "rLastAttackTime": { 
				orderByLastAttack = !orderByLastAttack;
				orderDirection = getOrderDirection(orderByLastAttack);
				break;
			}
			default: console.log("nothing clicked"); break;
		}
		lastOrderBy = type;
		lastSortDirection = orderDirection;
		search(type, orderDirection);
	}
	
	function toogleAdvancedOptions(checked) {
			// dummy check box
			document.getElementById("advanced-options").checked = ((checked == false) ? checked : !document.getElementById("advanced-options").checked);
			document.getElementById("advanced-options-splitter").click();
	}
	
	function toogleNavigationButtons() {
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
		showTable();	
	}
	
	function showNextPage() {
		currentPage++;
		toogleNavigationButtons();
		showTable();
	}
	
	function showPreviousPage() {
		currentPage--;
		if(currentPage < 0) {
			currentPage = 0;
		}
		toogleNavigationButtons();
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
		
		toogleNavigationButtons();
/* 		document.getElementById("pageInfo").value = utils.getString("from") + " " +  (Math.floor(startIndex/ROWS_PER_PAGE) + 1)  
													+ " " + utils.getString("to") + " " + (Math.floor(endIndex/ROWS_PER_PAGE) + 1)
													+ " " + utils.getString("total") + " " + Math.ceil(opponentsStore.length/ROWS_PER_PAGE);  */
		document.getElementById("pageInfo").value = utils.getString("from") + " " +  startIndex  
													+ " " + utils.getString("to") + " " + endIndex
													+ " " + utils.getString("total") + " " + opponentsStore.length; 
	}
	
	function search(orderBy, orderDirection) {
		clearTable();
		if(infoTimeOut != -1) {
			window.clearTimeout(infoTimeOut);
		}
		
		var name = document.getElementById("search-by-name").value;
		var lowLevel = document.getElementById("search-by-level-low").value;
		var highLevel = document.getElementById("search-by-level-high").value;
		var excludeAllies = document.getElementById("exclude-allies").checked;
		var period = document.getElementById("search-by-period").selectedItem.id;
		var server = document.getElementById("search-by-server").selectedItem.id;
		var location = document.getElementById("search-by-location").selectedItem.id;
		var attackType = document.getElementById("search-by-attack-type").selectedItem.id;
		if(location == "location-arena") {
			location = 0;
		} else if(location == "location-circus-turma") {
			location = 1;
		}
		
		opponentsStore = db.getOpponentsWithCriteria(period, orderBy, orderDirection, name, lowLevel, highLevel, server, location, excludeAllies, attackType);
		
		var infoMsgNode = document.getElementById("gft-info-messages");
		infoMsgNode.hidden = false;;
		var info = document.getElementById("load-info");
		info.value = opponentsStore.length + " " + utils.getString("loadedEntries") + ".";
		
		showTable();
		infoTimeOut = window.setTimeout(function(e) { infoMsgNode.hidden = true; info.value = ""; }, 5000);
	}
	
	function createTreeCell(labelValue) {
		var treeCell = document.createElement("treecell");
		treeCell.setAttribute("label", labelValue);
		return treeCell;
	}
	
	function createTreeRow(playerData) {
		var treechildren = document.getElementById("battles-rows");
		var treeitem = document.createElement("treeitem");
		treeitem.setAttribute("id", playerData.server + "#" + playerData.pid + "#" + playerData.name + "#" + playerData.level);
		var treerow = document.createElement("treerow");
		
		var nameCell = createTreeCell(playerData.name);
		var guildCell = createTreeCell(renderGuild(playerData.guild));
		var levelCell = createTreeCell(playerData.level);
		var serverCell = createTreeCell(playerData.server);
		var attacksCell = createTreeCell(renderNumberValue(playerData.attacks, true));
		var defensesCell = createTreeCell(renderNumberValue(playerData.defenses, true));
		var goldRaisedCell = createTreeCell(renderNumberValue(playerData.goldRaised, true));
		var goldLostCell = createTreeCell(renderNumberValue(playerData.goldLost, true));
		var maxGoldRaisedCell = createTreeCell(renderNumberValue(playerData.maxGoldRaised, true));
		var maxGoldLostCell = createTreeCell(renderNumberValue(playerData.maxGoldLost, true));
		var expRaisedCell = createTreeCell(renderNumberValue(playerData.expRaised, true));
		var nextPossibleAttackValue;
		if(renderNumberValue(playerData.attacks, false) > 0) {
			nextPossibleAttackValue = GFT.Main.getNextPossibleAtack(playerData.pid, playerData.server, "pid", true, false);
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
	
	function renderNumberValue(value, showInGroups) {
		return (value && value != "" ? (showInGroups ? utils.partitionateNumber(value) : value) : 0);
	}
	
	function renderGuild(value) {
		return (value != GFT.Constants.DEFAULT_GUILD ? value : utils.getString("none"));
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
	
	function getFightUrl(pid, name, server, isArena) {
		if(pid > 0) {
			if(isArena) {
				return GFT.Constants.HTTP_PROTOCOL + server + "/game/ajax/doArenaFight.php?did=" + pid + "&a=" + utils.getTime();
			} else {
				return GFT.Constants.HTTP_PROTOCOL + server + "/game/ajax/doGroupFight.php?did=" + pid + "&a=" + utils.getTime();
			}
		} else {
			if(isArena) {
				return GFT.Constants.HTTP_PROTOCOL + server + "/game/ajax/doArenaFight.php?dname=" + encodeURIComponent(name) + "&a=" + utils.getTime();
			} else {
				return GFT.Constants.HTTP_PROTOCOL + server + "/game/ajax/doGroupFight.php?dname=" + encodeURIComponent(name) + "&a=" + utils.getTime();
			}
		}
	}
	
	function showTCAlertMessage() {
		var msg = utils.getString("tcAlertMessage.row1") + "."
				+ "\n" + utils.getString("tcAlertMessage.row2") + ":"
				+ "\n" + utils.getString("tcAlertMessage.row3") + "."
				+ "\n" + utils.getString("tcAlertMessage.row4") + ".";
		if(confirm(msg)) {
			GFT.Statusbar.handleAction("options");
		}
	}
	
	function evaluateResponse(responseDetails, server, isArena) {
		if(battleLogTimeOut != -1) {
			window.clearTimeout(battleLogTimeOut);
		}
		var result = utils.getFightResponseResult(responseDetails);
		var battleLog = document.getElementById("battleLog");
		
		if(result.success) { //success
			battleLog.setAttribute("class", "battlelog-success");
			var url = utils.getFightResponseUrl(server, responseDetails);
			if(server != utils.getServer()) {
				utils.loadUrl(url, true);
			} else {
				utils.loadUrl(url, false);
			}
			if(prefMan.getValue("options.tabs.main.collapseBattleOverlayAfterBattle", true)) {
				GFT.Statusbar.handleAction("battles");
			}
		} else { //failure
			battleLog.setAttribute("class", "battlelog-failure");
		}
		
		var infoMsgNode = document.getElementById("gft-info-messages");
		infoMsgNode.hidden = false;
		battleLog.value = result.msg;
		battleLogTimeOut = window.setTimeout(function(e) { infoMsgNode.hidden = true; battleLog.value = ""; }, 10000);
	}
	
	function tryToFight(item, isArena) {
		if(!prefMan.getValue("options.tabs.main.showBattlePopupMenu", false)) {							
			showTCAlertMessage();
			return;
		}
		item = item.split("#");
		var server = item[0];
		var pid = parseInt(item[1]);
		var name = item[2];
		var level = item[3];
		var fightUrl = getFightUrl(pid, name, server, isArena);
		var gladiator = new GFT.Gladiator();
		gladiator.setId(pid);
		gladiator.setName(name);		
		gladiator.setLevel(level);
		
		if(GFT.Main.isLevelBashed(gladiator.getLevel(), server)) {
			var info = db.isGladiatorInfoOutOfDate(server, gladiator, "oneday");
			var message = utils.getString("notification.levelbashing.message");
			if(info.needUpdate) {
				message += "\n" + utils.getString("notification.levelbashing.outofdate")
							+ "\n" + utils.getString("notification.levelbashing.lastupdate") + " " + utils.unixtimeToHumanReadable(info.lastUpdate) + ".";
			}
			message += "\n\n" + utils.getString("notification.levelbashing.question");
			showLevelBashingDialog(message, pid, server, fightUrl, isArena);
		} else {
			startFight(fightUrl, server, isArena);
		}
	}
	
	function showLevelBashingDialog(message, pid, server, fightUrl, isArena) {
		try {
			const prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
									  .getService(Components.interfaces.nsIPromptService);
			var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +  
				prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +  
				prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL; 
			var button = prompts.confirmEx(null,
										utils.getString("notification.levelbashing.dialog.title"),
										message,
										flags,
										utils.getString("notification.levelbashing.buttons.attack"),
										utils.getString("notification.levelbashing.buttons.showprofile"),
										"",
										null,
										{value: false});

			if (button == 0) { // "Attack anyway" button
				startFight(fightUrl, server, isArena);
			} else if(button == 1) { // "Show profile" button
				showProfile(pid, server);
			}
		} catch (e) { console.error("Failed to handle level-bashing prompt\n" + e); }	
	}
	
	function startFight(fightUrl, server, isArena) {
		utils.doHttpRequest({
			method: "GET",
			url: fightUrl,
			onload: function(responseDetails) {
				evaluateResponse(responseDetails, server, isArena);
			}
		});	
	}
	
	function showProfile(pid, server) {
		var url = GFT.Constants.HTTP_PROTOCOL + server + "/game/index.php?mod=player&p=" + pid + "&sh=" + prefMan.getValue("secureHash." + server, "");
		if(server != utils.getServer()) {
			utils.loadUrl(url, true);
		} else {
			utils.loadUrl(url, false);
		}	
	}
	
	return {
		init: function() {
			document.getElementById("battles-rows").addEventListener('dblclick',this.handleRowClick,true);
			var activeServers = db.getAllActiveServers();
			for(var i = 0; i < activeServers.length; i++) {
				utils.appendToDD("serversMenu", activeServers[i]);
			}
			
			var advancedOptionsSplitter = document.getElementById("advanced-options-splitter");
			advancedOptionsSplitter.addEventListener("click", function(event){
				document.getElementById("advanced-options").checked = !document.getElementById("advanced-options").checked;
			}, false);
			document.getElementById("gft-info-messages").hidden = true;
			initPreferences();
			lastOrderBy = prefMan.getValue("options.tabs.others.defaultSortColumn", "rName");
			lastSortDirection = prefMan.getValue("options.tabs.others.defaultSortDirection", "asc");
			search(lastOrderBy, lastSortDirection);
			toogleNavigationButtons();
		},
		
		nextPage: showNextPage,
		
		previousPage: showPreviousPage,
		
		firstPage: showFirstPage,
		
		lastPage: showLastPage,
		
		advancedOptions: toogleAdvancedOptions,

		defaultSearch: function() {
			search(lastOrderBy, lastSortDirection);
		},
		
		sort: function(type) {
			sortBy(type);
		},
		
		handleRowClick: function(event) {
			var itemId = getSelectedItemId();
			if(itemId) {
				var loc = prefMan.getValue("options.tabs.main.defaultDoubleClickAction", "location-arena");	
				var isArena = ((loc == "location-arena") ? true : false);
				console.log("Fighting on " + loc.split("-").join(" ") + " with " + itemId.split("#")[2]);
				tryToFight(itemId, isArena);
			}
		},
		
		handleRowMenu: function(event) {
			var action = event.target.id;
			var itemId = getSelectedItemId();
			if(itemId) {
				var server = itemId.split("#")[0];
				var pid = itemId.split("#")[1];
				var opponent = itemId.split("#")[2];
				
				switch (action) {
					case "fightArena": {
						console.log("Fighting on " + action + " with " +  opponent);
						tryToFight(itemId, true);
						break;
					}
					case "fightCirkus": {
						console.log("Fighting on " + action + " with " +  opponent);
						tryToFight(itemId, false);
						break;
					}
					case "showProfile": {
						console.log("Showing profile for: " + opponent);
						if(pid > 0) {
							showProfile(pid, server);
						} else {
							alert(utils.getString("dataIncomplete"));
						}
					}
				}
			}
		}
	};
})();