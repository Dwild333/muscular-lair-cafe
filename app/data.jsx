// data.jsx — catalog, staff, seed ledger, helpers. Exports to window.
// Products & pricing transcribed from Muscular Café's in-store menu boards
// (Chiang Mai, TH · Tel 095 451 3904 · kitchen closed Sundays).
(function () {
  const THB = (n) => "฿" + Math.round(n).toLocaleString("en-US");

  // ---- Staff (family + workers) -------------------------------------------
  const STAFF = [
    { id: "ying", name: "Ying", role: "Owner", color: "#1F7A4D" },
    { id: "x", name: "X", role: "Cafe", color: "#C2552F" },
    { id: "ohm", name: "Ohm", role: "Cafe", color: "#2563A8" },
    { id: "ton", name: "Ton", role: "Kitchen", color: "#7A3FB0" },
  ];

  // ---- Flavors (signature drinks pick a flavor at the counter) -------------
  const FLAVORS = {
    // Amino Soda · Signature Menu · 0 calories · ฿75
    "Amino Soda": ["Lemon Lime", "Fruit Punch", "Glacial Grape", "Strawberry Kiwi", "Smash Apple", "Blue Raspberry"],
    // Muscular Smoothie · Signature Menu · iced · ฿85
    "Muscular Smoothie": ["Strawberry", "Mango", "Mixberry", "Kiwi"],
    // Milk & Tea · 16 oz · iced · ฿55
    "Milk & Tea": ["Green Tea", "Thai Tea", "Lemon Tea", "Cocoa", "Pink Milk", "Caramel Milk"],
  };
  // No à la carte drink add-ons on the printed menu.
  const ADDONS = [];

  // ---- Catalog -------------------------------------------------------------
  // kind: 'drink' (flavor and/or hot/iced variant), 'simple' (one-tap)
  // group: reporting category. variants: [{label, price}] for hot/iced sizing.
  const CATALOG = [
    // ---- Drinks ----
    { id: "d_amino", cat: "Drinks", group: "drink", name: "Amino Soda", price: 75, kind: "drink", glyph: "drop", note: "0 cal" },
    { id: "d_smoothie", cat: "Drinks", group: "drink", name: "Muscular Smoothie", price: 85, kind: "drink", glyph: "cup" },
    { id: "d_whey", cat: "Drinks", group: "drink", name: "Whey Protein", price: 70, kind: "simple", glyph: "shake" },
    { id: "d_pre", cat: "Drinks", group: "drink", name: "Pre-Workout", price: 75, kind: "simple", glyph: "bolt" },
    { id: "d_espresso", cat: "Drinks", group: "drink", name: "Espresso", price: 45, kind: "simple", glyph: "coffee", note: "Hot" },
    { id: "d_black", cat: "Drinks", group: "drink", name: "Black Coffee", price: 45, kind: "drink", glyph: "coffee", variants: [{ label: "Hot", price: 45 }, { label: "Iced", price: 55 }] },
    { id: "d_capp", cat: "Drinks", group: "drink", name: "Cappuccino", price: 50, kind: "drink", glyph: "coffee", variants: [{ label: "Hot", price: 50 }, { label: "Iced", price: 60 }] },
    { id: "d_latte", cat: "Drinks", group: "drink", name: "Latte", price: 50, kind: "drink", glyph: "coffee", variants: [{ label: "Hot", price: 50 }, { label: "Iced", price: 60 }] },
    { id: "d_mocha", cat: "Drinks", group: "drink", name: "Mocha", price: 50, kind: "drink", glyph: "coffee", variants: [{ label: "Hot", price: 50 }, { label: "Iced", price: 60 }] },
    { id: "d_caramelmac", cat: "Drinks", group: "drink", name: "Caramel Macchiato", price: 75, kind: "simple", glyph: "coffee", note: "Iced" },
    { id: "d_milktea", cat: "Drinks", group: "drink", name: "Milk & Tea", price: 55, kind: "drink", glyph: "cup" },

    // ---- Food (kitchen — fixed plates, rice & spaghetti, soups) ----
    { id: "f_rice", cat: "Food", group: "food", name: "Steamed Rice 150g", price: 15, kind: "simple", glyph: "bowl" },
    { id: "f_friedegg", cat: "Food", group: "food", name: "Fried Egg", price: 12, kind: "simple", glyph: "egg" },
    { id: "f_om_chicken", cat: "Food", group: "food", name: "Rice with Chicken Omelet", price: 59, kind: "simple", glyph: "egg" },
    { id: "f_om_pork", cat: "Food", group: "food", name: "Rice with Pork Omelet", price: 69, kind: "simple", glyph: "egg" },
    { id: "f_om_shrimp", cat: "Food", group: "food", name: "Rice with Shrimp Omelet", price: 89, kind: "simple", glyph: "egg" },
    { id: "f_spag_sauce", cat: "Food", group: "food", name: "Spaghetti Chicken with Sauce", price: 79, kind: "simple", glyph: "bowl" },
    { id: "f_spag_green", cat: "Food", group: "food", name: "Spaghetti Chicken Green Curry", price: 79, kind: "simple", glyph: "bowl" },
    { id: "f_spag_chili", cat: "Food", group: "food", name: "Spaghetti Shrimp Chili Paste", price: 99, kind: "simple", glyph: "bowl" },
    { id: "f_spag_drunken", cat: "Food", group: "food", name: "Drunken Spaghetti Shrimp", price: 99, kind: "simple", glyph: "bowl" },
    { id: "f_soup_sour", cat: "Food", group: "food", name: "Sour Curry Omelet & Shrimp", price: 119, kind: "simple", glyph: "bowl", note: "bowl" },
    { id: "f_soup_clear", cat: "Food", group: "food", name: "Clear Soup Tofu & Minced Pork", price: 89, kind: "simple", glyph: "bowl", note: "bowl" },

    // ---- Snacks: none on the printed menu yet.
    // Packaged snacks from distributors can be added from Catalog → Snacks.
  ];

  // ---- À la carte (stir-fry: pick a dish + protein + weight; rice 150g incl) -
  const ALC_DISHES = [
    { id: "alc_broccoli", name: "Stir Fried with Broccoli" },
    { id: "alc_egg", name: "Stir Fried with Egg" },
    { id: "alc_mushroom", name: "Mushrooms with Oyster Sauce" },
    { id: "alc_padcha", name: "Pad Cha (Thai Spicy)" },
    { id: "alc_green", name: "Stir Fried Green Curry" },
    { id: "alc_redcurry", name: "Stir Fried Red Curry Paste" },
    { id: "alc_chili", name: "Stir Fried Chili Paste" },
    { id: "alc_sweetpepper", name: "Stir Fried Sweet Pepper" },
    { id: "alc_ginger", name: "Stir Fried Ginger" },
    { id: "alc_curry", name: "Stir Fried Curry Powder" },
    { id: "alc_garlic", name: "Stir Fried Garlic & Pepper" },
    { id: "alc_larb", name: "Larb (Thai Spicy Salad)" },
    { id: "alc_friedrice", name: "Fried Rice" },
  ];
  const ALC_PROTEINS = [
    { id: "chicken", name: "Chicken", weights: [{ g: "100g", price: 69 }, { g: "200g", price: 89 }, { g: "300g", price: 99 }] },
    { id: "pork", name: "Pork", weights: [{ g: "100g", price: 79 }, { g: "200g", price: 119 }, { g: "300g", price: 159 }] },
    { id: "beef", name: "Beef", weights: [{ g: "100g", price: 89 }, { g: "200g", price: 139 }, { g: "300g", price: 189 }] },
    { id: "braised", name: "Braised Beef", weights: [{ g: "100g", price: 99 }] },
    { id: "shrimp", name: "Shrimp", weights: [{ g: "100g", price: 99 }, { g: "200g", price: 149 }, { g: "300g", price: 199 }] },
  ];

  const CATS = ["Drinks", "Food", "Snacks", "À la carte", "Saved"];
  const GROUPS = [{ id: "drink", label: "Drinks" }, { id: "food", label: "Food" }, { id: "snack", label: "Snacks" }];

  // ---- Seed ledger (today) -------------------------------------------------
  // line item shape: { name, qty, price, note?, group }
  let _id = 1000;
  const uid = () => "L" + ++_id;
  function entry(t, staff, customer, items, method, status) {
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    return { id: uid(), time: t, staff, customer, items, total, method, status };
  }
  const SEED = [
    entry("08:10", "x", "Khun Som", [{ name: "Amino Soda · Blue Raspberry", qty: 1, price: 75, group: "drink" }], "qr", "paid"),
    entry("08:25", "x", "Walk-in", [{ name: "Black Coffee · Iced", qty: 2, price: 55, group: "drink" }], "cash", "paid"),
    entry("08:42", "ohm", "Coach Peter", [{ name: "Pre-Workout", qty: 1, price: 75, group: "drink" }, { name: "Espresso", qty: 1, price: 45, group: "drink" }], "cash", "paid"),
    entry("09:05", "ohm", "Jane & David", [{ name: "Muscular Smoothie · Mango", qty: 1, price: 85, group: "drink" }, { name: "Muscular Smoothie · Strawberry", qty: 1, price: 85, group: "drink" }], "qr", "open"),
    entry("09:22", "x", "Walk-in", [{ name: "Stir Fried with Broccoli", qty: 1, price: 89, group: "food", note: "Chicken · 200g · Rice 150g" }], "cash", "paid"),
    entry("09:40", "ying", "Khun Ploy", [{ name: "Spaghetti Chicken Green Curry", qty: 1, price: 79, group: "food" }, { name: "Milk & Tea · Thai Tea", qty: 1, price: 55, group: "drink" }], "qr", "paid"),
    entry("10:03", "ohm", "Member #214", [{ name: "Stir Fried Garlic & Pepper", qty: 1, price: 139, group: "food", note: "Beef · 200g · Rice 150g" }, { name: "Fried Egg", qty: 1, price: 12, group: "food" }], "cash", "open"),
    entry("10:18", "ying", "Walk-in", [{ name: "Latte · Hot", qty: 1, price: 50, group: "drink" }], "cash", "paid"),
    entry("10:35", "x", "Khun Aon", [{ name: "Whey Protein", qty: 1, price: 70, group: "drink" }, { name: "Amino Soda · Lemon Lime", qty: 1, price: 75, group: "drink" }], "qr", "paid"),
    entry("10:52", "ton", "Coach Mint", [{ name: "Stir Fried Chili Paste", qty: 1, price: 199, group: "food", note: "Shrimp · 300g · Rice 150g" }], "qr", "paid"),
    entry("11:10", "ohm", "Big & Fai", [{ name: "Fried Rice", qty: 1, price: 89, group: "food", note: "Chicken · 200g" }, { name: "Cappuccino · Iced", qty: 1, price: 60, group: "drink" }], "cash", "open"),
    entry("11:28", "ying", "Walk-in", [{ name: "Rice with Pork Omelet", qty: 1, price: 69, group: "food" }, { name: "Milk & Tea · Cocoa", qty: 1, price: 55, group: "drink" }], "qr", "paid"),
  ];

  // ---- Saved customers (loyal crew) ---------------------------------------
  // spend = this month (฿); split = [drink, food, snack] %; top = favourites
  const CUSTOMERS = [
    { id: "cu_som", name: "Khun Som", tag: "Member", color: "#1F7A4D", visits: 18, spend: 1620, split: [80, 20, 0], top: [{ name: "Amino Soda", n: 12 }, { name: "Black Coffee", n: 6 }] },
    { id: "cu_peter", name: "Coach Peter", tag: "Coach", color: "#C2552F", visits: 22, spend: 1980, split: [85, 15, 0], top: [{ name: "Pre-Workout", n: 18 }, { name: "Espresso", n: 7 }] },
    { id: "cu_jd", name: "Jane & David", tag: "Members", color: "#2563A8", visits: 12, spend: 2280, split: [55, 45, 0], top: [{ name: "Muscular Smoothie", n: 14 }, { name: "Spaghetti Chicken with Sauce", n: 5 }] },
    { id: "cu_ploy", name: "Khun Ploy", tag: "Member", color: "#7A3FB0", visits: 15, spend: 1875, split: [40, 60, 0], top: [{ name: "Spaghetti Chicken Green Curry", n: 8 }, { name: "Milk & Tea", n: 9 }] },
    { id: "cu_aon", name: "Khun Aon", tag: "Member", color: "#B0833F", visits: 20, spend: 1700, split: [85, 15, 0], top: [{ name: "Whey Protein", n: 16 }, { name: "Amino Soda", n: 5 }] },
    { id: "cu_mint", name: "Coach Mint", tag: "Coach", color: "#1F7A4D", visits: 16, spend: 2560, split: [25, 75, 0], top: [{ name: "Stir Fried Chili Paste", n: 11 }, { name: "Fried Rice", n: 6 }] },
    { id: "cu_bigfai", name: "Big & Fai", tag: "Members", color: "#C2552F", visits: 10, spend: 1900, split: [45, 55, 0], top: [{ name: "Fried Rice", n: 8 }, { name: "Muscular Smoothie", n: 6 }] },
    { id: "cu_nan", name: "Khun Nan", tag: "Member", color: "#2563A8", visits: 14, spend: 1120, split: [90, 10, 0], top: [{ name: "Latte", n: 12 }, { name: "Amino Soda", n: 8 }] },
    { id: "cu_chai", name: "Pi Chai", tag: "Regular", color: "#7A3FB0", visits: 24, spend: 2640, split: [30, 70, 0], top: [{ name: "Stir Fried with Broccoli", n: 15 }, { name: "Rice with Pork Omelet", n: 7 }] },
    { id: "cu_jo", name: "Khun Jo", tag: "Member", color: "#B0833F", visits: 9, spend: 810, split: [70, 30, 0], top: [{ name: "Milk & Tea", n: 6 }, { name: "Cappuccino", n: 5 }] },
  ];

  window.CafeData = { THB, STAFF, FLAVORS, ADDONS, CATALOG, ALC_DISHES, ALC_PROTEINS, CATS, GROUPS, CUSTOMERS, SEED, uid };
})();
