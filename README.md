# News #
<a href='http://www.freetimecheck.com'><img src='http://www.freetimecheck.com/public/images/banners/768x90-flat-banner/freetime-check-your-freetime-designer.png' /></a>

**The latest version offered on this site is DEPRECATED since a while and DOES NOT WORK with the latst gladiatus server versions ( > v1.7.0 ) !!! If somebody wants to continue this project, then please contact me or open a ticket.**

This will be the last version, which I release and I hope that gladiatus layout will no change in near future once again. I'm dropping the support for this addon, this means that I'll not implement any new features or fix existing bugs anymore. Sorry folks, I just don't have the time and the motivation for this anymore!
Thanks to all people, which have been supported this project over GFT's existence. If somebody wants to continue my work, so just contact me per email or write a message at [feedback page](http://code.google.com/p/gladiatus-fighting-tools/wiki/Questions).

# Features overview #
  * Multiple server support
  * Compatible with gladiatus version 1.2.0
  * English, german, french, dutch and bulgarian translation.
  * Simple and comfortable overview of your battles with ability to fight directly from there (left click on the GFT icon to open it).
  * Keeps track and saves automatically your battles on the arena and circus turma for every player, that you attack.
  * Estimates the next possible attack time.
  * Warns if you are going to violate some rule according to specific server attack rules (for example bashing and level-bashing).
  * Keeps track on your earned gold and experience.
  * One click ability to start battle on the arena or cirkus turma directly from the battles overview.
  * Generate additional statistics

For feedback and/or questions, please use [this](http://code.google.com/p/gladiatus-fighting-tools/wiki/Questions) wiki article.

## Note ##
  * Defend reports are not automatically parsed. You should open this reports in order to have complete and correct statistics.
  * On fresh install the database is empty, so don't expect the battles count to match in the first 24h.
  * As more you fight on the arena as better and accurate statistic you will become.
  * In order to initialize the addon for a new server, you have to logout then login or just navigate to the overview page of your player.
  * This addon is compatible with other gladiatus addons(e.g. gladiatus tools). You can use both at the same time!
  * I cannot answer your question here, so please make it at project page on google(link below)
# Translators #
If you want to translate the application in your language, then follow the instructions on [this page](http://code.google.com/p/gladiatus-fighting-tools/wiki/FAQ#Locale_translation), then [create new issue](http://code.google.com/p/gladiatus-fighting-tools/issues/list) of type TRANSLATION and attach there the translated files as zip-archive.

# Changelog #
## Version 1.6 ##
  * ADDED: Firefox 4.0.`*` support
  * ADDED: Gladiatus v1.2.0 compatibility
  * CHANGED: Dropped support for gladiatus versions prior to gladiatus v1.2.0
  * FIXED: Battle table is shown on the profile page exact like before
  * CHANGED: Set icon position in the status-bar in firefox 4 (except right and hide) will not work anymore (no change in firefox 3.`*`)
  * CHANGED: Circus turma battle button on the profile page is now hidden per default
  * WONTFIX: Additional raised gold in combat reports is not added to your raised gold
Version 1.5.6
  * FIXED: click handlers for the battle table showed on gladiator and your own profile page

## Version 1.5.5 ##
  * FIXED: fixed the proper storing of battles finishing in a draw ([issue #24](https://code.google.com/p/gladiatus-fighting-tools/issues/detail?id=#24))
  * FIXED: the empty name of the circus turma button on the gladiator profile page ([issue #19](https://code.google.com/p/gladiatus-fighting-tools/issues/detail?id=#19))
  * FIXED: version log on the gft about dialog didn't appeared in firefox 4 ([issue #19](https://code.google.com/p/gladiatus-fighting-tools/issues/detail?id=#19))
  * ADDED: check for verifying if server is active, before adding any content to gladiator profile page

## Version 1.5.4 ##
  * FIXED: [issue #23](https://code.google.com/p/gladiatus-fighting-tools/issues/detail?id=#23) fixing the proper storing of battles made trough circus turma

## Version 1.5.3 ##
  * FIXED: Small bug fixes

## Version 1.5.2 ##
  * CHANGED: Improved exception handling
  * FIXED: Database query bug ([issue #17](https://code.google.com/p/gladiatus-fighting-tools/issues/detail?id=#17)-4)
  * ADDED: Dutch translation
  * ADDED: Partitial compability with Firefox 4.0b6 (there are still a few non critical bugs, but you can use the addon without any troubles)

## Version 1.5.1 ##
  * ADDED: Spanish translation. Translator asked to stay anonymous.
  * CHANGED: Encoding of about.dtd in the english locale has been changed to UTF-8

## Version 1.5 ##
  * CHANGED: The addon supports gladiatus version 0.8.x and 0.9
  * ADDED: Circus turma battles are stored and evaluated also.
  * ADDED: Fight through circus turma button on gladiator profile page.
  * ADDED: Level-Bashing notification when you attack someone out of your range. Could be switched on/off, because in some countries is no such rule.
  * FIXED: All functions related to the internal database have been rewritten, refactored and all known bugs were fixed
  * FIXED: Database queries are adjusted, verified and fixed
  * CHANGED: Better design for the about window
  * ADDED: New filters for the battles overview: min/max level, server, location, attack type, exlude allies
  * CHANGED: next possible attack column in battles overview is now sortable also
  * ADDED: Exception handling with ability to report errors directly to project page
  * FIXED: Battles parsing was adjusted to the new source. No wrong data is saved anymore.
  * CHANGED: Parsing of data is now more secure, faster and reliable
  * FIXED: If you are attacked by someone and loose the battle experience raised is now 0
  * ADDED: Filter location on gladiator profile and your own gladiator page
  * CHANGED: Formula for real chance for win has been changed
  * CHANGED: Battles overview navigation is made now now throug entries not pages
  * CHANGED: Fighting through battles overview is now disabled by default(see T&C of Gameforge for more info). To enabled it use the options.
  * ADDED: New action on battles overlay context menu: show gladiator profile
  * CHANGED: Option for collapsing the battles overview after successful battle
  * ADDED: Color my allies in green option on gladiator profile page
  * ADDED: Option to choose the position of the battles table on gladiator/your own profile page
  * FIXED: Some hard coded translations are now locale depended as well
  * ADDED: Remove fight buttons options related to level-bashing
  * ADDED: You can choose now the default double click action on battles overview
  * ADDED: Default values options for battles overview
  * FIXED: Some bugs related to tabs browser
  * CHANGED: Options dialog is no longer resizeable, layout was fixed
  * ADDED: Warning is showed if you are going to bash someone with the next attack

## Version 1.4.1 ##
  * FIXED: The addon was adjusted for gladiatus version 0.8.0
  * CHANGED: Options dialog is resizable now.
  * CHANGED: french translation is now fully completed.

## Version 1.4 ##
  * FIXED: The values displayed in the battle overlay were completly wrong.
  * ADDED: Ability to fight on the arena or cirkus turma directly from the battle overlay(double click or right click use the context menu).
  * ADDED: Almost all visual elements could be managed now through the options.
  * ADDED: Two different fight strategies can be choosen according to the specific rules of your server.
  * ADDED: The bashing rules can be manually adjusted.
  * ADDED: The whole addon is placed under single global namespace (GFT) avoiding possible conflicts with other addons.
  * FIXED: Battle time is now parsed from the reports. Different timezones are also respected.
  * ADDED: French translation. Thanks to Sébastien BAILLY!
  * FIXED: Various visual and logical bugs.

## Version 1.3 ##
  * ADDED: Battle GUI added. It allows you to search battles
  * UPDATE: Some visual changes
  * UPDATE: The addon was adjusted for gladiatus v0.6.0

## Version 1.2.2 (hotfix) ##
**Hotfix for v1.2.1, please see release notes for version 1.2 to see what's new**
  * CHANGED: wrong locale string caused bug in displaying of the battle table

## Version 1.2.1 (hotfix) ##
**Hotfix after v1.2 release, please see release notes for version 1.2 to see what's new**
  * FIXED: various database function, returning incorrect data for multiple servers

## Version 1.2 ##
  * CHANGED: Design of the battle statistic table has changed (opponent and own player pages)
  * ADDED: One more period column in the battle statistics menu (opponent and own player pages)
  * CHANGED: Battles for last 24h was removed and replaced by attacks count for the chosen time period (opponent page)
  * ADDED: Defenses attack count (opponent page)
  * ADDED: The chosen time period is now highlighted, default is always one day (later should be an option)
  * ADDED: Attacks count and defenses count for the chosen time period (own player page)
  * ADDED: Gold raised and lost for the chosen time period (own player page)
  * ADDED: Chance for win depending on the battles for the chosen time period (own player page)
  * REMOVED: The options link in the addons view, because options are still not available

## Version 1.1 ##
  * FIXED: fixed display bug of the battle table on the player page which caused the values to be showed next to the headers
  * ADDED: now can be chosen the time period for the battle table statistics
  * ADDED: real chance change. it shows if your real chance for win compared with the previous day chance for win become better or worser
  * FIXED: the statistics on your own gladiator page are now corrected

## Version 1.0.1 ##
  * ADD: Multiple server support
  * ADD: Bulgarian and german languages

## Version 1.0 ##
  * Initial version