// pos.jsx — point-of-sale order builder + customization modals. Exports POSView.
const { useState: useStateP, useMemo: useMemoP } = React;
const t = window.t, tname = window.tname;

function lineUid() { return "li" + Math.random().toString(36).slice(2, 8); }

const GROUP_CAT = { drink: "Drinks", food: "Food", snack: "Snacks" };
const GROUP_GLYPH = { drink: "cup", food: "bowl", snack: "stack" };

// ---------- Drink customization (hot/iced variant + flavor + add-ons + qty) -
function DrinkModal({ item, onClose, onAdd }) {
  const { FLAVORS, ADDONS, THB } = window.CafeData;
  const flavors = item.flavors || FLAVORS[item.name] || null;
  const variants = item.variants || null;
  const addonDefs = (item.addons || []).map((id) => ADDONS.find((a) => a.id === id)).filter(Boolean);
  const [variant, setVariant] = useStateP(variants ? variants[0] : null);
  const [flavor, setFlavor] = useStateP(flavors ? flavors[0] : null);
  const [addons, setAddons] = useStateP({}); // { addonId: count }
  const [qty, setQty] = useStateP(1);
  const setAddonQ = (id, q) => setAddons((m) => ({ ...m, [id]: Math.max(0, q) }));
  const addOnList = addonDefs.filter((a) => (addons[a.id] || 0) > 0);
  const base = variant ? variant.price : item.price;
  const unit = base + addOnList.reduce((s, a) => s + a.price * addons[a.id], 0);

  function commit() {
    const name = item.name
      + (variant ? " · " + variant.label : "")
      + (flavor ? " · " + flavor : "");
    const note = addOnList.map((a) => "+ " + a.name + (addons[a.id] > 1 ? " ×" + addons[a.id] : "")).join("  ");
    onAdd({ uid: lineUid(), name, note, price: unit, qty, base: item.id, group: item.group || "drink" });
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={tname(item.name)} wide
      footer={<>
        <Stepper value={qty} onChange={setQty} min={1} />
        <div className="spacer" />
        <span className="modal-total">{t("Line total")} <b className="money">{THB(unit * qty)}</b></span>
        <Btn kind="primary" icon="plus" onClick={commit}>{t("Add to ticket")}</Btn>
      </>}>
      {variants && (
        <div className="cust-block">
          <div className="cust-label">{t("Serve")}</div>
          <div className="chip-grid">
            {variants.map((v) => (
              <button key={v.label} className={"chip" + (variant === v ? " is-on" : "")} onClick={() => setVariant(v)}>
                {t(v.label)} <span className="money">{THB(v.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {flavors && (
        <div className="cust-block">
          <div className="cust-label">{t("Flavor")}</div>
          <div className="chip-grid">
            {flavors.map((fl) => (
              <button key={fl} className={"chip" + (flavor === fl ? " is-on" : "")} onClick={() => setFlavor(fl)}>{t(fl)}</button>
            ))}
          </div>
        </div>
      )}
      {addonDefs.length > 0 && (
        <div className="cust-block">
          <div className="cust-label">{t("Add-ons")} <span className="cust-hint">{t("tap to add — set the quantity")}</span></div>
          <div className="addon-grid">
            {addonDefs.map((a) => {
              const q = addons[a.id] || 0;
              return (
                <div key={a.id} className={"addon" + (q > 0 ? " is-on" : "")}>
                  <span className="addon-nm">{t(a.name)}</span>
                  <span className="addon-pr money">+{THB(a.price)}</span>
                  {q > 0
                    ? <Stepper value={q} onChange={(v) => setAddonQ(a.id, v)} min={0} />
                    : <button className="addon-add" onClick={() => setAddonQ(a.id, 1)} aria-label="add"><Icon name="plus" size={15} /></button>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---------- À la carte builder (dish + protein + weight, rice 150g incl) -----
function AlaCarte({ onAdd }) {
  const { ALC_DISHES, ALC_PROTEINS, THB } = window.CafeData;
  const [dish, setDish] = useStateP(ALC_DISHES[0]);
  const [protein, setProtein] = useStateP(ALC_PROTEINS[0]);
  const [wIdx, setWIdx] = useStateP(0);
  const [qty, setQty] = useStateP(1);

  // clamp weight when switching to a protein with fewer tiers (e.g. Braised Beef)
  const weights = protein.weights;
  const safeIdx = Math.min(wIdx, weights.length - 1);
  const weight = weights[safeIdx];
  const unit = weight.price;

  function pickProtein(p) {
    setProtein(p);
    if (wIdx > p.weights.length - 1) setWIdx(p.weights.length - 1);
  }

  function addPlate() {
    const note = `${protein.name} · ${weight.g} · Rice 150g`;
    onAdd({ uid: lineUid(), name: dish.name, note, price: unit, qty, base: dish.id + "_" + protein.id + "_" + weight.g, group: "food" });
    setQty(1);
  }

  return (
    <div className="alc">
      <div className="alc-build">
        <div className="alc-step">
          <div className="alc-group">{t("Dish")}</div>
          <div className="alc-dish-grid">
            {ALC_DISHES.map((d) => (
              <button key={d.id} className={"chip alc-dish" + (dish.id === d.id ? " is-on" : "")} onClick={() => setDish(d)}>{tname(d.name)}</button>
            ))}
          </div>
        </div>

        <div className="alc-step">
          <div className="alc-group">{t("Protein")}</div>
          <div className="chip-grid">
            {ALC_PROTEINS.map((p) => (
              <button key={p.id} className={"chip" + (protein.id === p.id ? " is-on" : "")} onClick={() => pickProtein(p)}>{t(p.name)}</button>
            ))}
          </div>
        </div>

        <div className="alc-step">
          <div className="alc-group">{t("Size")} <span className="cust-hint">{t("rice 150g included")}</span></div>
          <div className="chip-grid">
            {weights.map((w, i) => (
              <button key={w.g} className={"chip" + (safeIdx === i ? " is-on" : "")} onClick={() => setWIdx(i)}>
                {w.g} <span className="money">{THB(w.price)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="alc-bar">
        <div className="alc-sum">
          <span className="alc-sumtext">{tname(dish.name)} · {t(protein.name)} {weight.g} · <b className="money">{THB(unit * qty)}</b></span>
        </div>
        <Stepper value={qty} onChange={setQty} min={1} />
        <Btn kind="primary" icon="plus" onClick={addPlate}>{t("Add to ticket")}</Btn>
      </div>
    </div>
  );
}

// ---------- Custom / new item (with optional flavor options) ---------------
function CustomModal({ onClose, onAdd, onSave, defaultGroup, saveOnly }) {
  const { GROUPS } = window.CafeData;
  const [name, setName] = useStateP("");
  const [price, setPrice] = useStateP("");
  const [group, setGroup] = useStateP(defaultGroup || "food");
  const [flavors, setFlavors] = useStateP([]);
  const [flavorIn, setFlavorIn] = useStateP("");
  const [save, setSave] = useStateP(false);
  const valid = name.trim() && Number(price) > 0;

  const addFlavor = () => {
    const v = flavorIn.trim();
    if (v && !flavors.includes(v)) setFlavors([...flavors, v]);
    setFlavorIn("");
  };
  const rmFlavor = (f) => setFlavors(flavors.filter((x) => x !== f));

  function commit() {
    const p = Number(price);
    const hasFl = flavors.length > 0;
    const kind = hasFl ? "drink" : "simple";
    if (save || saveOnly) onSave({ id: "s" + Date.now(), cat: GROUP_CAT[group], group, name: name.trim(), price: p, kind, glyph: GROUP_GLYPH[group], flavors: hasFl ? flavors : undefined });
    if (!saveOnly) {
      if (hasFl) onAdd({ uid: lineUid(), name: name.trim() + " · " + flavors[0], note: "", price: p, qty: 1, base: "custom", group });
      else onAdd({ uid: lineUid(), name: name.trim(), note: "", price: p, qty: 1, base: "custom", group });
    }
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={saveOnly ? t("New catalog item") : t("Custom item")}
      footer={<>{!saveOnly && <label className="save-toggle" onClick={() => setSave(!save)}>
        <span className={"switch" + (save ? " on" : "")}><span className="knob" /></span>
        {t("Save to catalog")}
      </label>}<div className="spacer" /><Btn kind="primary" icon={saveOnly ? "check" : "plus"} disabled={!valid} onClick={commit}>{saveOnly ? t("Add to catalog") : t("Add to ticket")}</Btn></>}>
      <div className="form-grid">
        <Field label={t("Item name")}><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={saveOnly ? "e.g. Snickers Protein Bar" : "e.g. Birthday smoothie"} /></Field>
        <Field label={t("Price (฿)")}><input className="input" type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" /></Field>
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{t("Category")} <span style={{ color: "var(--muted)", fontWeight: 500 }}>{saveOnly ? t("· where it lives + reports") : t("· for sales reports")}</span></span>
        <Segmented full value={group} onChange={setGroup} options={GROUPS.map((g) => ({ value: g.id, label: t(g.label) }))} />
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{t("Flavor options (optional)")}</span>
        {flavors.length > 0 && (
          <div className="chip-grid" style={{ marginBottom: 8 }}>
            {flavors.map((f) => (
              <span key={f} className="chip is-on flavor-edit-chip">{f}<button onClick={() => rmFlavor(f)} aria-label="remove"><Icon name="x" size={13} /></button></span>
            ))}
          </div>
        )}
        <div className="flavor-add">
          <input className="input" value={flavorIn} onChange={(e) => setFlavorIn(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFlavor(); } }}
            placeholder={t("Add a flavor, then Enter")} />
          <Btn kind="ghost" icon="plus" onClick={addFlavor} disabled={!flavorIn.trim()} />
        </div>
      </div>
      <p className="form-note">{flavors.length > 0
        ? t("With flavor options, this becomes a tap-to-customise item at the register.")
        : (saveOnly
          ? t("Saved items appear under this category at the counter and in reports — perfect for packaged snacks from your local distributors.")
          : t("Use this for anything not on the menu. Turn on Save to catalog to reuse it later, or leave off for a one-off."))}</p>
    </Modal>
  );
}

// ---------- Item tile ------------------------------------------------------
function Tile({ item, onClick }) {
  const { THB } = window.CafeData;
  return (
    <button className="tile" onClick={onClick}>
      <span className="tile-ic"><Icon name={item.glyph || "dot"} size={24} /></span>
      <span className="tile-nm">{tname(item.name)}</span>
      <span className="tile-pr money">{THB(item.price)}</span>
      {item.kind === "drink" && <span className="tile-tag">{t("customise")}</span>}
    </button>
  );
}

// ---------- Customer autocomplete -----------------------------------------
function CustomerInput({ value, onChange, customers, onAddCustomer }) {
  const { THB } = window.CafeData;
  const list = customers || window.CafeData.CUSTOMERS;
  const [focus, setFocus] = useStateP(false);
  const q = value.trim();
  const ql = q.toLowerCase();
  const matches = list.filter((c) => !ql || c.name.toLowerCase().includes(ql)).filter((c) => c.name.toLowerCase() !== ql).slice(0, 5);
  const known = list.find((c) => c.name.toLowerCase() === ql);
  const canAdd = q.length > 1 && !known;
  const showList = focus && (matches.length > 0 || canAdd);

  function addNew() {
    const colors = ["#1F7A4D", "#C2552F", "#2563A8", "#7A3FB0", "#B0833F"];
    const c = { id: "cu" + Date.now(), name: q, tag: "Member", color: colors[Math.floor(Math.random() * colors.length)], visits: 0, spend: 0, split: [50, 40, 10], top: [] };
    onAddCustomer && onAddCustomer(c);
    onChange(c.name); setFocus(false);
  }

  return (
    <div className="cust-wrap">
      <div className={"ticket-cust" + (known ? " is-known" : "")}>
        <Icon name={known ? "star" : "user"} size={16} style={known ? { color: "var(--primary)" } : null} />
        <input className="cust-input" value={value} onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 160)}
          placeholder={t("Customer name (optional)")} />
        {known && <span className="cust-tag-pill">{t(known.tag)}</span>}
      </div>
      {showList && (
        <div className="cust-suggest">
          {matches.map((c) => (
            <button key={c.id} className="cs-row" onMouseDown={(e) => { e.preventDefault(); onChange(c.name); setFocus(false); }}>
              <Avatar staff={{ name: c.name, color: c.color }} size={26} />
              <span className="cs-nm">{c.name}</span>
              <span className="cs-tag">{t(c.tag)}</span>
              {c.spend > 0 && <span className="cs-spend money">{THB(c.spend)}<em>/mo</em></span>}
            </button>
          ))}
          {canAdd && (
            <button className="cs-row cs-add" onMouseDown={(e) => { e.preventDefault(); addNew(); }}>
              <span className="cs-add-ic"><Icon name="plus" size={16} /></span>
              <span className="cs-nm">{t("Add as a new customer")}<b>{" "}“{q}”</b></span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Discounts ------------------------------------------------------
function discAmount(disc, subtotal) {
  if (!disc) return 0;
  const a = disc.type === "percent" ? Math.round(subtotal * disc.value / 100) : disc.value;
  return Math.max(0, Math.min(a, subtotal));
}

function CustomDiscountModal({ onClose, onApply }) {
  const [type, setType] = useStateP("percent");
  const [val, setVal] = useStateP("");
  const valid = Number(val) > 0;
  function apply() {
    const v = Number(val);
    onApply({ label: type === "percent" ? v + "% off" : "฿" + v + " off", type, value: v });
    onClose();
  }
  return (
    <Modal open onClose={onClose} title={t("Custom discount")}
      footer={<><div className="spacer" /><Btn kind="primary" icon="check" disabled={!valid} onClick={apply}>{t("Apply discount")}</Btn></>}>
      <div className="field">
        <span className="field-label">{t("Type")}</span>
        <Segmented full value={type} onChange={setType} options={[{ value: "percent", label: t("Percent %") }, { value: "amount", label: t("Amount ฿") }]} />
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{type === "percent" ? t("Percent off") : t("Baht off")}</span>
        <input className="input" type="number" inputMode="numeric" autoFocus value={val} onChange={(e) => setVal(e.target.value)} placeholder={type === "percent" ? "10" : "20"} />
      </div>
    </Modal>
  );
}

// ---------- Ticket panel ---------------------------------------------------
function Ticket({ staff, cart, setCart, customer, setCustomer, method, setMethod, status, setStatus, onCommit, customers, onAddCustomer, coupons, discount, setDiscount }) {
  const { THB } = window.CafeData;
  const [customDisc, setCustomDisc] = useStateP(false);
  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const discAmt = discAmount(discount, subtotal);
  const total = Math.max(0, subtotal - discAmt);
  const setQty = (uid, q) => setCart((c) => q <= 0 ? c.filter((l) => l.uid !== uid) : c.map((l) => l.uid === uid ? { ...l, qty: q } : l));
  const remove = (uid) => setCart((c) => c.filter((l) => l.uid !== uid));
  const applyCoupon = (c) => setDiscount((d) => (d && d.id === c.id) ? null : { id: c.id, label: c.name, type: c.type, value: c.value });

  return (
    <aside className="ticket">
      <div className="ticket-top">
        <CustomerInput value={customer} onChange={setCustomer} customers={customers} onAddCustomer={onAddCustomer} />
        <div className="ticket-by">
          <Avatar staff={staff} size={26} />
          <span>{t("Logged by")} <b>{staff.name}</b></span>
        </div>
      </div>

      <div className="ticket-lines">
        {cart.length === 0
          ? <EmptyState icon="pos" title={t("Empty ticket")} sub={t("Tap items on the left to start an order.")} />
          : cart.map((l) => (
            <div key={l.uid} className="line">
              <div className="line-main">
                <div className="line-nm">{tname(l.name)}</div>
                {l.note && <div className="line-note">{tname(l.note)}</div>}
              </div>
              <Stepper value={l.qty} onChange={(q) => setQty(l.uid, q)} min={0} />
              <div className="line-pr money">{THB(l.price * l.qty)}</div>
              <button className="line-x" onClick={() => remove(l.uid)} aria-label="remove"><Icon name="x" size={15} /></button>
            </div>
          ))}
      </div>

      <div className="ticket-foot">
        <div className="pay-row">
          <div className="pay-col">
            <span className="pay-lbl">{t("Payment")}</span>
            <Segmented full value={method} onChange={setMethod}
              options={[{ value: "cash", label: t("Cash"), icon: "cash" }, { value: "qr", label: t("QR Transfer"), icon: "qr" }]} />
          </div>
        </div>
        <div className="pay-row">
          <div className="pay-col">
            <span className="pay-lbl">{t("Status")}</span>
            <Segmented full value={status} onChange={setStatus}
              options={[{ value: "paid", label: t("Paid"), icon: "check" }, { value: "open", label: t("Open tab"), icon: "clock" }]} />
          </div>
        </div>
        {cart.length > 0 && (
          <div className="disc-block">
            <span className="pay-lbl">{t("Discount")}</span>
            <div className="disc-chips">
              {coupons.map((c) => (
                <button key={c.id} className={"chip chip-disc" + (discount && discount.id === c.id ? " is-on" : "")} onClick={() => applyCoupon(c)}>
                  {tname(c.name)} <span className="disc-val">{c.type === "percent" ? c.value + "%" : "-" + THB(c.value)}</span>
                </button>
              ))}
              <button className={"chip chip-disc chip-custom" + (discount && !discount.id ? " is-on" : "")} onClick={() => setCustomDisc(true)}><Icon name="plus" size={13} />{t("Custom")}</button>
            </div>
          </div>
        )}
        {discAmt > 0 && (<>
          <div className="sum-row"><span>{t("Subtotal")}</span><span className="money">{THB(subtotal)}</span></div>
          <div className="sum-row sum-disc"><span className="sum-disc-nm">{tname(discount.label)}</span><span className="money">−{THB(discAmt)}</span><button className="line-x" onClick={() => setDiscount(null)} aria-label="remove"><Icon name="x" size={14} /></button></div>
        </>)}
        <div className="total-row">
          <span>{t("Total")}</span>
          <b className="money total-amt">{THB(total)}</b>
        </div>
        <Btn kind="primary" size="lg" full icon="check" disabled={!cart.length}
          onClick={() => onCommit({ total, discount: discAmt, discountLabel: discAmt > 0 ? discount.label : null })}>
          {status === "open" ? t("Save open tab") : (method === "cash" ? t("Save & take cash") : t("Save & confirm QR"))}
        </Btn>
      </div>
      {customDisc && <CustomDiscountModal onClose={() => setCustomDisc(false)} onApply={(d) => setDiscount(d)} />}
    </aside>
  );
}

// ---------- POS view -------------------------------------------------------
function POSView({ staff, onCommit, savedItems, onSaveItem, customers, catalog, onAddCustomer, coupons }) {
  const { CATS } = window.CafeData;
  const [cat, setCat] = useStateP("Drinks");
  const [cart, setCart] = useStateP([]);
  const [customer, setCustomer] = useStateP("");
  const [method, setMethod] = useStateP("cash");
  const [status, setStatus] = useStateP("paid");
  const [discount, setDiscount] = useStateP(null);
  const [drink, setDrink] = useStateP(null);
  const [custom, setCustom] = useStateP(false);

  const add = (line) => setCart((c) => {
    const i = c.findIndex((l) => l.base === line.base && l.name === line.name && l.note === line.note);
    if (i >= 0) { const n = [...c]; n[i] = { ...n[i], qty: n[i].qty + line.qty }; return n; }
    return [...c, line];
  });
  const tapItem = (it) => {
    if (it.kind === "drink") setDrink(it);
    else add({ uid: lineUid(), name: it.name, note: "", price: it.price, qty: 1, base: it.id, group: it.group });
  };

  function commit({ total, discount: discAmt, discountLabel }) {
    const now = new Date();
    onCommit({
      id: window.CafeData.uid(), staff: staff.id,
      time: window.CafeData.fmtTime(now),
      customer: customer.trim() || "Walk-in",
      items: cart.map((l) => ({ name: l.name, qty: l.qty, price: l.price, note: l.note, group: l.group })),
      total, method, status, discount: discAmt || 0, discountLabel: discountLabel || null,
    });
    setCart([]); setCustomer(""); setMethod("cash"); setStatus("paid"); setDiscount(null);
  }

  const tiles = cat === "Saved" ? savedItems : catalog.filter((c) => c.cat === cat);

  return (
    <div className="pos">
      <div className="pos-main">
        <div className="pos-tabs">
          <div className="seg-tabs">
            {CATS.map((c) => (
              <button key={c} className={"seg-tab" + (cat === c ? " is-on" : "")} onClick={() => setCat(c)}>{t(c)}</button>
            ))}
          </div>
          <div className="spacer" />
          <Btn kind="outline" icon="plus" onClick={() => setCustom(true)}>{t("Custom item")}</Btn>
        </div>

        <div className="pos-grid-wrap">
          {cat === "À la carte"
            ? <AlaCarte onAdd={add} />
            : tiles.length === 0
              ? <EmptyState icon="catalog" title={cat === "Saved" ? t("No saved items") : t("Nothing here")} sub={cat === "Saved" ? t("Custom items you save at the counter show up here.") : null} />
              : <div className="tile-grid">{tiles.map((it) => <Tile key={it.id} item={it} onClick={() => tapItem(it)} />)}</div>}
        </div>
      </div>

      <Ticket staff={staff} cart={cart} setCart={setCart} customer={customer} setCustomer={setCustomer}
        method={method} setMethod={setMethod} status={status} setStatus={setStatus} onCommit={commit}
        customers={customers} onAddCustomer={onAddCustomer} coupons={coupons} discount={discount} setDiscount={setDiscount} />

      {drink && <DrinkModal item={drink} onClose={() => setDrink(null)} onAdd={add} />}
      {custom && <CustomModal onClose={() => setCustom(false)} onAdd={add} onSave={onSaveItem} />}
    </div>
  );
}

Object.assign(window, { POSView, CustomModal });
