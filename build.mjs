// Builds the script into the single ES module the ProtoHax client loads, and
// can install it for you.
//
//   node build.mjs                    build once
//   node build.mjs --watch            rebuild on every change
//   node build.mjs --deploy           build, then copy into the client's scripts folder
//   node build.mjs --watch --deploy   rebuild and copy on every change
//
// The bundle itself is configured in rollup.config.mjs.

import path from "node:path";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import * as rollup from "rollup";

import config from "./script.config.mjs";
import options from "./rollup.config.mjs";
import { deploy } from "./scripts/deploy.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const watch = args.includes("--watch");
const shouldDeploy = args.includes("--deploy");
const useAdb = args.includes("--adb");

const outFile = path.join(ROOT, config.outFile);
mkdirSync(path.dirname(outFile), { recursive: true });

function afterBuild() {
    if (!shouldDeploy) return;
    try {
        const dest = deploy(outFile, { adb: useAdb });
        console.log(`[deploy] ${path.basename(outFile)} -> ${dest}`);
    } catch (error) {
        // Don't stop watching on a deploy error. The next rebuild retries,
        // which is handy if you just forgot to plug in a device.
        console.error(`[deploy] ${error.message}`);
        if (!watch) process.exitCode = 1;
    }
}

if (watch) {
    const watcher = rollup.watch({ ...options, watch: { clearScreen: false } });

    watcher.on("event", (event) => {
        switch (event.code) {
            case "BUNDLE_END":
                // Rollup has already written the bundle, but we still need to
                // close the result to release its file handles.
                event.result.close();
                console.log(`[build] built in ${event.duration}ms`);
                afterBuild();
                break;
            case "ERROR":
                console.error(`[build] ${event.error.message}`);
                break;
        }
    });

    console.log(`[watch] watching ${config.entry} — Ctrl+C to stop`);
} else {
    const bundle = await rollup.rollup(options);
    await bundle.write(options.output);
    await bundle.close();
    console.log(`[build] ${config.entry} -> ${config.outFile}`);
    afterBuild();
}
