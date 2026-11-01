# ProtoHax UserScript Template

A starting point for writing [ProtoHax](https://protohax.net/) client modules in
TypeScript.

Write your modules in `src/`, run `npm run build`, and you get one JavaScript
file the client can load. Types come from
[`@protohax/userscript`](https://www.npmjs.com/package/@protohax/userscript), so
your editor can autocomplete the whole game model: entities, the world,
inventory and every packet payload.

For everything else (the module lifecycle, the API, build requirements and
where scripts are installed), see the docs at
[userscript.protohax.net](https://userscript.protohax.net).

## Quick start

```bash
npm install
npm run build      # -> dist/my-script.js
npm run deploy     # build, then copy into the client's scripts folder

npm run dev        # rebuild and redeploy on every save
npm run check      # type-check (the build doesn't)
```

Start ProtoHax and you'll find `ChatCleaner` and `Coordinates` in the Script
category, next to the built-in modules. The client only reads scripts at startup, so restart it after each
rebuild.

## Layout

```
CLAUDE.md                instructions for AI coding agents
script.config.mjs        output name, sourcemap, minify, banner fields
rollup.config.mjs        bundle config: one ES module, client imports kept external, JSX
build.mjs                runs the build (one-shot, --watch, --deploy)
scripts/deploy.mjs       copies the bundle into the ProtoHax scripts folder
src/
  index.ts               entry point, with an example module to replace
  coordinates.tsx        example HUD widget written with Preact and JSX
  phaxuser.d.ts          types for `phaxuser:` imports of other scripts
```

`src/index.ts` is the entry point. Anything it imports ends up in the same
output file, so you can split your code across as many files as you like.

## Writing a module

Each module is a single `defineModule` call at the top level of a file:

```ts
import { defineModule } from "@protohax/userscript";

defineModule(
  { name: "MyModule" },
  {
    speed: { type: "number", def: 1, min: 0, max: 10, step: 0.5 },
  },
  (ctx) => {
    ctx.on("movement_tick", (state) => state.strafe(ctx.options.speed.value, 1));
  },
);
```

- **The schema** declares your options. It's read once and shared by every
  session.
- **The setup function** runs once per session, with your options typed on
  `ctx.options`.

`src/index.ts` has a commented example with the same structure. For the full
schema (nested options, drawers, modes) and everything `ctx` can do, see
[Getting Started](https://userscript.protohax.net/guides/getting-started).

## UI with Preact and JSX

The client ships its own [Preact](https://preactjs.com/) 11 and htm 3, and the
template keeps `preact`, `preact/compat`, `@preact/compat` and `htm` external
so your script uses those copies. The `preact` dev dependency is only there
for the types.

`.tsx` files compile with the classic JSX runtime, so every element becomes an
`h(...)` call. Import `h` (and `Fragment` if you use `<>...</>`) in each one:

```tsx
import { h, render } from "preact";
import { useState } from "preact/compat"; // hooks live here, not preact/hooks

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>;
}

render(<Counter />, widget.root);
```

`src/coordinates.tsx` is a complete HUD widget. See
[UI Widgets](https://userscript.protohax.net/ui) for widgets, and
[Preact & htm](https://userscript.protohax.net/ui/setup) for how the client's
DOM differs from a browser's.
