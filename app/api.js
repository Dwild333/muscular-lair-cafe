// api.js — Supabase data + auth layer for Muscular Lair Café.
// Plain script (no JSX); runs before the Babel app scripts and exposes
// window.mlApi / window.mlAuth. The publishable key is safe to ship — all
// ml_ tables are locked by RLS to the shared shop account below.
(function () {
  const SUPA_URL = "https://qbdxtnyulltjiaeyjuxv.supabase.co";
  const SUPA_KEY = "sb_publishable_dYCfA_xUEpguPodIdAxjiA_Dg7rWBgr";
  const SHOP_EMAIL = "shop@muscularlair.com";

  const sb = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "ml_auth" },
  });

  const num = (v) => (v == null ? 0 : Number(v));

  const mapItem = (r) => ({
    id: r.id, cat: r.cat, group: r.group, name: r.name, price: num(r.price),
    kind: r.kind, glyph: r.glyph, note: r.note || undefined,
    variants: r.variants || undefined, addons: r.addons || undefined,
    flavors: r.flavors || undefined, added: !!r.added, sort: r.sort,
  });
  const mapSale = (r) => ({
    id: r.id, ts: r.ts, time: r.time, staff: r.staff, customer: r.customer,
    items: r.items || [], total: num(r.total), method: r.method, status: r.status,
  });
  const mapCustomer = (r) => ({
    id: r.id, name: r.name, tag: r.tag, color: r.color, visits: r.visits || 0,
    spend: num(r.spend), split: r.split || [50, 40, 10], top: r.top || [],
  });
  const mapProtein = (r) => ({
    id: r.id, name: r.name, sort: r.sort,
    weights: (r.weights || []).map((w) => ({ g: w.g, price: num(w.price) })),
  });

  const auth = {
    async session() { const { data } = await sb.auth.getSession(); return data.session; },
    async signIn(password) { return sb.auth.signInWithPassword({ email: SHOP_EMAIL, password }); },
    async signOut() { await sb.auth.signOut(); },
    async changePassword(newPassword) {
      // Call the GoTrue REST endpoint directly with the access token — more
      // reliable than sb.auth.updateUser(), which intermittently reports
      // "Auth session missing" under the in-browser Babel setup.
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw new Error("Not signed in");
      const res = await fetch(SUPA_URL + "/auth/v1/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json", apikey: SUPA_KEY, Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.msg || j.error_description || j.error || ("Update failed (" + res.status + ")"));
      }
    },
    onChange(cb) { return sb.auth.onAuthStateChange((_e, s) => cb(s)); },
  };

  async function loadAll() {
    const r = await Promise.all([
      sb.from("ml_staff").select("*").order("sort"),
      sb.from("ml_catalog").select("*").order("sort"),
      sb.from("ml_addons").select("*").order("sort"),
      sb.from("ml_alc_dishes").select("*").order("sort"),
      sb.from("ml_alc_proteins").select("*").order("sort"),
      sb.from("ml_customers").select("*").order("name"),
      sb.from("ml_sales").select("*").order("ts"),
    ]);
    const bad = r.find((x) => x.error);
    if (bad && bad.error) throw bad.error;
    const [staff, catalog, addons, dishes, proteins, customers, sales] = r.map((x) => x.data);
    return {
      staff, addons, dishes,
      catalog: catalog.map(mapItem),
      proteins: proteins.map(mapProtein),
      customers: customers.map(mapCustomer),
      sales: sales.map(mapSale),
    };
  }

  // ---- sales ----
  async function addSale(entry) {
    const row = { time: entry.time, staff: entry.staff, customer: entry.customer, items: entry.items, total: entry.total, method: entry.method, status: entry.status };
    const { data, error } = await sb.from("ml_sales").insert(row).select().single();
    if (error) throw error; return mapSale(data);
  }
  async function updateSale(id, fields) {
    const { data, error } = await sb.from("ml_sales").update(fields).eq("id", id).select().single();
    if (error) throw error; return mapSale(data);
  }

  // ---- catalog ----
  async function setItemPrice(id, price) { const { error } = await sb.from("ml_catalog").update({ price }).eq("id", id); if (error) throw error; }
  async function addItem(item) {
    const { data, error } = await sb.from("ml_catalog").insert({ ...item, added: true }).select().single();
    if (error) throw error; return mapItem(data);
  }
  async function deleteItem(id) { const { error } = await sb.from("ml_catalog").delete().eq("id", id); if (error) throw error; }
  async function updateItem(id, fields) { const { data, error } = await sb.from("ml_catalog").update(fields).eq("id", id).select().single(); if (error) throw error; return mapItem(data); }

  // ---- add-ons & à la carte pricing ----
  async function setAddonPrice(id, price) { const { error } = await sb.from("ml_addons").update({ price }).eq("id", id); if (error) throw error; }
  async function setProteinWeights(id, weights) { const { error } = await sb.from("ml_alc_proteins").update({ weights }).eq("id", id); if (error) throw error; }

  // ---- staff ----
  async function addStaff(s) { const { data, error } = await sb.from("ml_staff").insert(s).select().single(); if (error) throw error; return data; }
  async function deleteStaff(id) { const { error } = await sb.from("ml_staff").delete().eq("id", id); if (error) throw error; }

  // ---- customers ----
  async function addCustomer(c) {
    const row = { id: c.id, name: c.name, tag: c.tag, color: c.color, visits: c.visits || 0, spend: c.spend || 0, split: c.split || [50, 40, 10], top: c.top || [] };
    const { data, error } = await sb.from("ml_customers").insert(row).select().single();
    if (error) throw error; return mapCustomer(data);
  }
  async function updateCustomer(id, fields) { const { data, error } = await sb.from("ml_customers").update(fields).eq("id", id).select().single(); if (error) throw error; return mapCustomer(data); }
  async function deleteCustomer(id) { const { error } = await sb.from("ml_customers").delete().eq("id", id); if (error) throw error; }

  window.mlAuth = auth;
  window.mlApi = {
    loadAll, addSale, updateSale,
    setItemPrice, addItem, deleteItem, updateItem,
    setAddonPrice, setProteinWeights,
    addStaff, deleteStaff,
    addCustomer, updateCustomer, deleteCustomer,
  };
})();
