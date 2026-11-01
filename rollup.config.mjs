// Rollup config, driven by script.config.mjs.
//
// `npm run build` runs it through build.mjs (which adds watch and deploy).
// `npx rollup -c` runs it directly.
//
// `@protohax/userscript` is intentionally NOT bundled. The import stays in the
// output, and the client points it at its own objects when loading the script.
// Bundling it (even if it had runtime code) would give your script a separate,
// disconnected copy of the game state. Preact and htm stay external for the
// same reason (see CLIENT_LIBS).

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

// The client ships its own Preact and htm and resolves these imports to them,
// the same way it resolves `@protohax/userscript`. Inlining a second Preact
// breaks hooks: a component rendered by one copy calls hooks registered with
// the other.
const CLIENT_LIBS = ["preact", "preact/compat", "@preact/compat", "htm"];

// Preact entry points the client doesn't ship. Bundling them would inline a
// second copy of the hooks, so fail the build with a pointer instead.
const UNSHIPPED_PREACT = {
    "preact/hooks": 'import hooks from "preact/compat" instead',
    "preact/jsx-runtime": 'use the classic JSX runtime (`import { h } from "preact"`)',
    "preact/jsx-dev-runtime": 'use the classic JSX runtime (`import { h } from "preact"`)',
};

function rejectUnshippedPreact() {
    return {
        name: "reject-unshipped-preact",
        resolveId(source, importer) {
            const hint = UNSHIPPED_PREACT[source];
            if (!hint) return null;
            const from = importer ? path.relative(ROOT, importer) : "the entry";
            this.error(`"${source}" (imported from ${from}) isn't shipped by the client: ${hint}.`);
        },
    };
}

// JSX uses the classic runtime: every element compiles to `h(...)` and every
// `<>...</>` to `Fragment`, so a .tsx file imports both from the client's
// `preact`. Only .tsx files are parsed as TSX, so `<T>value` casts in .ts
// files keep working.
function swcOptions({ tsx }) {
    return {
        jsc: {
            target: "esnext",
            parser: { syntax: "typescript", tsx },
            transform: tsx
                ? { react: { runtime: "classic", pragma: "h", pragmaFrag: "Fragment" } }
                : {},
        },
    };
}

// Tampermonkey-style metadata block. The client ignores it, but it means a
// copied-around script still says what it is, who wrote it and which version
// it is.
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
        // The client expects exactly one ES module.
        file: config.outFile,
        format: "es",
        sourcemap: config.sourcemap,
        banner: userScriptBanner(),
        // Never split into chunks: the client only loads the one file.
        inlineDynamicImports: true,
    },
    external: [
        "@protohax/userscript",
        // `phaxuser:` imports point to other scripts in the client's scripts
        // folder and are resolved at load time, so keep them external too.
        /^phaxuser:/,
        ...CLIENT_LIBS,
    ],
    plugins: [
        rejectUnshippedPreact(),
        resolve({
            // Lets extensionless imports (`./modules/auto-sprint`) find .ts
            // and .tsx files.
            extensions: [".ts", ".tsx", ".mjs", ".js", ".json"],
            // The client is neither Node nor a browser, so there are no
            // builtins or shims. Any npm package you bundle must be plain,
            // portable JS.
            browser: false,
            preferBuiltins: false,
        }),
        commonjs(),
        swc({ include: /\.tsx$/, swc: swcOptions({ tsx: true }) }),
        swc({ exclude: /\.tsx$/, swc: swcOptions({ tsx: false }) }),
        // Keep all comments, so the banner and your own notes survive minifying.
        config.minify ? terser({ module: true, format: { comments: "all" } }) : null,
    ],
};
