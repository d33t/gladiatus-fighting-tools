function DBPlayerData(id, pname, pguild, battles) 
{
	this.pid = id;
	this.name = pname;
	this.guild = pguild;
	this.battlesCount = battles;
}

function HttpPlayerData(pname, pguild, plevel, hp)
{
	this.name = pname;
	this.guild = pguild;
	this.level = plevel;
	this.lifepoints = hp;
}