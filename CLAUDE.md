# ProtoHax UserScript

TypeScript modules for the [ProtoHax](https://protohax.net/) Minecraft Bedrock
client, bundled by rollup into one ES module the client loads.

## Read first

- **<https://userscript.protohax.net/index.md>** — the guides and full API
  documentation. Read the relevant page before writing a module; the lifecycle
  is not guessable from the code alone.
- `node_modules/@protohax/userscript/index.d.ts` — every declaration in one
  file. Grep it instead of guessing a method name.

The client is closed source. Those two are the whole contract.

## Commands

```bash
npm run build      # -> dist/my-script.js
npm run check      # tsc --noEmit
npm run deploy     # build + copy to the client's scripts folder
npm run dev        # rebuild + redeploy on save
```

## Rules

- Run `npm run check` after editing `src/`. The build strips types without
  checking them, so it proves nothing.
- `src/index.ts` is the only entry point. Anything it imports is bundled in;
  never add a second rollup entry.
- The output must stay **one ES module** with `@protohax/userscript` and
  `phaxuser:` imports **external** — the client resolves them to its own live
  singletons at load time. Leave `rollup.config.mjs` and `skipLibCheck` alone.
- The client reads scripts at startup; a rebuild needs a client restart to take
  effect.
