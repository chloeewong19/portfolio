# Chloe Leung — Portfolio Hero

## Setup

1. Create a new React app (or drop into existing):
```bash
npx create-react-app my-portfolio
cd my-portfolio
```

2. Replace `src/App.js` contents with an import of the component:
```jsx
import PortfolioHero from './portfolio-hero';
export default function App() { return <PortfolioHero />; }
```

3. Copy `portfolio-hero.jsx` into `src/`

4. Run:
```bash
npm start
```

## Fonts used
- **Playfair Display** — big hero name + stats (Google Fonts)
- **Instrument Serif** — italic cycling subtitle + body copy (Google Fonts)
- **DM Mono** — nav, tags, chat UI, labels (Google Fonts)

All loaded via `@import` in the component — no install needed.

## Mini-Me Chat (Claude API)
The chat panel calls `https://api.anthropic.com/v1/messages` directly from the browser.

> ⚠️ For production, move the API call to a backend route to protect your key.
> For local dev/demo, the artifact handles auth automatically.

Model used: `claude-sonnet-4-20250514`

## Design tokens
```
--ink:   #0f0d0a   (near-black)
--paper: #F2EDE4   (warm off-white)
--red:   #C13B1B   (terracotta accent)
--rule:  rgba(15,13,10,0.12)  (divider lines)
```

## What's in the hero
- Staggered load-in animation on all elements
- Cycling italic subtitle (6 rotating descriptions)
- Floating collage annotation tags
- Grain texture overlay
- Marquee ticker (all projects + orgs)
- Stats grid (hackathons, projects, majors, HK→SOM)
- "Talk to mini-me →" button triggers slide-in chat panel
- Chat panel with quick-start prompt chips + full Claude-powered conversation

## Customise
- `CYCLING_TITLES` array — swap in your own descriptors
- `COLLAGE_ITEMS` array — change positions, text, rotation of floating tags
- `SYSTEM_PROMPT` — the mini-me personality and facts
- Stats grid — update numbers/labels as needed
- Marquee items — add/remove projects

## Next steps
- Add scroll-based project case studies below the hero
- Wire up Work / About / Writing nav links
- Add a real photo in a collage cut-out style
- Consider Framer or Next.js for deployment
