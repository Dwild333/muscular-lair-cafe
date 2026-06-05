// app.jsx — root shell, nav, staff identity, language, tweaks. Mounts the app.
const { useState: useStateA, useEffect: useEffectA } = React;
const tA = window.t;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "fresh",
  "density": "roomy",
  "showIcons": true
}/*EDITMODE-END*/;

const THEMES = [
  { id: "fresh", name: "Fresh", sw: ["#1F7A4D", "#EFEEE7", "#DD6238"] },
  { id: "iron", name: "Iron", sw: ["#B6F03C", "#14161A", "#FF8A5B"] },
  { id: "clay", name: "Clay", sw: ["#BF552F", "#EDE3D4", "#3E6B4F"] },
];

const NAV = [
  { id: "pos", label: "Register", icon: "pos" },
  { id: "ledger", label: "Ledger", icon: "ledger" },
  { id: "tabs", label: "Open tabs", icon: "tabs" },
  { id: "customers", label: "Customers", icon: "people" },
  { id: "reports", label: "Summary", icon: "reports" },
  { id: "catalog", label: "Catalog", icon: "catalog" },
  { id: "settings", label: "Settings", icon: "sliders" },
];

function StaffPicker({ onPick, onClose, current }) {
  const { STAFF } = window.CafeData;
  return (
    <Modal open onClose={onClose} title={tA("Who's on the counter?")}>
      <p className="form-note" style={{ marginTop: 0 }}>{tA("Tap your name. Every line you log gets stamped with it — so the family always knows who took what.")}</p>
      <div className="staff-pick">
        {STAFF.map((s) => (
          <button key={s.id} className={"sp-card" + (current && current.id === s.id ? " is-on" : "")} onClick={() => { onPick(s); onClose(); }}>
            <Avatar staff={s} size={52} />
            <span className="sp-nm">{s.name}</span>
            <span className="sp-rl">{tA(s.role)}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function SettingsView({ lang, setLang }) {
  return (
    <div className="settings">
      <div className="view-head"><div><h2>{tA("Settings")}</h2><div className="sub">{tA("This is a working prototype — data resets when you reload.")}</div></div></div>
      <div className="set-body">
        <div className="card set-card">
          <div className="set-row-head"><Icon name="globe" size={20} /><div><div className="set-title">{tA("Language")}</div><div className="set-desc">{tA("Switch the whole app between English and Thai. Item names and labels translate instantly.")}</div></div></div>
          <div className="lang-cards">
            <button className={"lang-card" + (lang === "en" ? " is-on" : "")} onClick={() => setLang("en")}>
              <span className="lang-flag">EN</span>
              <span className="lang-nm">English</span>
              {lang === "en" && <span className="lang-on"><Icon name="check" size={16} /></span>}
            </button>
            <button className={"lang-card" + (lang === "th" ? " is-on" : "")} onClick={() => setLang("th")}>
              <span className="lang-flag">ไทย</span>
              <span className="lang-nm">ภาษาไทย</span>
              {lang === "th" && <span className="lang-on"><Icon name="check" size={16} /></span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLangState] = useStateA(() => { try { return localStorage.getItem("ml_lang") || "en"; } catch (e) { return "en"; } });
  window.__lang = lang;
  const setLang = (l) => { window.__lang = l; try { localStorage.setItem("ml_lang", l); } catch (e) { } setLangState(l); };

  const [view, setView] = useStateA("pos");
  const [staff, setStaff] = useStateA(window.CafeData.STAFF[0]);
  const [picking, setPicking] = useStateA(false);
  const [ledger, setLedger] = useStateA(window.CafeData.SEED);
  const [catalog, setCatalog] = useStateA(window.CafeData.CATALOG);
  const [saved, setSaved] = useStateA([]);
  const [customers, setCustomers] = useStateA(window.CafeData.CUSTOMERS);
  const [toast, setToast] = useStateA(null);
  const [clock, setClock] = useStateA(new Date());

  useEffectA(() => { const i = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(i); }, []);
  const showToast = (m) => { setToast(m); clearTimeout(window.__tt); window.__tt = setTimeout(() => setToast(null), 2400); };

  const commit = (entry) => { setLedger((l) => [...l, entry]); showToast(entry.status === "open" ? tA("Open tab saved for ") + entry.customer : tA("Saved · ") + window.CafeData.THB(entry.total)); setView("ledger"); };
  const update = (entry) => { setLedger((l) => l.map((e) => e.id === entry.id ? entry : e)); showToast(entry.status === "paid" ? tA("Tab settled") : tA("Updated")); };
  const saveItem = (it) => { setSaved((s) => [...s, it]); setCatalog((c) => [...c, it]); showToast(tA("Saved to catalog")); };
  const deleteSaved = (id) => { setSaved((s) => s.filter((x) => x.id !== id)); setCatalog((c) => c.filter((x) => x.id !== id)); };
  const addCustomer = (c) => { setCustomers((s) => s.find((x) => x.name.toLowerCase() === c.name.toLowerCase()) ? s : [...s, c]); showToast(tA("Saved customer · ") + c.name); };

  const openTabs = ledger.filter((e) => e.status === "open").length;

  return (
    <div className="app" data-theme={t.theme} data-density={t.density} data-icons={t.showIcons ? "on" : "off"} data-lang={lang}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">ML</div>
          <div><div className="brand-name">Muscular Lair</div><div className="brand-sub">{tA("Café counter")}</div></div>
        </div>
        <div className="topbar-spacer" />
        <div className="lang-toggle">
          <button className={lang === "en" ? "is-on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "th" ? "is-on" : ""} onClick={() => setLang("th")}>ไทย</button>
        </div>
        <div className="topbar-date">
          <div className="d">{clock.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</div>
          <div className="t money">{clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        <button className="staff-chip" onClick={() => setPicking(true)}>
          <Avatar staff={staff} size={32} />
          <div style={{ textAlign: "left" }}><div className="nm">{staff.name}</div><div className="rl">{tA(staff.role)}</div></div>
          <Icon name="chev" size={15} style={{ color: "var(--muted)" }} />
        </button>
      </header>

      <div className="body">
        <nav className="rail">
          {NAV.map((n) => (
            <div className="rail-item-wrap" key={n.id}>
              <button className={"rail-item" + (view === n.id ? " is-on" : "")} onClick={() => setView(n.id)}>
                <Icon name={n.icon} size={23} />
                {tA(n.label)}
              </button>
              {n.id === "tabs" && openTabs > 0 && <span className="rail-badge">{openTabs}</span>}
            </div>
          ))}
        </nav>

        <main className="view">
          {view === "pos" && <POSView staff={staff} onCommit={commit} savedItems={saved} onSaveItem={saveItem} customers={customers} catalog={catalog} onAddCustomer={addCustomer} />}
          {view === "ledger" && <LedgerView ledger={ledger} onUpdate={update} />}
          {view === "tabs" && <TabsView ledger={ledger} onUpdate={update} />}
          {view === "customers" && <CustomersView customers={customers} onAddCustomer={addCustomer} />}
          {view === "reports" && <ReportsView ledger={ledger} onToast={showToast} />}
          {view === "catalog" && <CatalogView catalog={catalog} setCatalog={setCatalog} savedItems={saved} onSaveItem={saveItem} onDeleteSaved={deleteSaved} />}
          {view === "settings" && <SettingsView lang={lang} setLang={setLang} />}
        </main>
      </div>

      {picking && <StaffPicker current={staff} onPick={setStaff} onClose={() => setPicking(false)} />}
      {toast && <div className="toast"><Icon name="check" size={17} />{toast}</div>}

      <TweaksPanel>
        <TweakSection label="Theme" />
        <div className="theme-swatches">
          {THEMES.map((th) => (
            <button key={th.id} className={"theme-sw" + (t.theme === th.id ? " is-on" : "")} onClick={() => setTweak("theme", th.id)}>
              <span className="ts-dots">{th.sw.map((c, i) => <span key={i} style={{ background: c }} />)}</span>
              <span className="ts-nm">{th.name}</span>
            </button>
          ))}
        </div>
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "roomy"]} onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="Item icons" value={t.showIcons} onChange={(v) => setTweak("showIcons", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
