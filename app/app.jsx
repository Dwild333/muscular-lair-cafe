// app.jsx — root shell: login gate, Supabase load, nav, identity, CRUD wiring.
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

const STAFF_COLORS = ["#1F7A4D", "#C2552F", "#2563A8", "#7A3FB0", "#B0833F", "#3E6B4F", "#9A3B6B"];
const STAFF_ROLES = ["Cafe", "Kitchen", "Owner"];

// ---------- Login gate -----------------------------------------------------
function Login({ onSubmit, error, busy }) {
  const [pw, setPw] = useStateA("");
  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={(e) => { e.preventDefault(); onSubmit(pw); }}>
        <div className="login-mark">ML</div>
        <h1 className="login-title">Muscular Lair</h1>
        <div className="login-sub">{tA("Café counter")}</div>
        <label className="login-field">
          <span>{tA("Shop password")}</span>
          <input type="password" className="input" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
        </label>
        {error && <div className="login-err">{error}</div>}
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={busy || !pw}>
          {busy ? tA("Signing in…") : tA("Log in")}
        </button>
      </form>
    </div>
  );
}

// ---------- Staff management (Settings) ------------------------------------
function StaffManager({ staffList, current, onAdd, onDelete }) {
  const [adding, setAdding] = useStateA(false);
  const [name, setName] = useStateA("");
  const [role, setRole] = useStateA("Cafe");
  function submit() {
    const nm = name.trim(); if (!nm) return;
    onAdd(nm, role); setName(""); setRole("Cafe"); setAdding(false);
  }
  return (
    <div className="card set-card">
      <div className="set-row-head"><Icon name="people" size={20} /><div><div className="set-title">{tA("Staff")}</div><div className="set-desc">{tA("Add or remove who can be tapped at the counter.")}</div></div></div>
      <div className="staff-manage">
        {staffList.map((s) => (
          <div key={s.id} className="sm-row">
            <Avatar staff={s} size={30} /><span className="sm-nm">{s.name}</span><span className="sm-rl">{tA(s.role)}</span>
            <button className="cr-del" disabled={current && current.id === s.id} title={current && current.id === s.id ? tA("Currently selected") : ""} onClick={() => onDelete(s)} aria-label="delete"><Icon name="trash" size={16} /></button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="sm-add">
          <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={tA("Name")} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
          <Segmented value={role} onChange={setRole} options={STAFF_ROLES.map((r) => ({ value: r, label: tA(r) }))} />
          <Btn kind="primary" icon="check" onClick={submit} disabled={!name.trim()}>{tA("Add")}</Btn>
        </div>
      ) : (
        <button className="cat-add-row" onClick={() => setAdding(true)}><Icon name="plus" size={18} />{tA("Add staff member")}</button>
      )}
    </div>
  );
}

function SettingsView({ lang, setLang, staffList, current, onAddStaff, onDeleteStaff, onSignOut }) {
  return (
    <div className="settings">
      <div className="view-head"><div><h2>{tA("Settings")}</h2><div className="sub">{tA("Changes are saved to the cloud and sync to every device.")}</div></div><div className="spacer" /><Btn kind="outline" icon="back" onClick={onSignOut}>{tA("Log out")}</Btn></div>
      <div className="set-body">
        <div className="card set-card">
          <div className="set-row-head"><Icon name="globe" size={20} /><div><div className="set-title">{tA("Language")}</div><div className="set-desc">{tA("Switch the whole app between English and Thai. Item names and labels translate instantly.")}</div></div></div>
          <div className="lang-cards">
            <button className={"lang-card" + (lang === "en" ? " is-on" : "")} onClick={() => setLang("en")}>
              <span className="lang-flag">EN</span><span className="lang-nm">English</span>
              {lang === "en" && <span className="lang-on"><Icon name="check" size={16} /></span>}
            </button>
            <button className={"lang-card" + (lang === "th" ? " is-on" : "")} onClick={() => setLang("th")}>
              <span className="lang-flag">ไทย</span><span className="lang-nm">ภาษาไทย</span>
              {lang === "th" && <span className="lang-on"><Icon name="check" size={16} /></span>}
            </button>
          </div>
        </div>
        <StaffManager staffList={staffList} current={current} onAdd={onAddStaff} onDelete={onDeleteStaff} />
      </div>
    </div>
  );
}

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

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || "staff"; }

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLangState] = useStateA(() => { try { return localStorage.getItem("ml_lang") || "en"; } catch (e) { return "en"; } });
  window.__lang = lang;
  const setLang = (l) => { window.__lang = l; try { localStorage.setItem("ml_lang", l); } catch (e) { } setLangState(l); };

  const [booting, setBooting] = useStateA(true);
  const [authed, setAuthed] = useStateA(false);
  const [loginErr, setLoginErr] = useStateA(null);
  const [loginBusy, setLoginBusy] = useStateA(false);

  const [view, setView] = useStateA("pos");
  const [staffList, setStaffList] = useStateA([]);
  const [staff, setStaff] = useStateA(null);
  const [picking, setPicking] = useStateA(false);
  const [ledger, setLedger] = useStateA([]);
  const [catalog, setCatalog] = useStateA([]);
  const [addons, setAddons] = useStateA([]);
  const [dishes, setDishes] = useStateA([]);
  const [proteins, setProteins] = useStateA([]);
  const [customers, setCustomers] = useStateA([]);
  const [toast, setToast] = useStateA(null);
  const [clock, setClock] = useStateA(new Date());

  useEffectA(() => { const i = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(i); }, []);
  const showToast = (m) => { setToast(m); clearTimeout(window.__tt); window.__tt = setTimeout(() => setToast(null), 2400); };
  const showErr = (e) => showToast((e && e.message) ? e.message : tA("Something went wrong"));

  async function loadData() {
    const d = await window.mlApi.loadAll();
    setStaffList(d.staff); setStaff((cur) => cur || d.staff[0] || null);
    setCatalog(d.catalog); setAddons(d.addons); setDishes(d.dishes);
    setProteins(d.proteins); setCustomers(d.customers); setLedger(d.sales);
  }

  useEffectA(() => {
    (async () => {
      try {
        const session = await window.mlAuth.session();
        if (session) { await loadData(); setAuthed(true); }
      } catch (e) { /* show login */ }
      setBooting(false);
    })();
  }, []);

  async function handleLogin(pw) {
    setLoginBusy(true); setLoginErr(null);
    try {
      const { error } = await window.mlAuth.signIn(pw);
      if (error) { setLoginErr(tA("Wrong password — try again.")); setLoginBusy(false); return; }
      await loadData(); setAuthed(true);
    } catch (e) { setLoginErr((e && e.message) || tA("Could not connect.")); }
    setLoginBusy(false);
  }
  async function handleLogout() { await window.mlAuth.signOut(); setAuthed(false); }

  // ---- mirror live data so window.CafeData readers stay in sync ----
  const flavorsMap = {};
  catalog.forEach((c) => { if (c.flavors && c.flavors.length) flavorsMap[c.name] = c.flavors; });
  Object.assign(window.CafeData, {
    STAFF: staffList, CATALOG: catalog, ADDONS: addons,
    ALC_DISHES: dishes, ALC_PROTEINS: proteins, CUSTOMERS: customers, FLAVORS: flavorsMap,
  });
  const savedItems = catalog.filter((c) => c.added);

  // ---- mutations (persist to Supabase, then update local state) ----
  async function commit(entry) {
    try {
      const saved = await window.mlApi.addSale(entry);
      setLedger((l) => [...l, saved]);
      // accrue spend/visits for a known customer
      const cust = customers.find((c) => c.name.toLowerCase() === (entry.customer || "").toLowerCase());
      if (cust) {
        const fields = { spend: cust.spend + entry.total, visits: cust.visits + 1 };
        setCustomers((cs) => cs.map((c) => c.id === cust.id ? { ...c, ...fields } : c));
        window.mlApi.updateCustomer(cust.id, fields).catch(() => { });
      }
      showToast(entry.status === "open" ? tA("Open tab saved for ") + entry.customer : tA("Saved · ") + window.CafeData.THB(entry.total));
      setView("ledger");
    } catch (e) { showErr(e); }
  }
  async function update(entry) {
    try {
      const saved = await window.mlApi.updateSale(entry.id, { status: entry.status, method: entry.method, total: entry.total, items: entry.items, customer: entry.customer });
      setLedger((l) => l.map((e) => e.id === saved.id ? saved : e));
      showToast(entry.status === "paid" ? tA("Tab settled") : tA("Updated"));
    } catch (e) { showErr(e); }
  }
  async function saveItem(it) {
    try { const saved = await window.mlApi.addItem(it); setCatalog((c) => [...c, saved]); showToast(tA("Saved to catalog")); }
    catch (e) { showErr(e); }
  }
  async function deleteItem(id) {
    try { await window.mlApi.deleteItem(id); setCatalog((c) => c.filter((x) => x.id !== id)); showToast(tA("Item removed")); }
    catch (e) { showErr(e); }
  }
  async function updateItem(id, fields) {
    setCatalog((c) => c.map((it) => it.id === id ? { ...it, ...fields, note: it.note } : it));
    try { await window.mlApi.updateItem(id, fields); showToast(tA("Updated")); } catch (e) { showErr(e); }
  }
  async function setPrice(id, price) {
    setCatalog((c) => c.map((it) => it.id === id ? { ...it, price } : it));
    try { await window.mlApi.setItemPrice(id, price); } catch (e) { showErr(e); }
  }
  async function setAddonPrice(id, price) {
    setAddons((a) => a.map((x) => x.id === id ? { ...x, price } : x));
    try { await window.mlApi.setAddonPrice(id, price); } catch (e) { showErr(e); }
  }
  async function setProteinPrice(pid, idx, price) {
    let next = null;
    setProteins((ps) => ps.map((p) => {
      if (p.id !== pid) return p;
      const weights = p.weights.map((w, i) => i === idx ? { ...w, price } : w);
      next = weights; return { ...p, weights };
    }));
    try { if (next) await window.mlApi.setProteinWeights(pid, next); } catch (e) { showErr(e); }
  }
  async function addCustomer(c) {
    if (customers.find((x) => x.name.toLowerCase() === c.name.toLowerCase())) return;
    try { const saved = await window.mlApi.addCustomer(c); setCustomers((s) => [...s, saved]); showToast(tA("Saved customer · ") + saved.name); }
    catch (e) { showErr(e); }
  }
  async function updateCustomer(id, fields) {
    setCustomers((s) => s.map((c) => c.id === id ? { ...c, ...fields } : c));
    try { await window.mlApi.updateCustomer(id, fields); showToast(tA("Updated")); } catch (e) { showErr(e); }
  }
  async function deleteCustomer(id) {
    try { await window.mlApi.deleteCustomer(id); setCustomers((s) => s.filter((c) => c.id !== id)); showToast(tA("Customer removed")); }
    catch (e) { showErr(e); }
  }
  async function addStaff(name, role) {
    const used = new Set(staffList.map((s) => s.id));
    let id = slug(name); let n = 1; while (used.has(id)) id = slug(name) + (++n);
    const s = { id, name, role, color: STAFF_COLORS[staffList.length % STAFF_COLORS.length], sort: staffList.length };
    try { const saved = await window.mlApi.addStaff(s); setStaffList((l) => [...l, saved]); showToast(tA("Saved · ") + saved.name); }
    catch (e) { showErr(e); }
  }
  async function deleteStaff(s) {
    if (staff && staff.id === s.id) { showToast(tA("Pick another name first.")); return; }
    try { await window.mlApi.deleteStaff(s.id); setStaffList((l) => l.filter((x) => x.id !== s.id)); showToast(tA("Staff removed")); }
    catch (e) { showErr(e); }
  }

  const openTabs = ledger.filter((e) => e.status === "open").length;

  if (booting) {
    return <div className="app" data-theme={t.theme} data-density={t.density}><div className="boot"><div className="boot-mark">ML</div><div className="boot-spin" /></div></div>;
  }
  if (!authed) {
    return <div className="app" data-theme={t.theme} data-density={t.density} data-lang={lang}><Login onSubmit={handleLogin} error={loginErr} busy={loginBusy} /></div>;
  }

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
        {staff && (
          <button className="staff-chip" onClick={() => setPicking(true)}>
            <Avatar staff={staff} size={32} />
            <div style={{ textAlign: "left" }}><div className="nm">{staff.name}</div><div className="rl">{tA(staff.role)}</div></div>
            <Icon name="chev" size={15} style={{ color: "var(--muted)" }} />
          </button>
        )}
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
          {view === "pos" && <POSView staff={staff} onCommit={commit} savedItems={savedItems} onSaveItem={saveItem} customers={customers} catalog={catalog} onAddCustomer={addCustomer} />}
          {view === "ledger" && <LedgerView ledger={ledger} onUpdate={update} />}
          {view === "tabs" && <TabsView ledger={ledger} onUpdate={update} />}
          {view === "customers" && <CustomersView customers={customers} onAddCustomer={addCustomer} onUpdateCustomer={updateCustomer} onDeleteCustomer={deleteCustomer} />}
          {view === "reports" && <ReportsView ledger={ledger} onToast={showToast} />}
          {view === "catalog" && <CatalogView catalog={catalog} onSetPrice={setPrice} savedItems={savedItems} onSaveItem={saveItem} onDeleteItem={deleteItem} onUpdateItem={updateItem} addons={addons} proteins={proteins} onSetAddonPrice={setAddonPrice} onSetProteinPrice={setProteinPrice} />}
          {view === "settings" && <SettingsView lang={lang} setLang={setLang} staffList={staffList} current={staff} onAddStaff={addStaff} onDeleteStaff={deleteStaff} onSignOut={handleLogout} />}
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

class ErrBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { window.__APP_ERR = (err && err.stack || String(err)) + "\n--- component stack ---" + (info && info.componentStack || ""); }
  render() {
    if (this.state.err) return <pre style={{ padding: 24, color: "#b00", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{String(this.state.err && this.state.err.stack || this.state.err)}</pre>;
    return this.props.children;
  }
}
ReactDOM.createRoot(document.getElementById("root")).render(<ErrBoundary><App /></ErrBoundary>);
