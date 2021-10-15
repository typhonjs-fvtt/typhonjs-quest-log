# FoundryVTT - TyphonJS Quest Log

<img title="TyphonJS Quest Log version" src="https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/League-of-Foundry-Developers/foundryvtt-forien-quest-log/master/module.json&label=Forien%27s+Quest+Log+version&query=version&style=flat-square&color=success"> ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftyphonjs-fvtt%2Ftyphonjs-quest-log%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)
![GitHub release](https://img.shields.io/github/release-date/typhonjs-fvtt/typhonjs-quest-log)
[![GitHub commits](https://img.shields.io/github/commits-since/typhonjs-fvtt/typhonjs-quest-log/latest)](https://github.com/typhonjs-fvtt/typhonjs-quest-log/commits/)
![the latest version zip](https://img.shields.io/github/downloads/typhonjs-fvtt/typhonjs-quest-log/latest/module.zip)
![Forge installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ftyphonjs-quest-log)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Ftyphonjs-quest-log%2Fshield%2Fendorsements)](https://www.foundryvtt-hub.com/package/typhonjs-quest-log/)

**NOTE** This is a new quest log module which continues from Michael's / TyphonJS' work on the `0.7.x` series of 
Forien's Quest Log. A whole new UI / tech stack (Svelte + GSAP) and utilization of the TyphonJS plugin manager / 
eventbus is forthcoming. Many new features are planned for the TyphonJS Quest Log and provides a high performance 
quest runtime for Foundry VTT.

When officially launched there will be a migration path for users of Forien's Quest Log to update to the TyphonJS Quest
Log.

**[Compatibility]**: _FoundryVTT_ 0.8.x

**[Systems]**: _any_

**[Languages]**: _Chinese, English, French, German, Japanese, Korean, Polish, Portuguese (Brazil), Spanish, Swedish_

This module provides comprehensive Quest Log system for players and Game Masters to use with Foundry Virtual Table Top

## Installation

1. Install the TyphonJS Quest Log from the Foundry Module browser directly, or manually using manifest URL: https://github.com/typhonjs-fvtt/typhonjs-quest-log/releases/latest/download/module.json
2. While loaded in World, enable the **_TyphonJS Quest Log_** module.

## Usage

A button to access the Quest Log is situated on the bottom of Journal Directory or in the scene controls menu under notes / journal entries on the left-hand navigation bar where a scroll icon opens the Quest Log.

TQL is quite user-friendly with an intuitive UI, however you might want to [check out the Wiki](https://github.com/typhonjs-fvtt/typhonjs-quest-log/wiki) for more detailed usage including macros and Quest API details for external developers integrations. 

Being a new module that shares ancestry with Forien's Quest Log the following in-depth of useful in depth video tutorials on YouTube are applicable to the TyphonJS Quest Log:
- [v0.7.7](https://youtu.be/lfSYJXVQAcE)
- [v0.7.6](https://youtu.be/Dn2iprrcPpY)
- [v0.7.5](https://youtu.be/cakE2a9MedM)

## Features

- Quest Log windows that lists all quests divided into `In Progress`, `Completed` and `Failed` tabs
- Quest creator with WYSIWYG editors for description and GM notes
- Quest objectives
- Draggable Item rewards
- Fully editable Quest Details window
- Personal Quests
- Quest Branching in the form of Sub Quests

## Future plans (current ideas)

Plans for future include:

- advanced sorting with additional data fields including user tagging.
- experience / currency rewards with the option to split amongst the party.

You can **always** check current and up-to-date [planned and requested features here](https://github.com/typhonjs-fvtt/typhonjs-quest-log/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)

_If you have **any** suggestion or idea on new contents, hit me up on Discord!_

## Translations

If you are interested in translating my module, simply make a new Pull Request with your changes, or contact me on Discord.

#### How to contribute

Please leave your preferred attribution name and optional email address in the AUTHORS file. Your GitHub noreply address can be found with [this tool](https://caius.github.io/github_id/) (use `<id+username@users.noreply.github.com>`).

#### How to translate

The English translation of this module is maintained, so you check on that one to see how a translation file should look. It can be either expanded (nested) JSON like English, or flat JSON like Polish.

Order of Localization Strings inside a `.json` file is indifferent.

Localization file **must be** either completely flat, or completely expanded (nested). Not partially both.

Please provide your attribution name and optional email address.

#### What is `missing` Folder?

The `lang/missing/` folder contains files for all languages showing all Localization Strings that are in the Module, but are not covered by that Language. For example, there are 6 strings not covered by Polish language, but since they are simply `API Error` messages, there is no need.

## Contact

Michael Leahy aka TyphonJS is maintaining and adding new features as the main developer for the TyphonJS Quest Log.

We request that you contact MLeahy#4299 for permission to use the name **TyphonJS Quest Log** in your fan works, self-promotions, and advertisements. Do not use the TyphonJS name or the names of other contributors without permission.

Please feel free to join the following Discord servers:
- [TyphonJS Discord server / current main FQL developer](https://discord.gg/mnbgN8f) for any questions.

## Acknowledgments

TBA

## Support

TBA

## License

TyphonJS Quest Log is a module for Foundry VTT by Michael Leahy and is licensed under a [MIT License](https://github.com/typhonjs-fvtt/typhonjs-quest-log/blob/master/LICENSE). List of contributors in [AUTHORS file](https://github.com/typhonjs-fvtt/typhonjs-quest-log/blob/master/AUTHORS).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development from February 17, 2021](https://foundryvtt.com/article/license/).
