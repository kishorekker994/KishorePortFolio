# Portfolio Redesign

## Direction

An editorial aviation portfolio with a persistent Three.js aircraft, orange and black primary colors, and very pale lavender supporting surfaces (#f6f3fc and #efebf8) instead of white backgrounds. Black chapter bands alternate with lavender surfaces. Bright orange commands use black labels; orange text on light backgrounds uses a deeper shade for contrast. Dot grids, drafting grids and diagonal-line textures add structure behind the content.

The active page contains 15 portfolio chapters and six additional full-width flight-story moments. The hero and In Motion chapter also participate in the eight-part storyboard. The original numbered section implementations remain in the repository for reference, but App now mounts the redesigned components.

## Active Implementation

- `src/sections/PortfolioSections.jsx`: navigation and 14 portfolio chapters, including the footer.
- `src/sections/RequestFlow.jsx`: interactive API request trace.
- `src/styles/portfolio.css`: design tokens, responsive layouts and component states.
- `src/hooks/usePortfolioMotion.js`: scoped GSAP reveals, parallax, impact counters and off-screen animation pausing.
- `src/scenes/FlightScene.jsx`: aircraft loading, resource disposal, responsive framing, runway/cloud/terminal environment, jet bridge and passenger silhouettes, reduced-motion handling and WebGL fallback.
- `src/scenes/flightStory.js`: deterministic scroll-to-pose interpolation, tested with `node --test src/scenes/flightStory.test.mjs`.
- `src/sections/FlightChapter.jsx`: full-width story moments separating groups of portfolio content.
- `src/styles/flight-story.css`: lavender surface overrides, patterns and story framing.
- `src/components/FlightIntro.jsx`: short branded entry transition with timer cleanup.
- `src/data/resume.js`: source for personal details, career, technology, certification and project content.

## Chapter Designs

| Chapter | Design and interaction |
| --- | --- |
| Introduction | Full-bleed aircraft, editorial name treatment, circular anchor links, flight metadata |
| Experience | Expandable career timeline, tenure display, education strip |
| Travel technology | World map, destination selector, animated illustrative route, service links |
| API flow | Graphite request console, six-stage playback, keyboard-operated tabs, payload inspector |
| Pricing | Ticket-style worksheet and selectable pricing layers |
| Rapid Reprice | Date/route/cabin segmented control and itinerary comparison |
| Impact | Animated 80% metric and indexed before/after bar chart |
| Technology | Category filters, search, empty state, animated category-specific input/output diagram, detail inspector, certifications |
| Architecture | Selectable layered system diagram and responsibility notes |
| How I build | Sticky desktop delivery stages; normal document flow on mobile |
| Leadership | Expandable responsibility index |
| In motion | Large aircraft cruising above stylized cloud banks |
| Beyond enterprise | Independent-work narrative and workspace-style process illustration |
| Projects | Category filters, image-led covers and expandable project details |
| Contact | Email/phone links, clipboard status and back-to-top navigation |

## Layout and Motion Rules

- Shared maximum content width: 90rem. Gutters step from 4rem to 1.25rem.
- Section padding steps from 7rem to 4rem. Typography uses explicit breakpoint sizes, not viewport-scaled fonts.
- Section backgrounds are full-width bands. Only repeated items and genuinely framed tools use cards, with radii no greater than 8px.
- Native anchors, details, select controls and semantic buttons remain usable with keyboards. The API tabs additionally support Left, Right, Home and End.
- Chapter navigation uses a framed index dropdown with active-row states. Destination selection retains the native select for keyboard and mobile platform support. Command and segmented-control targets are at least 44px high.
- Reduced motion disables smooth scrolling, parallax and decorative animation. The impact metric retains its factual value.
- Flight sequence: taxi, runway lineup, takeoff, climb, cruise, descent, touchdown/rollout, taxi to the terminal and disembarkation. Local chapter scroll positions drive every pose; scrolling backward retraces the sequence. There is no timer-driven flight or forced scroll pin.
- Aircraft and scenery are clipped to reserved visual space between headings and footers, and hidden behind reading sections. Rendering is demand-driven, including during pauses. Reduced motion shows a representative static pose per story chapter.
- The current GLB is one combined mesh: landing gear cannot retract independently. Clouds, airport and passenger silhouettes are stylized procedural geometry, not a photorealistic airport simulation.
- Render resolution is capped at 1.5 DPR. No post-processing or shadow-map pass is required.
- The request trace and pricing/repricing examples are illustrative UI, not live Travelport integrations or actual fare quotes.

## Assets

- The existing `/models/boeing-787.glb` remains the primary visual asset. Confirm its original licensing before public release.
- World map: https://commons.wikimedia.org/wiki/File:World_map_-_low_resolution.svg
- Fusion concept image: https://images.unsplash.com/photo-1497366754035-f200968a6e72
- Route54 concept image: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4
- Finance tracker concept image: https://images.unsplash.com/photo-1454165804606-c3d57bc86b40
- Project photos are explicitly labeled concept imagery; they are not screenshots of the actual applications. Replace them with owner-provided screenshots when available.
- Fonts: Space Grotesk, DM Sans and IBM Plex Mono through Google Fonts. Remote fonts and images currently require an internet connection.
- Icons: Lucide React. No paid UI package or animation plugin is required.

## Verification

Run the production build with `npm run build`.

Storyboard regression checks (with the local preview running on port 5175):

```sh
node --test src/scenes/flightStory.test.mjs
npx playwright test tests/flight-story.spec.mjs --workers=1 --output=/tmp/kishore-flight-checks
```

The storyboard tests use fixed 390px and 1440px Chromium viewports, screenshot/pixel checks for all eight scenes, overflow checks, and normal-motion scroll advance/pause/reversal. The shared editor browser can resize its viewport independently, so these headless checks are the reliable viewport measurements. Direct initial fragment navigation to a flight stage can be reset by the existing loading/smooth-scroll initialization; the normal scrolling workflow is verified.

Focused lint for the active redesigned modules:

```sh
npx eslint src/App.jsx src/components/FlightIntro.jsx src/hooks/usePortfolioMotion.js src/scenes/FlightScene.jsx src/sections/PortfolioSections.jsx src/sections/RequestFlow.jsx
```

Browser checks covered all 15 chapters at desktop and mobile sizes, with text-fit checks at 320, 390, 768, 1024, 1440 and 1920 pixels. Controls checked include the chapter index, career/leadership expansion, destination selection, API playback and keyboard tabs, fare selection, repricing modes, technology search/filter/empty states, architecture selection and project filters/details. Canvas checks verify nonblank rendering and frame changes.

The clipboard API is unavailable on many non-HTTPS LAN origins. The contact section reports this instead of claiming success and retains a selectable email and mailto link.

## Before Public Release

- Replace concept project imagery with actual product screenshots and add verified public project URLs if appropriate.
- Optimize the GLB with free Blender and glTF Transform after checking material fidelity and model licensing.
- Consider lazy-loading/code splitting for the Three.js bundle. Vite currently reports the large main chunk; the production build still succeeds.
- Review existing dependency-audit findings separately before hosting publicly; avoid force-upgrading the framework as part of a visual redesign.
- Test on physical iOS and Android devices. Browser viewport emulation does not establish real-device frame rates or battery usage.
- Optional free design workflow: Penpot for layouts, Inkscape for vector editing, Blender for model/material authoring, and Squoosh for compressing project images.

## Local Preview

```sh
npm run dev -- --host 0.0.0.0 --port 5175 --strictPort
```

The current network preview is `http://192.168.29.243:5175/`. The host address may change when the Mac reconnects to Wi-Fi. This is a development preview, not a public deployment.