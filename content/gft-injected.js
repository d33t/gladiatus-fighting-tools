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

if (typeof(GFT) == "undefined") {
	var GFT = {};
};

GFT.Inject = (function(){
	function setVariousSettings(doc) {
		var xResult;
		if(GM_getValue("options.tabs.others.markMyAllies", true)) {
			xResult = doc.evaluate("//td[@id='content']/table/tbody/tr/td[2]/div[2]/b/a", doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
			if(!gladiatorExists(xResult)) { return; } // gladiator doesn't exists
			var guildNode = xResult.snapshotItem(0);
			if(guildNode) {
				var guild = guildNode.textContent.split(" ")[0];
				if(GM_isMyAlly(guild, doc)) {
					guildNode.style.color = "green";
				}
			}
		}
	}

	function getLocationCode(location) {
		switch(location) {
			case "location-all": return -1;
			case "location-arena": return 0;
			case "location-circus-turma": return 1; 
			default: return -1;			
		}
	}
	
	function insertAfter(parent, node, referenceNode) {
		parent.insertBefore(node, referenceNode.nextSibling);
	}
	
	function gladiatorExists(xResult) {
		return xResult.snapshotLength > 0;
	}
	
	function createAndInjectBattleInfo(doc) {
		var insertPosition = GM_getValue("options.tabs.others.battlesTablePosition", "before");
		if(insertPosition == "hide") {
			return;
		}
		var xPath = "//td[@id='content']/table";
		var xResult = doc.evaluate(xPath, doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		if(!gladiatorExists(xResult)) { return; } // gladiator doesn't exists
		var descriptionDiv = xResult.snapshotItem(0);
		var msgDiv = doc.createElement('div');
		msgDiv.id = "gfBattleStats";
		msgDiv.style.marginLeft = "17px";
		msgDiv.style.marginRight = "26px";
		if(insertPosition == "before") {
			descriptionDiv.parentNode.insertBefore(msgDiv, descriptionDiv);
		} else {
			insertAfter(descriptionDiv.parentNode, msgDiv, descriptionDiv);
		}
		
		var defaultSearchPeriod = GM_getValue("options.tabs.battlesTable.btDefaultSearchPeriod", "oneday");
		var defaultSearchLocation = GM_getValue("options.tabs.battlesTable.btDefaultSearchLocation", "location-arena");
		
		var searchPeriodDiv = doc.createElement('div');
		searchPeriodDiv.id = "selected-search-period";
		searchPeriodDiv.style.display = "none";
		descriptionDiv.parentNode.insertBefore(searchPeriodDiv, descriptionDiv);
		searchPeriodDiv.innerHTML = defaultSearchPeriod;
		
		var locationPeriodDiv = doc.createElement('div');
		locationPeriodDiv.id = "selected-search-location";
		locationPeriodDiv.style.display = "none";
		descriptionDiv.parentNode.insertBefore(locationPeriodDiv, descriptionDiv);
		locationPeriodDiv.innerHTML = defaultSearchLocation;		
		
		var content = "";
		var locCode = getLocationCode(defaultSearchLocation);
		if(GM_isMyProfilePage(doc)) {
			content = getBattleStatsTable(GM_getString("myBattleStatsTitle"), GM_getMyStats(doc, defaultSearchPeriod, false, locCode), "visible", defaultSearchPeriod, defaultSearchLocation);
		} else {
			content = getBattleStatsTable(GM_getString("battleStatsTitle"), GM_getEnemyStats(doc, defaultSearchPeriod, false, locCode), "visible", defaultSearchPeriod, defaultSearchLocation);
		}
		msgDiv.innerHTML = content;
		document.addEventListener('click', function(e){ GFT.Inject.handleClick(e);}, true);
	}
	
	function getArenaFightButton(doc) {
		var xResult = doc.evaluate("//input[contains(@onclick, 'startFightWithName')]", doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		if(!gladiatorExists(xResult)) { return null; } // gladiator doesn't exists
		return xResult.snapshotItem(0);
	}
	
	function createAndInjectCircusTurmaButton(doc) {
		var fightButton = getArenaFightButton(doc);
		if(fightButton) {
			var insertButton = doc.createElement('input');
			//insertButton.value = GM_getString("location.circusTurma");
			insertButton.className = "button2";
			insertButton.type = "button";
			insertButton.style.marginLeft = "5px";
			insertButton.id = "start-circus-turma-fight";
			fightButton.parentNode.insertBefore(insertButton, fightButton.nextSibling);
			doc.getElementById("start-circus-turma-fight").value = GM_getString("location.circusTurma");
		}	
	}
	
	function removeArenaFightButton(doc) {
		var fightButton = getArenaFightButton(doc);
		if(fightButton) {
			fightButton.parentNode.removeChild(fightButton);
		}
	}
	
	function getBattleStatsTable(title, content, visibility, hightlightId, selectedItem) {
		if(content == '') {
			visibility = 'hidden';
		}
		
		return 	'<div class="title_box"><div style="text-align:center;" class="title_inner"><a style="text-decoration: none;" href="#" onclick="javascript:return false;" id="gfBattleStatsTitle" title="' + GM_getString("clickToExpand") + '">' + title +  '</a></div></div>\n' + 
				'<div id="gfBattleStatsBody" style="visibility:' + visibility + ';" class="title2_box">\n' +
				getBattleStatsTableContent(content, visibility,  hightlightId, selectedItem) + '</div>';			
	}
	
	function getBattleStatsTableContent(content, visibility, hightlightId, selectedItem) {
		if(visibility == "visible" && content != '') {
			return '<div class="title2_inner">\n<table class="table1" cellpadding="0" cellspacing="3">\n<tbody>\n' + createNavigationEntry(hightlightId) + createLocationDD(selectedItem) + content + '\n</tbody></table></div>';
		}
		return '';
	}
	
	function createTDEntry(value, id, width, hightlightId) {
		var style = (id == hightlightId) ? 'style="font-weight:bold; border-bottom: 1px solid #b28b60; background-color:#FDC733;"' : '';
		return '\t<td style="white-space: nowrap; width:' + width + '%;"><a id="' + id + '" href="#" onclick="javascript:return false;"' + style + '>' + value + '</a></td>\n';
	}
	
	function createOptionItem(value, id, selectedItem) {
		var selected = (id == selectedItem) ? ' selected' : '';
		return '<option id="' + id + '"' + selected + '>' + value + '</option>\n';
	}
	
	function createLocationDD(selectedItem) {
		var ddLocMenu = '\n<select id="search-by-location">\n'
						+ createOptionItem(GM_getString("location.all"), "location-all", selectedItem)
						+ createOptionItem(GM_getString("location.arena"), "location-arena", selectedItem)
						+ createOptionItem(GM_getString("location.circusTurma"), "location-circus-turma", selectedItem)
						+ '</select>\n';
		return '<tr><th colspan="4">' + GM_getString("location.title") + ':</th> <td colspan="2" style="padding-left: 3px; white-space: nowrap;" class="stats_value">' + ddLocMenu + '</td></tr>\n';	
	}
	
	function createNavigationEntry(hightlightId) {
		var navigation = '<tr>\n';
		navigation += createTDEntry(GM_getString("all"), "none", 16, hightlightId);
		navigation += createTDEntry(GM_getString("oneDay"), "oneday", 16, hightlightId);
		navigation += createTDEntry(GM_getString("treeDays"), "threedays", 16, hightlightId);
		navigation += createTDEntry(GM_getString("fiveDays"), "fivedays", 16, hightlightId);
		navigation += createTDEntry(GM_getString("oneWeek"), "oneweek", 16, hightlightId);
		navigation += createTDEntry(GM_getString("oneMonth"), "onemonth", 16, hightlightId);
		navigation += '</tr>\n';
		return navigation;
	}
	
	function getPlayerPid(doc) {
		var pidRegEx = /mod=player&p=(\d+).*&sh=.*/;
		var url = doc.location + "";
		url.match(pidRegEx);
		return RegExp.$1;
	}
	
	function evaluateResponse(doc, responseDetails) {
		var result = GM_getFightResponseResult(responseDetails);
		if(!result.success) {
			doc.getElementById("errorRow").style.visibility = "visible";
			doc.getElementById("errorText").innerHTML = result.msg;
		} else {
			doc.location.href = GM_getFightResponseUrl(doc.domain + "", responseDetails);
		}
	}
	
	function handleButtonClick(aEvent) {
	    if(aEvent.button == 0) {
			var doc = document;
			var periodDiv = doc.getElementById("selected-search-period");
			var locationDiv = doc.getElementById("selected-search-location");
			var period = periodDiv.innerHTML;
			var div = doc.getElementById("gfBattleStatsBody");
			var visibility = div.style.visibility;
			var handleClick = false;
			
			switch(aEvent.target.id) {
				case "none": ;
				case "oneday": ;
				case "threedays": ;
				case "fivedays": ;
				case "oneweek": ;
				case "onemonth": { 
					period = aEvent.target.id +""; 
					periodDiv.innerHTML = aEvent.target.id;
					var locDD = doc.getElementById("search-by-location");
					var location = locDD.options[locDD.selectedIndex].id;
					displayTableContent(doc, visibility, period, location); 
					break; 
				}
				case "location-all": ;
				case "location-arena": ;
				case "location-circus-turma": {
					locationDiv.innerHTML = aEvent.target.id;
					displayTableContent(doc, visibility, period, aEvent.target.id);
					break;
				}
				case "gfBattleStatsTitle": {
					if(!div || visibility == "hidden") {
						visibility = "visible";
					
					} else {
						visibility = "hidden";
					}
					displayTableContent(doc, visibility, period, locationDiv.innerHTML);
					break;
				}
				case "start-circus-turma-fight": {
					GM_xmlhttpRequest({
						method: "GET",
						url: "http://" + doc.domain + "/game/ajax/doGroupFight.php?did=" + getPlayerPid(doc) + "&a=" + new Date().getTime(),
						onload: function(responseDetails) {
							evaluateResponse(doc, responseDetails);
						}
					});
				}
				default: break;
			}
		}
	}
	
	function displayTableContent(doc, visibility, period, location)
	{
		var div = doc.getElementById("gfBattleStatsBody");
		div.style.visibility = visibility;
		if(visibility == "hidden") {
			div.innerHTML = "";
		} else {
			var content = "";
			var locCode = getLocationCode(location);
			if(GM_isMyProfilePage(doc)) {
				content = GM_getMyStats(doc, period, true, locCode);
			} else {
				content = GM_getEnemyStats(doc, period, true, locCode);
			}
			div.innerHTML = getBattleStatsTableContent(content, visibility, period, location);		
		} 	
	}
	function getGladiatorLevel(doc) {
		var xResult = doc.evaluate("//span[@id='char_level']", doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		if(!gladiatorExists(xResult)) { return 200; } // gladiator doesn't exists
		return parseInt(xResult.snapshotItem(0).textContent);	
	}
	
	return {
		injectContent : function(e) { //TODO check if server is active before continuing
			var doc = e.target;
			setVariousSettings(doc);
			var removeFightButtons = GM_getValue("options.tabs.main.levelBashingRemoveButtons", false);
			var isLevelBashed = GM_isLevelBashed(getGladiatorLevel(doc), doc.domain);
			if(GM_getValue("options.tabs.others.showCircusTurmaButton", true)) {
				if(!isLevelBashed || (isLevelBashed && !removeFightButtons)) {
					createAndInjectCircusTurmaButton(doc);
				}
			}
			
			if(isLevelBashed && removeFightButtons) {
				removeArenaFightButton(doc);
			}
			
			createAndInjectBattleInfo(doc);
		},
		handleClick : function(e) {
			handleButtonClick(e);
		}
	};
})();

window.addEventListener('load', function(e){ if(GM_isServerActive(e.target)) {GFT.Inject.injectContent(e);}}, false);
