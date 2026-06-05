// data.jsx — catalog, staff, seed ledger, helpers. Exports to window.
(function () {
  const THB = (n) => "฿" + Math.round(n).toLocaleString("en-US");

  // ---- Staff (family + workers) -------------------------------------------
  const STAFF = [
    { id: "ying", name: "Ying", role: "Owner", color: "#1F7A4D" },
    { id: "x", name: "X", role: "Cafe", color: "#C2552F" },
    { id: "ohm", name: "Ohm", role: "Cafe", color: "#2563A8" },
    { id: "ton", name: "Ton", role: "Kitchen", color: "#7A3FB0" },
  ];

  // ---- Flavors & add-ons ---------------------------------------------------
  const FLAVORS = {
    "Protein Shake": ["Chocolate", "Vanilla", "Strawberry", "Cookies & Cream"],
    "Pre-Workout": ["Blue Razz", "Green Apple", "Fruit Punch", "Watermelon"],
    Smoothie: ["Mango", "Mixed Berry", "Banana", "Green Matcha", "Tropical"],
  };
  const ADDONS = [
    { id: "banana", name: "Banana", price: 15 },
    { id: "whey", name: "Extra Whey Scoop", price: 30 },
    { id: "pb", name: "Peanut Butter", price: 20 },
    { id: "oats", name: "Oats", price: 15 },
    { id: "honey", name: "Honey", price: 10 },
    { id: "chia", name: "Chia Seeds", price: 15 },
    { id: "almond", name: "Almond Milk", price: 20 },
    { id: "espresso", name: "Espresso Shot", price: 20 },
  ];

  // ---- Catalog -------------------------------------------------------------
  // kind: 'drink' (flavor + add-ons), 'food' (fixed), 'simple'; group: reporting category
  const CATALOG = [
    // Drinks
    { id: "d_protein", cat: "Drinks", group: "drink", name: "Protein Shake", price: 75, kind: "drink", glyph: "shake" },
    { id: "d_pre", cat: "Drinks", group: "drink", name: "Pre-Workout", price: 75, kind: "drink", glyph: "bolt" },
    { id: "d_smoothie", cat: "Drinks", group: "drink", name: "Smoothie", price: 90, kind: "drink", glyph: "cup" },
    { id: "d_coffee", cat: "Drinks", group: "drink", name: "Iced Americano", price: 60, kind: "drink", glyph: "coffee" },
    { id: "d_water", cat: "Drinks", group: "drink", name: "Water", price: 20, kind: "simple", glyph: "drop" },
    { id: "d_electro", cat: "Drinks", group: "drink", name: "Electrolyte", price: 45, kind: "drink", glyph: "drop" },

    // Food (kitchen menu — meals)
    { id: "f_chicken", cat: "Food", group: "food", name: "Chicken Rice Bowl", price: 120, kind: "food", glyph: "bowl" },
    { id: "f_padkrapao", cat: "Food", group: "food", name: "Pad Kra Pao", price: 110, kind: "food", glyph: "bowl" },
    { id: "f_steak", cat: "Food", group: "food", name: "Beef Steak & Veg", price: 180, kind: "food", glyph: "plate" },
    { id: "f_tuna", cat: "Food", group: "food", name: "Tuna Salad", price: 130, kind: "food", glyph: "salad" },
    { id: "f_pancake", cat: "Food", group: "food", name: "Protein Pancakes", price: 95, kind: "food", glyph: "stack" },
    { id: "f_omelette", cat: "Food", group: "food", name: "Egg White Omelette", price: 90, kind: "food", glyph: "egg" },

    // Snacks (grab-and-go on the gym floor)
    { id: "s_bar", cat: "Snacks", group: "snack", name: "Protein Bar", price: 65, kind: "simple", glyph: "stack" },
    { id: "s_nuts", cat: "Snacks", group: "snack", name: "Mixed Nuts", price: 55, kind: "simple", glyph: "dot" },
    { id: "s_yogurt", cat: "Snacks", group: "snack", name: "Greek Yogurt", price: 70, kind: "simple", glyph: "cup" },
    { id: "s_ricecake", cat: "Snacks", group: "snack", name: "Rice Cakes", price: 40, kind: "simple", glyph: "plate" },
    { id: "s_eggs", cat: "Snacks", group: "snack", name: "Boiled Eggs ×2", price: 30, kind: "simple", glyph: "egg" },
    { id: "s_banana", cat: "Snacks", group: "snack", name: "Banana", price: 20, kind: "simple", glyph: "dot" },
  ];

  // À la carte components (priced per unit; build a custom plate)
  const COMPONENTS = [
    { id: "c_chicken", name: "Grilled Chicken Breast", price: 35, unit: "100g", group: "Protein" },
    { id: "c_beef", name: "Lean Beef", price: 55, unit: "100g", group: "Protein" },
    { id: "c_fish", name: "White Fish", price: 45, unit: "100g", group: "Protein" },
    { id: "c_egg", name: "Egg", price: 10, unit: "each", group: "Protein" },
    { id: "c_eggwhite", name: "Egg White", price: 8, unit: "each", group: "Protein" },
    { id: "c_rice", name: "Jasmine Rice", price: 15, unit: "100g", group: "Carbs" },
    { id: "c_brown", name: "Brown Rice", price: 18, unit: "100g", group: "Carbs" },
    { id: "c_sweet", name: "Sweet Potato", price: 20, unit: "100g", group: "Carbs" },
    { id: "c_oats", name: "Oats", price: 15, unit: "100g", group: "Carbs" },
    { id: "c_veg", name: "Steamed Veg", price: 25, unit: "portion", group: "Extras" },
    { id: "c_avo", name: "Avocado", price: 35, unit: "half", group: "Extras" },
    { id: "c_salad", name: "Side Salad", price: 25, unit: "portion", group: "Extras" },
  ];

  const CATS = ["Drinks", "Food", "Snacks", "À la carte", "Saved"];
  const GROUPS = [{ id: "drink", label: "Drinks" }, { id: "food", label: "Food" }, { id: "snack", label: "Snacks" }];

  // ---- Seed ledger (today) -------------------------------------------------
  // line item shape: { name, qty, price, note }
  let _id = 1000;
  const uid = () => "L" + ++_id;
  function entry(t, staff, customer, items, method, status) {
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    return { id: uid(), time: t, staff, customer, items, total, method, status };
  }
  const SEED = [
    entry("08:12", "x", "Khun Som", [{ name: "Protein Shake · Chocolate", qty: 1, price: 75, group: "drink" }, { name: "+ Banana", qty: 1, price: 15, group: "drink" }], "qr", "paid"),
    entry("08:31", "x", "Walk-in", [{ name: "Iced Americano", qty: 2, price: 60, group: "drink" }], "cash", "paid"),
    entry("08:47", "ohm", "Coach Peter", [{ name: "Pre-Workout · Blue Razz", qty: 1, price: 75, group: "drink" }], "cash", "paid"),
    entry("09:05", "ohm", "Jane & David", [{ name: "Smoothie · Mango", qty: 1, price: 90, group: "drink" }, { name: "+ Extra Whey Scoop", qty: 1, price: 30, group: "drink" }, { name: "Smoothie · Green Matcha", qty: 1, price: 90, group: "drink" }], "qr", "open"),
    entry("09:22", "x", "Walk-in", [{ name: "À la carte plate", qty: 1, price: 110, group: "food", note: "Chicken 200g · Rice 200g · Egg ×2" }], "cash", "paid"),
    entry("09:40", "ying", "Khun Ploy", [{ name: "Tuna Salad", qty: 1, price: 130, group: "food" }, { name: "Electrolyte", qty: 1, price: 45, group: "drink" }], "qr", "paid"),
    entry("10:03", "ohm", "Member #214", [{ name: "Pad Kra Pao", qty: 1, price: 110, group: "food" }, { name: "Egg White Omelette", qty: 1, price: 90, group: "food" }], "cash", "open"),
    entry("10:18", "ying", "Walk-in", [{ name: "Protein Bar", qty: 2, price: 65, group: "snack" }, { name: "Banana", qty: 1, price: 20, group: "snack" }], "cash", "paid"),
    entry("10:35", "x", "Khun Aon", [{ name: "Protein Shake · Vanilla", qty: 1, price: 75, group: "drink" }, { name: "+ Peanut Butter", qty: 1, price: 20, group: "drink" }, { name: "+ Oats", qty: 1, price: 15, group: "drink" }], "qr", "paid"),
    entry("10:52", "ton", "Coach Mint", [{ name: "Beef Steak & Veg", qty: 1, price: 180, group: "food" }], "qr", "paid"),
    entry("11:10", "ohm", "Big & Fai", [{ name: "Smoothie · Tropical", qty: 1, price: 90, group: "drink" }, { name: "Chicken Rice Bowl", qty: 1, price: 120, group: "food" }], "cash", "open"),
    entry("11:28", "ying", "Walk-in", [{ name: "Greek Yogurt", qty: 1, price: 70, group: "snack" }, { name: "Mixed Nuts", qty: 1, price: 55, group: "snack" }], "qr", "paid"),
  ];

  // ---- Saved customers (loyal crew) ---------------------------------------
  // spend = this month (฿); split = [drink, food, snack] %; top = favourites
  const CUSTOMERS = [
    { id: "cu_som", name: "Khun Som", tag: "Member", color: "#1F7A4D", visits: 18, spend: 1620, split: [70, 20, 10], top: [{ name: "Protein Shake", n: 12 }, { name: "Banana", n: 6 }] },
    { id: "cu_peter", name: "Coach Peter", tag: "Coach", color: "#C2552F", visits: 22, spend: 1980, split: [80, 15, 5], top: [{ name: "Pre-Workout", n: 18 }, { name: "Iced Americano", n: 7 }] },
    { id: "cu_jd", name: "Jane & David", tag: "Members", color: "#2563A8", visits: 12, spend: 2280, split: [55, 35, 10], top: [{ name: "Smoothie", n: 14 }, { name: "Tuna Salad", n: 5 }] },
    { id: "cu_ploy", name: "Khun Ploy", tag: "Member", color: "#7A3FB0", visits: 15, spend: 1875, split: [35, 55, 10], top: [{ name: "Tuna Salad", n: 8 }, { name: "Electrolyte", n: 9 }] },
    { id: "cu_aon", name: "Khun Aon", tag: "Member", color: "#B0833F", visits: 20, spend: 1700, split: [75, 10, 15], top: [{ name: "Protein Shake", n: 16 }, { name: "Protein Bar", n: 5 }] },
    { id: "cu_mint", name: "Coach Mint", tag: "Coach", color: "#1F7A4D", visits: 16, spend: 2560, split: [25, 70, 5], top: [{ name: "Beef Steak & Veg", n: 11 }, { name: "Chicken Rice Bowl", n: 6 }] },
    { id: "cu_bigfai", name: "Big & Fai", tag: "Members", color: "#C2552F", visits: 10, spend: 1900, split: [45, 50, 5], top: [{ name: "Chicken Rice Bowl", n: 8 }, { name: "Smoothie", n: 6 }] },
    { id: "cu_nan", name: "Khun Nan", tag: "Member", color: "#2563A8", visits: 14, spend: 1120, split: [85, 5, 10], top: [{ name: "Iced Americano", n: 12 }, { name: "Water", n: 8 }] },
    { id: "cu_chai", name: "Pi Chai", tag: "Regular", color: "#7A3FB0", visits: 24, spend: 2640, split: [30, 60, 10], top: [{ name: "Pad Kra Pao", n: 15 }, { name: "Greek Yogurt", n: 7 }] },
    { id: "cu_jo", name: "Khun Jo", tag: "Member", color: "#B0833F", visits: 9, spend: 810, split: [40, 25, 35], top: [{ name: "Greek Yogurt", n: 6 }, { name: "Mixed Nuts", n: 5 }] },
  ];

  window.CafeData = { THB, STAFF, FLAVORS, ADDONS, CATALOG, COMPONENTS, CATS, GROUPS, CUSTOMERS, SEED, uid };
})();
