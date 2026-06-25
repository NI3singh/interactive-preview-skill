# Reconstruction

Goal: rebuild the screens the hero flow touches as **isolated, presentational-only replicas** under
`preview/screens/`, faithful enough to pass for the real thing but containing none of the real app's
logic, data layer, or network. This is where "looks real" meets "reveals nothing."

## The one rule, and why

**Replicas render from props and mock state, and nothing else.** No data fetching, no API/SDK
clients, no auth guards, no app stores, no real business logic. The reason is in the SKILL's core
principle: imported logic drags in `fetch` calls, data shapes, feature flags, and auth behavior that
expose how the product actually works and can break at runtime. A dumb replica on mock data looks
identical, runs every time, and leaks nothing.

So when you read a real component, you're harvesting its **markup and look**, not its behavior.

## How to reconstruct a screen

1. **Read the real component** for structure: the DOM/JSX hierarchy, class names, and which design
   tokens it uses. You want the replica's structure close enough that, styled with the same tokens,
   it's visually identical.
2. **Rebuild it clean** in `preview/screens/`, using the extracted tokens (and the project's
   presentational primitives if they're safe — see below). Keep the markup shape; drop the brains.
3. **Replace every real handler.** An `onClick` that called `await api.addFriend(id)` becomes a call
   into the mock store (`store.addFriend(id)`) or simply a no-op the tour engine listens for. An
   `onSubmit` that hit a route becomes a local state update.
4. **Feed all content from `preview/mock/`** — never from a fetch, context, or prop wired to real data.

## Tag the targets the tour will drive

Add a stable `data-tour="..."` attribute to every element the flow references (the search button, the
search input, Nitin's Add button, the feed tab). The tour engine finds elements by these ids.

Why `data-tour` rather than CSS selectors or refs: it's explicit, survives restyling and class
changes, reads clearly in the flow config, and keeps the engine decoupled from the screens. Use
descriptive, flow-level ids (`nav-search`, `search-input`, `add-nitin`, `nav-feed`).

```tsx
<button data-tour="nav-search" className="navBtn" onClick={() => go("search")}>Search</button>
<input data-tour="search-input" placeholder="Search people" value={q} onChange={...} />
<button data-tour="add-nitin" onClick={() => store.addFriend("nitin")}>Add</button>
```

## Mock data and the in-memory store

- `preview/mock/data.ts` — the entities the story needs, written like real content so it feels alive:
  the current user, the searchable "Nitin" profile (avatar, name, mutuals), a couple of feed posts.
  Use believable copy and real-looking avatars (local placeholder images or generated initials), not
  "Lorem ipsum" — fake-looking data is another "this is a demo" tell.
- `preview/mock/store.ts` — a tiny in-memory store (the bundled `useMockStore` covers this) so actions
  have visible consequences: adding Nitin flips his button to "Added," bumps the friend count, and
  drops his post into the feed. Those consequences are what make the visitor believe it's real.

The store holds *only* demo state and never touches the network. It resets on reload, which is exactly
right for a demo.

## Reuse vs rebuild

Default to **rebuilding** presentational primitives from tokens — it's safest and keeps the preview
self-contained. You *may* import a component from the real app only if you're certain it is purely
presentational: no data fetching, no effects with side effects, no store/context/auth dependencies,
no env access. UI-kit components (a MUI `<Button>`, a Chakra `<Card>`) are usually safe and worth
reusing for exactness. When in doubt, rebuild — the cost of a leak is higher than the cost of a few
extra components.

**Coupled components** (markup + data hooks tangled together) are common. Don't import them — copy
just their JSX into a replica and delete the hooks, replacing the data they produced with mock data.

## Responsive and accessible

- **Mirror the real breakpoints** (you captured `screens` during token extraction). The preview
  should look native at both desktop and mobile widths, since that's where it'll be embedded.
- Use semantic elements (`button`, `nav`, `input` with labels), give mock avatars `alt` text, and
  keep visible focus states. The tour drives real DOM elements, so real semantics make it work
  smoothly with keyboard and screen readers.

## Keep screens dumb; let the engine and store own behavior

A good replica screen is almost boring: it takes props / reads mock state, renders, and fires simple
callbacks. The *behavior* — what advances the tour, what state changes — lives in the flow config and
the mock store. This separation is what lets one bundled engine drive any product's screens, and lets
the user tweak the demo by editing data instead of code.
