# Flow Selection

Goal: choose **one** hero flow that makes a stranger think "oh, I get it — I want this." The preview
lives or dies on this choice. A pixel-perfect replica of the *wrong* journey is worthless; a decent
replica of the *right* one converts. So treat this as the creative core, not a checkbox.

## Discover the candidates

Read the product to find the things it lets people *do*. Good sources, in rough order of signal:

- **Primary navigation** — the nav/tab bar is the product's own answer to "what matters here."
- **Routes** — the route/page list shows the surfaces; the post-signup ones are your material.
- **The hero/landing copy** — how the team pitches the value tells you which flow to dramatize.
- **Primary CTAs and empty states** — "Create your first ___", "Invite a friend", "Start a ___"
  are the product literally telling you its activation moment.
- **Feature components** — a `<Composer/>`, `<SearchModal/>`, `<Editor/>`, `<Checkout/>` names the verb.

Reduce this to a handful of candidate journeys, each phrased as a verb the user completes:
"Find and add a friend," "Publish your first post," "Generate a report," "Build a board."

## Rank them

Score each candidate on four axes and pick the winner — usually the one that's high on all four:

- **Wow** — does it show the *core* value, the reason the product exists? (A feed app's wow is the
  feed coming alive, not editing your bio.)
- **Clarity** — can a first-timer follow it in about 3–6 steps with no prior context?
- **Low cognitive load** — is it self-contained, with no prerequisites, accounts, or setup? Fewer
  branches, fewer decisions.
- **Demoability** — does it run convincingly on mock data without exposing backend concepts? A flow
  that only makes sense with real data plumbing is a poor demo.

Strongly prefer flows that end in a **satisfying state change** the visitor caused — a friend added,
a post published, a result generated, a card moved. That micro-payoff is the hook the signup CTA
then converts.

## Keep it tight

- **3–6 steps.** Each step = one clear gesture. If it needs more, it's two flows; pick one.
- **One screen-to-screen journey**, not a tour of the whole app.
- **No reading required.** The visitor should always know what to do from the coachmark alone.
- **No branching.** A demo has one happy path. Decisions are for the real product.

## Present a shortlist, then commit to one

Show the user the top ~3 with a one-line pitch and let them choose, reorder, or edit. Keep it light:

> Here are the three flows I think best sell the product — which should the preview tell?
> 1. **Find & add a friend** — search "Nitin," add them, watch their post drop into your feed. *(shows the social loop in 4 taps)*
> 2. **Post to your feed** — compose, publish, see it appear with reactions. *(shows creation)*
> 3. **Discover people nearby** — the location scan finds friends around you. *(novel, but needs more setup)*

If you're running with no user to ask (e.g. an automated run), pick the top-ranked flow and say so
plainly: "I went with *Find & add a friend* as the hero flow — re-run and tell me to switch if you'd
rather feature something else."

## Map the chosen flow to a build spec

Turn the winning flow into the concrete things Phases 3–4 need:

1. **Screens touched** — e.g. Feed, Search. Reconstruct exactly these (Phase 3).
2. **Ordered steps** — for each: the target element (`data-tour` id), the coachmark copy, the
   expected action (`click` / `input`), and the reward toast.
3. **Mock entities** — the data the story needs: the searchable "Nitin" profile, a couple of feed
   posts, the current user. Lives in `preview/mock/data.ts`.
4. **State changes** — what each step mutates in the mock store (adding Nitin flips his button to
   "Added" and drops his post into the feed).
5. **The payoff + signup CTA** — the closing line and the real signup URL to send them to.

### Worked example — social app, "Find & add a friend"

```
startScreen: Feed
step 1  target=nav-search     click   "Looking for someone? Open Search."
step 2  target=search-input   input   "Type a name — try 'Nitin'."        expect="Nitin"
step 3  target=add-nitin      click   "Tap Add to put them in your circle."  toast="Nitin's in your circle 🎉"
        → mutate: friends.add('nitin')  (his post now appears in Feed)
step 4  target=nav-feed        click   "Head back to your feed."
payoff  → Nitin's post is now in the feed; show signup CTA:
        "Create your account to build your real circle." → /signup
```

## Anti-patterns

- Demoing settings, billing, profile editing, or configuration — necessary, never impressive.
- Flows that require the visitor to read or think hard.
- Anything that only makes sense once you understand the backend.
- Trying to show everything. Restraint is what makes it feel premium.
