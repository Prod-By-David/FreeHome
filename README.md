# 🏡 FreeHome - Organización y Gestión Inteligente del Hogar

FreeHome es una aplicación web dinámica (SPA) diseñada para centralizar, organizar y simplificar todas las áreas operativas del hogar en una única interfaz intuitiva y moderna con diseño **Glassmorphic** y soporte nativo para **Modo Oscuro**.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica de la aplicación.
- **CSS3 / Tailwind CSS (v3 CDN)**: Estilos utilitarios, variables de color personalizadas y clases glassmorphic.
- **JavaScript (Vanilla ES6+)**: Lógica reactiva de la aplicación, manejo de eventos y gestión de modales.
- **FontAwesome (v6.4)**: Iconografía vectorial.
- **LocalStorage**: Persistencia de datos en el cliente (sin dependencias de backend).

---

## 🚀 Módulos e Funcionalidades Principal

**1. Dashboard Principal:**
- Vista general del estado del hogar (métricas de tareas, lista de la compra, medicinas y hábitos).
- Banners dinámicos para avisos urgentes (ej. medicamentos con stock bajo).
- Resumen del menú diario y tareas prioritarias.

**2. Tareas y Limpieza:**
- Gestión de tareas por zonas (Cocina, Salón, Baño, Dormitorios, Exterior).
- Filtrado por frecuencia (Diaria, Semanal, Mensual) y asignación de responsables.

**3. Planificador de Comidas y Recetas:**
- Menú semanal interactivo por días y tomas (Desayuno, Comida, Snack, Cena).
- Libro de recetas favoritas.
- Exportación automática: Añade ingredientes del menú a la lista de compra con un solo clic.

**4. Lista de la Compra Inteligente:**
- Organización por secciones/pasillos (Frescos, Despensa, Limpieza, Farmacia).
- Cálculo automático del presupuesto total estimado.

**5. Rutinas Diarias y Hábitos:**
- Seguimiento de rutinas de Mañana y Noche con contador de racha (streak).

**6. Botiquín y Salud:**
- Control de inventario de medicamentos, dosis, horarios y fechas de caducidad.
- Alerta visual automática para stock crítico (≤ 5 unidades).

**7. Proyectos del Hogar (Kanban):**
- Control de inventario de medicamentos, dosis, horarios y fechas de caducidad.
- Tablero Kanban interactivo para mejoras y remodelaciones con columnas Por Hacer, En Proceso y Completado.

---

## 💻 Instalación y Uso

- **Clona o descarga el repositorio en tu equipo.**
- **Abre el archivo index.html en cualquier navegador web moderno (Chrome, Firefox, Edge, Safari).**
- **¡Listo! La aplicación comenzará a guardar automáticamente tu información localmente en tu navegador.**

---

## 📂 Estructura del Proyecto

```text
freehome/
│
├── css/
│   └── styles.css          # Estilos personalizados y componentes UI
│
├── js/
│   └── app.js              # Lógica del estado, modales y renderizado dinámico
│
├── index.html              # Estructura principal y navegación SPA
└── README.md               # Documentación del proyecto