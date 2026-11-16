var TB;

function startup({ id, version, rootURI }) {
  Services.scriptloader.loadSubScript(rootURI + "toggle.js");
  TB = ToggleBars;
  TB.init(id, rootURI);
}

function onMainWindowLoad({ window }) { TB && TB.addToWindow(window); }
function onMainWindowUnload({ window }) { TB && TB.removeFromWindow(window); }

function shutdown() {
  if (TB) TB.shutdown();
  TB = undefined;
  ToggleBars = undefined;
}

function install() {}
function uninstall() {}
