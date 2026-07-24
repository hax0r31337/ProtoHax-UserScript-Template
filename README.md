# ProtoHax UserScript Template

**A starting point for writing [ProtoHax](https://protohax.net/) client modules
in TypeScript.**

Write your modules in `src/`, run `npm run build`, and get one JavaScript file
the client loads. Type definitions come from
[`@protohax/userscript`](https://www.npmjs.com/package/@protohax/userscript), so
your editor autocompletes the whole game model — entities, the world, inventory,
every packet payload.

**Everything else — the lifecycle, the API, the build contract, where scripts
install — is documented at [userscript.protohax.net](https://userscript.protohax.net).**

## Quick start

```bash
npm install
npm run build      # -> dist/my-script.js
npm run deploy     # build, then copy into the client's scripts folder

npm run dev        # rebuild + redeploy on every save
npm run check      # type-check (the build does not)
```

Start ProtoHax and `ChatCleaner` appears under Utility, next to the built-in
modules. Scripts are read at startup, so restart the client after a rebuild.

## Layout

```
CLAUDE.md                project brief for AI coding agents
script.config.mjs        output name, sourcemap, minify, banner fields
rollup.config.mjs        the bundle: one ES module, facade left external
build.mjs                runs it (one-shot, --watch, --deploy)
scripts/deploy.mjs       copies the bundle into the ProtoHax scripts folder
src/
  index.ts               entry — a worked example module to replace
  phaxuser.d.ts          types for `phaxuser:` imports of other scripts
```

`src/index.ts` is the entry point; anything it imports is bundled into the same
output file, so split it up however you like.

## Writing a module

Every module is one `defineModule` call at the top level of a file:

```ts
import { defineModule, ModuleCategory } from "@protohax/userscript";

defineModule(
  { name: "MyModule", category: ModuleCategory.Utility },
  {
    strength: { type: "number", def: 1, min: 0, max: 10, step: 0.5 },
  },
  (ctx) => {
    ctx.on("tick", () => ctx.session.entityState.localPlayer.strafe(ctx.options.strength.value, 1));
  },
);
```

The schema declares the options (interpreted once, shared by every session);
the setup function runs per session with the typed handles on `ctx.options`.
`src/index.ts` ships a commented walkthrough of the same shape. For the full
schema — nested options, drawers, modes — and everything `ctx` can do, see
[Getting Started](https://userscript.protohax.net/guides/getting-started).
