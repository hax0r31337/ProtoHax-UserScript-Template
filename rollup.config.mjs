// Rollup build, driven by script.config.mjs.
//
// `npm run build` runs this through build.mjs (which adds watch and deploy);
// `npx rollup -c` runs it directly.
//
// `@protohax/userscript` is deliberately left OUT of the bundle: the import
// survives into the output, and the client resolves it to its own live
// singletons at load time. Bundling it (if it even had runtime code) would give
// your script a second, disconnected copy of the game state.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import swc from "@rollup/plugin-swc";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

import config from "./script.config.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));

// Tampermonkey-style metadata block. Purely informational — the client runs the
// file either way — but it makes a script that has been copied around still say
// what it is, who wrote it, and which version it came from.
function userScriptBanner() {
    const fields = {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        author: typeof pkg.author === "string" ? pkg.author : pkg.author?.name,
        license: pkg.license,
        homepage: pkg.homepage,
        ...config.banner,
    };

    const entries = Object.entries(fields).filter(([, value]) => value);
    const width = Math.max(...entries.map(([key]) => key.length));

    return [
        "// ==UserScript==",
        ...entries.map(([key, value]) => `// @${key.padEnd(width)}  ${value}`),
        "// ==/UserScript==",
    ].join("\n");
}

export default {
    input: config.entry,
    output: {
        // One ES module, exactly as the client expects.
        file: config.outFile,
        format: "es",
        sourcemap: config.sourcemap,
        banner: userScriptBanner(),
        // A userscript is one file by definition; never split into chunks the
        // client would not load.
        inlineDynamicImports: true,
    },
    external: [
        "@protohax/userscript",
        // `phaxuser:` imports resolve to other scripts in the client's scripts
        // folder at load time, so they must survive into the output too.
        /^phaxuser:/,
    ],
    plugins: [
        resolve({
            // Extensionless imports (`./modules/auto-sprint`) have to be told to
            // resolve to .ts.
            extensions: [".ts", ".mjs", ".js", ".json"],
            // The host is neither Node nor a browser: no builtins, no shims.
            // Any npm package you bundle must be pure, portable JS.
            browser: false,
            preferBuiltins: false,
        }),
        commonjs(),
        swc({
            swc: {
                jsc: {
                    target: "esnext",
                    parser: { syntax: "typescript" },
                },
            },
        }),
        // Keep every comment: the banner survives, and so does anything you
        // annotated the source with.
        config.minify ? terser({ module: true, format: { comments: "all" } }) : null,
    ],
};
