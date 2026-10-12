# KazeChronik — Documentación Técnica & Arquitectura

## 1. Descripción del Proyecto
KazeChronik es una aplicación web full-stack progresiva (PWA) construida para la gestión integral de bibliotecas personales de videojuegos, registro de horas, análisis de estadísticas, bitácora táctica de notas y seguimiento de trofeos para jugadores.

---

## 2. Stack Tecnológico

- **Frontend & Server Rendering:** Astro (SSR habilitado para Vercel), JavaScript / TypeScript.
- **Estilos:** Tailwind CSS v4 con variables temáticas custom.
- **Base de Datos & Autenticación:** Supabase PostgreSQL con Row Level Security (RLS) y Supabase Auth.
- **APIs de Videojuegos:** RAWG API (Catálogo general, sugerencias y trofeos) y Steam API (Sincronización oficial de logros).
- **PWA & Offline First:** Service Workers custom (`sw.js`), manifest web y cola de acciones pendiente (`src/lib/syncQueue.ts`).

---

## 3. Especificación de Requisitos

### 3.1. Requisitos Funcionales (RF)
- **RF-01 Autenticación & Perfiles:** Registro, inicio de sesión (Supabase Auth) y perfiles de usuario personalizables (`/u/[username]`) con avatares, banners y biografía.
- **RF-02 Búsqueda Externa & Sugerencias:** Búsqueda en directo mediante RAWG API y módulo de recomendación automática de títulos afines.
- **RF-03 CRUD de Biblioteca & Filtros Avanzados:**
  - Control de estado: *Jugando*, *Completado*, *En Pausa*, *Abandonado*, *Backlog*.
  - Clasificación por Plataforma, Tienda y Etiquetas personalizadas.
  - Ordenamiento por Horas Jugadas, Calificación ★, % de Logros, Prioridad y Alfabético.
- **RF-04 Gamer Notebook:** Creación de notas enriquecidas por juego con soporte de imágenes locales/URL, listas de verificación (`[ ]` / `[x]`) y enlaces activos.
- **RF-05 Sincronización de Trofeos:** Lectura de trofeos desde Steam/RAWG con marcas de completitud y badge de Platinado.
- **RF-06 Metas Anuales:** Definición de objetivos numéricos anuales y barra de progreso de juegos completados.
- **RF-07 Modo Offline:** Persistencia en `localStorage` con envío diferido de queries mediante `syncQueue`.

### 3.2. Requisitos No Funcionales (RNF)
- **RNF-01 Rendimiento:** Renderizado híbrido en servidor (SSR) y cliente.
- **RNF-02 SEO & Social Sharing:** Inyección dinámica de metadatos Open Graph (OG) y Twitter Cards en las vistas de juegos y perfiles.
- **RNF-03 Seguridad RLS:** Isolación total de datos en PostgreSQL para que cada usuario solo gestione sus registros.

---

## 4. Estructura de Base de Datos (PostgreSQL en Supabase)

### Tabla: `profiles`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Corresponde con `auth.users.id` |
| `username` | Text (Unique) | Handle único del usuario |
| `display_name` | Text | Nombre visible en la plataforma |
| `bio` | Text | Biografía del jugador |
| `avatar_url` | Text | URL o DataURL del avatar |
| `banner_url` | Text | URL o DataURL de cabecera |

### Tabla: `user_library`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador del registro |
| `user_id` | UUID (FK) | Propietario del juego |
| `rawg_id` | BigInt | ID original de RAWG/Steam |
| `title` | Text | Título del videojuego |
| `cover_url` | Text | Imagen de portada |
| `platform` | Text | Plataforma principal |
| `store` | Text | Tienda / Origen |
| `status` | Text | Estado de juego (`playing`, `completed`, etc.) |
| `hours_played` | Numeric | Horas registradas |
| `rating` | Numeric | Calificación personal (1 a 10) |
| `review` | Text | Reseña o crítica redactada |
| `notes` | Text | Notas rápidas de bitácora |
| `tags` | Array (Text) | Lista de etiquetas asignadas |
| `is_favorite` | Boolean | Estado de favorito |
| `achievements_progress` | Integer | Porcentaje de trofeos completados |

### Tabla: `game_notes`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador de la nota |
| `game_id` | UUID (FK) | Juego asociado en `user_library` |
| `user_id` | UUID (FK) | Propietario de la nota |
| `category` | Text | `builds`, `map`, `puzzle`, `general` |
| `title` | Text | Título descriptivo |
| `content` | Text | Texto de la nota / checklists |
| `image_url` | Text | Captura o infografía adjunta |
| `is_pinned` | Boolean | Fijado al inicio de la bitácora |

---

## 📁 5. Arquitectura del Proyecto

```text
Game-Tracker/
├── public/                     # Service Worker, manifest PWA, SVGs e íconos
├── src/
│   ├── components/            # Componentes reutilizables UI
│   │   ├── common/            # Navbar, Footer, Toast, SEO, Shortcuts
│   │   └── CookieBanner.astro # Banner de consentimiento
│   ├── layouts/               # Plantilla base (Layout.astro)
│   ├── lib/                   # Clientes API y colas de sincronización
│   │   ├── rawg.js            # Cliente RAWG API
│   │   ├── supabase.js        # Cliente Supabase
│   │   └── syncQueue.ts       # Gestor de acciones offline
│   ├── pages/                 # Páginas de la aplicación (Astro SSR)
│   │   ├── api/               # Endpoints locales (Steam, búsqueda RAWG)
│   │   ├── game/[id].astro    # Detalle, Bitácora y Gamer Notebook
│   │   ├── u/[username].astro # Perfil público de jugador con OG Metas
│   │   ├── analytics.astro    # Módulo de métricas visuales
│   │   ├── dashboard.astro    # Biblioteca principal con ordenamiento y timeline
│   │   ├── goals.astro        # Gestión de metas anuales
│   │   ├── lists.astro        # Listas personalizadas
│   │   └── search.astro       # Buscador global
│   └── styles/                # Tailwind CSS v4 global
├── DOCUMENTACION.md           # Especificaciones técnicas del proyecto
└── README.md                  # Presentación para GitHub
```