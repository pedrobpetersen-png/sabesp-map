# CLAUDE.md — AI Assistant Guide for sabesp-map

## Project Overview

SABESP Sanitation Map — an interactive geospatial dashboard for SABESP (São Paulo's water/sewage utility) built with Next.js 14, Mapbox GL, Deck.gl, and Recharts. Visualizes water treatment plants (ETAs), sewage treatment plants (ETEs), reservoirs, pipelines, power plants, construction projects, and regional statistics across São Paulo state.

**Language**: Portuguese (Brazilian). All UI labels, data, and commit messages are in Portuguese.

**Disclaimer**: Data is illustrative for training/demonstration purposes — not for operational decisions.

## Tech Stack

- **Framework**: Next.js 14.2.5 (App Router, `"use client"` components)
- **Language**: TypeScript 5 (strict mode)
- **Mapping**: Mapbox GL 3.20 + react-map-gl 7.1 + Deck.gl 9.2 + Turf.js 7.3
- **Styling**: Tailwind CSS 3.4 + PostCSS
- **Charts**: Recharts 3.8
- **Font**: Inter (Google Fonts, loaded in layout.tsx)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout (font, metadata)
│   ├── page.tsx           # Main page — root state management
│   └── globals.css        # Tailwind directives + Mapbox custom styling
├── components/
│   ├── MapView.tsx                # Mapbox GL map rendering + all layers
│   ├── Sidebar.tsx                # Left sidebar: layer toggles, search, legend
│   ├── ReservoirDashboard.tsx     # Right panel: reservoir detail + charts
│   ├── UniversalizationPanel.tsx  # Right panel: universalization targets
│   └── RegionalComparison.tsx     # Right panel: regional statistics
├── data/                  # Static data files (no backend)
│   ├── etas.ts            # ~40 water treatment plants (SNIS data)
│   ├── etes.ts            # ~45 sewage treatment plants
│   ├── reservoirs.ts      # Reservoirs with history + forecast
│   ├── pipelines.ts       # Pipeline networks (LineString geometries)
│   ├── powerplants.ts     # Power generation facilities
│   ├── construction.ts    # Ongoing construction projects
│   └── regions.ts         # Regional polygons + coverage metrics
├── lib/
│   └── utils.ts           # Color schemes, formatters, utility functions
└── types/
    └── index.ts           # All TypeScript interfaces
```

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint (next/core-web-vitals)
```

## Environment Setup

Requires a single environment variable:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token
```

Copy `.env.example` to `.env.local` and add your Mapbox public token. Get one at https://account.mapbox.com/access-tokens/.

## Architecture & Key Patterns

### State Management
All application state lives in `page.tsx` (root) and flows down via props:
- Layer visibility toggles (8 layers)
- Selected reservoir / active panel
- Choropleth metric selection
- 3D buildings toggle

### Component Conventions
- All components are client-side (`"use client"` directive)
- `MapView` is dynamically imported with `ssr: false`
- Props are typed with explicit interfaces
- State via React hooks (useState, useCallback, useMemo, useEffect)

### Data Flow
Static TypeScript data → GeoJSON FeatureCollection → Mapbox Source/Layer. No backend API.

### Map Layer System
- Custom SVG icons generated as data URIs and loaded into Mapbox at runtime
- Click handlers trigger panel updates and fly-to animations
- Choropleth coloring via utility functions in `utils.ts`

### Path Alias
`@/*` maps to `./src/*` (configured in tsconfig.json)

## Naming & Style Conventions

- **Components**: PascalCase files and exports (`MapView.tsx`)
- **Data IDs**: prefixed pattern (`eta-001`, `ete-015`, `reg-020`)
- **Commit messages**: Portuguese, descriptive
- **SABESP Brand Colors**:
  - Blue `#005BAA` — water/ETAs
  - Green `#00A651` — reservoirs/universalization
  - Orange `#D97706` — ETEs
  - Amber `#F59E0B` — power plants
  - Orange `#F97316` — construction
- **Status colors**: Green ≥60%, Amber 30–60%, Red <30%

## Key Types (src/types/index.ts)

`ETA`, `ETE`, `Reservoir`, `Pipeline`, `PowerPlant`, `ConstructionWork`, `RegionData`, `LayerVisibility`, `ChoroplethMetric`

## Testing

No test infrastructure currently exists. No test files, test libraries, or test scripts.

## Notes for AI Assistants

- All user-facing text must be in **Portuguese (Brazilian)**
- Data is static — changes go in `src/data/*.ts` files
- When adding new map layers: add type in `types/index.ts`, data in `src/data/`, layer visibility in `LayerVisibility`, rendering in `MapView.tsx`, toggle in `Sidebar.tsx`
- Keep the single-page architecture — avoid adding new routes
- Mapbox token is the only external dependency; everything else is self-contained
- The codebase is ~4,600 LOC with no automated tests — manually verify changes via `npm run build` and `npm run lint`
