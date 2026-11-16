var ToggleBars = {
  id: null,
  PREF: "extensions.togglebars.",
  state: { tabs: false, toolbar: false },   // true = hidden
  windows: new Set(),
  keyHandlers: new WeakMap(),
  prefObservers: [],

  log(msg) { Zotero.debug("Toggle Bars: " + msg); },

  init(id, rootURI) {
    this.id = id;
    this.state.tabs = !!Zotero.Prefs.get(this.PREF + "hideTabs", true);
    this.state.toolbar = !!Zotero.Prefs.get(this.PREF + "hideToolbar", true);

    // The prefs are the single source of truth: the shortcuts, the View menu
    // and the Settings pane all write them, and these observers apply the change.
    this.prefObservers = [
      Zotero.Prefs.registerObserver(this.PREF + "hideTabs", () => this.onTabsPref(), true),
      Zotero.Prefs.registerObserver(this.PREF + "hideToolbar", () => this.onToolbarPref(), true),
    ];

    // Style each reader as it opens.
    try {
      this.onRender = (event) => {
        try { this.styleReaderDoc(event.doc); } catch (e) { this.log(e); }
      };
      Zotero.Reader.registerEventListener("renderToolbar", this.onRender, id);
    } catch (e) { this.log("renderToolbar hook failed: " + e); }

    this.registerMenu();
    this.registerPane(rootURI);

    for (let win of Zotero.getMainWindows()) {
      if (win.ZoteroPane) this.addToWindow(win);
    }
    this.applyReaders();
  },

  // ---------- View menu (Zotero rebuilds these each time the menu opens) ----------
  registerMenu() {
    let check = (label, key, isChecked) => (event, ctx) => {
      try {
        let el = ctx.menuElem;
        el.setAttribute("label", label);
        el.setAttribute("acceltext", "Ctrl+Shift+" + key);
        if (isChecked) {
          el.setAttribute("type", "checkbox");
          if (isChecked()) el.setAttribute("checked", "true");
          else el.removeAttribute("checked");
        }
        this.log("menu item shown: " + label);
      } catch (e) { this.log("menu onShowing failed: " + e); }
    };

    let result = Zotero.MenuManager.registerMenu({
      menuID: "togglebars-view",
      pluginID: this.id,
      target: "main/menubar/view",
      menus: [
        { menuType: "separator" },
        {
          menuType: "menuitem",
          onShowing: check("Hide Tab Bar", "T", () => this.state.tabs),
          onCommand: () => this.toggleTabs(),
        },
        {
          menuType: "menuitem",
          onShowing: check("Hide Reader Toolbar", "A", () => this.state.toolbar),
          onCommand: () => this.toggleToolbar(),
        },
        {
          menuType: "menuitem",
          onShowing: check("Toggle Reader Sidebar", "B", null),
          onCommand: () => this.toggleSidebar(),
        },
      ],
    });
    this.log("registerMenu returned " + result);
  },

  // ---------- Settings pane ----------
  registerPane(rootURI) {
    Zotero.PreferencePanes.register({
      pluginID: this.id,
      id: "togglebars-prefpane",
      label: "Toggle Bars",
      src: rootURI + "prefs.xhtml",
      image: rootURI + "icon.svg",
    }).then(
      (paneID) => this.log("registered Settings pane " + paneID),
      (e) => this.log("Settings pane failed: " + e)
    );
  },

  // ---------- main window ----------
  addToWindow(win) {
    let doc = win.document;
    if (this.windows.has(win)) return;
    this.windows.add(win);

    let style = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
    style.id = "togglebars-style";
    style.textContent =
      ":root.togglebars-hide-tabs #zotero-title-bar," +
      ":root.togglebars-hide-tabs #tab-bar-container { display: none !important; }";
    (doc.head || doc.documentElement).appendChild(style);
    this.applyWindow(win);

    let handler = (e) => this.onKey(e);
    this.keyHandlers.set(win, handler);
    win.addEventListener("keydown", handler, true);
  },

  removeFromWindow(win) {
    let doc = win.document;
    doc.getElementById("togglebars-style")?.remove();
    doc.documentElement.classList.remove("togglebars-hide-tabs");
    let h = this.keyHandlers.get(win);
    if (h) win.removeEventListener("keydown", h, true);
    this.windows.delete(win);
  },

  applyWindow(win) {
    win.document.documentElement.classList.toggle("togglebars-hide-tabs", this.state.tabs);
  },

  // ---------- reader ----------
  readerDocs() {
    let docs = [];
    for (let r of (Zotero.Reader._readers || [])) {
      try { if (r._iframeWindow?.document) docs.push(r._iframeWindow.document); } catch (e) {}
    }
    return docs;
  },

  styleReaderDoc(doc) {
    if (!doc) return;
    if (!doc.getElementById("togglebars-reader-style")) {
      let style = doc.createElement("style");
      style.id = "togglebars-reader-style";
      style.textContent =
        ":root.togglebars-hide-toolbar .toolbar { display: none !important; }" +
        ":root.togglebars-hide-toolbar #split-view," +
        ":root.togglebars-hide-toolbar #sidebarContainer," +
        ":root.togglebars-hide-toolbar .sidebar-container { top: 0 !important; }" +
        ":root.togglebars-hide-toolbar .view-popup { margin-top: -40px; }";
      (doc.head || doc.documentElement).appendChild(style);
      // Let the shortcuts work while the reader has focus.
      doc.defaultView?.addEventListener("keydown", (e) => this.onKey(e), true);
    }
    doc.documentElement.classList.toggle("togglebars-hide-toolbar", this.state.toolbar);
  },

  applyReaders() {
    for (let doc of this.readerDocs()) {
      try { this.styleReaderDoc(doc); } catch (e) { this.log(e); }
    }
  },

  // ---------- prefs -> UI ----------
  onTabsPref() {
    this.state.tabs = !!Zotero.Prefs.get(this.PREF + "hideTabs", true);
    for (let w of this.windows) this.applyWindow(w);
  },

  onToolbarPref() {
    this.state.toolbar = !!Zotero.Prefs.get(this.PREF + "hideToolbar", true);
    this.applyReaders();
  },

  // ---------- actions ----------
  toggleTabs() {
    Zotero.Prefs.set(this.PREF + "hideTabs", !this.state.tabs, true);
  },

  toggleToolbar() {
    Zotero.Prefs.set(this.PREF + "hideToolbar", !this.state.toolbar, true);
  },

  toggleSidebar() {
    for (let r of (Zotero.Reader._readers || [])) {
      try { r.toggleSidebar(); } catch (e) { this.log(e); }
    }
  },

  onKey(e) {
    if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey || e.repeat) return;
    let map = { KeyT: () => this.toggleTabs(), KeyA: () => this.toggleToolbar(), KeyB: () => this.toggleSidebar() };
    let fn = map[e.code];
    if (!fn) return;
    e.preventDefault();
    e.stopPropagation();
    fn();
  },

  shutdown() {
    // Zotero removes the menu and Settings pane itself when the plugin shuts down.
    for (let symbol of this.prefObservers) Zotero.Prefs.unregisterObserver(symbol);
    this.prefObservers = [];
    try { Zotero.Reader.unregisterEventListener?.("renderToolbar", this.onRender); } catch (e) {}
    for (let doc of this.readerDocs()) {
      doc.getElementById("togglebars-reader-style")?.remove();
      doc.documentElement.classList.remove("togglebars-hide-toolbar");
    }
    for (let w of [...this.windows]) this.removeFromWindow(w);
  },
};
