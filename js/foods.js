// EmpowerFit Nutrition App - Australian Food Database
// Sources: Coles, Woolworths, Aldi, Costco Australia + whole foods
// Per 100g/100ml values: { protein, carbs, fat, fibre, sodium, calories }

const FOOD_DATABASE = {
  // ========== PROTEINS ==========
  "Chicken Breast (Raw)": { protein: 23.1, carbs: 0, fat: 1.5, fibre: 0, sodium: 74, calories: 109, category: "Protein", unit: "g" },
  "Chicken Thigh (Raw, Skinless)": { protein: 19.5, carbs: 0, fat: 5.2, fibre: 0, sodium: 85, calories: 130, category: "Protein", unit: "g" },
  "Chicken Mince (Coles)": { protein: 20.5, carbs: 0, fat: 6.8, fibre: 0, sodium: 90, calories: 145, category: "Protein", unit: "g" },
  "Beef Mince (Lean, Coles)": { protein: 21.4, carbs: 0, fat: 7.5, fibre: 0, sodium: 70, calories: 155, category: "Protein", unit: "g" },
  "Beef Mince (Regular, Woolworths)": { protein: 19.2, carbs: 0, fat: 12.0, fibre: 0, sodium: 75, calories: 188, category: "Protein", unit: "g" },
  "Beef Steak (Rump, Raw)": { protein: 22.0, carbs: 0, fat: 5.8, fibre: 0, sodium: 58, calories: 143, category: "Protein", unit: "g" },
  "Beef Steak (Sirloin, Raw)": { protein: 21.5, carbs: 0, fat: 8.0, fibre: 0, sodium: 55, calories: 159, category: "Protein", unit: "g" },
  "Salmon Fillet (Raw)": { protein: 20.4, carbs: 0, fat: 13.4, fibre: 0, sodium: 59, calories: 208, category: "Protein", unit: "g" },
  "Tuna in Springwater (Sirena)": { protein: 26.5, carbs: 0, fat: 0.8, fibre: 0, sodium: 320, calories: 115, category: "Protein", unit: "g" },
  "Tuna in Oil (John West)": { protein: 24.5, carbs: 0, fat: 6.2, fibre: 0, sodium: 350, calories: 158, category: "Protein", unit: "g" },
  "Eggs (Whole, Large)": { protein: 12.6, carbs: 0.7, fat: 9.9, fibre: 0, sodium: 124, calories: 147, category: "Protein", unit: "g" },
  "Egg Whites (Liquid, Coles)": { protein: 10.9, carbs: 0.7, fat: 0.2, fibre: 0, sodium: 166, calories: 50, category: "Protein", unit: "g" },
  "Turkey Mince (Coles)": { protein: 21.0, carbs: 0, fat: 4.5, fibre: 0, sodium: 80, calories: 124, category: "Protein", unit: "g" },
  "Lamb Mince (Woolworths)": { protein: 18.5, carbs: 0, fat: 15.0, fibre: 0, sodium: 80, calories: 211, category: "Protein", unit: "g" },
  "Pork Tenderloin (Raw)": { protein: 21.8, carbs: 0, fat: 2.7, fibre: 0, sodium: 63, calories: 112, category: "Protein", unit: "g" },
  "Prawns (Cooked, Peeled)": { protein: 22.8, carbs: 0, fat: 1.0, fibre: 0, sodium: 210, calories: 103, category: "Protein", unit: "g" },
  "Cottage Cheese (Bulla, Low Fat)": { protein: 12.5, carbs: 3.8, fat: 1.5, fibre: 0, sodium: 370, calories: 79, category: "Protein", unit: "g" },
  "Greek Yoghurt (Chobani, Plain)": { protein: 9.5, carbs: 4.1, fat: 0.5, fibre: 0, sodium: 45, calories: 59, category: "Protein", unit: "g" },
  "Greek Yoghurt (Farmers Union)": { protein: 7.8, carbs: 5.2, fat: 3.8, fibre: 0, sodium: 55, calories: 87, category: "Protein", unit: "g" },
  "Whey Protein (Bulk Nutrients WPC)": { protein: 74.0, carbs: 8.0, fat: 5.5, fibre: 0, sodium: 130, calories: 380, category: "Protein", unit: "g" },
  "Whey Isolate (Bulk Nutrients WPI)": { protein: 82.0, carbs: 4.0, fat: 2.0, fibre: 0, sodium: 110, calories: 362, category: "Protein", unit: "g" },
  "Casein Protein (Bulk Nutrients)": { protein: 77.0, carbs: 5.5, fat: 2.5, fibre: 0, sodium: 120, calories: 350, category: "Protein", unit: "g" },
  "Tofu (Firm)": { protein: 8.1, carbs: 1.5, fat: 4.2, fibre: 0.3, sodium: 7, calories: 76, category: "Protein", unit: "g" },
  "Edamame (Frozen, Woolworths)": { protein: 11.9, carbs: 7.6, fat: 5.2, fibre: 5.2, sodium: 15, calories: 121, category: "Protein", unit: "g" },
  "Chickpeas (Canned, Edgell)": { protein: 6.0, carbs: 16.5, fat: 1.5, fibre: 5.4, sodium: 290, calories: 103, category: "Protein", unit: "g" },

  // ========== CARBOHYDRATES ==========
  "White Rice (Raw)": { protein: 7.1, carbs: 78.9, fat: 0.6, fibre: 0.4, sodium: 1, calories: 350, category: "Carbs", unit: "g" },
  "Brown Rice (Raw)": { protein: 7.5, carbs: 73.0, fat: 2.7, fibre: 3.5, sodium: 4, calories: 357, category: "Carbs", unit: "g" },
  "Basmati Rice (SunRice)": { protein: 7.3, carbs: 78.0, fat: 0.5, fibre: 0.5, sodium: 2, calories: 349, category: "Carbs", unit: "g" },
  "Rolled Oats (Uncle Tobys)": { protein: 11.0, carbs: 58.7, fat: 7.5, fibre: 9.4, sodium: 4, calories: 361, category: "Carbs", unit: "g" },
  "Quick Oats (Woolworths)": { protein: 10.8, carbs: 59.5, fat: 7.2, fibre: 8.5, sodium: 5, calories: 359, category: "Carbs", unit: "g" },
  "Sweet Potato (Raw)": { protein: 1.6, carbs: 20.1, fat: 0.1, fibre: 3.0, sodium: 55, calories: 87, category: "Carbs", unit: "g" },
  "White Potato (Raw)": { protein: 2.0, carbs: 17.0, fat: 0.1, fibre: 1.8, sodium: 7, calories: 77, category: "Carbs", unit: "g" },
  "Pasta (Dry, San Remo)": { protein: 12.5, carbs: 70.2, fat: 1.5, fibre: 3.2, sodium: 3, calories: 348, category: "Carbs", unit: "g" },
  "Wholemeal Pasta (San Remo)": { protein: 13.5, carbs: 64.0, fat: 2.0, fibre: 7.5, sodium: 5, calories: 334, category: "Carbs", unit: "g" },
  "Sourdough Bread (Coles Bakery)": { protein: 8.5, carbs: 47.0, fat: 2.5, fibre: 2.8, sodium: 480, calories: 247, category: "Carbs", unit: "g" },
  "Wholegrain Bread (Tip Top 9 Grain)": { protein: 9.5, carbs: 40.0, fat: 4.2, fibre: 5.8, sodium: 390, calories: 240, category: "Carbs", unit: "g" },
  "White Bread (Tip Top Soft White)": { protein: 8.0, carbs: 47.5, fat: 3.5, fibre: 2.5, sodium: 450, calories: 258, category: "Carbs", unit: "g" },
  "Rice Cakes (Sunrice)": { protein: 7.5, carbs: 78.0, fat: 1.0, fibre: 1.5, sodium: 5, calories: 355, category: "Carbs", unit: "g" },
  "Banana (Raw)": { protein: 1.1, carbs: 22.8, fat: 0.3, fibre: 2.6, sodium: 1, calories: 90, category: "Carbs", unit: "g" },
  "Apple (Raw)": { protein: 0.3, carbs: 13.8, fat: 0.2, fibre: 2.4, sodium: 1, calories: 57, category: "Carbs", unit: "g" },
  "Blueberries (Fresh)": { protein: 0.7, carbs: 14.5, fat: 0.3, fibre: 2.4, sodium: 1, calories: 57, category: "Carbs", unit: "g" },
  "Strawberries (Fresh)": { protein: 0.8, carbs: 7.7, fat: 0.3, fibre: 2.0, sodium: 1, calories: 32, category: "Carbs", unit: "g" },
  "Mango (Raw)": { protein: 0.8, carbs: 17.0, fat: 0.4, fibre: 1.8, sodium: 2, calories: 70, category: "Carbs", unit: "g" },
  "Quinoa (Raw)": { protein: 14.1, carbs: 64.2, fat: 6.1, fibre: 7.0, sodium: 5, calories: 368, category: "Carbs", unit: "g" },
  "Lentils (Canned, Edgell)": { protein: 8.5, carbs: 18.0, fat: 0.5, fibre: 6.5, sodium: 240, calories: 112, category: "Carbs", unit: "g" },
  "Weet-Bix (Sanitarium)": { protein: 12.0, carbs: 63.0, fat: 1.5, fibre: 11.5, sodium: 270, calories: 315, category: "Carbs", unit: "g" },
  "Pita Bread (Mission)": { protein: 9.0, carbs: 51.0, fat: 2.5, fibre: 2.8, sodium: 420, calories: 265, category: "Carbs", unit: "g" },
  "Corn Thins (Real Foods)": { protein: 7.5, carbs: 76.0, fat: 1.5, fibre: 2.5, sodium: 5, calories: 352, category: "Carbs", unit: "g" },
  "Vita-Weat Crackers (Arnott's)": { protein: 10.5, carbs: 64.0, fat: 5.5, fibre: 8.5, sodium: 510, calories: 350, category: "Carbs", unit: "g" },

  // ========== FATS ==========
  "Avocado (Raw)": { protein: 2.0, carbs: 1.9, fat: 15.4, fibre: 6.7, sodium: 7, calories: 160, category: "Fats", unit: "g" },
  "Almonds (Raw)": { protein: 21.2, carbs: 5.6, fat: 53.5, fibre: 12.5, sodium: 1, calories: 589, category: "Fats", unit: "g" },
  "Cashews (Raw)": { protein: 15.3, carbs: 30.2, fat: 46.4, fibre: 3.3, sodium: 12, calories: 580, category: "Fats", unit: "g" },
  "Peanut Butter (Bega Natural)": { protein: 26.0, carbs: 13.0, fat: 52.0, fibre: 6.5, sodium: 8, calories: 614, category: "Fats", unit: "g" },
  "Almond Butter (Macro, Woolworths)": { protein: 20.0, carbs: 7.0, fat: 56.0, fibre: 10.0, sodium: 5, calories: 614, category: "Fats", unit: "g" },
  "Olive Oil (Extra Virgin)": { protein: 0, carbs: 0, fat: 100.0, fibre: 0, sodium: 0, calories: 884, category: "Fats", unit: "ml" },
  "Coconut Oil": { protein: 0, carbs: 0, fat: 100.0, fibre: 0, sodium: 0, calories: 862, category: "Fats", unit: "ml" },
  "Butter (Mainland)": { protein: 0.6, carbs: 0.5, fat: 81.0, fibre: 0, sodium: 630, calories: 740, category: "Fats", unit: "g" },
  "Walnuts (Raw)": { protein: 15.2, carbs: 13.7, fat: 65.2, fibre: 6.7, sodium: 2, calories: 654, category: "Fats", unit: "g" },
  "Chia Seeds": { protein: 17.0, carbs: 42.1, fat: 31.0, fibre: 34.4, sodium: 16, calories: 486, category: "Fats", unit: "g" },
  "Cheddar Cheese (Mainland)": { protein: 25.5, carbs: 0.1, fat: 33.5, fibre: 0, sodium: 620, calories: 404, category: "Fats", unit: "g" },
  "Mozzarella (Perfect Italiano)": { protein: 22.0, carbs: 0.5, fat: 22.0, fibre: 0, sodium: 450, calories: 292, category: "Fats", unit: "g" },
  "Full Cream Milk": { protein: 3.3, carbs: 4.8, fat: 3.8, fibre: 0, sodium: 44, calories: 63, category: "Fats", unit: "ml" },
  "Skim Milk": { protein: 3.5, carbs: 4.9, fat: 0.1, fibre: 0, sodium: 50, calories: 35, category: "Fats", unit: "ml" },
  "Almond Milk Unsweetened (Sanitarium)": { protein: 0.4, carbs: 0.5, fat: 1.1, fibre: 0.3, sodium: 65, calories: 13, category: "Fats", unit: "ml" },
  "Oat Milk (Inside Out, Woolworths)": { protein: 0.9, carbs: 6.5, fat: 1.5, fibre: 0.5, sodium: 80, calories: 44, category: "Fats", unit: "ml" },

  // ========== VEGETABLES ==========
  "Broccoli (Raw)": { protein: 2.8, carbs: 7.0, fat: 0.4, fibre: 2.6, sodium: 33, calories: 34, category: "Vegetables", unit: "g" },
  "Spinach (Raw)": { protein: 2.9, carbs: 3.6, fat: 0.4, fibre: 2.2, sodium: 79, calories: 23, category: "Vegetables", unit: "g" },
  "Baby Spinach (Coles)": { protein: 2.2, carbs: 1.6, fat: 0.3, fibre: 1.6, sodium: 65, calories: 17, category: "Vegetables", unit: "g" },
  "Kale (Raw)": { protein: 4.3, carbs: 8.8, fat: 1.5, fibre: 3.6, sodium: 53, calories: 50, category: "Vegetables", unit: "g" },
  "Capsicum Red (Raw)": { protein: 1.0, carbs: 6.0, fat: 0.3, fibre: 2.1, sodium: 4, calories: 31, category: "Vegetables", unit: "g" },
  "Zucchini (Raw)": { protein: 1.2, carbs: 3.1, fat: 0.3, fibre: 1.0, sodium: 8, calories: 17, category: "Vegetables", unit: "g" },
  "Cucumber (Raw)": { protein: 0.7, carbs: 3.6, fat: 0.1, fibre: 0.5, sodium: 2, calories: 16, category: "Vegetables", unit: "g" },
  "Tomato (Raw)": { protein: 0.9, carbs: 3.9, fat: 0.2, fibre: 1.2, sodium: 5, calories: 18, category: "Vegetables", unit: "g" },
  "Carrot (Raw)": { protein: 0.9, carbs: 9.6, fat: 0.2, fibre: 2.8, sodium: 69, calories: 41, category: "Vegetables", unit: "g" },
  "Mushrooms (Raw)": { protein: 2.5, carbs: 4.0, fat: 0.3, fibre: 1.0, sodium: 5, calories: 22, category: "Vegetables", unit: "g" },
  "Onion (Raw)": { protein: 1.1, carbs: 9.3, fat: 0.1, fibre: 1.7, sodium: 4, calories: 40, category: "Vegetables", unit: "g" },
  "Asparagus (Raw)": { protein: 2.2, carbs: 3.9, fat: 0.1, fibre: 2.1, sodium: 2, calories: 20, category: "Vegetables", unit: "g" },
  "Green Beans (Raw)": { protein: 1.8, carbs: 7.1, fat: 0.1, fibre: 3.4, sodium: 6, calories: 31, category: "Vegetables", unit: "g" },
  "Peas (Frozen, Birds Eye)": { protein: 5.4, carbs: 14.0, fat: 0.4, fibre: 5.1, sodium: 3, calories: 81, category: "Vegetables", unit: "g" },
  "Broccolini (Raw)": { protein: 3.6, carbs: 5.3, fat: 0.5, fibre: 2.8, sodium: 30, calories: 35, category: "Vegetables", unit: "g" },
  "Mixed Salad Leaves (Woolworths)": { protein: 1.5, carbs: 2.0, fat: 0.3, fibre: 1.5, sodium: 30, calories: 15, category: "Vegetables", unit: "g" },

  // ========== SUPPLEMENTS ==========
  "BCAAs / Amino Acids (Powder)": { protein: 78.0, carbs: 3.0, fat: 0, fibre: 0, sodium: 50, calories: 324, category: "Supplements", unit: "g" },
  "Creatine Monohydrate": { protein: 0, carbs: 0, fat: 0, fibre: 0, sodium: 0, calories: 0, category: "Supplements", unit: "g" },
  "Pre-Workout (Generic, per 10g serve)": { protein: 5.0, carbs: 20.0, fat: 0, fibre: 0, sodium: 200, calories: 100, category: "Supplements", unit: "g" },
  "Mass Gainer (Bulk Nutrients)": { protein: 28.0, carbs: 52.0, fat: 5.0, fibre: 3.0, sodium: 150, calories: 365, category: "Supplements", unit: "g" },
  "Collagen Powder": { protein: 90.0, carbs: 0, fat: 0, fibre: 0, sodium: 150, calories: 360, category: "Supplements", unit: "g" },
  "Electrolyte Powder (Hydralyte)": { protein: 0, carbs: 7.0, fat: 0, fibre: 0, sodium: 400, calories: 28, category: "Supplements", unit: "g" },

  // ========== CONDIMENTS & EXTRAS ==========
  "Tomato Sauce (Heinz)": { protein: 1.5, carbs: 24.0, fat: 0.1, fibre: 1.0, sodium: 960, calories: 105, category: "Extras", unit: "g" },
  "Soy Sauce Low Salt (Kikkoman)": { protein: 8.1, carbs: 7.9, fat: 0.1, fibre: 0.2, sodium: 5720, calories: 60, category: "Extras", unit: "ml" },
  "Honey (Capilano)": { protein: 0.3, carbs: 82.0, fat: 0, fibre: 0.2, sodium: 4, calories: 304, category: "Extras", unit: "g" },
  "BBQ Sauce (Masterfoods)": { protein: 1.5, carbs: 36.0, fat: 0.2, fibre: 0.5, sodium: 910, calories: 155, category: "Extras", unit: "g" },
  "Mayonnaise Light (Hellmans)": { protein: 0.8, carbs: 7.5, fat: 18.5, fibre: 0, sodium: 480, calories: 202, category: "Extras", unit: "g" },
  "Protein Bar (Quest, avg)": { protein: 20.0, carbs: 25.0, fat: 9.0, fibre: 14.0, sodium: 260, calories: 200, category: "Extras", unit: "g" },
  "Dark Chocolate 85% (Lindt)": { protein: 9.0, carbs: 20.0, fat: 48.0, fibre: 11.0, sodium: 10, calories: 560, category: "Extras", unit: "g" },
  "Salsa (Old El Paso)": { protein: 1.2, carbs: 6.5, fat: 0.2, fibre: 1.0, sodium: 580, calories: 32, category: "Extras", unit: "g" },
  "Hot Sauce (Tabasco)": { protein: 0.5, carbs: 1.5, fat: 0.2, fibre: 0.3, sodium: 1200, calories: 12, category: "Extras", unit: "ml" }
};

const MEAL_SLOTS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "snack1", label: "Morning Snack" },
  { id: "lunch", label: "Lunch" },
  { id: "snack2", label: "Afternoon Snack" },
  { id: "dinner", label: "Dinner" },
  { id: "snack3", label: "Evening Snack / Shake" }
];

const GOALS = {
  "Fat Loss (Aggressive)": { adjustment: -500, description: "Aggressive calorie deficit for rapid fat loss" },
  "Fat Loss (Moderate)": { adjustment: -250, description: "Moderate deficit for sustainable fat loss" },
  "Maintenance": { adjustment: 0, description: "Match energy output to maintain current weight" },
  "Recomp": { adjustment: 0, description: "Simultaneous fat loss and muscle gain at maintenance" },
  "Lean Bulk": { adjustment: 200, description: "Minimal surplus to gain muscle with minimal fat" },
  "Muscle Gain (Moderate)": { adjustment: 350, description: "Moderate surplus for consistent muscle gain" },
  "Athletic Performance": { adjustment: 100, description: "Slight surplus to support high-performance training" },
  "Endurance": { adjustment: 0, description: "Maintenance with carb emphasis for endurance output" },
  "Enhanced Athlete": { adjustment: 500, description: "Aggressive surplus to support enhanced recovery and growth" }
};

// Mifflin-St Jeor equation — validated across diverse populations including Australians
// Reference: Frankenfield D et al. (2005) JADA; NHMRC Nutrient Reference Values for Australia and NZ
const ACTIVITY_MULTIPLIERS = {
  "Sedentary (desk job, no exercise)": 1.2,
  "Lightly Active (1-2 days/week)": 1.375,
  "Moderately Active (3-4 days/week)": 1.55,
  "Very Active (5-6 days/week, hard training)": 1.725,
  "Extremely Active (2x/day or physical job + training)": 1.9
};
