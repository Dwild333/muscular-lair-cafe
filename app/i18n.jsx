// i18n.jsx — language layer. t(en) returns Thai when lang='th', else the English source.
// Missing keys fall back to English on purpose (dev stays readable).
(function () {
  const TH = {
    // chrome / nav
    "Café counter": "เคาน์เตอร์คาเฟ่",
    "Register": "หน้าขาย", "Ledger": "สมุดบัญชี", "Open tabs": "บิลค้างจ่าย",
    "Customers": "ลูกค้า", "Summary": "สรุปยอด", "Catalog": "รายการสินค้า", "Settings": "ตั้งค่า",
    // staff
    "Who's on the counter?": "ใครอยู่หน้าเคาน์เตอร์?",
    "Tap your name. Every line you log gets stamped with it — so the family always knows who took what.":
      "แตะชื่อของคุณ ทุกรายการที่บันทึกจะติดชื่อไว้ เพื่อให้ทุกคนในร้านรู้ว่าใครเป็นคนรับ",
    "Owner": "เจ้าของ", "Cafe": "คาเฟ่", "Kitchen": "ครัว",
    "Logged by": "บันทึกโดย",
    // POS categories
    "Drinks": "เครื่องดื่ม", "Food": "อาหาร", "Snacks": "ของว่าง",
    "À la carte": "จัดจานเอง", "Saved": "บันทึกไว้", "Add-ons": "รายการเสริม",
    "Custom item": "รายการกำหนดเอง", "New catalog item": "เพิ่มสินค้าใหม่", "New item": "เพิ่มสินค้า",
    // drink modal
    "Flavor": "รสชาติ", "tap to include": "แตะเพื่อเลือก", "Line total": "รวมรายการ",
    "Add to ticket": "เพิ่มลงบิล", "Add to catalog": "เพิ่มลงสินค้า", "Save to catalog": "บันทึกลงรายการสินค้า",
    "Item name": "ชื่อรายการ", "Price (฿)": "ราคา (฿)", "Category": "หมวดหมู่",
    "· where it lives + reports": "· หมวดที่จะแสดง + รายงาน", "· for sales reports": "· สำหรับรายงานยอดขาย",
    "Use this for anything not on the menu. Turn on Save to catalog to reuse it later, or leave off for a one-off.":
      "ใช้สำหรับสิ่งที่ไม่มีในเมนู เปิด \"บันทึกลงรายการสินค้า\" เพื่อใช้ซ้ำภายหลัง หรือปิดไว้สำหรับครั้งเดียว",
    "Saved items appear under this category at the counter and in reports — perfect for packaged snacks from your local distributors.":
      "สินค้าที่บันทึกจะแสดงในหมวดนี้ที่หน้าเคาน์เตอร์และในรายงาน — เหมาะสำหรับของว่างแพ็กเกจจากผู้จัดจำหน่ายในพื้นที่",
    // à la carte
    "Protein": "โปรตีน", "Carbs": "คาร์บ", "Extras": "เพิ่มเติม",
    "Tap components to build a plate": "แตะวัตถุดิบเพื่อจัดจาน",
    "Add plate to ticket": "เพิ่มจานลงบิล",
    "items": "รายการ", "item": "รายการ", "per": "ต่อ",
    "each": "ชิ้น", "portion": "ที่", "half": "ครึ่ง",
    "customise": "ปรับแต่ง", "customisable": "ปรับแต่งได้", "added": "เพิ่มเอง",
    // ticket
    "Customer name (optional)": "ชื่อลูกค้า (ไม่บังคับ)",
    "Empty ticket": "บิลว่าง", "Tap items on the left to start an order.": "แตะรายการทางซ้ายเพื่อเริ่มออเดอร์",
    "Payment": "การชำระเงิน", "Cash": "เงินสด", "QR Transfer": "โอน QR", "QR transfer": "โอน QR", "QR": "QR",
    "Status": "สถานะ", "Paid": "จ่ายแล้ว", "Open tab": "ค้างจ่าย", "Open": "ค้าง", "Total": "รวม",
    "Save open tab": "บันทึกบิลค้าง", "Save & take cash": "บันทึก & รับเงินสด", "Save & confirm QR": "บันทึก & ยืนยัน QR",
    "Walk-in": "ลูกค้าทั่วไป",
    // ledger
    "Today's ledger": "บันทึกวันนี้", "entries": "รายการ", "entry": "รายการ",
    "Search customer or item": "ค้นหาลูกค้าหรือสินค้า",
    "Gross": "ยอดรวม", "Gross sales": "ยอดขายรวม", "Open tabs ": "บิลค้างจ่าย",
    "All": "ทั้งหมด", "Everyone": "ทุกคน",
    "Time": "เวลา", "By": "โดย", "Customer": "ลูกค้า", "Items": "รายการ", "Pay": "ชำระ",
    "No matching entries": "ไม่พบรายการ",
    "Settle this tab": "เคลียร์บิลนี้", "Reopen as tab": "เปิดเป็นบิลค้างใหม่",
    // open tabs
    "unpaid": "ค้างจ่าย", "outstanding": "ยอดค้าง",
    "No open tabs": "ไม่มีบิลค้างจ่าย", "Everything's settled. Nice.": "เคลียร์หมดแล้ว เยี่ยม!",
    "Settle": "เคลียร์บิล",
    // reports
    "Summary & export": "สรุปยอด & ส่งออก", "Summary &": "สรุปยอด &",
    "Day": "วัน", "Week": "สัปดาห์", "Month": "เดือน", "Year": "ปี", "Export": "ส่งออก",
    "Transactions": "จำนวนบิล", "Avg ticket": "เฉลี่ย/บิล", "Items sold": "ขายได้ (ชิ้น)",
    "Sales by category": "ยอดขายตามหมวด", "tap to filter": "แตะเพื่อกรอง",
    "Payment split": "สัดส่วนการชำระ", "By staff": "ตามพนักงาน", "Top items": "ขายดี",
    "sold": "ขายได้", "No sales in range.": "ไม่มียอดขายในช่วงนี้",
    "Sales by hour": "ยอดขายรายชั่วโมง", "Gross by day": "ยอดรวมรายวัน",
    "Daily gross · June": "ยอดรวมรายวัน · มิถุนายน", "Monthly gross · 2026": "ยอดรวมรายเดือน · 2026",
    "Thursday · 5 June 2026": "พฤหัสบดี · 5 มิ.ย. 2026",
    "Week of 1–7 June 2026": "สัปดาห์ 1–7 มิ.ย. 2026",
    "June 2026 · month to date": "มิถุนายน 2026 · ถึงปัจจุบัน",
    "2026 · year to date": "2026 · ถึงปัจจุบัน",
    "Every entry feeds these totals automatically — no more retyping the notebook into Excel. Tap Export for the spreadsheet Ying needs.":
      "ทุกรายการรวมยอดให้อัตโนมัติ — ไม่ต้องพิมพ์สมุดลง Excel อีก แตะ \"ส่งออก\" เพื่อได้ไฟล์ที่หยิงต้องการ",
    // catalog
    "Tap a price to edit · changes apply instantly at the counter":
      "แตะที่ราคาเพื่อแก้ไข · เปลี่ยนแล้วใช้ได้ทันทีที่หน้าเคาน์เตอร์",
    "Drink add-ons": "ท็อปปิ้งเครื่องดื่ม", "Flavors": "รสชาติ",
    "Add a packaged snack": "เพิ่มของว่างแพ็กเกจ",
    "No saved items": "ยังไม่มีสินค้าที่บันทึก",
    "Custom items you save at the counter show up here.": "สินค้าที่คุณบันทึกหน้าเคาน์เตอร์จะแสดงที่นี่",
    "Nothing here": "ยังไม่มีรายการ",
    // customers
    "saved": "รายชื่อ", "this month": "เดือนนี้", "this week": "สัปดาห์นี้",
    "Search name": "ค้นหาชื่อ", "Add": "เพิ่ม", "visits": "ครั้ง", "Usual": "ประจำ", "Usual · ": "ประจำ · ",
    "Member": "สมาชิก", "Members": "สมาชิก", "Coach": "โค้ช", "Regular": "ขาประจำ",
    "This month": "เดือนนี้", "This week": "สัปดาห์นี้", "Visits / mo": "ครั้ง/เดือน", "Avg / visit": "เฉลี่ย/ครั้ง",
    "Spend by category": "ใช้จ่ายตามหมวด", "Usual order": "ออเดอร์ประจำ",
    "Save a customer": "บันทึกลูกค้า", "Name": "ชื่อ", "Type": "ประเภท", "Save customer": "บันทึกลูกค้า",
    "Saved customers pop up as you type their name at the counter — and their weekly & monthly spend builds up here automatically.":
      "ลูกค้าที่บันทึกจะแสดงขึ้นเมื่อพิมพ์ชื่อหน้าเคาน์เตอร์ — และยอดใช้จ่ายรายสัปดาห์/เดือนจะสะสมที่นี่อัตโนมัติ",
    "Add as a new customer": "เพิ่มเป็นลูกค้าใหม่",
    "Flavor options (optional)": "ตัวเลือกรสชาติ (ไม่บังคับ)",
    "Add a flavor, then Enter": "พิมพ์รสชาติแล้วกด Enter",
    "With flavor options, this becomes a tap-to-customise item at the register.": "เมื่อมีตัวเลือกรสชาติ รายการนี้จะกลายเป็นแบบปรับแต่งได้ที่หน้าขาย",
    "Leave as one-off": "ใช้ครั้งเดียว",
    // settings
    "Language": "ภาษา", "Appearance": "ลักษณะที่แสดง",
    "Switch the whole app between English and Thai. Item names and labels translate instantly.":
      "สลับทั้งแอประหว่างภาษาอังกฤษและไทย ชื่อรายการและป้ายต่าง ๆ จะแปลทันที",
    "This is a working prototype — data resets when you reload.":
      "นี่เป็นต้นแบบที่ใช้งานได้จริง — ข้อมูลจะรีเซ็ตเมื่อโหลดหน้าใหม่",
    // toasts
    "Saved to catalog": "บันทึกลงสินค้าแล้ว", "Tab settled": "เคลียร์บิลแล้ว", "Updated": "อัปเดตแล้ว",
    "Open tab saved for ": "บันทึกบิลค้างให้ ", "Saved · ": "บันทึกแล้ว · ", "Saved customer · ": "บันทึกลูกค้า · ",
    "Exported ": "ส่งออก ", "today's ledger to CSV": "บันทึกวันนี้เป็น CSV",
    "this week to CSV": "สัปดาห์นี้เป็น CSV", "June to Excel (.xlsx)": "มิถุนายนเป็น Excel (.xlsx)",
    "2026 to Excel (.xlsx)": "ปี 2026 เป็น Excel (.xlsx)",
    // data — drinks
    "Protein Shake": "โปรตีนเชค", "Pre-Workout": "พรีเวิร์กเอาท์", "Smoothie": "สมูทตี้",
    "Iced Americano": "อเมริกาโน่เย็น", "Water": "น้ำเปล่า", "Electrolyte": "เกลือแร่",
    // data — food
    "Chicken Rice Bowl": "ข้าวหน้าไก่", "Pad Kra Pao": "กะเพรา", "Beef Steak & Veg": "สเต๊กเนื้อกับผัก",
    "Tuna Salad": "สลัดทูน่า", "Protein Pancakes": "แพนเค้กโปรตีน", "Egg White Omelette": "ไข่ขาวเจียว",
    "À la carte plate": "จานจัดเอง",
    // data — snacks
    "Protein Bar": "โปรตีนบาร์", "Mixed Nuts": "ถั่วรวม", "Greek Yogurt": "กรีกโยเกิร์ต",
    "Rice Cakes": "ข้าวพอง", "Boiled Eggs ×2": "ไข่ต้ม ×2", "Banana": "กล้วย",
    // data — add-ons
    "Extra Whey Scoop": "เวย์เพิ่ม 1 ช้อน", "Peanut Butter": "เนยถั่ว", "Oats": "ข้าวโอ๊ต",
    "Honey": "น้ำผึ้ง", "Chia Seeds": "เมล็ดเจีย", "Almond Milk": "นมอัลมอนด์", "Espresso Shot": "เอสเพรสโซช็อต",
    // data — flavors
    "Chocolate": "ช็อกโกแลต", "Vanilla": "วานิลลา", "Strawberry": "สตรอว์เบอร์รี", "Cookies & Cream": "คุกกี้แอนด์ครีม",
    "Blue Razz": "บลูราสป์", "Green Apple": "แอปเปิลเขียว", "Fruit Punch": "ฟรุตพันช์", "Watermelon": "แตงโม",
    "Mango": "มะม่วง", "Mixed Berry": "เบอร์รีรวม", "Green Matcha": "มัทฉะ", "Tropical": "ทรอปิคอล",
    // data — components
    "Grilled Chicken Breast": "อกไก่ย่าง", "Lean Beef": "เนื้อไม่ติดมัน", "White Fish": "ปลาเนื้อขาว",
    "Egg": "ไข่", "Egg White": "ไข่ขาว", "Jasmine Rice": "ข้าวหอมมะลิ", "Brown Rice": "ข้าวกล้อง",
    "Sweet Potato": "มันหวาน", "Steamed Veg": "ผักนึ่ง", "Avocado": "อะโวคาโด", "Side Salad": "สลัดเครื่องเคียง",
  };

  function t(s) {
    if (s == null) return s;
    return (window.__lang === "th" && TH[s] != null) ? TH[s] : s;
  }
  // translate a composed item name like "Smoothie · Mango" or "+ Banana"
  function tname(s) {
    if (s == null) return s;
    if (window.__lang !== "th") return s;
    if (TH[s] != null) return TH[s];
    if (s.startsWith("+ ")) return "+ " + t(s.slice(2));
    if (s.includes(" · ")) return s.split(" · ").map((p) => t(p)).join(" · ");
    return s;
  }
  window.__lang = window.__lang || "en";
  window.I18N = { t, tname };
  window.t = t; window.tname = tname;
})();
