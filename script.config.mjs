// Build settings for this userscript. Shared by rollup.config.mjs, build.mjs,
// and scripts/deploy.mjs.

export default {
    /**
     * Entry module. Everything it imports (statically) is bundled into one file
     * — add new modules by importing them from here, not by adding entries.
     */
    entry: "src/index.ts",

    /**
     * The single JavaScript file the client loads. Its basename is what shows
     * up in the ProtoHax scripts folder, so give it your script pack's name.
     */
    outFile: "dist/my-script.js",

    /**
     * `"inline"` keeps the output a single self-contained file while still
     * mapping stack traces back to your TypeScript. Other options: `false`,
     * `true` (emits a separate .js.map), `"hidden"`.
     */
    sourcemap: "inline",

    /**
     * Off by default — a userscript is small, and readable output makes runtime
     * errors far easier to trace. Turn on if you care about file size; comments
     * (including the banner below) are kept either way.
     */
    minify: false,

    /**
     * Extra `@key value` lines for the UserScript metadata banner at the top of
     * the bundle. `name`, `version`, `description`, `author`, `license` and
     * `homepage` are taken from package.json; anything added here wins.
     */
    banner: {
        // author: "you",
        // namespace: "https://example.com",
    },
};
