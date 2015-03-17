## Download and install ##
If you want to install any GFT version directly downloaded from this site ([downloads section](http://code.google.com/p/gladiatus-fighting-tools/downloads/list)), then follow these steps:
  1. Download the **gft-v`*`.xpi** file to any location on your computer
  1. Drag and drop the above file to the mozilla firefox browser
  1. Restart your browser
or
  1. Start downloading the **gft-v`*`.xpi** file and then choose open with mozilla firefox.
  1. Restart your browser

## Transfer GFT internal database to other computer/firefox profile ##
The steps below are to apply for windows xp, among other operational systems should be similar
  1. Open windows explorer and type in the adressbar (alternativ: start menu -> run) **%APPDATA%\Mozilla\Firefox\Profiles\** or follow the instructions on [this page](http://support.mozilla.com/bg/kb/Backing+up+your+information)
  1. Open the <mozilla profile> folder
  1. Copy gft.sqlite file
  1. Repeat step one on the computer/firefox profile, where you want to move the database
  1. Paste the file above
  1. Restart your firefox browser

Note: <mozilla profile> is the firefox profile, where you have installed GFT (if you are not using more than one profile, than the profile is called xxxxxxxx.default, where xxxxxxxx represents random string of 8 characters)

## Locale translation ##
The locale files for the current version can be found in the [download section](http://code.google.com/p/gladiatus-fighting-tools/downloads/list). Download and extract the archive to any location on your computer. Within the archive you can find 3 files, which you can open with your prefered editor (e.g. notepad++) and than you can translate the entities inside them.
### Examples ###
The _first file type_ has the form: **somefile.properties**. Every row in the content of this file has the structure:
  * **entity=string**

_Example_:
`my.entity=Some useful text`

To translate the above row, you have to translate only the text on the right side (**Some useful text**), you **should not** translate my.entity!

The _second file type_ has the form: **somefile.dtd**. Every row in the content of this file has the structure:
  * **<!ENTITY gft.something "string">**

_Example_:
`<!ENTITY gft.something "Some useful text">`

To translate the above row, you have to translate only **"Some useful text"**, but nothing else. Please do not remove the quotes or the locale will break the addon!