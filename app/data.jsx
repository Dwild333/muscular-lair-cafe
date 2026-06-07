// data.jsx — static config + an in-memory mirror of the live data.
// The real menu/staff/customers/sales now live in Supabase (see api.js) and
// are loaded at startup by app.jsx, which mirrors them onto window.CafeData so
// the existing components can keep reading window.CafeData.* synchronously.
(function () {
  const THB = (n) => "฿" + Math.round(n).toLocaleString("en-US");
  let _id = 1000;
  const uid = () => "L" + ++_id;

  const CATS = ["Drinks", "Food", "Snacks", "À la carte", "Saved"];
  const GROUPS = [{ id: "drink", label: "Drinks" }, { id: "food", label: "Food" }, { id: "snack", label: "Snacks" }];

  window.CafeData = {
    THB, uid, CATS, GROUPS,
    // populated from Supabase at runtime (see App):
    STAFF: [], CATALOG: [], ADDONS: [], ALC_DISHES: [], ALC_PROTEINS: [], CUSTOMERS: [], FLAVORS: {},
  };
})();
