// EmpowerFit Nutrition App - Main Application Logic

// ============================================================
// STATE
// ============================================================
let state = {
  client: { name: "", age: "", sex: "male", weight: "", height: "", activity: "", goal: "", notes: "" },
  meals: { breakfast: [], snack1: [], lunch: [], snack2: [], dinner: [], snack3: [] },
  targets: null,
  customCalories: null,
  calibrationMode: 'coach',  // 'raw' | 'calibrated' | 'coach'
  coachFactors: null,       // { calories: 0.89, protein: 0.90, fat: 0.83, carbs: 0.94 }
  targetFormula: 'herbalife'   // 'normal' | 'herbalife'
};

// ============================================================
// CALCULATIONS
// ============================================================
function calculateBMR(weight, height, age, sex) {
  // Mifflin-St Jeor Equation
  if (sex === "male") {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

function calculateTDEE(bmr, activityKey) {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityKey]);
}

function calculateTargets(weight, tdee, goalKey, customCals = null) {
  const goal = GOALS[goalKey];
  let targetCals = customCals !== null ? customCals : (tdee + goal.adjustment);
  let protein = Math.round(weight * 2.2);
  let fat = Math.round(weight * 0.8);

  // Herbalife Coach formula: simple kcal/kg approach
  if (state.targetFormula === 'herbalife') {
    protein = Math.round(weight * 1.75);
    fat = Math.round(weight * 0.7);
    if (customCals === null) {
      // Base: 30 kcal/kg maintenance, adjust by goal
      const hblBase = { 
        'Fat Loss (Aggressive)': 26, 'Fat Loss (Moderate)': 28,
        'Maintenance': 30, 'Recomp': 30,
        'Lean Bulk': 34, 'Muscle Gain (Moderate)': 36,
        'Athletic Performance': 32, 'Endurance': 30,
        'Enhanced Athlete': 38
      };
      const kcalPerKg = hblBase[goalKey] || 30;
      targetCals = Math.round(weight * kcalPerKg);
    }
  }

  // Coach-Tuned calibration on targets
  if (state.calibrationMode === 'coach' && state.coachFactors) {
    targetCals = Math.round(targetCals * state.coachFactors.calories);
    protein = Math.round(protein * state.coachFactors.protein);
    fat = Math.round(fat * state.coachFactors.fat);
  }

  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = targetCals - proteinCals - fatCals;
  const carbs = Math.max(0, Math.round(carbCals / 4));
  return { calories: Math.round(targetCals), protein, carbs, fat };
}

function calculateFoodMacros(foodName, grams, cookingMethod) {
  const food = FOOD_DATABASE[foodName] || VN_FOOD_CACHE[foodName];
  if (!food) return null;
  const ratio = food.unit === 'serving' ? grams : grams / 100;

  // Raw macros
  let protein = food.protein * ratio;
  let fat = food.fat * ratio;
  let carbs = food.carbs * ratio;
  let fibre = food.fibre * ratio;
  let sodium = food.sodium * ratio;

  // Mode: Calibrated — apply cooking factors
  if (state.calibrationMode === 'calibrated' && cookingMethod && cookingMethod !== 'raw') {
    const factors = (COOKING_FACTORS[cookingMethod] || {})[food.category];
    if (factors) {
      protein *= factors.rf_protein;
      fat = fat * factors.rf_fat + (factors.oil_uptake * (food.unit === 'serving' ? grams : grams / 100));
      carbs = carbs * factors.rf_carbs - (factors.rs_delta * (food.unit === 'serving' ? grams : grams / 100));
      if (carbs < 0) carbs = 0;
    }
  }

  // Calculate calories from adjusted macros
  let calories = 4 * protein + 9 * fat + 4 * carbs;

  // Mode: Coach — apply blanket factors
  if (state.calibrationMode === 'coach' && state.coachFactors) {
    calories *= state.coachFactors.calories;
    protein *= state.coachFactors.protein;
    fat *= state.coachFactors.fat;
    carbs *= state.coachFactors.carbs;
  }

  // If raw mode, use original calorie value from DB
  if (state.calibrationMode === 'raw') {
    calories = food.calories * ratio;
  }

  return {
    calories: Math.round(calories * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    fibre: Math.round(fibre * 10) / 10,
    sodium: Math.round(sodium)
  };
}

// ============================================================
// CALIBRATION MODE CONTROLS
// ============================================================
function setCalibrationMode(mode) {
  state.calibrationMode = mode;
  // Show/hide cooking method dropdowns
  document.querySelectorAll('.cook-method-select').forEach(el => {
    el.style.display = mode === 'calibrated' ? 'inline-block' : 'none';
  });
  // Show/hide coach button
  document.getElementById('coachCalibBtn').style.display = mode === 'coach' ? 'inline-block' : 'none';
  // Recalculate targets + meals
  recalculate();
  MEAL_SLOTS.forEach(slot => renderMealItems(slot.id));
}

function setTargetFormula(formula) {
  state.targetFormula = formula;
  recalculate();
  saveStateToCache();
}

function openCoachCalibModal() {
  const totals = getDayTotals();
  document.getElementById('calib_app_cal').textContent = Math.round(totals.calories);
  document.getElementById('calib_app_pro').textContent = formatMacro(totals.protein);
  document.getElementById('calib_app_fat').textContent = formatMacro(totals.fat);
  document.getElementById('calib_app_carb').textContent = formatMacro(totals.carbs);
  document.getElementById('coachCalibModal').style.display = 'flex';
}

function closeCoachCalibModal() {
  document.getElementById('coachCalibModal').style.display = 'none';
}

function calculateCoachFactors() {
  const appCal = parseFloat(document.getElementById('calib_app_cal').textContent) || 1;
  const appPro = parseFloat(document.getElementById('calib_app_pro').textContent) || 1;
  const appFat = parseFloat(document.getElementById('calib_app_fat').textContent) || 1;
  const appCarb = parseFloat(document.getElementById('calib_app_carb').textContent) || 1;

  const coachCal = parseFloat(document.getElementById('calib_coach_cal').value) || appCal;
  const coachPro = parseFloat(document.getElementById('calib_coach_pro').value) || appPro;
  const coachFat = parseFloat(document.getElementById('calib_coach_fat').value) || appFat;
  const coachCarb = parseFloat(document.getElementById('calib_coach_carb').value) || appCarb;

  const factors = {
    calories: Math.round((coachCal / appCal) * 1000) / 1000,
    protein: Math.round((coachPro / appPro) * 1000) / 1000,
    fat: Math.round((coachFat / appFat) * 1000) / 1000,
    carbs: Math.round((coachCarb / appCarb) * 1000) / 1000
  };

  document.getElementById('calib_factor_cal').textContent = factors.calories.toFixed(3);
  document.getElementById('calib_factor_pro').textContent = factors.protein.toFixed(3);
  document.getElementById('calib_factor_fat').textContent = factors.fat.toFixed(3);
  document.getElementById('calib_factor_carb').textContent = factors.carbs.toFixed(3);
}

function saveCoachFactors() {
  const cal = parseFloat(document.getElementById('calib_factor_cal').textContent);
  const pro = parseFloat(document.getElementById('calib_factor_pro').textContent);
  const fat = parseFloat(document.getElementById('calib_factor_fat').textContent);
  const carb = parseFloat(document.getElementById('calib_factor_carb').textContent);
  if (isNaN(cal)) { alert('Calculate factors first'); return; }
  state.coachFactors = { calories: cal, protein: pro, fat: fat, carbs: carb };
  closeCoachCalibModal();
  recalculate();
  MEAL_SLOTS.forEach(slot => renderMealItems(slot.id));
}


function getMealTotals(mealId) {
  const items = state.meals[mealId];
  return items.reduce((acc, item) => {
    const macros = calculateFoodMacros(item.food, item.grams, item.cookingMethod);
    if (macros) {
      acc.calories += macros.calories;
      acc.protein += macros.protein;
      acc.carbs += macros.carbs;
      acc.fat += macros.fat;
      acc.fibre += macros.fibre;
      acc.sodium += macros.sodium;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, sodium: 0 });
}

function getDayTotals() {
  return Object.keys(state.meals).reduce((acc, mealId) => {
    const t = getMealTotals(mealId);
    acc.calories += t.calories;
    acc.protein += t.protein;
    acc.carbs += t.carbs;
    acc.fat += t.fat;
    acc.fibre += t.fibre;
    acc.sodium += t.sodium;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, sodium: 0 });
}

// ============================================================
// VN LIVE FOOD LOOKUP (viendinhduong.vn)
// ============================================================
const VN_FOOD_CACHE = {};
let vnSearchTimeout = null;

async function searchVNFoods(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`${window.location.origin}/api/vn-food?page=1&name=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return (data.data || []).map(f => {
      const nutrients = {};
      (f.nutritional_components || []).forEach(n => { nutrients[n.key] = parseFloat(n.amount) || 0; });
      const entry = {
        protein: nutrients['chat-dam'] || 0,
        carbs: nutrients['chat-bot-duong'] || 0,
        fat: nutrients['chat-beo'] || 0,
        fibre: 0,
        sodium: nutrients['natri'] || 0,
        calories: nutrients['nang-luong'] || 0,
        category: 'VN Dish',
        unit: 'g'
      };
      const name = `${f.name_vi} - ${f.name_en}`;
      VN_FOOD_CACHE[name] = entry;
      return name;
    });
  } catch (e) { console.warn('VN food search failed:', e); return []; }
}

// ============================================================
// UI HELPERS
// ============================================================
function getFoodSuggestions(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return Object.keys(FOOD_DATABASE).filter(name => name.toLowerCase().includes(q)).slice(0, 8);
}

function formatMacro(val) {
  return Math.round(val * 10) / 10;
}

function updateClientState() {
  state.client.name = document.getElementById('clientName').value;
  state.client.age = parseFloat(document.getElementById('clientAge').value);
  state.client.sex = document.getElementById('clientSex').value;
  state.client.weight = parseFloat(document.getElementById('clientWeight').value);
  state.client.height = parseFloat(document.getElementById('clientHeight').value);
  state.client.activity = document.getElementById('clientActivity').value;
  state.client.goal = document.getElementById('clientGoal').value;
  state.client.notes = document.getElementById('clientNotes').value;
}

function recalculate() {
  updateClientState();
  const { weight, height, age, sex, activity, goal } = state.client;
  if (!weight || !height || !age || !activity || !goal) return;

  const bmr = calculateBMR(weight, height, age, sex);
  const tdee = calculateTDEE(bmr, activity);
  const customCals = state.customCalories;
  const targets = calculateTargets(weight, tdee, goal, customCals);
  state.targets = targets;

  document.getElementById('bmrDisplay').textContent = Math.round(bmr);
  document.getElementById('tdeeDisplay').textContent = tdee;
  document.getElementById('targetCalDisplay').textContent = targets.calories;
  document.getElementById('targetProteinDisplay').textContent = targets.protein + 'g';
  document.getElementById('targetCarbsDisplay').textContent = targets.carbs + 'g';
  document.getElementById('targetFatDisplay').textContent = targets.fat + 'g';

  if (!customCals) {
    document.getElementById('customCalories').value = targets.calories;
  }

  // Update dynamic formula labels
  if (weight) {
    var hblPro = Math.round(weight * 1.75);
    var normPro = Math.round(weight * 2.2);
    document.getElementById('hblProLabel').textContent = hblPro + 'g pro (' + (1.75).toFixed(2) + '/kg)';
    document.getElementById('normalProLabel').textContent = normPro + 'g pro (' + (2.2).toFixed(1) + '/kg)';
  }

  updateDayTotalsBar();
  updateAllMealTotals();
}

function updateDayTotalsBar() {
  if (!state.targets) return;
  const totals = getDayTotals();
  const targets = state.targets;

  const fields = ['calories', 'protein', 'carbs', 'fat'];
  fields.forEach(field => {
    const el = document.getElementById(`total${field.charAt(0).toUpperCase() + field.slice(1)}`);
    if (el) el.textContent = formatMacro(totals[field]);
  });

  // Progress bars
  ['calories', 'protein', 'carbs', 'fat'].forEach(field => {
    const bar = document.getElementById(`bar_${field}`);
    if (bar) {
      const pct = Math.min(100, Math.round((totals[field] / targets[field]) * 100));
      bar.style.width = pct + '%';
      bar.style.backgroundColor = pct > 105 ? '#ff4444' : pct > 95 ? '#00ff88' : '#2e7d32';
    }
  });
}

function updateAllMealTotals() {
  MEAL_SLOTS.forEach(slot => updateMealTotals(slot.id));
}

function updateMealTotals(mealId) {
  const t = getMealTotals(mealId);
  const el = document.getElementById(`meal_totals_${mealId}`);
  if (el) {
    el.innerHTML = `
      <span>${formatMacro(t.calories)} kcal</span>
      <span>P: ${formatMacro(t.protein)}g</span>
      <span>C: ${formatMacro(t.carbs)}g</span>
      <span>F: ${formatMacro(t.fat)}g</span>
    `;
  }
  updateDayTotalsBar();
}

// ============================================================
// FOOD ITEM MANAGEMENT
// ============================================================
function addFoodItem(mealId) {
  const input = document.getElementById(`food_input_${mealId}`);
  const gramsInput = document.getElementById(`grams_input_${mealId}`);
  const foodName = input.value.trim();
  const grams = parseFloat(gramsInput.value);

  if (!FOOD_DATABASE[foodName] && !VN_FOOD_CACHE[foodName]) {
    input.style.borderColor = '#ff4444';
    setTimeout(() => input.style.borderColor = '', 1500);
    return;
  }
  if (!grams || grams <= 0) {
    gramsInput.style.borderColor = '#ff4444';
    setTimeout(() => gramsInput.style.borderColor = '', 1500);
    return;
  }

  const cookMethod = document.getElementById(`cook_method_${mealId}`).value || 'raw';
  state.meals[mealId].push({ food: foodName, grams, cookingMethod: cookMethod });
  input.value = '';
  gramsInput.value = '';
  hideSuggestions(mealId);
  renderMealItems(mealId);
  updateMealTotals(mealId);
  saveStateToCache();
}

function removeFoodItem(mealId, index) {
  state.meals[mealId].splice(index, 1);
  renderMealItems(mealId);
  updateMealTotals(mealId);
  saveStateToCache();
}

function renderMealItems(mealId) {
  const container = document.getElementById(`meal_items_${mealId}`);
  if (!container) return;
  const items = state.meals[mealId];

  if (items.length === 0) {
    container.innerHTML = '<div class="empty-meal">No foods added yet</div>';
    return;
  }

  container.innerHTML = items.map((item, idx) => {
    const macros = calculateFoodMacros(item.food, item.grams, item.cookingMethod);
    const unit = FOOD_DATABASE[item.food]?.unit || VN_FOOD_CACHE[item.food]?.unit || 'g';
    return `
      <div class="food-item">
        <div class="food-item-name">
          <span class="food-name">${item.food}</span>
          <span class="food-amount">${item.grams}${unit}</span>
        </div>
        <div class="food-item-macros">
          <span>${formatMacro(macros.calories)} kcal</span>
          <span>P: ${formatMacro(macros.protein)}g</span>
          <span>C: ${formatMacro(macros.carbs)}g</span>
          <span>F: ${formatMacro(macros.fat)}g</span>
        </div>
        <button class="remove-btn" onclick="removeFoodItem('${mealId}', ${idx})">✕</button>
      </div>
    `;
  }).join('');
}

// ============================================================
// AUTOCOMPLETE
// ============================================================
function showSuggestions(mealId) {
  const input = document.getElementById(`food_input_${mealId}`);
  const dropdown = document.getElementById(`suggestions_${mealId}`);
  const query = input.value;
  const localSuggestions = getFoodSuggestions(query);

  if (localSuggestions.length > 0) {
    renderSuggestions(dropdown, mealId, localSuggestions);
  } else if (query && query.length >= 2) {
    dropdown.innerHTML = '<div class="suggestion-item" style="color:#888;pointer-events:none">Searching Vietnamese dishes...</div>';
    dropdown.style.display = 'block';
  } else {
    dropdown.style.display = 'none';
    return;
  }

  // VN API search - direct call with debounce
  if (query && query.length >= 2) {
    clearTimeout(vnSearchTimeout);
    vnSearchTimeout = setTimeout(function() {
      var q = input.value;
      fetch(window.location.origin + '/api/vn-food?page=1&name=' + encodeURIComponent(q))
        .then(function(res) { return res.json(); })
        .then(function(data) {
          var vnResults = (data.data || []).map(function(f) {
            var nutrients = {};
            (f.nutritional_components || []).forEach(function(n) { nutrients[n.key] = parseFloat(n.amount) || 0; });
            var name = f.name_vi + ' - ' + f.name_en;
            VN_FOOD_CACHE[name] = {
              protein: nutrients['chat-dam'] || 0,
              carbs: nutrients['chat-bot-duong'] || 0,
              fat: nutrients['chat-beo'] || 0,
              fibre: 0,
              sodium: nutrients['natri'] || 0,
              calories: nutrients['nang-luong'] || 0,
              category: 'VN Dish',
              unit: 'g'
            };
            return name;
          });
          if (vnResults.length > 0) {
            var local = getFoodSuggestions(q);
            var combined = local.concat(vnResults).slice(0, 12);
            renderSuggestions(dropdown, mealId, combined);
          }
        })
        .catch(function(e) { console.warn('VN search error:', e); });
    }, 400);
  }
}

function renderSuggestions(dropdown, mealId, suggestions) {
  if (suggestions.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  dropdown.innerHTML = suggestions.map((name, i) => {
    const food = FOOD_DATABASE[name] || VN_FOOD_CACHE[name];
    const isLive = !!VN_FOOD_CACHE[name];
    const sourceTag = isLive ? '<span class="sug-tag sug-tag-live">🇻🇳 Online</span>' : '<span class="sug-tag sug-tag-local">Local</span>';
    const perLabel = food.unit === 'serving' ? '/ serving' : '/ 100 ' + food.unit;
    return `
      <div class="suggestion-item" data-index="${i}">
        <span class="sug-name">${name} ${sourceTag}</span>
        <span class="sug-macros">${food.calories} kcal | P:${food.protein}g C:${food.carbs}g F:${food.fat}g ${perLabel}</span>
      </div>
    `;
  }).join('');
  dropdown.style.display = 'block';
  dropdown.querySelectorAll('.suggestion-item').forEach(el => {
    el.onclick = () => selectFood(mealId, suggestions[el.dataset.index]);
  });
}

function selectFood(mealId, foodName) {
  const input = document.getElementById(`food_input_${mealId}`);
  const gramsInput = document.getElementById(`grams_input_${mealId}`);
  input.value = foodName;
  hideSuggestions(mealId);
  gramsInput.placeholder = 'g / ml';
  gramsInput.focus();
}

function hideSuggestions(mealId) {
  const dropdown = document.getElementById(`suggestions_${mealId}`);
  if (dropdown) dropdown.style.display = 'none';
}

// ============================================================
// CUSTOM CALORIES
// ============================================================
function applyCustomCalories() {
  const val = parseFloat(document.getElementById('customCalories').value);
  if (val && val > 0) {
    state.customCalories = val;
    recalculate();
  }
}

function resetToCalculated() {
  state.customCalories = null;
  recalculate();
}

// ============================================================
// PDF GENERATION
// ============================================================
function generatePDF() {
  updateClientState();
  const { name, age, sex, weight, height, activity, goal, notes } = state.client;

  if (!name || !state.targets) {
    alert('Please fill in client details and calculate targets before generating PDF.');
    return;
  }

  const totals = getDayTotals();
  const targets = state.targets;

  // Build meal sections — only include meals with food
  const mealSections = MEAL_SLOTS.map(slot => {
    const items = state.meals[slot.id];
    if (items.length === 0) return null;
    const t = getMealTotals(slot.id);
    const itemRows = items.map(item => {
      const m = calculateFoodMacros(item.food, item.grams, item.cookingMethod);
      const unit = FOOD_DATABASE[item.food]?.unit || VN_FOOD_CACHE[item.food]?.unit || 'g';
      return `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #b0d4b0;">${item.food}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #b0d4b0;text-align:center;">${item.grams}${unit}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #b0d4b0;text-align:center;">${formatMacro(m.calories)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #b0d4b0;text-align:center;">${formatMacro(m.protein)}g</td>
          <td style="padding:6px 8px;border-bottom:1px solid #b0d4b0;text-align:center;">${formatMacro(m.carbs)}g</td>
          <td style="padding:6px 8px;border-bottom:1px solid #b0d4b0;text-align:center;">${formatMacro(m.fat)}g</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="meal-section">
        <div class="meal-header-pdf">
          <span class="meal-title-pdf">${slot.label}</span>
          <span class="meal-total-pdf">${formatMacro(t.calories)} kcal &nbsp;|&nbsp; P: ${formatMacro(t.protein)}g &nbsp;|&nbsp; C: ${formatMacro(t.carbs)}g &nbsp;|&nbsp; F: ${formatMacro(t.fat)}g</span>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;color:#1a2e1a;">
          <thead>
            <tr style="background:#dceadc;">
              <th style="padding:6px 8px;text-align:left;color:#2e7d32;">Food</th>
              <th style="padding:6px 8px;color:#2e7d32;">Amount</th>
              <th style="padding:6px 8px;color:#2e7d32;">kcal</th>
              <th style="padding:6px 8px;color:#2e7d32;">Protein</th>
              <th style="padding:6px 8px;color:#2e7d32;">Carbs</th>
              <th style="padding:6px 8px;color:#2e7d32;">Fat</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>
    `;
  }).filter(Boolean).join('');

  // Micronutrient totals
  const microTotals = Object.keys(state.meals).reduce((acc, mealId) => {
    state.meals[mealId].forEach(item => {
      const m = calculateFoodMacros(item.food, item.grams, item.cookingMethod);
      if (m) {
        acc.fibre += m.fibre;
        acc.sodium += m.sodium;
      }
    });
    return acc;
  }, { fibre: 0, sodium: 0 });

  const logoB64 = window.LOGO_BASE64 || '';

  const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>House of Health Well Pro - Nutrition Plan - ${name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f0f5f0; color: #1a2e1a; font-family: 'Barlow', sans-serif; font-size: 13px; }
        .page { max-width: 800px; margin: 0 auto; padding: 30px; }

        .header { display: flex; align-items: center; gap: 20px; padding-bottom: 20px; border-bottom: 2px solid #2e7d32; margin-bottom: 24px; }
        .logo { width: 90px; height: 90px; object-fit: contain; }
        .header-text h1 { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 800; color: #1a2e1a; text-transform: uppercase; letter-spacing: 2px; }
        .header-text h2 { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600; color: #2e7d32; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        .header-text p { font-size: 11px; color: #4a7a4a; margin-top: 4px; }

        .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .client-card { background: #dceadc; border: 1px solid #a0c8a0; border-radius: 8px; padding: 12px 16px; }
        .client-card label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2e7d32; display: block; margin-bottom: 4px; }
        .client-card span { font-size: 15px; font-weight: 600; color: #1a2e1a; }

        .targets-box { background: #dceadc; border: 1px solid #2e7d32; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
        .targets-box h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #2e7d32; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .targets-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .target-item { text-align: center; }
        .target-item .val { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 800; color: #1a2e1a; }
        .target-item .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #4a7a4a; margin-top: 2px; }
        .target-item.highlight .val { color: #2e7d32; }

        .meal-section { margin-bottom: 18px; background: #e4ede4; border-radius: 8px; overflow: hidden; border: 1px solid #b0d4b0; }
        .meal-header-pdf { display: flex; justify-content: space-between; align-items: center; background: #dceadc; padding: 10px 14px; border-bottom: 1px solid #a0c8a0; }
        .meal-title-pdf { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: #1a2e1a; text-transform: uppercase; letter-spacing: 1px; }
        .meal-total-pdf { font-size: 11px; color: #2e7d32; }

        .day-totals-box { background: #d8e8d8; border: 2px solid #2e7d32; border-radius: 10px; padding: 16px 20px; margin: 24px 0 18px; }
        .day-totals-box h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #2e7d32; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .day-totals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .dt-item { text-align: center; }
        .dt-item .val { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; color: #1a2e1a; }
        .dt-item .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #4a7a4a; }
        .dt-item .diff { font-size: 11px; font-weight: 600; margin-top: 2px; }
        .diff-over { color: #ff4444; }
        .diff-under { color: #00ff88; }
        .diff-ok { color: #2e7d32; }

        .micro-box { background: #e4ede4; border: 1px solid #a0c8a0; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px; }
        .micro-box h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #4a7a4a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .micro-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .micro-item { display: flex; justify-content: space-between; padding: 6px 10px; background: #d8e8d8; border-radius: 5px; }
        .micro-item span:first-child { color: #a0b8cc; font-size: 12px; }
        .micro-item span:last-child { color: #1a2e1a; font-weight: 600; font-size: 12px; }

        .notes-box { background: #e4ede4; border: 1px solid #a0c8a0; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px; }
        .notes-box h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #4a7a4a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .notes-box p { color: #c0d0e0; line-height: 1.6; font-size: 13px; white-space: pre-wrap; }

        .footer { border-top: 1px solid #a0c8a0; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; color: #4a7a4a; font-size: 11px; }
        .footer-brand { color: #2e7d32; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <img src="docs/images/logo.jpg" class="logo" alt="Logo">
          <div class="header-text">
            <h1>House of Health Well Pro</h1>
            <h2>Personalised Nutrition Plan</h2>
            <p>Stronger Mind. Stronger Body. Stronger You.</p>
          </div>
        </div>

        <div class="client-grid">
          <div class="client-card"><label>Client</label><span>${name}</span></div>
          <div class="client-card"><label>Goal</label><span>${goal}</span></div>
          <div class="client-card"><label>Weight</label><span>${weight} kg</span></div>
          <div class="client-card"><label>Activity Level</label><span>${activity}</span></div>
        </div>

        <div class="targets-box">
          <h3>Daily Targets</h3>
          <div class="targets-grid">
            <div class="target-item highlight"><div class="val">${targets.calories}</div><div class="lbl">Total kcal</div></div>
            <div class="target-item"><div class="val">${targets.protein}g</div><div class="lbl">Protein</div></div>
            <div class="target-item"><div class="val">${targets.carbs}g</div><div class="lbl">Carbohydrates</div></div>
            <div class="target-item"><div class="val">${targets.fat}g</div><div class="lbl">Fat</div></div>
          </div>
        </div>

        <div style="font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Meal Plan</div>

        ${mealSections}

        <div class="day-totals-box">
          <h3>Day Totals vs Targets</h3>
          <div class="day-totals-grid">
            ${['calories', 'protein', 'carbs', 'fat'].map(field => {
              const actual = Math.round(totals[field] * 10) / 10;
              const target = targets[field];
              const diff = Math.round((actual - target) * 10) / 10;
              const diffClass = Math.abs(diff) <= (target * 0.05) ? 'diff-ok' : diff > 0 ? 'diff-over' : 'diff-under';
              const diffText = diff > 0 ? `+${diff}` : `${diff}`;
              const unit = field === 'calories' ? 'kcal' : 'g';
              return `
                <div class="dt-item">
                  <div class="val">${actual}${unit}</div>
                  <div class="lbl">${field.charAt(0).toUpperCase() + field.slice(1)}</div>
                  <div class="diff ${diffClass}">${diffText}${unit} vs target</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="micro-box">
          <h3>Micronutrient Summary</h3>
          <div class="micro-grid">
            <div class="micro-item"><span>Dietary Fibre</span><span>${formatMacro(microTotals.fibre)}g ${microTotals.fibre >= 25 ? '✓' : '(aim 25-38g)'}</span></div>
            <div class="micro-item"><span>Sodium</span><span>${Math.round(microTotals.sodium)}mg ${microTotals.sodium <= 2300 ? '✓' : '⚠ check'}</span></div>
          </div>
          <p style="font-size:10px;color:#4a7a4a;margin-top:10px;">Reference values based on Vietnamese Nutrition Institute guidelines. Individual requirements may vary.</p>
        </div>

        ${notes ? `
          <div class="notes-box">
            <h3>Coach Notes</h3>
            <p>${notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <div>
            <div class="footer-brand">House of Health Well Pro — 85 Tan Cang St</div>
            <div style="margin-top:3px;">📞 0400 074 078 &nbsp;|&nbsp; ✉ Empowerfit77@gmail.com &nbsp;|&nbsp; Instagram: @Empower_FitPT</div>
          </div>
          <div style="text-align:right;">
            <div>Generated ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style="color:#2e7d32;margin-top:2px;">Stronger Mind. Stronger Body. Stronger You.</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(pdfContent);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Populate activity dropdown
  const activitySelect = document.getElementById('clientActivity');
  Object.keys(ACTIVITY_MULTIPLIERS).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = key;
    activitySelect.appendChild(opt);
  });

  // Populate goal dropdown
  const goalSelect = document.getElementById('clientGoal');
  Object.keys(GOALS).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = key;
    goalSelect.appendChild(opt);
  });

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    MEAL_SLOTS.forEach(slot => {
      const dropdown = document.getElementById(`suggestions_${slot.id}`);
      const input = document.getElementById(`food_input_${slot.id}`);
      if (dropdown && input && !input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  });

  // Load cached state
  loadStateFromCache();

  // Init meal item displays
  MEAL_SLOTS.forEach(slot => renderMealItems(slot.id));
});

// ============================================================
// CACHE (localStorage)
// ============================================================
function saveStateToCache() {
  try { localStorage.setItem('empowerfit_state', JSON.stringify(state)); } catch(e) {}
}

function loadStateFromCache() {
  try {
    const cached = localStorage.getItem('empowerfit_state');
    if (!cached) return;
    const saved = JSON.parse(cached);
    Object.assign(state, saved);
    // Restore UI from cached state
    if (state.client.name) document.getElementById('clientName').value = state.client.name;
    if (state.client.age) document.getElementById('clientAge').value = state.client.age;
    if (state.client.sex) document.getElementById('clientSex').value = state.client.sex;
    if (state.client.weight) document.getElementById('clientWeight').value = state.client.weight;
    if (state.client.height) document.getElementById('clientHeight').value = state.client.height;
    if (state.client.activity) document.getElementById('clientActivity').value = state.client.activity;
    if (state.client.goal) document.getElementById('clientGoal').value = state.client.goal;
    if (state.client.notes) document.getElementById('clientNotes').value = state.client.notes;
    if (state.targetFormula) document.querySelector(`input[name="targetFormula"][value="${state.targetFormula}"]`).checked = true;
    if (state.calibrationMode) document.querySelector(`input[name="calibMode"][value="${state.calibrationMode}"]`).checked = true;
    setCalibrationMode(state.calibrationMode || 'raw');
    recalculate();
  } catch(e) {}
}

function clearAppCache() {
  localStorage.removeItem('empowerfit_state');
  location.reload();
}

// Theme toggle
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? '' : 'dark');
  document.querySelector('.btn-theme-toggle').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('empowerfit_theme', isDark ? 'light' : 'dark');
}
// Restore theme on load
(function() {
  var t = localStorage.getItem('empowerfit_theme');
  if (t === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); }
})();
