GFT.Globals = {
	VERSION: 1.5,
	Database : new GFT.DB(),
	XUL_NS : "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
	init : function() {
		this.Database.init();
	}
};