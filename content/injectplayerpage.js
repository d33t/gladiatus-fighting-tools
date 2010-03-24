// ==UserScript==
// @name           inject_player_page
// @namespace      com.dt.injected
// @include        http://s*.gladiatus.com/game/index.php?mod=player&p=*&sh=*
// ==/UserScript==

function createAndInjectBattleInfo()
{
	var xPath = "//td[@id='content']/table";
	var xResult = document.evaluate(xPath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	var descriptionDiv = xResult.snapshotItem(0);
	var msgDiv = document.createElement('div');
	msgDiv.id = "gfBattleStats";
	msgDiv.style.marginLeft = "17px";
	msgDiv.style.marginRight = "26px";
	descriptionDiv.parentNode.insertBefore(msgDiv, descriptionDiv);
	msgDiv.innerHTML = isPlayerPage() ? getBattleStatsTable("Battle stats", GM_getContent(document), "visible") : getBattleStatsTable("My stats", GM_getMyStats(document), "visible");
}

function getBattleStatsTable(title, content, visibility)
{
	return 	'<div class="title_box"><div id="gfBattleStatsTitle" class="title_inner">' + title +  '</div></div>\n' + 
			'<div id="gfBattleStatsBody" style="visibility:' + visibility + ';" class="title2_box">\n' +
			getBattleStatsTableContent(content, visibility) + '</div>';			
}

function getBattleStatsTableContent(content, visibility)
{
	if(visibility == "visible")
		return '<div class="title2_inner">\n<table class="table1" cellpadding="0" cellspacing="0">\n<tbody>\n' + content + '\n</tbody></table></div>';
	return '';
}

function isPlayerPage()
{
	var xRet = document.evaluate("//input[@onclick='startFightWithName();']", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	var fightButton = xRet.snapshotItem(0);
	
	return fightButton ? true : false;
}

function handleButtonClick(event)
{
    if(event.button == 0) {
	    if(event.target.id == "gfBattleStatsTitle") 
		{
			var div = document.getElementById("gfBattleStatsBody");
			
			if(!div || div.style.visibility == "hidden")
			{
				var visibility = "visible";
				div.style.visibility = visibility;
				div.innerHTML = isPlayerPage() ? getBattleStatsTableContent(GM_getContent(document), visibility) : getBattleStatsTableContent(GM_getMyStats(document), visibility);
			} 
			else 
			{
				div.style.visibility = "hidden";
				div.innerHTML = "";
			}
	    }
	}
}

createAndInjectBattleInfo();
window.addEventListener('click', handleButtonClick, true);