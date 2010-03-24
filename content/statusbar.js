var gft_statusbar = {
	timeout: -1,
	endtime: -1,
	tick: 1000,
	
	handleClick: function(event)
	{
		switch (event.button)
		{
			case 0:
				// take no action on left click event
				return;
			case 1:
				this.handleAction("options");  // Set action via options
				return;
			// Button 2 shows popup menu via context attribute
		}
	},

	handleCursor: function(imagenode)  // Changes mouseover cursor to a hand when there is a click action
	{
		imagenode.style.cursor = "pointer";
	},

	handleMenu: function(menupopup)  // Decides which menu items to grey out
	{
		var menuItems = menupopup.getElementsByTagName("menuitem");
		for (var i=0; i < menuItems.length; i++)  // menuItems[i].value is not reliable in FF3betas; using getAttribute() instead!
			menuItems[i].setAttribute( "disabled", false );
	},

	handleAction: function(action)
	{
		switch (action)
		{
			case "options":
				window.openDialog("chrome://gft/content/options.xul",
								  "gftOptions", "chrome,dialogger.log,centerscreen");
				return;
			case "battles":
				window.openDialog("chrome://gft/content/battles.xul",
								  "gftBattles", "chrome,dialogger.log,centerscreen");
				return;
			case "about":
				window.openDialog("chrome://gft/content/about.xul",
								  "gftAbout", "chrome,dialogger.log,centerscreen");
				return;
		}
	},
	
	getTimerElement: function()
	{
		return document.getElementById("gft-timer");
	},
	
	showReverseCounter: function(timeoutmillis)
	{
		this.endtime = gft_utils.getTime() + timeoutmillis; 
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
		var currtime = gft_utils.getTime();
		
		if(currtime < this.endtime)
		{
			var timeleft = this.endtime - currtime;
			this.getTimerElement().setAttribute( "label", gft_utils.millisToHumanReadable(timeleft));
			this.timeout = window.setTimeout("gft_statusbar.reverseCounter()", this.tick);
		}
		else
			this.hideReverseCounter();
	}
};