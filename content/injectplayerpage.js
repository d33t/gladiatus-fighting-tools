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
	msgDiv.innerHTML = isPlayerPage() ? getBattleStatsTable("Battle stats", GM_getContent(document), "hidden") : getBattleStatsTable("My stats", GM_getMyStats(document), "hidden");

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