// Clean Initial Datastores
const emptyMeals = {
    'Lunes': { breakfast: '', lunch: '', dinner: '', snack: '' },
    'Martes': { breakfast: '', lunch: '', dinner: '', snack: '' },
    'Miércoles': { breakfast: '', lunch: '', dinner: '', snack: '' },
    'Jueves': { breakfast: '', lunch: '', dinner: '', snack: '' },
    'Viernes': { breakfast: '', lunch: '', dinner: '', snack: '' },
    'Sábado': { breakfast: '', lunch: '', dinner: '', snack: '' },
    'Domingo': { breakfast: '', lunch: '', dinner: '', snack: '' }
};

const store = {
    tasks: JSON.parse(localStorage.getItem('fh_tasks')) || [],
    meals: JSON.parse(localStorage.getItem('fh_meals')) || emptyMeals,
    recipes: JSON.parse(localStorage.getItem('fh_recipes')) || [],
    shopping: JSON.parse(localStorage.getItem('fh_shopping')) || [],
    routines: JSON.parse(localStorage.getItem('fh_routines')) || [],
    meds: JSON.parse(localStorage.getItem('fh_meds')) || [],
    projects: JSON.parse(localStorage.getItem('fh_projects')) || [],

    save(key) {
        localStorage.setItem(`fh_${key}`, JSON.stringify(this[key]));
        updateDashboard();
    }
};

// Theme Toggle Handler
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('fh_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
}
if (localStorage.getItem('fh_theme') === 'dark') {
    document.documentElement.classList.add('dark');
}

// Navigation Engine
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-tab'));

    const targetSection = document.getElementById(`module-${tabId}`);
    if (targetSection) targetSection.classList.remove('hidden');

    const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (targetBtn) targetBtn.classList.add('active-tab');
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Toast Feedback System
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto px-4 py-3 rounded-2xl glass-card shadow-xl text-xs font-bold flex items-center gap-2 border transition-all duration-300 transform translate-y-2 opacity-0 ${
        type === 'success' ? 'border-sage-500 text-sage-700 dark:text-sage-300' : 'border-terracotta-500 text-terracotta-600'
    }`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check text-sage-500' : 'fa-bell text-terracotta-500'}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modals Helper
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openQuickAddModal() { openModal('modal-quick-add'); }

// --- DASHBOARD LOGIC ---
function updateDashboard() {
    const pendingTasks = store.tasks.filter(t => !t.done);
    document.getElementById('dash-tasks-count').textContent = pendingTasks.length;

    const pendingShopping = store.shopping.filter(s => !s.bought).length;
    document.getElementById('dash-shopping-count').textContent = pendingShopping;

    const pendingMeds = store.meds.filter(m => !m.takenToday).length;
    document.getElementById('dash-meds-count').textContent = pendingMeds;

    const completedRoutines = store.routines.filter(r => r.done).length;
    const routinePct = store.routines.length ? Math.round((completedRoutines / store.routines.length) * 100) : 0;
    document.getElementById('dash-routines-pct').textContent = `${routinePct}%`;

    // Urgent alerts (Low stock or near expiry)
    const lowStockMeds = store.meds.filter(m => m.stock <= 5);
    const urgentBanner = document.getElementById('dash-urgent-banner');
    if (lowStockMeds.length > 0) {
        urgentBanner.classList.remove('hidden');
        document.getElementById('urgent-title').textContent = 'Atención en Botiquín';
        document.getElementById('urgent-desc').textContent = `El medicamento "${lowStockMeds[0].name}" tiene un stock bajo (${lowStockMeds[0].stock} unidades).`;
    } else {
        urgentBanner.classList.add('hidden');
    }

    // High priority tasks
    const highPriority = store.tasks.filter(t => !t.done && t.priority === 'Alta');
    const priorityContainer = document.getElementById('dash-priority-tasks-list');
    if (highPriority.length === 0) {
        priorityContainer.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">No hay tareas de alta prioridad asignadas.</div>`;
    } else {
        priorityContainer.innerHTML = highPriority.map(t => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-cream-100/60 dark:bg-charcoal-950/40 border border-sand-200/50 dark:border-slate-800">
                <div class="flex items-center gap-3">
                    <input type="checkbox" onchange="toggleTask(${t.id})" class="w-4 h-4 rounded text-terracotta-500">
                    <span class="text-xs font-bold">${t.title}</span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-600 font-extrabold">${t.room}</span>
            </div>
        `).join('');
    }

    // Today's Meals Summary
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const todayStr = days[new Date().getDay()];
    const todayMeal = store.meals[todayStr] || { breakfast: '', lunch: '', dinner: '', snack: '' };

    document.getElementById('dash-today-meals-list').innerHTML = `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-cream-100 dark:bg-charcoal-950">
            <span class="text-xs text-slate-400 font-bold">Desayuno</span>
            <span class="text-xs font-bold">${todayMeal.breakfast || 'Sin definir'}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-cream-100 dark:bg-charcoal-950">
            <span class="text-xs text-slate-400 font-bold">Comida</span>
            <span class="text-xs font-bold text-terracotta-500">${todayMeal.lunch || 'Sin definir'}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-cream-100 dark:bg-charcoal-950">
            <span class="text-xs text-slate-400 font-bold">Snack</span>
            <span class="text-xs font-bold">${todayMeal.snack || 'Sin definir'}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-cream-100 dark:bg-charcoal-950">
            <span class="text-xs text-slate-400 font-bold">Cena</span>
            <span class="text-xs font-bold">${todayMeal.dinner || 'Sin definir'}</span>
        </div>
    `;
}

// --- TASKS LOGIC ---
function renderTasks() {
    const container = document.getElementById('tasks-container');
    const roomFilter = document.getElementById('task-filter-room').value;
    const freqFilter = document.getElementById('task-filter-freq').value;

    let filtered = store.tasks.filter(t => {
        const matchRoom = roomFilter === 'all' || t.room === roomFilter;
        const matchFreq = freqFilter === 'all' || t.freq === freqFilter;
        return matchRoom && matchFreq;
    });

    document.getElementById('tasks-badge-count').textContent = `Mostrando ${filtered.length} tareas`;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full p-8 text-center glass-card rounded-2xl space-y-2 border border-sand-200/60 dark:border-slate-800">
                <i class="fa-solid fa-clipboard-check text-3xl text-sage-500"></i>
                <p class="text-xs font-bold text-slate-500">No hay tareas creadas todavía.</p>
                <button onclick="openModal('modal-task')" class="text-xs text-terracotta-500 underline font-bold">Añade tu primera tarea</button>
            </div>`;
        return;
    }

    container.innerHTML = filtered.map(t => `
        <div class="glass-card p-4 rounded-2xl border border-sand-200/60 dark:border-slate-800 flex flex-col justify-between gap-3 ${t.done ? 'opacity-50' : ''}">
            <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-3">
                    <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${t.id})" class="w-5 h-5 rounded text-terracotta-500 cursor-pointer">
                    <span class="font-bold text-xs ${t.done ? 'line-through text-slate-400' : ''}">${t.title}</span>
                </div>
                <button onclick="deleteTask(${t.id})" class="text-slate-400 hover:text-rose-500 text-xs"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="flex items-center justify-between text-[11px] pt-2 border-t border-sand-200/40 dark:border-slate-800">
                <span class="px-2 py-0.5 rounded-md bg-sand-200 dark:bg-charcoal-800 font-bold text-slate-600 dark:text-slate-300">${t.room}</span>
                <div class="flex items-center gap-2">
                    <span class="text-slate-400"><i class="fa-regular fa-user mr-1"></i>${t.assignee || 'General'}</span>
                    <span class="px-2 py-0.5 rounded-md font-bold ${t.priority === 'Alta' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}">${t.priority}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleTask(id) {
    const t = store.tasks.find(item => item.id === id);
    if (t) {
        t.done = !t.done;
        store.save('tasks');
        renderTasks();
        showToast(t.done ? 'Tarea completada ✨' : 'Tarea pendiente');
    }
}

function deleteTask(id) {
    store.tasks = store.tasks.filter(t => t.id !== id);
    store.save('tasks');
    renderTasks();
    showToast('Tarea eliminada');
}

function handleAddTask(e) {
    e.preventDefault();
    store.tasks.push({
        id: Date.now(),
        title: document.getElementById('task-title').value,
        room: document.getElementById('task-room').value,
        freq: document.getElementById('task-freq').value,
        assignee: document.getElementById('task-assignee').value,
        priority: document.getElementById('task-priority').value,
        done: false
    });
    store.save('tasks');
    renderTasks();
    closeModal('modal-task');
    document.getElementById('form-task').reset();
    showToast('Nueva tarea añadida');
}

// --- MEALS & RECIPES LOGIC ---
function renderMeals() {
    const grid = document.getElementById('meal-grid');
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    grid.innerHTML = days.map(day => {
        const meal = store.meals[day] || {};
        return `
            <div class="glass-card p-3 rounded-2xl border border-sand-200/60 dark:border-slate-800 space-y-2">
                <div class="font-extrabold text-center text-xs text-terracotta-500 pb-1 border-b border-sand-200/40 dark:border-slate-800">
                    ${day}
                </div>
                <div class="space-y-2">
                    <div>
                        <span class="text-[9px] uppercase font-bold text-slate-400">Desayuno</span>
                        <input type="text" placeholder="Añadir..." value="${meal.breakfast || ''}" onchange="updateMeal('${day}', 'breakfast', this.value)" class="w-full bg-cream-100 dark:bg-charcoal-950 p-1.5 rounded-lg border-0 outline-none text-[11px] font-medium">
                    </div>
                    <div>
                        <span class="text-[9px] uppercase font-bold text-slate-400">Comida</span>
                        <input type="text" placeholder="Añadir..." value="${meal.lunch || ''}" onchange="updateMeal('${day}', 'lunch', this.value)" class="w-full bg-cream-100 dark:bg-charcoal-950 p-1.5 rounded-lg border-0 outline-none text-[11px] font-bold text-terracotta-600 dark:text-terracotta-400">
                    </div>
                    <div>
                        <span class="text-[9px] uppercase font-bold text-slate-400">Snack</span>
                        <input type="text" placeholder="Añadir..." value="${meal.snack || ''}" onchange="updateMeal('${day}', 'snack', this.value)" class="w-full bg-cream-100 dark:bg-charcoal-950 p-1.5 rounded-lg border-0 outline-none text-[11px] font-medium">
                    </div>
                    <div>
                        <span class="text-[9px] uppercase font-bold text-slate-400">Cena</span>
                        <input type="text" placeholder="Añadir..." value="${meal.dinner || ''}" onchange="updateMeal('${day}', 'dinner', this.value)" class="w-full bg-cream-100 dark:bg-charcoal-950 p-1.5 rounded-lg border-0 outline-none text-[11px] font-medium">
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Render Recipes Cards
    const recipeContainer = document.getElementById('recipes-container');
    if (store.recipes.length === 0) {
        recipeContainer.innerHTML = `
            <div class="col-span-full p-6 text-center glass-card rounded-2xl space-y-2 border border-sand-200/60 dark:border-slate-800">
                <p class="text-xs font-bold text-slate-400">Sin recetas guardadas.</p>
                <button onclick="openModal('modal-recipe')" class="text-xs text-terracotta-500 font-bold underline">Añade tu primera receta</button>
            </div>`;
    } else {
        recipeContainer.innerHTML = store.recipes.map(r => `
            <div class="glass-card p-4 rounded-2xl border border-sand-200/60 dark:border-slate-800 space-y-2">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-xs">${r.title}</h4>
                    <span class="text-[10px] font-bold text-amber-500"><i class="fa-regular fa-clock mr-1"></i>${r.prep}</span>
                </div>
                <div class="flex flex-wrap gap-1 pt-1">
                    ${r.ingredients.map(i => `<span class="px-2 py-0.5 rounded-md bg-sand-200/60 dark:bg-charcoal-800 text-[10px] text-slate-600 dark:text-slate-300">${i}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }
}

function updateMeal(day, type, val) {
    if (!store.meals[day]) store.meals[day] = {};
    store.meals[day][type] = val;
    store.save('meals');
}

function handleAddRecipe(e) {
    e.preventDefault();
    const ingredientsInput = document.getElementById('recipe-ingredients').value;
    store.recipes.push({
        id: Date.now(),
        title: document.getElementById('recipe-title').value,
        prep: document.getElementById('recipe-prep').value,
        ingredients: ingredientsInput.split(',').map(item => item.trim())
    });
    store.save('recipes');
    renderMeals();
    closeModal('modal-recipe');
    document.getElementById('form-recipe').reset();
    showToast('Receta guardada');
}

function generateShoppingFromMeals() {
    let count = 0;
    Object.values(store.meals).forEach(m => {
        if (m.lunch && m.lunch.trim() !== '') {
            store.shopping.push({ id: Date.now() + Math.random(), name: `Ingrediente: ${m.lunch}`, category: 'Frescos', price: 0, bought: false });
            count++;
        }
    });
    if (count > 0) {
        store.save('shopping');
        renderShopping();
        showToast(`Añadidos ${count} elementos a la lista de la compra`);
    } else {
        showToast('Planifica tus comidas primero', 'error');
    }
}

// --- SHOPPING LOGIC ---
function renderShopping() {
    const container = document.getElementById('shopping-categories-grid');
    const categories = ['Frescos', 'Despensa', 'Limpieza', 'Farmacia'];

    let total = 0;
    let bought = 0;

    store.shopping.forEach(s => {
        total += Number(s.price || 0);
        if (s.bought) bought++;
    });

    document.getElementById('shopping-total-price').textContent = `${total.toFixed(2)} €`;
    document.getElementById('shopping-bought-progress').textContent = `${bought} / ${store.shopping.length}`;

    container.innerHTML = categories.map(cat => {
        const items = store.shopping.filter(s => s.category === cat);
        return `
            <div class="glass-card p-4 rounded-2xl border border-sand-200/60 dark:border-slate-800 space-y-3">
                <div class="flex items-center justify-between border-b pb-2 border-sand-200 dark:border-slate-800">
                    <h4 class="font-bold text-xs uppercase text-terracotta-500">${cat}</h4>
                    <span class="text-[10px] font-bold text-slate-400">${items.length} items</span>
                </div>
                <div class="space-y-2">
                    ${items.length === 0 ? '<p class="text-[11px] text-slate-400 py-2">Sin artículos</p>' : items.map(item => `
                        <div class="flex items-center justify-between p-2 rounded-xl bg-cream-100 dark:bg-charcoal-950">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" ${item.bought ? 'checked' : ''} onchange="toggleShopping(${item.id})" class="w-4 h-4 rounded text-terracotta-500">
                                <span class="text-xs font-medium ${item.bought ? 'line-through text-slate-400' : ''}">${item.name}</span>
                            </div>
                            <button onclick="deleteShopping(${item.id})" class="text-slate-400 hover:text-rose-500 text-xs"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function toggleShopping(id) {
    const item = store.shopping.find(s => s.id === id);
    if (item) {
        item.bought = !item.bought;
        store.save('shopping');
        renderShopping();
    }
}

function deleteShopping(id) {
    store.shopping = store.shopping.filter(s => s.id !== id);
    store.save('shopping');
    renderShopping();
}

function clearBoughtShopping() {
    store.shopping = store.shopping.filter(s => !s.bought);
    store.save('shopping');
    renderShopping();
    showToast('Artículos comprados eliminados');
}

function handleAddShopping(e) {
    e.preventDefault();
    store.shopping.push({
        id: Date.now(),
        name: document.getElementById('shop-name').value,
        category: document.getElementById('shop-cat').value,
        price: parseFloat(document.getElementById('shop-price').value) || 0,
        bought: false
    });
    store.save('shopping');
    renderShopping();
    closeModal('modal-shopping');
    document.getElementById('form-shopping').reset();
    showToast('Artículo añadido');
}

// --- ROUTINES LOGIC ---
function renderRoutines() {
    const morningContainer = document.getElementById('morning-routines-container');
    const eveningContainer = document.getElementById('evening-routines-container');

    const morning = store.routines.filter(r => r.period === 'morning');
    const evening = store.routines.filter(r => r.period === 'evening');

    document.getElementById('morning-count-badge').textContent = `${morning.filter(r => r.done).length}/${morning.length}`;
    document.getElementById('evening-count-badge').textContent = `${evening.filter(r => r.done).length}/${evening.length}`;

    morningContainer.innerHTML = morning.length === 0 ? '<p class="text-xs text-slate-400">Sin rutinas para la mañana.</p>' : morning.map(r => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-cream-100 dark:bg-charcoal-950">
            <div class="flex items-center gap-3">
                <input type="checkbox" ${r.done ? 'checked' : ''} onchange="toggleRoutine(${r.id})" class="w-4 h-4 rounded text-amber-500">
                <span class="text-xs font-bold ${r.done ? 'line-through text-slate-400' : ''}">${r.name}</span>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-[10px] font-bold text-amber-500"><i class="fa-solid fa-fire mr-1"></i>${r.streak || 0}d</span>
                <button onclick="deleteRoutine(${r.id})" class="text-slate-400 hover:text-rose-500 text-xs"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    eveningContainer.innerHTML = evening.length === 0 ? '<p class="text-xs text-slate-400">Sin rutinas para la noche.</p>' : evening.map(r => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-cream-100 dark:bg-charcoal-950">
            <div class="flex items-center gap-3">
                <input type="checkbox" ${r.done ? 'checked' : ''} onchange="toggleRoutine(${r.id})" class="w-4 h-4 rounded text-indigo-400">
                <span class="text-xs font-bold ${r.done ? 'line-through text-slate-400' : ''}">${r.name}</span>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-[10px] font-bold text-indigo-400"><i class="fa-solid fa-fire mr-1"></i>${r.streak || 0}d</span>
                <button onclick="deleteRoutine(${r.id})" class="text-slate-400 hover:text-rose-500 text-xs"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function toggleRoutine(id) {
    const r = store.routines.find(item => item.id === id);
    if (r) {
        r.done = !r.done;
        if (r.done) {
            r.streak = (r.streak || 0) + 1;
        } else {
            r.streak = Math.max(0, (r.streak || 1) - 1);
        }
        store.save('routines');
        renderRoutines();
    }
}

function deleteRoutine(id) {
    store.routines = store.routines.filter(r => r.id !== id);
    store.save('routines');
    renderRoutines();
}

function handleAddRoutine(e) {
    e.preventDefault();
    store.routines.push({
        id: Date.now(),
        name: document.getElementById('routine-name').value,
        period: document.getElementById('routine-period').value,
        done: false,
        streak: 0
    });
    store.save('routines');
    renderRoutines();
    closeModal('modal-routine');
    document.getElementById('form-routine').reset();
    showToast('Rutina creada');
}

// --- MEDS LOGIC ---
function renderMeds() {
    const container = document.getElementById('meds-container');
    if (store.meds.length === 0) {
        container.innerHTML = `
            <div class="col-span-full p-8 text-center glass-card rounded-2xl border border-sand-200/60 dark:border-slate-800 space-y-2">
                <p class="text-xs font-bold text-slate-400">No hay medicamentos registrados en el botiquín.</p>
                <button onclick="openModal('modal-med')" class="text-xs text-terracotta-500 font-bold underline">Registrar primer medicamento</button>
            </div>`;
        return;
    }

    container.innerHTML = store.meds.map(m => `
        <div class="glass-card p-5 rounded-2xl border border-sand-200/60 dark:border-slate-800 space-y-3 relative">
            ${m.stock <= 5 ? '<span class="absolute top-3 right-3 bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Stock Bajo</span>' : ''}
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <i class="fa-solid fa-capsules text-lg"></i>
                </div>
                <div>
                    <h4 class="font-extrabold text-xs">${m.name}</h4>
                    <span class="text-[11px] text-slate-400">${m.dose} • ${m.time} hrs</span>
                </div>
            </div>
            ${m.expiry ? `<div class="text-[10px] text-slate-400 font-semibold"><i class="fa-regular fa-calendar text-terracotta-500 mr-1"></i>Caducidad: ${m.expiry}</div>` : ''}
            <div class="flex items-center justify-between pt-2 border-t border-sand-200/40 dark:border-slate-800 text-xs font-bold">
                <span>Stock: <strong class="${m.stock <= 5 ? 'text-rose-500' : ''}">${m.stock} uds</strong></span>
                <button onclick="takeMed(${m.id})" ${m.takenToday ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl text-xs font-bold ${m.takenToday ? 'bg-sage-100 text-sage-600' : 'bg-terracotta-500 text-white shadow-md'}">
                    ${m.takenToday ? 'Toma Hoy ✅' : 'Tomar (-1)'}
                </button>
            </div>
        </div>
    `).join('');
}

function takeMed(id) {
    const m = store.meds.find(item => item.id === id);
    if (m && !m.takenToday && m.stock > 0) {
        m.takenToday = true;
        m.stock -= 1;
        store.save('meds');
        renderMeds();
        showToast(`Dosis registrada para ${m.name}`);
    }
}

function handleAddMed(e) {
    e.preventDefault();
    store.meds.push({
        id: Date.now(),
        name: document.getElementById('med-name').value,
        dose: document.getElementById('med-dose').value,
        time: document.getElementById('med-time').value,
        stock: parseInt(document.getElementById('med-stock').value) || 0,
        expiry: document.getElementById('med-expiry').value || '',
        takenToday: false
    });
    store.save('meds');
    renderMeds();
    closeModal('modal-med');
    document.getElementById('form-med').reset();
    showToast('Medicina registrada');
}

// --- PROJECTS KANBAN LOGIC ---
function renderProjects() {
    const colTodo = document.getElementById('proj-col-todo');
    const colDoing = document.getElementById('proj-col-doing');
    const colDone = document.getElementById('proj-col-done');

    const todo = store.projects.filter(p => p.status === 'todo');
    const doing = store.projects.filter(p => p.status === 'doing');
    const done = store.projects.filter(p => p.status === 'done');

    document.getElementById('proj-todo-count').textContent = todo.length;
    document.getElementById('proj-doing-count').textContent = doing.length;
    document.getElementById('proj-done-count').textContent = done.length;

    const renderCard = p => `
        <div class="p-3 rounded-2xl bg-cream-100 dark:bg-charcoal-950 border border-sand-200/50 dark:border-slate-800 space-y-2">
            <h5 class="font-bold text-xs">${p.title}</h5>
            <p class="text-[11px] text-slate-400">${p.desc}</p>
            <div class="flex items-center justify-between pt-2 border-t border-sand-200/30">
                <button onclick="moveProject(${p.id}, 'prev')" class="text-slate-400 hover:text-terracotta-500 text-xs"><i class="fa-solid fa-chevron-left"></i></button>
                <button onclick="deleteProject(${p.id})" class="text-slate-400 hover:text-rose-500 text-[10px]"><i class="fa-solid fa-trash"></i></button>
                <button onclick="moveProject(${p.id}, 'next')" class="text-slate-400 hover:text-terracotta-500 text-xs"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    `;

    colTodo.innerHTML = todo.length === 0 ? '<p class="text-xs text-slate-400 py-2">Vacío</p>' : todo.map(renderCard).join('');
    colDoing.innerHTML = doing.length === 0 ? '<p class="text-xs text-slate-400 py-2">Vacío</p>' : doing.map(renderCard).join('');
    colDone.innerHTML = done.length === 0 ? '<p class="text-xs text-slate-400 py-2">Vacío</p>' : done.map(renderCard).join('');
}

function moveProject(id, dir) {
    const p = store.projects.find(item => item.id === id);
    if (!p) return;
    const flow = ['todo', 'doing', 'done'];
    let idx = flow.indexOf(p.status);
    if (dir === 'next' && idx < 2) p.status = flow[idx + 1];
    if (dir === 'prev' && idx > 0) p.status = flow[idx - 1];
    store.save('projects');
    renderProjects();
}

function deleteProject(id) {
    store.projects = store.projects.filter(p => p.id !== id);
    store.save('projects');
    renderProjects();
}

function handleAddProject(e) {
    e.preventDefault();
    store.projects.push({
        id: Date.now(),
        title: document.getElementById('proj-title').value,
        desc: document.getElementById('proj-desc').value,
        status: 'todo'
    });
    store.save('projects');
    renderProjects();
    closeModal('modal-project');
    document.getElementById('form-project').reset();
    showToast('Nuevo proyecto añadido');
}

// --- INIT APP ---
window.addEventListener('DOMContentLoaded', () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    document.getElementById('current-date-badge').innerHTML = `<i class="fa-regular fa-calendar-days text-terracotta-500 mr-2"></i> ${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}`;

    updateDashboard();
    renderTasks();
    renderMeals();
    renderShopping();
    renderRoutines();
    renderMeds();
    renderProjects();
});