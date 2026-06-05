// ui.jsx — shared atoms. Exports to window.
const { useState, useRef, useEffect } = React;

// ---- Icons (stroked line set) ---------------------------------------------
const ICON_PATHS = {
  pos: '<path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
  ledger: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 4v16M12 9h4M12 13h4"/>',
  tabs: '<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.2L6 20V5a1 1 0 0 1 1-1Z"/>',
  reports: '<path d="M5 19V5M5 19h15M9 15l3-4 3 2 4-6"/>',
  catalog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.7-1.3-2-3.4-2 .8a7.5 7.5 0 0 0-2.6-1.5L14 2h-4l-.5 2.6a7.5 7.5 0 0 0-2.6 1.5l-2-.8-2 3.4 1.7 1.3a7.6 7.6 0 0 0 0 3L2.9 14.8l2 3.4 2-.8a7.5 7.5 0 0 0 2.6 1.5L10 22h4l.5-2.6a7.5 7.5 0 0 0 2.6-1.5l2 .8 2-3.4-1.7-1.3Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5 10 17 19 7"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2M20 14v6M14 20h6M18 17h.01"/>',
  cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.4"/><path d="M6 9h.01M18 15h.01"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-3.2-3.2"/>',
  user: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.4a3 3 0 0 1 0 5.2M17.4 19a5.5 5.5 0 0 0-2.2-4.4"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z"/>',
  cal: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9.5h16M8 3v4M16 3v4"/>',
  globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.6 2.3 2.6 13.7 0 16M12 4c-2.6 2.3-2.6 13.7 0 16"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h7M15 17h5"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="13" cy="17" r="2"/>',
  trash: '<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="M14 6l4 4"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  download: '<path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  dot: '<circle cx="12" cy="12" r="3.2"/>',
  // catalog glyphs
  shake: '<path d="M8 8h8l-.7 11a2 2 0 0 1-2 1.9h-2.6a2 2 0 0 1-2-1.9L8 8Z"/><path d="M9 4h6l1 4H8l1-4Z"/>',
  bolt: '<path d="M13 3 5 13h5l-1 8 8-11h-5l1-7Z"/>',
  cup: '<path d="M7 8h10l-1 11a2 2 0 0 1-2 1.8h-4a2 2 0 0 1-2-1.8L7 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  coffee: '<path d="M5 9h12v4a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V9Z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v2M12 3v2"/>',
  drop: '<path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3Z"/>',
  bowl: '<path d="M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z"/><path d="M9 7c0-1.5 3-1.5 3 0M14 6c0-1.2 2-1.2 2 0"/>',
  plate: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  salad: '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M9 11c-1-3 2-4 3-2 1-2 4-1 3 2"/>',
  stack: '<ellipse cx="12" cy="7" rx="7" ry="2.6"/><path d="M5 7v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V7M5 11v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-4"/>',
  egg: '<path d="M12 3c3.5 0 6 5 6 9a6 6 0 0 1-12 0c0-4 2.5-9 6-9Z"/>',
};

function Icon({ name, size = 22, stroke = 2, style, className }) {
  const d = ICON_PATHS[name] || ICON_PATHS.dot;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} dangerouslySetInnerHTML={{ __html: d }} />
  );
}

function Money({ value, className, style }) {
  return <span className={"money " + (className || "")} style={style}>{window.CafeData.THB(value)}</span>;
}

function Avatar({ staff, size = 38, ring }) {
  if (!staff) return null;
  const initials = staff.name.slice(0, 2).toUpperCase();
  return (
    <span className="avatar" style={{
      width: size, height: size, background: staff.color,
      fontSize: size * 0.36, boxShadow: ring ? `0 0 0 3px var(--surface), 0 0 0 5px ${staff.color}` : "none",
    }}>{initials}</span>
  );
}

function Btn({ children, kind = "ghost", icon, onClick, disabled, style, full, size = "md" }) {
  return (
    <button className={`btn btn-${kind} btn-${size}`} onClick={onClick} disabled={disabled}
      style={{ width: full ? "100%" : undefined, ...style }}>
      {icon && <Icon name={icon} size={size === "lg" ? 22 : 18} />}
      {children && <span>{children}</span>}
    </button>
  );
}

function IconBtn({ name, onClick, label, active, size = 20, style }) {
  return (
    <button className={"iconbtn" + (active ? " is-active" : "")} onClick={onClick} aria-label={label} style={style}>
      <Icon name={name} size={size} />
    </button>
  );
}

function Stepper({ value, onChange, min = 0, step = 1, suffix }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - step))} aria-label="decrease"><Icon name="minus" size={16} /></button>
      <span className="stepper-val">{value}{suffix ? <em>{suffix}</em> : null}</span>
      <button onClick={() => onChange(value + step)} aria-label="increase"><Icon name="plus" size={16} /></button>
    </div>
  );
}

function Segmented({ options, value, onChange, full }) {
  return (
    <div className={"segmented" + (full ? " seg-full" : "")}>
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const lbl = typeof o === "string" ? o : o.label;
        const ic = typeof o === "object" ? o.icon : null;
        return (
          <button key={val} className={"seg" + (value === val ? " is-on" : "")} onClick={() => onChange(val)}>
            {ic && <Icon name={ic} size={17} />}{lbl}
          </button>
        );
      })}
    </div>
  );
}

function Pill({ children, tone = "neutral", soft, style }) {
  return <span className={`pill pill-${tone}` + (soft ? " pill-soft" : "")} style={style}>{children}</span>;
}

function Modal({ open, onClose, children, title, footer, wide }) {
  useEffect(() => {
    function esc(e) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className={"modal" + (wide ? " modal-wide" : "")} onClick={(e) => e.stopPropagation()}>
        {title && (
          <header className="modal-head">
            <h3>{title}</h3>
            <IconBtn name="x" onClick={onClose} label="close" />
          </header>
        )}
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="empty">
      <div className="empty-ic"><Icon name={icon} size={30} /></div>
      <h4>{title}</h4>
      {sub && <p>{sub}</p>}
    </div>
  );
}

Object.assign(window, { Icon, Money, Avatar, Btn, IconBtn, Stepper, Segmented, Pill, Modal, Field, EmptyState });
