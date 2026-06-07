// customers.jsx — saved customers + per-customer spend tracking. Exports CustomersView.
const { useState: useStateC } = React;
const tC = window.t;

const CG_LABEL = { drink: "Drinks", food: "Food", snack: "Snacks" };

function catAmounts(c, spend) {
  return { drink: Math.round(spend * c.split[0] / 100), food: Math.round(spend * c.split[1] / 100), snack: Math.round(spend * c.split[2] / 100) };
}

function SplitBar({ split }) {
  return (
    <span className="mini-split">
      <span className="cb-drink" style={{ width: split[0] + "%" }} />
      <span className="cb-food" style={{ width: split[1] + "%" }} />
      <span className="cb-snack" style={{ width: split[2] + "%" }} />
    </span>
  );
}

function CustomerModal({ cust, period, onClose, onUpdate, onDelete }) {
  const { THB } = window.CafeData;
  const [editing, setEditing] = useStateC(false);
  const [name, setName] = useStateC(cust.name);
  const [tag, setTag] = useStateC(cust.tag);
  const month = cust.spend;
  const week = Math.round(cust.spend / 4.3);
  const spend = period === "week" ? week : month;
  const amts = catAmounts(cust, spend);

  if (editing) {
    return (
      <Modal open onClose={onClose} title={tC("Edit customer")}
        footer={<><Btn kind="danger" icon="trash" onClick={() => { onDelete(cust.id); onClose(); }}>{tC("Delete")}</Btn><div className="spacer" /><Btn kind="ghost" onClick={() => setEditing(false)}>{tC("Cancel")}</Btn><Btn kind="primary" icon="check" disabled={!name.trim()} onClick={() => { onUpdate(cust.id, { name: name.trim(), tag }); onClose(); }}>{tC("Save customer")}</Btn></>}>
        <Field label={tC("Name")}><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <div className="field" style={{ marginTop: 14 }}>
          <span className="field-label">{tC("Type")}</span>
          <Segmented full value={tag} onChange={setTag} options={[{ value: "Member", label: tC("Member") }, { value: "Coach", label: tC("Coach") }, { value: "Regular", label: tC("Regular") }]} />
        </div>
      </Modal>
    );
  }
  return (
    <Modal open onClose={onClose} title={cust.name}
      footer={<><Pill tone="neutral">{tC(cust.tag)}</Pill><Btn kind="ghost" icon="edit" onClick={() => setEditing(true)}>{tC("Edit")}</Btn><div className="spacer" /><span className="modal-total">{period === "week" ? tC("This week") : tC("This month")} <b className="money">{THB(spend)}</b></span></>}>
      <div className="cm-kpis">
        <div className="cm-kpi"><span className="cm-lbl">{tC("This month")}</span><span className="cm-val money">{THB(month)}</span></div>
        <div className="cm-kpi"><span className="cm-lbl">{tC("This week")}</span><span className="cm-val money">{THB(week)}</span></div>
        <div className="cm-kpi"><span className="cm-lbl">{tC("Visits / mo")}</span><span className="cm-val">{cust.visits}</span></div>
        <div className="cm-kpi"><span className="cm-lbl">{tC("Avg / visit")}</span><span className="cm-val money">{THB(cust.visits ? Math.round(cust.spend / cust.visits) : 0)}</span></div>
      </div>
      <div className="cm-section">{tC("Spend by category")} <span className="card-hint">{period === "week" ? tC("this week") : tC("this month")}</span></div>
      <div className="cat-bars">
        {["drink", "food", "snack"].map((g, i) => (
          <div key={g} className="catbar-row static">
            <span className="cb-nm">{tC(CG_LABEL[g])}</span>
            <span className="cb-track"><span className={"cb-fill cb-" + g} style={{ width: cust.split[i] + "%" }} /></span>
            <span className="cb-amt money">{THB(amts[g])}</span>
          </div>
        ))}
      </div>
      {cust.top.length > 0 && <>
        <div className="cm-section">{tC("Usual order")}</div>
        <div className="cm-faves">
          {cust.top.map((tp) => (
            <div key={tp.name} className="cm-fave"><span>{window.tname(tp.name)}</span><span className="cm-fave-n">{tp.n}×<em>/mo</em></span></div>
          ))}
        </div>
      </>}
    </Modal>
  );
}

function AddCustomerModal({ onClose, onAdd }) {
  const [name, setName] = useStateC("");
  const [tag, setTag] = useStateC("Member");
  const colors = ["#1F7A4D", "#C2552F", "#2563A8", "#7A3FB0", "#B0833F"];
  return (
    <Modal open onClose={onClose} title={tC("Save a customer")}
      footer={<><div className="spacer" /><Btn kind="primary" icon="check" disabled={!name.trim()}
        onClick={() => { onAdd({ id: "cu" + Date.now(), name: name.trim(), tag, color: colors[Math.floor(Math.random() * colors.length)], visits: 0, spend: 0, split: [50, 40, 10], top: [] }); onClose(); }}>{tC("Save customer")}</Btn></>}>
      <Field label={tC("Name")}><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Khun Mali" /></Field>
      <div className="field" style={{ marginTop: 14 }}>
        <span className="field-label">{tC("Type")}</span>
        <Segmented full value={tag} onChange={setTag} options={[{ value: "Member", label: tC("Member") }, { value: "Coach", label: tC("Coach") }, { value: "Regular", label: tC("Regular") }]} />
      </div>
      <p className="form-note">{tC("Saved customers pop up as you type their name at the counter — and their weekly & monthly spend builds up here automatically.")}</p>
    </Modal>
  );
}

function CustomersView({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer }) {
  const { THB } = window.CafeData;
  const [q, setQ] = useStateC("");
  const [period, setPeriod] = useStateC("month");
  const [open, setOpen] = useStateC(null);
  const [adding, setAdding] = useStateC(false);

  const rows = customers.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase())).slice().sort((a, b) => b.spend - a.spend);
  const totalMonth = customers.reduce((s, c) => s + c.spend, 0);
  const scale = (v) => period === "week" ? Math.round(v / 4.3) : v;

  return (
    <div className="customers">
      <div className="view-head">
        <div><h2>{tC("Customers")}</h2><div className="sub">{customers.length} {tC("saved")} · <b className="money">{THB(scale(totalMonth))}</b> {period === "week" ? tC("this week") : tC("this month")}</div></div>
        <div className="spacer" />
        <Segmented value={period} onChange={setPeriod} options={[{ value: "week", label: tC("Week") }, { value: "month", label: tC("Month") }]} />
        <div className="search"><Icon name="search" size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tC("Search name")} /></div>
        <Btn kind="primary" icon="plus" onClick={() => setAdding(true)}>{tC("Add")}</Btn>
      </div>

      <div className="cust-grid">
        {rows.map((c) => {
          const spend = scale(c.spend);
          return (
            <button key={c.id} className="cust-card" onClick={() => setOpen(c)}>
              <div className="cc-head">
                <Avatar staff={{ name: c.name, color: c.color }} size={40} />
                <div className="cc-id">
                  <div className="cc-nm">{c.name}</div>
                  <div className="cc-tag"><Icon name="star" size={12} />{tC(c.tag)}</div>
                </div>
                <div className="cc-spend"><span className="cc-amt money">{THB(spend)}</span><span className="cc-per">{period === "week" ? "/wk" : "/mo"}</span></div>
              </div>
              <SplitBar split={c.split} />
              <div className="cc-foot">
                <span className="cc-meta"><Icon name="cal" size={14} />{scale(c.visits)} {tC("visits")}</span>
                {c.top[0] && <span className="cc-fave">{tC("Usual · ")}<b>{window.tname(c.top[0].name)}</b></span>}
              </div>
            </button>
          );
        })}
      </div>

      {open && <CustomerModal cust={open} period={period} onClose={() => setOpen(null)} onUpdate={onUpdateCustomer} onDelete={onDeleteCustomer} />}
      {adding && <AddCustomerModal onClose={() => setAdding(false)} onAdd={onAddCustomer} />}
    </div>
  );
}

Object.assign(window, { CustomersView });
