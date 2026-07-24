// Entry point — everything reachable from here ends up in the single file the
// client loads, and each module registers itself as its file is evaluated.
//
// The example below is a packet-level module: it drops incoming chat messages
// containing any of a list of words. It shows the option schema (string-list/
// enum/boolean options plus a nested child), `ctx.onPacket`, narrowing a packet
// union, and cancelling a packet so the client never sees it.

import { defineModule, ModuleCategory } from "@protohax/userscript";

defineModule(
    {
        name: "ChatCleaner",
        category: ModuleCategory.Utility,
    },

    // The schema — interpreted ONCE at registration. Keys become the handle
    // names on `ctx.options` and the display names in the menu (override a
    // label with `name: "..."`). The handles are shared by every session, so
    // listeners always read the current menu value.
    {
        words: { type: "string-list", name: "Blocked Words", def: ["buycraft", "discord.gg"] },
        scope: { type: "enum", values: ["Chat", "Chat + Whisper"], def: "Chat" },
        log: {
            type: "boolean", name: "Log Dropped", child: {
                // Nested options appear under their parent in the menu and hang
                // off the parent handle: `ctx.options.log.child.prefix`.
                prefix: { type: "string", def: "[ChatCleaner]" },
            },
        },
    },

    // The setup — runs ONCE PER SESSION with a fresh context; `ctx.options`
    // carries the handles above, fully typed from the schema. Listeners wired
    // through `ctx` are torn down with the session and only fire while the
    // module is enabled, so no manual unsubscribing and no "am I enabled?"
    // guards.
    (ctx) => {
        const blocked = () =>
            ctx.options.words.value
                .map((word) => word.trim().toLowerCase())
                .filter((word) => word.length > 0);

        ctx.onPacket("text", (packet) => {
            // `packet` is a union discriminated by `type`; narrowing gives
            // you the fields of that variant.
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
