// data.jsx — static config + an in-memory mirror of the live data.
// The real menu/staff/customers/sales now live in Supabase (see api.js) and
// are loaded at startup by app.jsx, which mirrors them onto window.CafeData so
// the existing components can keep reading window.CafeData.* synchronously.
(function () {
  const THB = (n) => "฿" + Math.round(n).toLocaleString("en-US");
  let _id = 1000;
  const uid = () => "L" + ++_id;

  // ---- Time: the café runs on Asia/Bangkok regardless of the device's clock.
  // This keeps the displayed day/time and the "today" sales boundary correct
  // even if an iPad or browser is set to the wrong timezone.
  const TZ = "Asia/Bangkok";
  const fmtDateShort = (d) => d.toLocaleDateString("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
  const fmtDateLong = (d) => d.toLocaleDateString("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtTime = (d) => d.toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
  const dayKey = (d) => (typeof d === "string" ? new Date(d) : d).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD in Bangkok
  const todayKey = () => dayKey(new Date());

  const CATS = ["Drinks", "Food", "Snacks", "À la carte", "Saved"];
  const GROUPS = [{ id: "drink", label: "Drinks" }, { id: "food", label: "Food" }, { id: "snack", label: "Snacks" }];

  window.CafeData = {
    THB, uid, CATS, GROUPS, TZ, fmtDateShort, fmtDateLong, fmtTime, dayKey, todayKey,
    // populated from Supabase at runtime (see App):
    STAFF: [], CATALOG: [], ADDONS: [], ALC_DISHES: [], ALC_PROTEINS: [], CUSTOMERS: [], FLAVORS: {},
  };
})();
