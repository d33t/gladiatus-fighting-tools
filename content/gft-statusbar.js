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

GFT.Statusbar = {
	timeout: -1,
	endtime: -1,
	tick: 1000,
	utils: GFT.Utils,
	
	handleClick: function(event)
	{
		switch (event.button)
		{
			case 0:
				if(event.target.id == "gftCloseButton"
					|| event.target.id == "gft-status-icon")
				{
					this.handleAction("battles");
				}
				//this.handleAction("battles");
				break;
			case 1:
				// Button 2 shows popup menu via context attribute
				break;
		}
	},

	handleCursor: function(imagenode)  // Changes mouseover cursor to a hand when there is a click action
	{
		imagenode.style.cursor = "pointer";
	},

	handleMenu: function(menupopup)  // Decides which menu items to grey out
	{
		var menuItems = menupopup.getElementsByTagName("menuitem");
		for (var i=0; i < menuItems.length; i++)
			menuItems[i].setAttribute( "disabled", false );
	},

	handleAction: function(action)
	{
		switch (action)
		{
			case "options":
				window.openDialog("chrome://gft/content/options.xul",
								  "gftOptions", "chrome,dialogger.log,centerscreen,resizable=no");
				break;
			case "battles":
				var battlesSearchSplitter = document.getElementById("battlesSearchSplitter");
				var battlesSearch = document.getElementById("battlesSearch");
				battlesSearchSplitter.collapsed = !battlesSearchSplitter.collapsed;
				battlesSearch.collapsed = !battlesSearch.collapsed;
				if(!battlesSearch.collapsed) {
					document.getElementById("search-by-name").focus();
				}
				break;
			case "about":
				window.openDialog("chrome://gft/content/about.xul",
								  "gftAbout", "chrome,dialogger.log,centerscreen,resizable=no");
				break;
		}
	},
	
	getTimerElement: function()
	{
		return document.getElementById("gft-timer");
	},
	
	showReverseCounter: function(timeoutmillis)
	{
		this.endtime = this.utils.getTime() + timeoutmillis; 
		this.getTimerElement().setAttribute("hidden", "false");
		this.reverseCounter();
	},
	
	hideReverseCounter: function()
	{
		this.endtime = -1;
		this.getTimerElement().setAttribute("hidden", "true");
		if(this.timeout != -1)
			window.clearTimeout(this.timeout);
	},
	
	reverseCounter: function()
	{
		var currtime = this.utils.getTime();
		
		if(currtime < this.endtime)
		{
			var timeleft = this.endtime - currtime;
			this.getTimerElement().setAttribute( "label", this.utils.millisToHumanReadable(timeleft));
			this.timeout = window.setTimeout("GFT.Statusbar.reverseCounter()", this.tick);
		}
		else
			this.hideReverseCounter();
	}
};