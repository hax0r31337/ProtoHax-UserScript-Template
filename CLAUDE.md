# ProtoHax UserScript

TypeScript modules for the [ProtoHax](https://protohax.net/) Minecraft Bedrock
client. Rollup bundles them into one ES module that the client loads.

## Read first

- **<https://userscript.protohax.net/index.md>**: guides and full API docs.
  Read the relevant page before writing a module. You can't infer the lifecycle
  from the code alone.
- `node_modules/@protohax/userscript/index.d.ts`: every declaration in one file.
  Grep it instead of guessing method names.

The client is closed source, so these two are the entire contract.

## Commands

```bash
npm run build      # -> dist/my-script.js
npm run check      # tsc --noEmit
npm run deploy     # build + copy to the client's scripts folder
npm run dev        # rebuild + redeploy on save
```

## Rules

- Run `npm run check` after editing `src/`. The build strips types without
  checking them, so a passing build proves nothing.
- `src/index.ts` is the only entry point. Everything it imports gets bundled.
  Never add a second rollup entry.
- The output must stay **one ES module**, with `@protohax/userscript`,
  `phaxuser:`, `preact`, `preact/compat`, `@preact/compat` and `htm` imports
  kept **external**. The client resolves them to its own objects at load time.
  Don't change `rollup.config.mjs` or `skipLibCheck`.
- UI widgets use Preact with **classic-runtime JSX** in `.tsx` files. Import
  `h` (and `Fragment` for `<>...</>`) from `preact` in every `.tsx` file, and
  hooks from `preact/compat`. The client doesn't ship `preact/hooks` or
  `preact/jsx-runtime`, and the build fails if you import them. Read
  <https://userscript.protohax.net/ui/setup.md> first: event handlers get a
  `UiEvent`, refs are `UiElement`s, there's no `document`/`window`, and style
  values need units.
- The client reads scripts at startup, so a rebuild only takes effect after a
  client restart.
