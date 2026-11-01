// A HUD readout of the player's coordinates, written in JSX. It shows:
//   - a widget that lives and dies with the module's session
//   - a `hud-placement` option, so the player's move/scale in the HUD editor
//     is saved with the config
//   - rendering Preact into `widget.root` with JSX
//
// JSX uses the classic runtime: every element compiles to an `h(...)` call,
// so each .tsx file imports `h` (and `Fragment`, if it uses `<>...</>`) from
// `preact`. The client resolves `preact` to its own copy at load time.
// Hooks come from `preact/compat`. The client doesn't ship `preact/hooks`.

import { defineModule } from "@protohax/userscript";
import { h, render } from "preact";

defineModule(
    { name: "Coordinates" },
    {
        placement: {
            type: "hud-placement",
            def: { alignment: "Top Left", x: 0.01, y: 0.3 },
        },
        decimals: { type: "number", def: 1, min: 0, max: 3, step: 1 },
    },
    (ctx) => {
        // `ctx.createWidget` destroys the widget with the session. Unmount
        // Preact first, so component cleanups still run.
        const widget = ctx.createWidget({
            style: "hud",
            visible: false,
            placement: ctx.options.placement,
        });
        widget.onDestroy(() => render(null, widget.root));

        ctx.onEnable(() => widget.show());
        ctx.onDisable(() => widget.hide());

        const player = ctx.session.entityState.localPlayer;

        // Re-rendering every tick is fine: only what changed is sent to the
        // client.
        ctx.on("tick", () => {
            const d = ctx.options.decimals.value;
            const { x, y, z } = player.position;

            render(
                <div
                    style={{
                        // Everything else is in em, so it all follows the HUD
                        // scale. Always write units: a bare number is dropped
                        // by the web flavor.
                        fontSize: "calc(13px * var(--hud-scale))",
                        padding: "0.3em 0.6em",
                        borderRadius: "0.5em",
                        background: "rgb(0 0 0 / 45%)",
                        color: "white",
                        whiteSpace: "nowrap",
                    }}
                >
                    <b style={{ color: "var(--primary)" }}>XYZ</b> {x.toFixed(d)} {y.toFixed(d)}{" "}
                    {z.toFixed(d)}
                </div>,
                widget.root,
            );
        });
    },
);
