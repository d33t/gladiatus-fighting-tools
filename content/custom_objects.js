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

function DBPlayerData(name, guild, level, server, attacks, defenses, goldRaised, goldLost, maxGoldRaised, maxGoldLost, expRaised) 
{
	this.name = name;
	this.guild = guild;
	this.level = level;
	this.server = server;
	this.attacks = attacks;
	this.defenses = defenses;
	this.goldRaised = goldRaised;
	this.goldLost = goldLost;
	this.maxGoldRaised = maxGoldRaised;
	this.maxGoldLost = maxGoldLost;
	this.expRaised = expRaised;
}

function HttpPlayerData(pname, pguild, plevel, hp)
{
	this.name = pname;
	this.guild = pguild;
	this.level = plevel;
	this.lifepoints = hp;
}