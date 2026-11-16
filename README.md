# Toggle Bars for Zotero

Hide Zotero's tab bar, the reader toolbar and the reader sidebar, for a
distraction-free reading view. Works with Zotero 7 through 10.

This is a maintained fork of [wmstack/Zotero-Toggle-Bars](https://github.com/wmstack/Zotero-Toggle-Bars)
by Waleed Dahshan, whose plugin stops at Zotero 7.0. Version 3 is reworked to
use Zotero's official menu and Settings APIs, so it runs on Zotero 7–10 and its
menu items appear in every window.

## Install

1. Download `zotero-toggle-bars.xpi` from the [latest release](https://github.com/zackmezera/zotero-toggle-bars/releases/latest).
2. In Zotero, open **Tools → Plugins**, click the gear icon, and choose **Install Plugin From File…**.
3. Pick the file. No restart needed.

If you have the original Toggle Bars installed, remove it first.
Zotero checks this repository for new versions and updates the plugin on its own.

## Use

| Shortcut | Action |
|---|---|
| Ctrl+Shift+T | Hide or show the tab bar |
| Ctrl+Shift+A | Hide or show the reader toolbar |
| Ctrl+Shift+B | Open or close the reader sidebar |

On macOS these use the Control key, not Command. All three are also in the
**View** menu, and the first two are checkboxes in **Settings → Toggle Bars**.
Your choices are remembered after Zotero quits.

## Build from source

```sh
./build.sh    # -> dist/zotero-toggle-bars.xpi and dist/updates.json
```

No dependencies beyond `zip` and Python 3. To release, attach both files to a
GitHub release tagged `v<version>` (the version in `src/manifest.json`).

## Support

Maintained on a best-effort basis. Bug reports are welcome in
[Issues](https://github.com/zackmezera/zotero-toggle-bars/issues); please include
your Zotero version.

## License

[BSD 2-Clause](LICENSE), as in the original.
