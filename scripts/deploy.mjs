// Copies the built bundle into the ProtoHax scripts folder, where the client
// picks it up on startup.
//
// Destination resolution, in order:
//   1. PROTOHAX_SCRIPTS_DIR   — explicit path, any platform. Always wins.
//   2. --adb / PROTOHAX_ADB=1 — `adb push` to a connected Android device
//                               (override the on-device path with
//                               PROTOHAX_ANDROID_DIR).
//   3. Windows                — %APPDATA%\ProtoHax\scripts
//
// Run standalone with `node scripts/deploy.mjs [--adb]`, or as part of a build
// with `npm run deploy` / `npm run dev`.

import { copyFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import config from "../script.config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ANDROID_SCRIPTS_DIR =
    process.env.PROTOHAX_ANDROID_DIR ??
    "/storage/emulated/0/Android/data/net.protohax.prod/files/protohax/scripts";

/** The scripts folder on this machine, or null if it can't be determined. */
export function scriptsDir() {
    if (process.env.PROTOHAX_SCRIPTS_DIR) {
        return process.env.PROTOHAX_SCRIPTS_DIR;
    }

    if (process.platform === "win32" && process.env.APPDATA) {
        return path.join(process.env.APPDATA, "ProtoHax", "scripts");
    }

    return null;
}

function pushWithAdb(file) {
    const remote = `${ANDROID_SCRIPTS_DIR}/${path.basename(file)}`;

    const mkdir = spawnSync("adb", ["shell", "mkdir", "-p", ANDROID_SCRIPTS_DIR], {
        stdio: "inherit",
    });
    if (mkdir.error) {
        throw new Error(`adb not found on PATH (${mkdir.error.message})`);
    }

    const push = spawnSync("adb", ["push", file, remote], { stdio: "inherit" });
    if (push.status !== 0) {
        throw new Error(`adb push failed with exit code ${push.status}`);
    }

    return remote;
}

/**
 * Installs `file` (defaults to the configured bundle) into the scripts folder.
 * Returns the destination path it wrote to.
 */
export function deploy(file = path.join(ROOT, config.outFile), { adb = false } = {}) {
    if (adb || process.env.PROTOHAX_ADB === "1") {
        return pushWithAdb(file);
    }

    const dir = scriptsDir();
    if (!dir) {
        throw new Error(
            "Could not determine the ProtoHax scripts folder on this platform. " +
                "Set PROTOHAX_SCRIPTS_DIR to the folder the client loads scripts from, " +
                "or pass --adb to push to an Android device.",
        );
    }

    const dest = path.join(dir, path.basename(file));
    mkdirSync(dir, { recursive: true });
    copyFileSync(file, dest);
    return dest;
}

// Standalone invocation: `node scripts/deploy.mjs [--adb]`.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
    const dest = deploy(undefined, { adb: process.argv.includes("--adb") });
    console.log(`[deploy] ${path.basename(config.outFile)} -> ${dest}`);
}
