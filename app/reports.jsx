// reports.jsx — Summary/export (period + category) + Catalog manager.
const { useState: useStateR, useMemo: useMemoR } = React;
const tR = window.t, tnameR = window.tname;

function sById(id) { return window.CafeData.STAFF.find((s) => s.id === id); }

const PERIODS = [{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }];
const PERIOD_META = {
  day: { factor: 1, sub: "Thursday · 5 June 2026", chart: "Sales by hour", exp: "today's ledger to CSV" },
  week: { factor: 6.4, sub: "Week of 1–7 June 2026", chart: "Gross by day", exp: "this week to CSV" },
  month: { factor: 27, sub: "June 2026 · month to date", chart: "Daily gross · June", exp: "June to Excel (.xlsx)" },
  year: { factor: 320, sub: "2026 · year to date", chart: "Monthly gross · 2026", exp: "2026 to Excel (.xlsx)" },
};
function makeSeries(period) {
  if (period === "day") return ["8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p"].map((l, i) => ({ l, v: [3, 6, 9, 7, 5, 8, 6, 4, 5, 7, 6, 3][i], hot: i === 2 }));
  if (period === "week") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((l, i) => ({ l, v: [1450, 1680, 1520, 1635, 1980, 2360, 1740][i], hot: i === 3 }));
  if (period === "month") return Array.from({ length: 30 }, (_, i) => { const d = i + 1; const v = d <= 5 ? 1400 + Math.round(950 * Math.abs(Math.sin(d * 1.3))) + ((d === 6 || d === 7) ? 700 : 0) : 0; return { l: String(d), v, hot: d === 5 }; });
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((l, i) => ({ l, v: i <= 5 ? [38, 34, 41, 39, 46, 18][i] : 0, hot: i === 5 }));
}

const GROUP_LABEL = { drink: "Drinks", food: "Food", snack: "Snacks" };

function ReportsView({ ledger, onToast }) {
  const { THB, STAFF } = window.CafeData;
  const [period, setPeriod] = useStateR("day");
  const [cat, setCat] = useStateR("all");
  const meta = PERIOD_META[period];
  const f = meta.factor;
  const R = (n) => Math.round(n * f);

  const gross = ledger.reduce((s, e) => s + e.total, 0);
  const cash = ledger.filter((e) => e.method === "cash").reduce((s, e) => s + e.total, 0);
  const qr = gross - cash;
  const cashPct = gross ? Math.round((cash / gross) * 100) : 0;
  const itemsSold = ledger.reduce((s, e) => s + e.items.reduce((a, it) => a + it.qty, 0), 0);
  const avg = ledger.length ? gross / ledger.length : 0;

  const catTotals = { drink: 0, food: 0, snack: 0 };
  ledger.forEach((e) => e.items.forEach((it) => { catTotals[it.group || "food"] += it.price * it.qty; }));
  const catMax = Math.max(catTotals.drink, catTotals.food, catTotals.snack, 1);

  const byStaff = STAFF.map((s) => { const es = ledger.filter((e) => e.staff === s.id); return { s, n: es.length, total: es.reduce((a, e) => a + e.total, 0) }; }).filter((r) => r.n).sort((a, b) => b.total - a.total);

  const itemMap = {};
  ledger.forEach((e) => e.items.forEach((it) => {
    if (cat !== "all" && (it.group || "food") !== cat) return;
    const key = it.name.split(" · ")[0].replace(/^\+ /, "");
    if (!itemMap[key]) itemMap[key] = { name: key, qty: 0, rev: 0, group: it.group || "food" };
    itemMap[key].qty += it.qty; itemMap[key].rev += it.price * it.qty;
  }));
  const topItems = Object.values(itemMap).sort((a, b) => b.rev - a.rev).slice(0, 7);
  const maxRev = Math.max(...topItems.map((i) => i.rev), 1);

  const series = useMemoR(() => makeSeries(period), [period]);
  const seriesMax = Math.max(...series.map((d) => d.v), 1);

  return (
    <div className="reports">
      <div className="view-head">
        <div><h2>{tR("Summary & export")}</h2><div className="sub">{tR(meta.sub)}</div></div>
        <div className="spacer" />
        <Segmented value={period} onChange={setPeriod} options={PERIODS.map((p) => ({ value: p.value, label: tR(p.label) }))} />
        <Btn kind="primary" icon="download" onClick={() => onToast(tR("Exported ") + tR(meta.exp))}>{tR("Export")}</Btn>
      </div>

      <div className="rep-body">
        <div className="kpi-row">
          <div className="kpi"><span className="kpi-lbl">{tR("Gross sales")}</span><span className="kpi-val money">{THB(R(gross))}</span></div>
          <div className="kpi"><span className="kpi-lbl">{tR("Transactions")}</span><span className="kpi-val">{R(ledger.length)}</span></div>
          <div className="kpi"><span className="kpi-lbl">{tR("Avg ticket")}</span><span className="kpi-val money">{THB(avg)}</span></div>
          <div className="kpi"><span className="kpi-lbl">{tR("Items sold")}</span><span className="kpi-val">{R(itemsSold)}</span></div>
        </div>

        <div className="card">
          <div className="card-h">{tR(meta.chart)}</div>
          <div className={"trend" + (series.length > 14 ? " trend-dense" : "")}>
            {series.map((d, i) => (
              <div key={i} className={"tr-col" + (d.hot ? " is-hot" : "")} title={d.l}>
                <span className="tr-bar" style={{ height: d.v ? Math.max(3, d.v / seriesMax * 100) + "%" : "2px" }} />
                <span className="tr-lbl">{d.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rep-cols">
          <div className="card">
            <div className="card-h">{tR("Sales by category")} <span className="card-hint">{tR("tap to filter")}</span></div>
            <div className="cat-bars">
              {["drink", "food", "snack"].map((g) => (
                <button key={g} className={"catbar-row" + (cat === g ? " is-on" : "")} onClick={() => setCat(cat === g ? "all" : g)}>
                  <span className="cb-nm">{tR(GROUP_LABEL[g])}</span>
                  <span className="cb-track"><span className={"cb-fill cb-" + g} style={{ width: (catTotals[g] / catMax * 100) + "%" }} /></span>
                  <span className="cb-amt money">{THB(R(catTotals[g]))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h">{tR("Payment split")}</div>
            <div className="split-bar"><span className="split-cash" style={{ width: cashPct + "%" }} /><span className="split-qr" style={{ width: (100 - cashPct) + "%" }} /></div>
            <div className="split-legend">
              <div><span className="dot dot-cash" /> {tR("Cash")} <b className="money">{THB(R(cash))}</b> <em>{cashPct}%</em></div>
              <div><span className="dot dot-qr" /> {tR("QR transfer")} <b className="money">{THB(R(qr))}</b> <em>{100 - cashPct}%</em></div>
            </div>
          </div>
        </div>

        <div className="rep-cols">
          <div className="card">
            <div className="card-h">{tR("By staff")}</div>
            <div className="staff-rows">
              {byStaff.map((r) => (
                <div key={r.s.id} className="staff-row">
                  <Avatar staff={r.s} size={28} /><span className="sr-nm">{r.s.name}</span>
                  <span className="sr-n">{R(r.n)} {tR("entries")}</span><span className="sr-total money">{THB(R(r.total))}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h">{tR("Top items")}
              <div className="ti-filter">
                {[{ value: "all", label: "All" }, { value: "drink", label: "Drinks" }, { value: "food", label: "Food" }, { value: "snack", label: "Snacks" }].map((o) => (
                  <button key={o.value} className={"tif" + (cat === o.value ? " is-on" : "")} onClick={() => setCat(o.value)}>{tR(o.label)}</button>
                ))}
              </div>
            </div>
            <div className="top-items">
              {topItems.length === 0 ? <div className="ti-empty">{tR("No sales in range.")}</div> : topItems.map((it) => (
                <div key={it.name} className="ti-row">
                  <span className="ti-nm">{tnameR(it.name)}</span>
                  <span className="ti-bar"><span className={"ti-fill cb-" + it.group} style={{ width: (it.rev / maxRev * 100) + "%" }} /></span>
                  <span className="ti-qty">{R(it.qty)} {tR("sold")}</span><span className="ti-rev money">{THB(R(it.rev))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="form-note" style={{ padding: "0 4px" }}>{tR("Every entry feeds these totals automatically — no more retyping the notebook into Excel. Tap Export for the spreadsheet Ying needs.")}</p>
      </div>
    </div>
  );
}

// ---------- Catalog manager -------------------------------------------------
function PriceEdit({ value, onSave }) {
  const [edit, setEdit] = useStateR(false);
  const [v, setV] = useStateR(value);
  if (edit) return (
    <span className="price-edit">
      ฿<input className="price-input" type="number" value={v} autoFocus onChange={(e) => setV(e.target.value)} />
      <button className="pe-ok" onClick={() => { onSave(Number(v) || 0); setEdit(false); }}><Icon name="check" size={15} /></button>
    </span>
  );
  return <button className="price-show money" onClick={() => setEdit(true)}>{window.CafeData.THB(value)}<Icon name="edit" size={13} /></button>;
}

function CatalogView({ catalog, setCatalog, savedItems, onSaveItem, onDeleteSaved }) {
  const { ALC_DISHES, ALC_PROTEINS, ADDONS, FLAVORS } = window.CafeData;
  const [tab, setTab] = useStateR("Drinks");
  const [custom, setCustom] = useStateR(false);
  const tabs = ["Drinks", "Food", "Snacks", "À la carte", "Flavors", "Saved"];

  const setPrice = (id, price) => setCatalog((c) => c.map((it) => it.id === id ? { ...it, price } : it));
  const menu = catalog.filter((c) => c.cat === tab);
  const TAB_GROUP = { Drinks: "drink", Food: "food", Snacks: "snack" };
  const isSaved = (id) => savedItems.some((s) => s.id === id);

  return (
    <div className="catalog">
      <div className="view-head">
        <div><h2>{tR("Catalog")}</h2><div className="sub">{tR("Tap a price to edit · changes apply instantly at the counter")}</div></div>
        <div className="spacer" />
        <Btn kind="primary" icon="plus" onClick={() => setCustom(true)}>{tR("New item")}</Btn>
      </div>
      <div className="cat-tabs">
        {tabs.map((t2) => <button key={t2} className={"cat-tab" + (tab === t2 ? " is-on" : "")} onClick={() => setTab(t2)}>{tR(t2)}</button>)}
      </div>

      <div className="cat-list">
        {(tab === "Drinks" || tab === "Food" || tab === "Snacks") && menu.map((it) => (
          <div key={it.id} className="cat-row">
            <span className="cr-ic"><Icon name={it.glyph || "dot"} size={20} /></span>
            <span className="cr-nm">{tnameR(it.name)}{it.kind === "drink" && <em className="cr-tag">{tR("customisable")}</em>}{isSaved(it.id) && <span className="cr-group">{tR("added")}</span>}</span>
            <PriceEdit value={it.price} onSave={(p) => setPrice(it.id, p)} />
            {isSaved(it.id) && <button className="cr-del" onClick={() => onDeleteSaved(it.id)} aria-label="delete"><Icon name="trash" size={16} /></button>}
          </div>
        ))}
        {tab === "Snacks" && (
          <button className="cat-add-row" onClick={() => setCustom(true)}><Icon name="plus" size={18} />{tR("Add a packaged snack")}</button>
        )}

        {tab === "À la carte" && (<>
          <div className="cat-sub">{tR("Protein & size")} <em className="cr-unit">{tR("rice 150g included")}</em></div>
          {ALC_PROTEINS.map((p) => (
            <div key={p.id} className="cat-row cat-flavor">
              <span className="cr-nm">{tR(p.name)}</span>
              <span className="flavor-chips">{p.weights.map((w) => <span key={w.g} className="chip chip-mini">{w.g} <b className="money">{window.CafeData.THB(w.price)}</b></span>)}</span>
            </div>
          ))}
          <div className="cat-sub">{tR("Dishes")}</div>
          {ALC_DISHES.map((d) => (
            <div key={d.id} className="cat-row">
              <span className="cr-ic"><Icon name="bowl" size={18} /></span>
              <span className="cr-nm">{tnameR(d.name)}</span>
            </div>
          ))}
        </>)}

        {tab === "Flavors" && (<>
          {ADDONS.length > 0 && (<>
            <div className="cat-sub">{tR("Drink add-ons")}</div>
            {ADDONS.map((a) => (
              <div key={a.id} className="cat-row">
                <span className="cr-ic"><Icon name="plus" size={18} /></span>
                <span className="cr-nm">{tnameR(a.name)}</span>
                <span className="price-show money">+{window.CafeData.THB(a.price)}</span>
              </div>
            ))}
          </>)}
          <div className="cat-sub">{tR("Flavors")}</div>
          {Object.entries(FLAVORS).map(([k, list]) => (
            <div key={k} className="cat-row cat-flavor">
              <span className="cr-nm">{tnameR(k)}</span>
              <span className="flavor-chips">{list.map((fl) => <span key={fl} className="chip chip-mini">{tR(fl)}</span>)}</span>
            </div>
          ))}
        </>)}

        {tab === "Saved" && (savedItems.length === 0
          ? <EmptyState icon="catalog" title={tR("No saved items")} sub={tR("Custom items you save at the counter show up here.")} />
          : savedItems.map((it) => (
            <div key={it.id} className="cat-row">
              <span className="cr-ic"><Icon name="dot" size={18} /></span>
              <span className="cr-nm">{tnameR(it.name)}{it.group && <span className="cr-group">{tR(GROUP_LABEL[it.group])}</span>}</span>
              <span className="price-show money">{window.CafeData.THB(it.price)}</span>
              <button className="cr-del" onClick={() => onDeleteSaved(it.id)} aria-label="delete"><Icon name="trash" size={16} /></button>
            </div>
          )))}
      </div>

      {custom && <CustomModal onClose={() => setCustom(false)} onSave={(it) => onSaveItem(it)} saveOnly defaultGroup={TAB_GROUP[tab] || "food"} />}
    </div>
  );
}

Object.assign(window, { ReportsView, CatalogView });
