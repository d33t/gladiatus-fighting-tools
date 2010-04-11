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
	
	var hidden = true; // should be an option
	var content = "";
	
	if(isPlayerPage())
		content = getBattleStatsTable(GM_getString("battleStatsTitle"), (hidden ? "" : GM_getContent(document, "none")), "hidden");
	else
		content = getBattleStatsTable(GM_getString("myBattleStatsTitle"), (hidden ? "" : GM_getMyStats(document, "none")), "hidden");
	msgDiv.innerHTML = content;

}

function getBattleStatsTable(title, content, visibility)
{
	return 	'<div class="title_box"><div id="gfBattleStatsTitle" style="text-align:center;" class="title_inner">' + title +  '</div></div>\n' + 
			'<div id="gfBattleStatsBody" style="visibility:' + visibility + ';" class="title2_box">\n' +
			getBattleStatsTableContent(content, visibility) + '</div>';			
}

function getBattleStatsTableContent(content, visibility)
{
	if(visibility == "visible")
		return '<div class="title2_inner">\n<table class="table1" cellpadding="0" cellspacing="3">\n<tbody>\n' + createNavigationEntry() + content + '\n</tbody></table></div>';
	return '';
}

function createTDEntry(value, id, width)
{
	return '\t<td style="white-space: nowrap; width:' + width + '%;"><a id="' + id + '" href="#">' + value + '</a></td>\n';
}

function createNavigationEntry()
{
	var navigation = '<tr>\n';
	navigation += createTDEntry(GM_getString("all"), "none", 15);
	navigation += createTDEntry(GM_getString("oneDay"), "oneday", 20);
	navigation += createTDEntry(GM_getString("treeDays"), "threedays", 20);
	navigation += createTDEntry(GM_getString("oneWeek"), "oneweek", 20);
	navigation += createTDEntry(GM_getString("oneMonth"), "onemonth", 20);
	navigation += '</tr>\n';
	return navigation;
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
		var period = "none";
		var div = document.getElementById("gfBattleStatsBody");
		var visibility = div.style.visibility;
		switch(event.target.id)
		{
			case "none": ;
			case "oneday": ;
			case "threedays": ;
			case "oneweek": ;
			case "onemonth": { period = event.target.id +""; break; }
			case "gfBattleStatsTitle":
			{
				if(!div || visibility == "hidden")
					visibility = "visible";
				else 
					visibility = "hidden";
				break;
			}
			default: break;
		}
		
		div.style.visibility = visibility;
		if(visibility == "hidden")
			div.innerHTML = "";
		else
		{
			var content = "";
			if(isPlayerPage())
				content = GM_getContent(document, period);
			else
				content = GM_getMyStats(document, period);
			div.innerHTML = getBattleStatsTableContent(content, visibility);		
		}
	}
}
/*
function getToolTipElem(text, toolTipText)
{
	return '<a href="#" onmouseover="return escape(\'' + getToolTipTable(toolTipText) + '\')">' + text + '</a>';
}

function getToolTipTable(toolTipText)
{
	return '<table cellspacing=2 cellpadding=2 valign=middle style=\'background:black;filter:alpha(opacity=85); -moz-opacity:0.85;opacity: 0.85;border: 1px solid #999; font-family:Tahoma;\'><tr><td style=\'color:white; font-weight: bold; font-size:9pt\' colspan=\'2\' nowrap=\'nowrap\'>' + toolTipText + '</td></tr></table>';
}

function getBoldElem(text)
{
	return '<span style="color: blue; font-weight: bold;">' + text + '</span>';
}
*/
window.addEventListener('load', createAndInjectBattleInfo, false);
window.addEventListener('click', handleButtonClick, true);