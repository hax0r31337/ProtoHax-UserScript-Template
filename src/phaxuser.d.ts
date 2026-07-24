// `phaxuser:<path>` imports another script from the client's scripts folder —
// `phaxuser:lib/math.js` is `<scripts>/lib/math.js`. TypeScript can't resolve
// those on its own, so they are declared here.
//
// This shorthand declaration types every `phaxuser:` import as `any`. For a
// shared library you control, declare its shape as well — the specific
// declaration wins over the wildcard, and you get real checking back:
//
//     declare module "phaxuser:lib/math.js" {
//         export function clamp(value: number, min: number, max: number): number;
//     }

declare module "phaxuser:*";
