// pos.jsx — point-of-sale order builder + customization modals. Exports POSView.
const { useState: useStateP, useMemo: useMemoP } = React;
const t = window.t, tname = window.tname;

function lineUid() { return "li" + Math.random().toString(36).slice(2, 8); }

const GROUP_CAT = { drink: "Drinks", food: "Food", snack: "Snacks" };
const GROUP_GLYPH = { drink: "cup", food: "bowl", snack: "stack" };

// ---------- Drink customization (flavor + add-ons + qty) -------------------
function DrinkModal({ item, onClose, onAdd }) {
  const { FLAVORS, ADDONS, THB } = window.CafeData;
  const flavors = item.flavors || FLAVORS[item.name] || null;
  const [flavor, setFlavor] = useStateP(flavors ? flavors[0] : null);
  const [addons, setAddons] = useStateP({});
  const [qty, setQty] = useStateP(1);
  const toggle = (a) => setAddons((m) => ({ ...m, [a.id]: !m[a.id] }));
  const addOnList = ADDONS.filter((a) => addons[a.id]);
  const unit = item.price + addOnList.reduce((s, a) => s + a.price, 0);

  function commit() {
    const name = item.name + (flavor ? " · " + flavor : "");
    const note = addOnList.length ? addOnList.map((a) => "+ " + a.name).join("  ") : "";
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
      <div className="cust-block">
        <div className="cust-label">{t("Add-ons")} <span className="cust-hint">{t("tap to include")}</span></div>
        <div className="addon-grid">
          {ADDONS.map((a) => (
            <button key={a.id} className={"addon" + (addons[a.id] ? " is-on" : "")} onClick={() => toggle(a)}>
              <span className="addon-check"><Icon name="check" size={14} /></span>
              <span className="addon-nm">{t(a.name)}</span>
              <span className="addon-pr money">+{THB(a.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ---------- À la carte plate builder ---------------------------------------
function AlaCarte({ onAdd }) {
  const { COMPONENTS, THB } = window.CafeData;
  const [sel, setSel] = useStateP({});
  const groups = ["Protein", "Carbs", "Extras"];
  const setQ = (id, q) => setSel((m) => ({ ...m, [id]: Math.max(0, q) }));
  const chosen = COMPONENTS.filter((c) => sel[c.id] > 0);
  const total = chosen.reduce((s, c) => s + c.price * sel[c.id], 0);

  function addPlate() {
    if (!chosen.length) return;
    const note = chosen.map((c) => `${c.name}${sel[c.id] > 1 ? " ×" + sel[c.id] : ""}`).join(" · ");
    onAdd({ uid: lineUid(), name: "À la carte plate", note, price: total, qty: 1, base: "alacarte", group: "food" });
    setSel({});
  }

  return (
    <div className="alc">
      <div className="alc-cols">
        {groups.map((g) => (
          <div key={g} className="alc-col">
            <div className="alc-group">{t(g)}</div>
            {COMPONENTS.filter((c) => c.group === g).map((c) => {
              const q = sel[c.id] || 0;
              return (
                <div key={c.id} className={"alc-item" + (q > 0 ? " is-on" : "")}>
                  <div className="alc-item-main" onClick={() => setQ(c.id, q + 1)}>
                    <span className="alc-nm">{tname(c.name)}</span>
                    <span className="alc-meta"><span className="money">{THB(c.price)}</span> / {t(c.unit)}</span>
                  </div>
                  {q > 0
                    ? <Stepper value={q} onChange={(v) => setQ(c.id, v)} min={0} />
                    : <button className="alc-add" onClick={() => setQ(c.id, 1)}><Icon name="plus" size={16} /></button>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="alc-bar">
        <div className="alc-sum">
          {chosen.length ? <span className="alc-sumtext">{chosen.length} {t(chosen.length > 1 ? "items" : "item")} · <b className="money">{THB(total)}</b></span>
            : <span className="alc-sumtext muted">{t("Tap components to build a plate")}</span>}
        </div>
        <Btn kind="primary" icon="plus" disabled={!chosen.length} onClick={addPlate}>{t("Add plate to ticket")}</Btn>
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

// ---------- Ticket panel ---------------------------------------------------
function Ticket({ staff, cart, setCart, customer, setCustomer, method, setMethod, status, setStatus, onCommit, customers, onAddCustomer }) {
  const { THB } = window.CafeData;
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const setQty = (uid, q) => setCart((c) => q <= 0 ? c.filter((l) => l.uid !== uid) : c.map((l) => l.uid === uid ? { ...l, qty: q } : l));
  const remove = (uid) => setCart((c) => c.filter((l) => l.uid !== uid));

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
        <div className="total-row">
          <span>{t("Total")}</span>
          <b className="money total-amt">{THB(total)}</b>
        </div>
        <Btn kind="primary" size="lg" full icon="check" disabled={!cart.length}
          onClick={() => onCommit({ total })}>
          {status === "open" ? t("Save open tab") : (method === "cash" ? t("Save & take cash") : t("Save & confirm QR"))}
        </Btn>
      </div>
    </aside>
  );
}

// ---------- POS view -------------------------------------------------------
function POSView({ staff, onCommit, savedItems, onSaveItem, customers, catalog, onAddCustomer }) {
  const { CATS } = window.CafeData;
  const [cat, setCat] = useStateP("Drinks");
  const [cart, setCart] = useStateP([]);
  const [customer, setCustomer] = useStateP("");
  const [method, setMethod] = useStateP("cash");
  const [status, setStatus] = useStateP("paid");
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

  function commit({ total }) {
    const now = new Date();
    onCommit({
      id: window.CafeData.uid(), staff: staff.id,
      time: now.toTimeString().slice(0, 5),
      customer: customer.trim() || "Walk-in",
      items: cart.map((l) => ({ name: l.name, qty: l.qty, price: l.price, note: l.note, group: l.group })),
      total, method, status,
    });
    setCart([]); setCustomer(""); setMethod("cash"); setStatus("paid");
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
        customers={customers} onAddCustomer={onAddCustomer} />

      {drink && <DrinkModal item={drink} onClose={() => setDrink(null)} onAdd={add} />}
      {custom && <CustomModal onClose={() => setCustom(false)} onAdd={add} onSave={onSaveItem} />}
    </div>
  );
}

Object.assign(window, { POSView, CustomModal });
