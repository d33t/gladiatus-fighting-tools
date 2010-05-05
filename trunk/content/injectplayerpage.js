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
	
	var hidden = true; //TODO should be an option
	var content = "";
	
	if(isPlayerPage())
		content = getBattleStatsTable(GM_getString("battleStatsTitle"), (hidden ? "" : GM_getContent(document, "none")), "hidden", "oneday");
	else
		content = getBattleStatsTable(GM_getString("myBattleStatsTitle"), (hidden ? "" : GM_getMyStats(document, "none")), "hidden", "oneday");
	msgDiv.innerHTML = content;
}

function getBattleStatsTable(title, content, visibility, hightlightId)
{
	return 	'<div class="title_box"><div style="text-align:center;" class="title_inner"><a style="text-decoration: none;" href="#" id="gfBattleStatsTitle">' + title +  '</a></div></div>\n' + 
			'<div id="gfBattleStatsBody" style="visibility:' + visibility + ';" class="title2_box">\n' +
			getBattleStatsTableContent(content, visibility,  hightlightId) + '</div>';			
}

function getBattleStatsTableContent(content, visibility, hightlightId)
{
	if(visibility == "visible")
		return '<div class="title2_inner">\n<table class="table1" cellpadding="0" cellspacing="3">\n<tbody>\n' + createNavigationEntry(hightlightId) + content + '\n</tbody></table></div>';
	return '';
}

function createTDEntry(value, id, width, hightlightId)
{
	var style = (id == hightlightId) ? 'style="font-weight:bold; border-bottom: 1px solid #b28b60; background-color:#FDC733;"' : '';
	return '\t<td style="white-space: nowrap; width:' + width + '%;"><a id="' + id + '" href="#" ' + style + '>' + value + '</a></td>\n';
}

function createNavigationEntry(hightlightId)
{
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

function isPlayerPage()
{
	var xRet = document.evaluate("//input[@onclick='startFightWithName();']", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	var fightButton = xRet.snapshotItem(0);
	
	return fightButton ? true : false;
}

function handleButtonClick(event)
{
    if(event.button == 0) {
		var period = "oneday";
		var div = document.getElementById("gfBattleStatsBody");
		var visibility = div.style.visibility;
		var handleClick = false;
		
		switch(event.target.id)
		{
			case "none": ;
			case "oneday": ;
			case "threedays": ;
			case "fivedays": ;
			case "oneweek": ;
			case "onemonth": 
			{ 
				period = event.target.id +""; 
				displayTableContent(div, visibility, period); 
				break; 
			}
			case "gfBattleStatsTitle":
			{
				if(!div || visibility == "hidden")
					visibility = "visible";
				else 
					visibility = "hidden";
				displayTableContent(div, visibility, "oneday");
				break;
			}
			default: break;
		}
	}
}

function displayTableContent(div, visibility, period)
{
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
		div.innerHTML = getBattleStatsTableContent(content, visibility, period);		
	} 	
}

window.addEventListener('load', createAndInjectBattleInfo, false);
window.addEventListener('click', handleButtonClick, true);