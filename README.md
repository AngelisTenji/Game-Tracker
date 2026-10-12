# 🎮 KazeChronik — Your Personal Game Backlog & Journal

<p align="center">
  <img src="./public/favicon.svg" alt="KazeChronik Logo" width="100" height="100" />
</p>

<p align="center">
  <b>KazeChronik</b> es una plataforma web progresiva (PWA) de alto rendimiento para el seguimiento, gestión y análisis de colecciones de videojuegos, bitácoras personales, metas anuales y trofeos.
</p>

<p align="center">
  <a href="https://kazechronik.vercel.app"><img src="https://img.shields.io/badge/Demo-kazechronik.vercel.app-6366f1?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Astro-5.x-ff5e00?style=for-the-badge&logo=astro" alt="Astro" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase" alt="Supabase" />
</p>

---

## 🚀 Características Principales

- 📊 **Dashboard & Biblioteca Interactiva**:
  - Filtros rápidos por estado (*Jugando, Completado, Pendiente, En Pausa, Abandonado, Platinados, Favoritos*).
  - Filtros secundarios por plataforma (PC, PS5, Switch, Mobile, etc.), tienda/distribuidor y multi-etiquetas personalizadas (`#Sigilo`, `#Coop`, `#RPG`).
  - **Ordenamiento Avanzado**: Prioridad/Reciente, Tiempo Jugado, Valoración (1-10), % de Logros y Alfabético (A-Z).
  - **Timeline Gamer**: Módulo de actividad con los últimos hitos y actualizaciones en tiempo real.

- 📓 **Gamer Notebook & Bitácora**:
  - Reseñas personales y calificaciones detalladas.
  - Cuaderno táctico por juego (*Gamer Notebook*) para guardar *builds*, mapas, puzles, soluciones y capturas/infografías (subida local o URL).
  - Soporte de sintaxis rica: URLs cliqueables automáticas y listas de tareas interactivas (`[ ]` pendiente, `[x]` completado).

- 🏆 **Logros & Trofeos Sincronizados**:
  - Integración nativa con las APIs públicas de **Steam** y **RAWG**.
  - Contador de trofeos con porcentaje de completitud y badge interactivo **100% Platinado**.

- 🎯 **Metas Anuales & Analytics**:
  - Establecimiento y seguimiento de metas de juegos a completar por año.
  - Estadísticas visuales de tiempo invertido, porcentaje de avance y distribución por plataforma.

- 📁 **Listas Personalizadas**:
  - Agrupación libre de videojuegos en listas temáticas personalizadas (ej. *"Juegos de Terror 2026"*, *"Pendientes de Pasarme con Amigos"*).

- 📶 **Modo Offline & PWA Sync (Service Workers)**:
  - Funcionamiento híbrido con cola de sincronización en `localStorage` (`syncQueue.ts`).
  - Permite crear o editar notas, calificaciones y progresos sin conexión; los cambios se sincronizan automáticamente al recuperar internet.

- 🌐 **Perfil de Jugador & Social Sharing**:
  - Perfil público accesible desde `/u/[username]`.
  - Edición de avatar, biografía y banner de cabecera in-situ.
  - Tarjetas de presentación con metadatos **Open Graph (OG Images)** y **Twitter Cards** para una vista previa profesional al compartir enlaces en Discord, WhatsApp o X.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework Frontend** | [Astro](https://astro.build/) (Modo SSR / Server-First) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Backend & Base de Datos** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| **Iconografía** | [Lucide Astro](https://lucide.dev/) |
| **APIs Externas** | [RAWG Video Games Database API](https://rawg.io/apidocs) & Web API de Steam |
| **Despliegue** | [Vercel](https://vercel.com/) |

---

## 🗄️ Modelo de Base de Datos (Supabase PostgreSQL)

La aplicación utiliza las siguientes tablas principales con **Row Level Security (RLS)** activado:

- `profiles`: Datos públicos del usuario (`username`, `display_name`, `avatar_url`, `banner_url`, `bio`).
- `user_library`: Registro de biblioteca (`rawg_id`, `title`, `cover_url`, `platform`, `store`, `status`, `hours_played`, `rating`, `review`, `tags`, `is_favorite`).
- `game_notes`: Notas de la bitácora (*Gamer Notebook*) asociadas a cada juego (`category`, `title`, `content`, `image_url`, `is_pinned`).
- `custom_lists` & `custom_list_items`: Colecciones personalizadas definidas por el usuario.
- `user_goals`: Metas anuales de completitud de juegos.

---

## ⚙️ Configuración e Instalación Local

### 1. Clonar el repositorio

git clone [https://github.com/AngelisTenji/Game-Tracker.git](https://github.com/AngelisTenji/Game-Tracker.git)
cd Game-Tracker

### 2. Instalar dependencias

npm install

### 3. Variables de entorno

PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
PUBLIC_RAWG_API_KEY=
STEAM_API_KEY=

### 4. Ejecutar en Modo Desarrollo

npm run dev

## Autor

Desarrollado por Angel González (@AngelisTenji) | Estudiante de Ingeniería de Sistemas (UNERG), Venezuela.