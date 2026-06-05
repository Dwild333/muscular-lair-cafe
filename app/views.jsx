// views.jsx — Ledger + Open Tabs. Exports LedgerView, TabsView.
const { useState: useStateV, useMemo: useMemoV } = React;
const tV = window.t, tnameV = window.tname;

function staffById(id) { return window.CafeData.STAFF.find((s) => s.id === id); }
function itemsSummary(items) {
  return items.map((it) => (it.qty > 1 ? it.qty + "× " : "") + tnameV(it.name)).join(", ");
}

// ---------- Entry detail modal ---------------------------------------------
function EntryModal({ entry, onClose, onUpdate }) {
  const { THB } = window.CafeData;
  const s = staffById(entry.staff);
  return (
    <Modal open onClose={onClose} title={tnameV(entry.customer)}
      footer={<>
        {entry.status === "open"
          ? <Btn kind="primary" icon="check" onClick={() => { onUpdate({ ...entry, status: "paid" }); onClose(); }}>{tV("Settle this tab")}</Btn>
          : <Btn kind="danger" icon="clock" onClick={() => { onUpdate({ ...entry, status: "open" }); onClose(); }}>{tV("Reopen as tab")}</Btn>}
        <div className="spacer" />
        <span className="modal-total">{tV("Total")} <b className="money">{THB(entry.total)}</b></span>
      </>}>
      <div className="entry-meta">
        <span className="em"><Icon name="clock" size={15} /> {entry.time}</span>
        <span className="em"><Avatar staff={s} size={20} /> {s.name}</span>
        <Pill tone={entry.method === "qr" ? "qr" : "cash"}><Icon name={entry.method === "qr" ? "qr" : "cash"} size={13} />{entry.method === "qr" ? tV("QR") : tV("Cash")}</Pill>
        <Pill tone={entry.status === "paid" ? "paid" : "open"}>{entry.status === "paid" ? tV("Paid") : tV("Open tab")}</Pill>
      </div>
      <div className="entry-lines">
        {entry.items.map((it, i) => (
          <div key={i} className="eline">
            <div className="eline-main">
              <span className="eline-nm">{it.qty > 1 ? <b>{it.qty}×</b> : null} {tnameV(it.name)}</span>
              {it.note && <span className="eline-note">{tnameV(it.note)}</span>}
            </div>
            <span className="money">{THB(it.price * it.qty)}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ---------- Ledger ----------------------------------------------------------
function LedgerView({ ledger, onUpdate }) {
  const { THB, STAFF } = window.CafeData;
  const [q, setQ] = useStateV("");
  const [staffF, setStaffF] = useStateV("all");
  const [statusF, setStatusF] = useStateV("all");
  const [open, setOpen] = useStateV(null);

  const rows = useMemoV(() => ledger.filter((e) => {
    if (staffF !== "all" && e.staff !== staffF) return false;
    if (statusF !== "all" && e.status !== statusF) return false;
    if (q && !(e.customer.toLowerCase().includes(q.toLowerCase()) || itemsSummary(e.items).toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }).slice().reverse(), [ledger, q, staffF, statusF]);

  const gross = rows.reduce((s, e) => s + e.total, 0);
  const cash = rows.filter((e) => e.method === "cash").reduce((s, e) => s + e.total, 0);
  const qr = rows.filter((e) => e.method === "qr").reduce((s, e) => s + e.total, 0);
  const openAmt = rows.filter((e) => e.status === "open").reduce((s, e) => s + e.total, 0);

  return (
    <div className="ledger">
      <div className="view-head">
        <div><h2>{tV("Today's ledger")}</h2><div className="sub">{tV("Thursday · 5 June 2026")} · {rows.length} {tV("entries")}</div></div>
        <div className="spacer" />
        <div className="search"><Icon name="search" size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tV("Search customer or item")} /></div>
      </div>

      <div className="stat-strip">
        <div className="stat"><span className="stat-lbl">{tV("Gross")}</span><span className="stat-val money">{THB(gross)}</span></div>
        <div className="stat"><span className="stat-lbl">{tV("Cash")}</span><span className="stat-val money">{THB(cash)}</span></div>
        <div className="stat"><span className="stat-lbl">{tV("QR transfer")}</span><span className="stat-val money">{THB(qr)}</span></div>
        <div className="stat stat-warn"><span className="stat-lbl">{tV("Open tabs")}</span><span className="stat-val money">{THB(openAmt)}</span></div>
      </div>

      <div className="filter-bar">
        <Segmented value={statusF} onChange={setStatusF} options={[{ value: "all", label: tV("All") }, { value: "paid", label: tV("Paid") }, { value: "open", label: tV("Open") }]} />
        <div className="staff-filter">
          <button className={"sf" + (staffF === "all" ? " is-on" : "")} onClick={() => setStaffF("all")}>{tV("Everyone")}</button>
          {STAFF.map((s) => (
            <button key={s.id} className={"sf" + (staffF === s.id ? " is-on" : "")} onClick={() => setStaffF(s.id)}>
              <Avatar staff={s} size={20} />{s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="table">
        <div className="thead">
          <span className="c-time">{tV("Time")}</span><span className="c-by">{tV("By")}</span><span className="c-cust">{tV("Customer")}</span>
          <span className="c-items">{tV("Items")}</span><span className="c-pay">{tV("Pay")}</span><span className="c-status">{tV("Status")}</span><span className="c-total">{tV("Total")}</span>
        </div>
        <div className="tbody">
          {rows.length === 0
            ? <EmptyState icon="ledger" title={tV("No matching entries")} />
            : rows.map((e) => {
              const s = staffById(e.staff);
              return (
                <button key={e.id} className="trow" onClick={() => setOpen(e)}>
                  <span className="c-time money">{e.time}</span>
                  <span className="c-by"><Avatar staff={s} size={26} /></span>
                  <span className="c-cust">{tnameV(e.customer)}</span>
                  <span className="c-items">{itemsSummary(e.items)}</span>
                  <span className="c-pay"><Pill tone={e.method === "qr" ? "qr" : "cash"}><Icon name={e.method === "qr" ? "qr" : "cash"} size={13} />{e.method === "qr" ? tV("QR") : tV("Cash")}</Pill></span>
                  <span className="c-status"><Pill tone={e.status === "paid" ? "paid" : "open"}>{e.status === "paid" ? tV("Paid") : tV("Open")}</Pill></span>
                  <span className="c-total money">{THB(e.total)}</span>
                </button>
              );
            })}
        </div>
      </div>

      {open && <EntryModal entry={open} onClose={() => setOpen(null)} onUpdate={onUpdate} />}
    </div>
  );
}

// ---------- Open Tabs -------------------------------------------------------
function TabsView({ ledger, onUpdate }) {
  const { THB } = window.CafeData;
  const tabs = ledger.filter((e) => e.status === "open").slice().reverse();
  const total = tabs.reduce((s, e) => s + e.total, 0);

  return (
    <div className="tabs-view">
      <div className="view-head">
        <div><h2>{tV("Open tabs")}</h2><div className="sub">{tabs.length} {tV("unpaid")} · <b className="money">{THB(total)}</b> {tV("outstanding")}</div></div>
      </div>
      {tabs.length === 0
        ? <EmptyState icon="tabs" title={tV("No open tabs")} sub={tV("Everything's settled. Nice.")} />
        : <div className="tab-cards">
          {tabs.map((e) => {
            const s = staffById(e.staff);
            return (
              <div key={e.id} className="tab-card">
                <div className="tc-head">
                  <div className="tc-cust">{tnameV(e.customer)}</div>
                  <Pill tone="open"><Icon name="clock" size={13} />{e.time}</Pill>
                </div>
                <div className="tc-items">
                  {e.items.map((it, i) => (
                    <div key={i} className="tc-line"><span>{it.qty > 1 ? it.qty + "× " : ""}{tnameV(it.name)}</span><span className="money">{THB(it.price * it.qty)}</span></div>
                  ))}
                </div>
                <div className="tc-foot">
                  <div className="tc-by"><Avatar staff={s} size={22} /><span>{s.name}</span></div>
                  <div className="spacer" />
                  <span className="tc-total money">{THB(e.total)}</span>
                </div>
                <div className="tc-actions">
                  <Btn kind="ghost" icon="cash" onClick={() => onUpdate({ ...e, status: "paid", method: "cash" })}>{tV("Cash")}</Btn>
                  <Btn kind="ghost" icon="qr" onClick={() => onUpdate({ ...e, status: "paid", method: "qr" })}>{tV("QR")}</Btn>
                  <Btn kind="primary" icon="check" onClick={() => onUpdate({ ...e, status: "paid" })}>{tV("Settle")}</Btn>
                </div>
              </div>
            );
          })}
        </div>}
    </div>
  );
}

Object.assign(window, { LedgerView, TabsView });
