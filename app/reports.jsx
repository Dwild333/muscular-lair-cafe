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

// ---- CSV export (downloads the real recorded transactions) ----------------
function csvEscape(v) {
  const s = String(v == null ? "" : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function exportLedgerCSV(ledger, period) {
  const STAFF = window.CafeData.STAFF;
  const sName = (id) => (STAFF.find((s) => s.id === id) || {}).name || id;
  const header = ["Time", "Logged by", "Customer", "Items", "Payment", "Status", "Discount (THB)", "Total (THB)"];
  const rows = ledger.map((e) => [
    e.time, sName(e.staff), e.customer,
    e.items.map((it) => `${it.name}${it.note ? " (" + it.note + ")" : ""}${it.qty > 1 ? " x" + it.qty : ""}`).join("; "),
    e.method === "cash" ? "Cash" : "QR", e.status === "paid" ? "Paid" : "Open tab",
    (e.discount || 0) + (e.discountLabel ? " (" + e.discountLabel + ")" : ""), e.total,
  ]);
  const gross = ledger.reduce((s, e) => s + e.total, 0);
  rows.push([], ["", "", "", "", "", "TOTAL", "", gross]);
  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\r\n");
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const filename = `muscular-cafe-${period}-${stamp}.csv`;
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return filename;
}

function ReportsView({ ledger, onToast }) {
  const { THB, STAFF, dayKey, todayKey, fmtDateLong } = window.CafeData;
  const [period, setPeriod] = useStateR("day");
  const [cat, setCat] = useStateR("all");
  const meta = PERIOD_META[period];
  const f = meta.factor;
  const R = (n) => Math.round(n * f);

  // For the Day view, count only today's (Bangkok) entries so the day
  // starts/ends correctly. Other periods scale from the full ledger.
  const base = period === "day" ? ledger.filter((e) => !e.ts || dayKey(e.ts) === todayKey()) : ledger;
  const daySub = fmtDateLong(new Date());

  const gross = base.reduce((s, e) => s + e.total, 0);
  const cash = base.filter((e) => e.method === "cash").reduce((s, e) => s + e.total, 0);
  const qr = gross - cash;
  const cashPct = gross ? Math.round((cash / gross) * 100) : 0;
  const itemsSold = base.reduce((s, e) => s + e.items.reduce((a, it) => a + it.qty, 0), 0);
  const avg = base.length ? gross / base.length : 0;

  const catTotals = { drink: 0, food: 0, snack: 0 };
  base.forEach((e) => e.items.forEach((it) => { catTotals[it.group || "food"] += it.price * it.qty; }));
  const catMax = Math.max(catTotals.drink, catTotals.food, catTotals.snack, 1);

  const byStaff = STAFF.map((s) => { const es = base.filter((e) => e.staff === s.id); return { s, n: es.length, total: es.reduce((a, e) => a + e.total, 0) }; }).filter((r) => r.n).sort((a, b) => b.total - a.total);

  const itemMap = {};
  base.forEach((e) => e.items.forEach((it) => {
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
        <div><h2>{tR("Summary & export")}</h2><div className="sub">{period === "day" ? daySub : tR(meta.sub)}</div></div>
        <div className="spacer" />
        <Segmented value={period} onChange={setPeriod} options={PERIODS.map((p) => ({ value: p.value, label: tR(p.label) }))} />
        <Btn kind="primary" icon="download" onClick={() => { const fn = exportLedgerCSV(base, period); onToast(tR("Exported ") + fn); }}>{tR("Export")}</Btn>
      </div>

      <div className="rep-body">
        <div className="kpi-row">
          <div className="kpi"><span className="kpi-lbl">{tR("Gross sales")}</span><span className="kpi-val money">{THB(R(gross))}</span></div>
          <div className="kpi"><span className="kpi-lbl">{tR("Transactions")}</span><span className="kpi-val">{R(base.length)}</span></div>
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

const ITEM_GLYPHS = ["shake", "bolt", "cup", "coffee", "drop", "bowl", "plate", "salad", "stack", "egg", "dot"];

function ItemEditModal({ item, addons, onClose, onSave }) {
  const GMAP = { drink: "Drinks", food: "Food", snack: "Snacks" };
  const [name, setName] = useStateR(item.name);
  const [price, setPrice] = useStateR(String(item.price));
  const [group, setGroup] = useStateR(item.group || "drink");
  const [glyph, setGlyph] = useStateR(item.glyph || "dot");
  const [flavors, setFlavors] = useStateR(item.flavors ? [...item.flavors] : []);
  const [flavorIn, setFlavorIn] = useStateR("");
  const [variants, setVariants] = useStateR(item.variants ? item.variants.map((v) => ({ label: v.label, price: String(v.price) })) : []);
  const [sel, setSel] = useStateR(() => { const m = {}; (item.addons || []).forEach((id) => m[id] = true); return m; });

  const addFlavor = () => { const v = flavorIn.trim(); if (v && !flavors.includes(v)) setFlavors([...flavors, v]); setFlavorIn(""); };
  const rmFlavor = (f) => setFlavors(flavors.filter((x) => x !== f));
  const addVariant = () => setVariants([...variants, { label: "", price: price || "0" }]);
  const setVar = (i, k, val) => setVariants(variants.map((v, j) => j === i ? { ...v, [k]: val } : v));
  const rmVar = (i) => setVariants(variants.filter((_, j) => j !== i));
  const valid = name.trim() && Number(price) >= 0;

  function save() {
    const fl = flavors.filter(Boolean);
    const vr = variants.filter((v) => v.label.trim()).map((v) => ({ label: v.label.trim(), price: Number(v.price) || 0 }));
    const ad = (addons || []).filter((a) => sel[a.id]).map((a) => a.id);
    const customised = fl.length > 0 || vr.length > 0 || ad.length > 0;
    onSave(item.id, {
      name: name.trim(), price: Number(price) || 0, group, cat: GMAP[group] || item.cat, glyph,
      flavors: fl.length ? fl : null, variants: vr.length ? vr : null, addons: ad.length ? ad : null,
      kind: customised ? "drink" : "simple",
    });
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={tR("Edit item")} wide
      footer={<><div className="spacer" /><Btn kind="ghost" onClick={onClose}>{tR("Cancel")}</Btn><Btn kind="primary" icon="check" disabled={!valid} onClick={save}>{tR("Save changes")}</Btn></>}>
      <div className="form-grid">
        <Field label={tR("Item name")}><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label={tR("Price (฿)")}><input className="input" type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{tR("Category")}</span>
        <Segmented full value={group} onChange={setGroup} options={[{ value: "drink", label: tR("Drinks") }, { value: "food", label: tR("Food") }, { value: "snack", label: tR("Snacks") }]} />
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{tR("Icon")}</span>
        <div className="glyph-grid">
          {ITEM_GLYPHS.map((g) => (
            <button key={g} className={"glyph-opt" + (glyph === g ? " is-on" : "")} onClick={() => setGlyph(g)} aria-label={g}><Icon name={g} size={20} /></button>
          ))}
        </div>
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{tR("Flavor options")} <span style={{ color: "var(--muted)", fontWeight: 500 }}>{tR("· tap-to-pick at register")}</span></span>
        {flavors.length > 0 && <div className="chip-grid" style={{ marginBottom: 8 }}>{flavors.map((f) => <span key={f} className="chip is-on flavor-edit-chip">{f}<button onClick={() => rmFlavor(f)} aria-label="remove"><Icon name="x" size={13} /></button></span>)}</div>}
        <div className="flavor-add"><input className="input" value={flavorIn} onChange={(e) => setFlavorIn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFlavor(); } }} placeholder={tR("Add a flavor, then Enter")} /><Btn kind="ghost" icon="plus" onClick={addFlavor} disabled={!flavorIn.trim()} /></div>
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{tR("Serve options")} <span style={{ color: "var(--muted)", fontWeight: 500 }}>{tR("· e.g. Hot / Iced, each with its own price")}</span></span>
        {variants.map((v, i) => (
          <div key={i} className="variant-row">
            <input className="input" value={v.label} onChange={(e) => setVar(i, "label", e.target.value)} placeholder={tR("Label e.g. Iced")} />
            <span className="variant-baht money">฿</span>
            <input className="input variant-price" type="number" value={v.price} onChange={(e) => setVar(i, "price", e.target.value)} />
            <button className="cr-del" onClick={() => rmVar(i)} aria-label="remove"><Icon name="x" size={15} /></button>
          </div>
        ))}
        <button className="cat-add-row" onClick={addVariant}><Icon name="plus" size={16} />{tR("Add a serve option")}</button>
      </div>
      {addons && addons.length > 0 && (
        <div className="field" style={{ marginTop: 14 }}>
          <span className="field-label">{tR("Add-ons")} <span style={{ color: "var(--muted)", fontWeight: 500 }}>{tR("· extras offered for this item")}</span></span>
          <div className="chip-grid">
            {addons.map((a) => (
              <button key={a.id} className={"chip" + (sel[a.id] ? " is-on" : "")} onClick={() => setSel((m) => ({ ...m, [a.id]: !m[a.id] }))}>{tnameR(a.name)} <span className="money">+{window.CafeData.THB(a.price)}</span></button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

function CouponEditModal({ coupon, onClose, onSave }) {
  const isNew = !coupon;
  const [name, setName] = useStateR(coupon ? coupon.name : "");
  const [type, setType] = useStateR(coupon ? coupon.type : "percent");
  const [value, setValue] = useStateR(coupon ? String(coupon.value) : "");
  const valid = name.trim() && Number(value) > 0;
  return (
    <Modal open onClose={onClose} title={isNew ? tR("New coupon") : tR("Edit coupon")}
      footer={<><div className="spacer" /><Btn kind="ghost" onClick={onClose}>{tR("Cancel")}</Btn><Btn kind="primary" icon="check" disabled={!valid} onClick={() => { onSave(isNew ? null : coupon.id, { name: name.trim(), type, value: Number(value) }); onClose(); }}>{isNew ? tR("Add coupon") : tR("Save changes")}</Btn></>}>
      <Field label={tR("Coupon name")}><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ML Coupon" /></Field>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{tR("Type")}</span>
        <Segmented full value={type} onChange={setType} options={[{ value: "percent", label: tR("Percent %") }, { value: "amount", label: tR("Amount ฿") }]} />
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{type === "percent" ? tR("Percent off") : tR("Baht off")}</span>
        <input className="input" type="number" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "percent" ? "10" : "20"} />
      </div>
    </Modal>
  );
}

function CatalogView({ catalog, onSetPrice, savedItems, onSaveItem, onDeleteItem, onUpdateItem, addons, proteins, onSetAddonPrice, onSetProteinPrice, coupons, onAddCoupon, onUpdateCoupon, onDeleteCoupon }) {
  const { ALC_DISHES, FLAVORS } = window.CafeData;
  const [tab, setTab] = useStateR("Drinks");
  const [custom, setCustom] = useStateR(false);
  const [confirm, setConfirm] = useStateR(null); // item pending delete
  const [editItem, setEditItem] = useStateR(null); // item being edited
  const [couponEdit, setCouponEdit] = useStateR(null); // coupon being edited or 'new'
  const tabs = ["Drinks", "Food", "Snacks", "À la carte", "Flavors", "Coupons", "Saved"];

  const menu = catalog.filter((c) => c.cat === tab);
  const TAB_GROUP = { Drinks: "drink", Food: "food", Snacks: "snack" };
  const isSaved = (id) => savedItems.some((s) => s.id === id);
  const addLabel = { Drinks: tR("Add a drink"), Food: tR("Add a dish"), Snacks: tR("Add a packaged snack") };

  return (
    <div className="catalog">
      <div className="view-head">
        <div><h2>{tR("Catalog")}</h2><div className="sub">{tR("Tap a price to edit · changes save to the cloud instantly")}</div></div>
        <div className="spacer" />
        <Btn kind="primary" icon="plus" onClick={() => setCustom(true)}>{tR("New item")}</Btn>
      </div>
      <div className="cat-tabs">
        {tabs.map((t2) => <button key={t2} className={"cat-tab" + (tab === t2 ? " is-on" : "")} onClick={() => setTab(t2)}>{tR(t2)}</button>)}
      </div>

      <div className="cat-list">
        {(tab === "Drinks" || tab === "Food" || tab === "Snacks") && (<>
          {menu.map((it) => (
            <div key={it.id} className="cat-row">
              <span className="cr-ic"><Icon name={it.glyph || "dot"} size={20} /></span>
              <button className="cr-nm cr-nm-btn" onClick={() => setEditItem(it)}>{tnameR(it.name)}{it.kind === "drink" && <em className="cr-tag">{tR("customisable")}</em>}{isSaved(it.id) && <span className="cr-group">{tR("added")}</span>}</button>
              <PriceEdit value={it.price} onSave={(p) => onSetPrice(it.id, p)} />
              <button className="cr-edit" onClick={() => setEditItem(it)} aria-label="edit"><Icon name="edit" size={16} /></button>
              <button className="cr-del" onClick={() => setConfirm(it)} aria-label="delete"><Icon name="trash" size={16} /></button>
            </div>
          ))}
          {menu.length === 0 && tab === "Snacks" && <EmptyState icon="catalog" title={tR("No snacks yet")} sub={tR("Add packaged snacks from your distributors below.")} />}
          <button className="cat-add-row" onClick={() => setCustom(true)}><Icon name="plus" size={18} />{addLabel[tab]}</button>
        </>)}

        {tab === "À la carte" && (<>
          <div className="cat-sub">{tR("Protein & size")} <em className="cr-unit">{tR("rice 150g included · tap a price to edit")}</em></div>
          {proteins.map((p) => (
            <div key={p.id} className="cat-row cat-flavor">
              <span className="cr-nm">{tR(p.name)}</span>
              <span className="flavor-chips">{p.weights.map((w, i) => (
                <span key={w.g} className="alc-price-chip">{w.g} <PriceEdit value={w.price} onSave={(pr) => onSetProteinPrice(p.id, i, pr)} /></span>
              ))}</span>
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
          <div className="cat-sub">{tR("Drink add-ons")}</div>
          {addons.map((a) => (
            <div key={a.id} className="cat-row">
              <span className="cr-ic"><Icon name="plus" size={18} /></span>
              <span className="cr-nm">{tnameR(a.name)}</span>
              <PriceEdit value={a.price} onSave={(p) => onSetAddonPrice(a.id, p)} />
            </div>
          ))}
          <div className="cat-sub">{tR("Flavors")}</div>
          {Object.entries(FLAVORS).map(([k, list]) => (
            <div key={k} className="cat-row cat-flavor">
              <span className="cr-nm">{tnameR(k)}</span>
              <span className="flavor-chips">{list.map((fl) => <span key={fl} className="chip chip-mini">{tR(fl)}</span>)}</span>
            </div>
          ))}
        </>)}

        {tab === "Coupons" && (<>
          {coupons.map((c) => (
            <div key={c.id} className="cat-row">
              <span className="cr-ic"><Icon name="star" size={18} /></span>
              <button className="cr-nm cr-nm-btn" onClick={() => setCouponEdit(c)}>{tnameR(c.name)} <span className="cr-group">{c.type === "percent" ? c.value + "%" : window.CafeData.THB(c.value) + " " + tR("off")}</span></button>
              <button className="cr-edit" onClick={() => setCouponEdit(c)} aria-label="edit"><Icon name="edit" size={16} /></button>
              <button className="cr-del" onClick={() => onDeleteCoupon(c.id)} aria-label="delete"><Icon name="trash" size={16} /></button>
            </div>
          ))}
          {coupons.length === 0 && <EmptyState icon="catalog" title={tR("No coupons yet")} sub={tR("Add a quick discount staff can tap at the register.")} />}
          <button className="cat-add-row" onClick={() => setCouponEdit("new")}><Icon name="plus" size={18} />{tR("Add a coupon")}</button>
        </>)}

        {tab === "Saved" && (savedItems.length === 0
          ? <EmptyState icon="catalog" title={tR("No saved items")} sub={tR("Custom items you save at the counter show up here.")} />
          : savedItems.map((it) => (
            <div key={it.id} className="cat-row">
              <span className="cr-ic"><Icon name={it.glyph || "dot"} size={18} /></span>
              <button className="cr-nm cr-nm-btn" onClick={() => setEditItem(it)}>{tnameR(it.name)}{it.group && <span className="cr-group">{tR(GROUP_LABEL[it.group])}</span>}</button>
              <PriceEdit value={it.price} onSave={(p) => onSetPrice(it.id, p)} />
              <button className="cr-edit" onClick={() => setEditItem(it)} aria-label="edit"><Icon name="edit" size={16} /></button>
              <button className="cr-del" onClick={() => setConfirm(it)} aria-label="delete"><Icon name="trash" size={16} /></button>
            </div>
          )))}
      </div>

      {custom && <CustomModal onClose={() => setCustom(false)} onSave={(it) => onSaveItem(it)} saveOnly defaultGroup={TAB_GROUP[tab] || "food"} />}
      {editItem && <ItemEditModal item={editItem} addons={addons} onClose={() => setEditItem(null)} onSave={onUpdateItem} />}
      {couponEdit && <CouponEditModal coupon={couponEdit === "new" ? null : couponEdit} onClose={() => setCouponEdit(null)} onSave={(id, fields) => id ? onUpdateCoupon(id, fields) : onAddCoupon(fields)} />}
      {confirm && (
        <Modal open onClose={() => setConfirm(null)} title={tR("Remove item?")}
          footer={<><div className="spacer" /><Btn kind="ghost" onClick={() => setConfirm(null)}>{tR("Cancel")}</Btn><Btn kind="danger" icon="trash" onClick={() => { onDeleteItem(confirm.id); setConfirm(null); }}>{tR("Remove")}</Btn></>}>
          <p className="form-note" style={{ marginTop: 0 }}>{tR("This removes")} <b>{tnameR(confirm.name)}</b> {tR("from the menu. Past sales keep their record.")}</p>
        </Modal>
      )}
    </div>
  );
}

Object.assign(window, { ReportsView, CatalogView });
