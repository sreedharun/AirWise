# AirWise — Urban Air Quality Assistant & Health Advisor

> An accessible, offline-first urban air quality intelligence web application built for hackathon evaluation across **Code Quality**, **Security**, **Efficiency**, **Testing**, **Accessibility (WCAG 2.1 AA)**, and **Problem Statement Alignment**.

---

## 🌐 Live Demo & Deployment

- **Repository**: [https://github.com/sreedharun/AirWise](https://github.com/sreedharun/AirWise)
- **Live Demo**: [https://air-wise-sand.vercel.app/](https://air-wise-sand.vercel.app/)
- **Production Build**: Zero server-side runtime needed — compiles to pure static HTML, CSS, and JavaScript.

### Deploying to Vercel

1. Import the repository into your Vercel Dashboard.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Install Command: `npm install`
5. The included `vercel.json` automatically enforces all security headers (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`).

---

## 🌍 The Problem

City residents struggle to interpret raw air quality readings (e.g., `45 µg/m³ PM₂.₅`) or understand what practical protective actions to take. Standard weather widgets give abstract numbers without actionable advice for specific vulnerabilities (such as children playing outside, asthmatic residents commuting, or athletes training).

**AirWise** bridges this gap: search any city or use your device location to receive real-time US AQI readings, a 6-pollutant breakdown with plain-language explanations, an interactive 48-hour hourly forecast with optimal time windows in the city's local time, and an offline deterministic assistant delivering tailored guidance across 5 health profiles.

---

## 🎯 Challenge Requirements & Solution Architecture

### 1. Chosen Vertical & Persona Targeting
- **Chosen Vertical**: **Urban Environmental Health & Air Quality Intelligence**
- **Target Personas & Logics**:
  1. `general` — **General Public**: Baseline commuters and residents seeking everyday outdoor and ventilation advice.
  2. `children` — **Children & Teenagers**: Higher minute ventilation, developing respiratory systems, and active outdoor play.
  3. `elderly` — **Older Adults / Seniors**: Increased vulnerability to cardiovascular stress and compromised lung capacity.
  4. `respiratory` — **Asthma, COPD & Respiratory Sensitivities**: High bronchial hyperreactivity; triggers specific reliever inhaler and N95 warnings.
  5. `athletes` — **Outdoor Athletes & Workers**: Sustained deep-inhalation exposure; triggers exercise intensity adjustments and optimal training window analysis.

### 2. Approach and Logic
- **Context-Aware Decision Matrix**: Rather than generic weather summaries, AirWise runs a deterministic 30-case matrix (6 US EPA AQI tiers × 5 vulnerability groups) grounded in EPA and WHO clinical literature.
- **Categorical Protection Outputs**: Every state produces specific, actionable recommendations across 5 categories:
  - **Outdoor Activity**: Exercise adjustments, intensity modulation, or staying indoors.
  - **Masks**: Specific guidance on N95/FFP2/KN95 particle filtration when PM2.5 or PM10 exceeds safe thresholds.
  - **Ventilation**: Guidance on whether to open windows for fresh air or seal living spaces.
  - **Air Purifiers**: Operating instructions for HEPA filters and recirculation settings.
  - **Special Precautions**: Reliever inhaler accessibility, symptom vigilance, and emergency alerts.
- **Dynamic "Assistant" Engine**: Chat-like interactive inquiries provide instant answers without external LLM dependencies, ensuring zero latency, zero API costs, zero hallucination risk, and 100% offline functionality.

### 3. How the Solution Works (End-to-End Flow)
1. **Input & Geolocation**: User inputs a city (sanitized against XSS, debounced by 300 ms) or grants geolocation permissions.
2. **Two-Tier Caching**: Checks in-memory cache and `sessionStorage` (5-min air quality, 10-min geocoding) to serve instant responses and support offline viewing.
3. **Data Fetching & Normalization**: Securely calls Open-Meteo's Air Quality API over HTTPS with `&timezone=auto` and an 8-second `AbortController` timeout.
4. **Real-time Assessment**: Computes dominant US AQI category, positions the continuous gauge, and evaluates 6 key pollutants with plain-language explanations.
5. **48-Hour Forecast & Analysis**: Parses hourly data directly in the city's local wall-clock time, plots the trend on a custom responsive SVG chart (<6 KB), and identifies the optimal outdoor time window.
6. **Accessible & Responsive Delivery**: Renders through WCAG 2.1 AA certified UI with colorblind-safe patterns, live screen-reader regions (`aria-live="polite"`), and an alternate Data Table view.

### 4. Assumptions Made
See the detailed **[Assumptions & Limitations](#-assumptions--limitations)** section below detailing the Copernicus CAMS/NOAA GFS ~11 km spatial resolution, 1-hour model update cycles, and offline local cache boundaries.

---

## 🏆 Hackathon Evaluation Criteria Alignment

### 1. Code Quality

- **Modular Directory Architecture**: Clear separation of concerns:
  - `/src/api`: Fetch wrapper with timeout, AbortController, sanitization, and typing.
  - `/src/utils`: Pure mathematical and analytical functions (`aqi.ts`, `adviceEngine.ts`, `forecast.ts`, `cache.ts`, `sanitize.ts`).
  - `/src/components`: Focused, single-responsibility React components.
  - `/src/hooks`: Custom React hooks (`useDebounce`, `useAirQuality`, `useGeolocation`, `useOnlineStatus`).
- **Strict TypeScript & Zero `any`**: 100% type safety with `noEmit`, strict null checks, and interfaces for all payloads.
- **ESLint & Prettier**: Configured with modern flat config (`eslint.config.js` and `.prettierrc`) and enforced via `npm run lint` (`--max-warnings 0`) and `npm run format`.
- **Pure Functions & Zero Duplication**: Centralized breakpoints, color tokens, and pollutant thresholds.

### 2. Security

- **No API Keys or Secrets**: Built using Open-Meteo's open data APIs requiring zero sensitive environment variables or committed keys.
- **Zero Injections**: Absolutely no `dangerouslySetInnerHTML` or `eval()`.
- **Strict Content Security Policy (CSP)**: Configured in `index.html` and `vercel.json`:
  ```html
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com; object-src 'none'; base-uri 'self';"
  />
  ```
  > **Note on `style-src 'unsafe-inline'`**: Required strictly for React dynamic inline style attributes (`style={{ backgroundColor: ..., left: ... }}`) that dynamically position the continuous AQI gauge marker and render real-time category tinting without introducing heavy runtime CSS-in-JS dependencies.
- **Security Headers (`vercel.json`)**:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(self)`
  - `X-Frame-Options: DENY`
- **HTTPS Enforcement**: Network client strictly rejects insecure HTTP URLs.
- **Input Sanitization & Coordinate Validation**:
  - Search queries strip script tags, style tags, and illegal characters while preserving international city characters (e.g. `São Paulo`, `München`).
  - Geographic coordinates validated to ensure `latitude ∈ [-90, 90]` and `longitude ∈ [-180, 180]`.
- **Network Resilience**: Automatic 8-second request timeouts and stale request cancellation via `AbortController`.

### 3. Efficiency & Performance

- **Zero Heavy UI / Chart Dependencies**: Built with plain CSS design tokens and a **custom lightweight SVG chart** (<5 KB) instead of Chart.js, avoiding 200+ KB of runtime overhead.
- **Micro-Bundle Size**: Total production JavaScript is only **~95 kB gzipped** (code-split: 92.8 kB initial bundle + 2.2 kB lazy-loaded chart bundle); production CSS is only **~5.5 kB gzipped** (25.5 kB raw).
- **Clean Repository Size**: The entire repository is **~1.8 MB** (well under the 10 MB hackathon ceiling).
- **Search Debouncing**: 300 ms debounce prevents excessive API requests while typing.
- **Two-Tier TTL Cache**: In-memory `Map` with `sessionStorage` fallback (5-minute TTL for air quality, 10-minute TTL for geocoding) eliminates duplicate requests and supports immediate offline retrieval.
- **Request Cancellation**: Automatically aborts previous in-flight requests when a user rapidly switches cities.

### 4. Testing & Code Coverage

- **Vitest + React Testing Library + vitest-axe + v8 Coverage**:
  - **106 passing automated tests** across **16 test suites** with **94.4% statement coverage** and **90.3% function coverage**.
  - **Automated Accessibility Testing (`vitest-axe`)**: Automated axe assertions testing the main screen and components for zero WCAG violations.
  - **Custom Hook Tests**: Comprehensive test suites for `useDebounce`, `useGeolocation`, and `useOnlineStatus`.
  - **Exhaustive Advice Matrix Testing**: Every AQI category (6) × every vulnerability group (5) = all 30 combinations verified for completeness, headlines, 5 action categories, and dos/donts.
  - Component tests for Search autocomplete, keyboard navigation, Geolocation permission denials, SVG chart interactions, data table alternate view, and chat inquiries.
  - Continuous Integration via GitHub Actions (`.github/workflows/ci.yml`).

### 5. Accessibility (WCAG 2.1 AA Compliant)

- **Colorblind-Safe Design**: Colors are **never** the sole indicator of danger. Every AQI tier pairs color with:
  1. Clear text label (`Good`, `Moderate`, `Unhealthy for Sensitive Groups`, `Unhealthy`, `Very Unhealthy`, `Hazardous`)
  2. Distinct graphical icon (`🌿`, `⛅`, `⚠️`, `😷`, `🛑`, `☣️`)
  3. Tactile SVG background pattern (dots, stripes, cross-hatching, diamonds, mesh).
- **Decorative Emojis**: All decorative emojis and icons explicitly carry `aria-hidden="true"`.
- **Sufficient Contrast**: All text and background combinations meet or exceed WCAG 2.1 AA 4.5:1 contrast ratios.
- **Semantic HTML Landmarks**: `<header role="banner">`, `<main id="main-content">`, `<section>`, `<article>`, `<aside>`, and `<footer role="contentinfo">`.
- **Accessible Navigation**:
  - High-visibility focus indicators (`:focus-visible` with 3px high-contrast outline).
  - Accessible "Skip to main content" link for keyboard and screen reader users.
  - Full keyboard navigation across city suggestions, health profile radio groups, and pollutant accordions.
- **Screen Reader Announcements**: Live region (`aria-live="polite"`) announces fresh air quality updates whenever data loads.
- **Chart Accessibility**:
  - SVG chart contains `role="img"` and descriptive `aria-label`.
  - Accessible interactive **Data Table toggle** allowing users to inspect all 48 hours in a semantic tabular format.
- **Motion Sensitivity**: Strictly respects `@media (prefers-reduced-motion: reduce)`.

### 6. Problem Statement Alignment

- **City Search & Geolocation**: Instant search with suggestions + "Use My Location" button with courteous, graceful permission-denied fallback messages.
- **Current AQI Hero Card**: Clear US AQI value, category name, colorblind pattern badge, gauge position, and 6-pollutant breakdown (PM2.5, PM10, NO2, O3, CO, SO2) with plain-language definitions and direct health effects.
- **48-Hour Forecast in City Local Time**: Hourly forecast using Open-Meteo's `timezone=auto` where time formatting and the highlighted text summary (e.g. `"Air quality is best tomorrow around 6 AM local time (AQI 22)"`) always reflect the city's local wall-clock time.
- **Tailored Health Advisor ("Assistant")**: Rule-based, deterministic offline advisor with 5 distinct groups:
  1. `general` (General Public)
  2. `children` (Children & Teens)
  3. `elderly` (Older Adults / Seniors)
  4. `respiratory` (Asthma & Respiratory Conditions)
  5. `athletes` (Outdoor Athletes & Workers)
  - Features action cards for **Exercise/Activity**, **Masks (N95/FFP2)**, **Windows/Ventilation**, **Air Purifiers (HEPA)**, and **Special Precautions**.
  - Interactive chat layout with one-click questions ("Can I exercise outdoors right now?", "Should I wear a mask outside?") providing instant, deterministic advice.
- **States**: First-class loading skeletons (`aria-busy`), error banner with retry button, empty state, and live offline indicator.

---

## 🛠️ Tech Stack

| Technology                | Purpose                                                     |
| :------------------------ | :---------------------------------------------------------- |
| **React 19**              | Modern UI rendering and component architecture              |
| **TypeScript 5.7**        | Strict type safety and compilation verification             |
| **Vite 6**                | Instant HMR development and optimized production bundling   |
| **Vitest 3**              | Fast test runner with native ESM support                    |
| **React Testing Library** | User-centric accessibility and component testing            |
| **vitest-axe**            | Automated WCAG 2.1 accessibility auditing                   |
| **ESLint & Prettier**     | Code style, syntax, and hooks linting                       |
| **Open-Meteo APIs**       | Open-source Air Quality & Geocoding endpoints (no API keys) |
| **Pure CSS**              | High-performance design tokens and custom variables         |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18.0.0` or higher (tested on Node `v24.16.0`)
- npm `v9.0.0` or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/sreedharun/AirWise.git
cd AirWise

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Linting & Formatting

```bash
# Run ESLint check
npm run lint

# Format code with Prettier
npm run format
```

### Running Tests & Coverage

```bash
# Run 106 unit, a11y, and component tests
npm test

# Run tests with code coverage report
npm run test:coverage
```

### Building for Production

```bash
# Typecheck and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
airwise/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions workflow (npm ci, lint, test, build)
├── .gitignore               # Clean git exclusions
├── .prettierrc              # Prettier code formatting rules
├── .prettierignore          # Prettier ignored paths
├── eslint.config.js         # ESLint flat config with TypeScript & React Hooks
├── index.html               # Entry HTML with Content Security Policy
├── package.json             # Scripts and dependencies
├── tsconfig.json            # Strict TypeScript compiler options
├── vercel.json              # Vercel deployment headers (CSP, nosniff, permissions)
├── vite.config.ts           # Vite and Vitest configuration
├── src/
│   ├── main.tsx             # Application bootstrap
│   ├── App.tsx              # Root coordinator component
│   ├── api/
│   │   ├── client.ts        # HTTPS fetch wrapper with timeout & AbortController
│   │   ├── geocoding.ts     # City search API integration & validation
│   │   ├── airQuality.ts    # Air quality fetch, parsing, and caching
│   │   └── types.ts         # Shared data contracts and types
│   ├── utils/
│   │   ├── aqi.ts           # AQI breakpoints, colorblind patterns & pollutant metadata
│   │   ├── adviceEngine.ts  # Deterministic 30-case rule-based health advisor
│   │   ├── forecast.ts      # 48-hour hourly parser & local time analysis
│   │   ├── cache.ts         # Memory + sessionStorage TTL caching service
│   │   └── sanitize.ts      # Input sanitization and coordinate validator
│   ├── hooks/
│   │   ├── useDebounce.ts   # Debounce hook for smooth search
│   │   ├── useAirQuality.ts # Main state manager with AbortController
│   │   ├── useGeolocation.ts# Geolocation hook with graceful permission denied handling
│   │   └── useOnlineStatus.ts# Online/offline network event listener
│   ├── components/
│   │   ├── Header.tsx       # Semantic header, branding, and offline badge
│   │   ├── SearchBar.tsx    # Debounced search, suggestions, and quick picks
│   │   ├── GroupSelector.tsx# Accessible radio group for vulnerability profiles
│   │   ├── CurrentAQICard.tsx# Current US AQI hero with gauge & colorblind pattern
│   │   ├── PollutantCard.tsx# Individual pollutant card with health impact explanation
│   │   ├── ForecastChart.tsx# Responsive custom SVG chart & data table alternate
│   │   ├── AssistantPanel.tsx# Chat-style deterministic health guidance
│   │   ├── LoadingSkeleton.tsx# Screen-reader accessible loading skeleton
│   │   ├── ErrorBanner.tsx  # Error notification with retry trigger
│   │   ├── EmptyState.tsx   # Welcome prompt with quick explore link
│   │   ├── MedicalDisclaimer.tsx# Prominent health guidance disclaimer
│   │   └── Footer.tsx       # Attribution, credits, and WCAG statements
│   ├── styles/
│   │   ├── variables.css    # Design tokens, colorblind SVG patterns, focus rings
│   │   ├── components.css   # Extracted modular CSS for cards, gauge, chart, and advisor
│   │   └── global.css       # Accessible CSS reset, layout, and reduced motion
│   └── test/
│       ├── setup.ts         # Testing Library setup & vitest-axe matchers
│       ├── a11y.test.tsx    # vitest-axe automated WCAG 2.1 AA accessibility tests
│       ├── aqi.test.ts      # AQI categorization & pollutant unit tests
│       ├── adviceEngine.test.ts# 30-combination matrix tests
│       ├── sanitize.test.ts # Input validation & sanitization tests
│       ├── cache.test.ts    # Caching and TTL tests
│       ├── forecast.test.ts # Forecast parser & city local time tests
│       ├── api.test.ts      # Client HTTPS, geocoding, and fetchAirQuality tests
│       ├── useDebounce.test.ts # Debounce hook unit tests
│       ├── useGeolocation.test.ts # Geolocation hook unit tests
│       ├── useOnlineStatus.test.ts # Online/offline hook unit tests
│       ├── SearchBar.test.tsx# Search & geolocation component tests
│       ├── CurrentAQICard.test.tsx# AQI card & pollutant breakdown tests
│       ├── ForecastChart.test.tsx # Chart rendering & table toggle tests
│       ├── AssistantPanel.test.tsx# Advisor actions & chat stream tests
│       └── App.test.tsx     # Full integration tests
```

---

## 🔍 Assumptions & Limitations

1. **Modeled Atmospheric Data**: Open-Meteo's Air Quality API combines high-resolution Copernicus Atmosphere Monitoring Service (CAMS) models and NOAA GFS atmospheric chemical transport models calibrated with satellite measurements (~11 km spatial grid). While providing global coverage without requiring physical sensors in every neighborhood, micro-scale anomalies (such as street canyons, active construction, or direct localized exhaust plumes) may differ from regional model averages.
2. **Temporal Resolution**: Hourly data represents model forecast intervals. Real-world spikes (e.g. sudden fireworks or localized burns) may have a latency of up to 1 hour before appearing in synoptic model updates.
3. **Geocoding Constraints**: Autocomplete queries trigger after 2 sanitized alphanumeric characters to minimize unnecessary API roundtrips.
4. **Offline Capability**: The rule-based health guidance assistant is 100% deterministic and offline-functional. Air quality values and forecasts are cached locally for 5 minutes; if offline, previously fetched city readings remain fully browsable.

---

## 🤖 Generative AI Usage

In compliance with hackathon transparency guidelines:

- **Architecture & Scaffolding**: Generative AI was used to draft initial architectural boundaries and generate the 30-case matrix for health advice based on standard EPA and WHO Air Quality Health Index (AQHI) clinical literature.
- **Accessibility Verification**: AI was utilized to audit color palettes against WCAG 2.1 AA contrast requirements and craft test fixtures for `vitest-axe`.
- **Test Scaffolding**: Assisted in generating boundary edge-case inputs for the sanitization suite and mocking Open-Meteo geocoding payloads.
- **Deterministic Implementation**: All runtime code, advice rules, and charting are deterministic, handwritten TypeScript with zero runtime AI API dependencies.

---

## ⚕️ Health & Medical Disclaimer

**All recommendations and air quality insights generated by AirWise are strictly informational and intended for general educational guidance only.** AirWise does not provide medical advice, diagnosis, or clinical treatment plans. Individuals with severe chronic obstructive pulmonary disease (COPD), active asthma exacerbations, cardiovascular disease, or acute breathing difficulties should follow the guidance of their personal medical provider or call emergency medical services immediately.

---

## 📜 API Attribution & Credits

- Atmospheric air quality data and 48-hour forecasts provided by the **[Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)**.
- Geographic search and city coordinates provided by the **[Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)**.
- Data licensed under **[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)**.
