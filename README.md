# Lunar's Factorio Mod Manager (LFMM)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)
[![Total Downloads](https://img.shields.io/github/downloads/AlyxMoon/Lunars-Factorio-Mod-Manager/total.svg?label=Total%20Downloads)](https://github.com/AlyxMoon/Lunars-Factorio-Mod-Manager/releases)

LFMM is a tool for managing mods in Factorio. The aim is to make it easy to use many different sets of mods at a time.

**Disclaimer**: This is an old hobby project that is undergoing a rework. To be safe, you should backup any mods and saves that you might be worried about losing. If you run into any issues you can leave an issue on this repo or post on the [Factorio forums](https://forums.factorio.com/viewtopic.php?f=137&t=30394).

## Downloading / Installing
Check out [the releases page](https://github.com/AlyxMoon/lunar-factorio-mod-manager/releases) for the compiled packages.
Download the appropriate package for your operating system, unzip it wherever you like, and start the app by running the `lunar-mod-manager.exe` file.

The master branch on this repo will be updated for official version releases. You can download from that at any time for the source code on releases. The develop branch should be kept fairly stable if you wish to run from that as well.  
If you wish to run from source code but aren't sure how, check out the [Contributing Guide](https://github.com/AlyxMoon/lunar-factorio-mod-manager/blob/develop/CONTRIBUTING.md) for info on how to set things up.

## Features
For a full roadmap and planned feature list, check out the [roadmap on the wiki](https://github.com/AlyxMoon/lunar-factorio-mod-manager/wiki/Design-Document-and-Roadmap). If you have any questions or feel like any information is missing, let me know and I'll get things updated.

These are the main planned features for the app, though not everything is implemented at the time of writing.
- __Modpacks__  
Create and manage modpacks, easily swap between them
- __Export / Import modpacks__
Easily save the modpack configuration as a file that can be shared with others
- __Edit mod configuration__
Edit the individual mod configuration and save it as part of the modpack
- __Browse online mods__  
View the mods on the official mod portal, download directly from the app
- __Manage mod updates and dependencies__  
Check for available updates to mods as well as any missing dependencies.
- __Create modpacks from saves__
View save files and automatically create modpacks to match mods used in the save
- __Create modpacks from servers__
View online servers and automatically create modpacks to match mods used in the server
- __Copy and edit mods__
Need to make a tweak to a mod? No problem, make a copy and edit the files within the app

##### Credits
All credits for the authors of packages and tools used in the project
- Development scripts from the [vue-electron-template project](https://github.com/mubaidr/vue-electron-template)
