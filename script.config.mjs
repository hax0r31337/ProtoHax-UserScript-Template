// Build settings for this userscript, used by rollup.config.mjs, build.mjs and
// scripts/deploy.mjs.

export default {
    /**
     * Entry module. Everything it statically imports is bundled into one file.
     * To add a module, import it from here instead of adding another entry.
     */
    entry: "src/index.ts",

    /**
     * The single JavaScript file the client loads. This file name is what you'll
     * see in the ProtoHax scripts folder, so name it after your script pack.
     */
    outFile: "dist/my-script.js",

    /**
     * `"inline"` keeps the output as one self-contained file and still maps
     * stack traces back to your TypeScript. Other options: `false`, `true`
     * (writes a separate .js.map) and `"hidden"`.
     */
    sourcemap: "inline",

    /**
     * Off by default: userscripts are small, and readable output makes runtime
     * errors much easier to trace. Turn it on if file size matters. Comments,
     * including the banner below, are kept either way.
     */
    minify: false,

    /**
     * Extra `@key value` lines for the UserScript banner at the top of the
     * bundle. `name`, `version`, `description`, `author`, `license` and
     * `homepage` come from package.json. Values set here override them.
     */
    banner: {
        // author: "you",
        // namespace: "https://example.com",
    },
};
