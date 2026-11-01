// Entry point. Everything imported from here ends up in the single file the
// client loads, and each module registers itself when its file runs.
//
// The example below drops incoming chat messages that contain any word from a
// list. It shows:
//   - an option schema (string-list, enum and boolean options, plus a nested child)
//   - listening to packets with `ctx.onPacket`
//   - narrowing a packet union
//   - cancelling a packet so the client never sees it

import { defineModule } from "@protohax/userscript";

// A second example, a HUD widget written with Preact and JSX. Delete the line
// (and the file) if you don't need UI.
import "./coordinates";

defineModule(
    // Every script module goes in the client menu's Script category.
    { name: "ChatCleaner" },

    // The schema is read ONCE, at registration. Each key is both the name on
    // `ctx.options` and the label in the menu (set `name: "..."` to change the
    // label). Options are shared by every session, so listeners always see the
    // current menu value.
    {
        words: { type: "string-list", name: "Blocked Words", def: ["buycraft", "discord.gg"] },
        scope: { type: "enum", values: ["Chat", "Chat + Whisper"], def: "Chat" },
        log: {
            type: "boolean", name: "Log Dropped", child: {
                // Nested options show up under their parent in the menu, and
                // in code as `ctx.options.log.child.prefix`.
                prefix: { type: "string", def: "[ChatCleaner]" },
            },
        },
    },

    // The setup runs ONCE PER SESSION with a fresh `ctx`. `ctx.options` holds
    // the options above, fully typed from the schema. Listeners added through
    // `ctx` only fire while the module is enabled and are removed when the
    // session ends, so you don't need to unsubscribe or check "am I enabled?".
    (ctx) => {
        const blocked = () =>
            ctx.options.words.value
                .map((word) => word.trim().toLowerCase())
                .filter((word) => word.length > 0);

        ctx.onPacket("text", (packet) => {
            // `packet` is a union keyed on `type`. Checking `type` narrows it
            // and gives you that variant's fields.
            const isWhisper = packet.type === "whisper";
            if (packet.type !== "chat" && !isWhisper) return;
            if (isWhisper && ctx.options.scope.value !== "Chat + Whisper") return;

            const message = packet.message.toLowerCase();
            if (!blocked().some((word) => message.includes(word))) return;

            // Cancelled packets are dropped before the game sees them.
            packet.isCancelled = true;

            if (ctx.options.log.value) {
                console.log(`${ctx.options.log.child.prefix.value} dropped message from ${packet.source_name}`);
            }
        });
    },
);
