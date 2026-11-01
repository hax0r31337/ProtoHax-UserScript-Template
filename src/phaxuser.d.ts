// `phaxuser:<path>` imports another script from the client's scripts folder.
// For example, `phaxuser:lib/math.js` is `<scripts>/lib/math.js`. TypeScript
// can't resolve these by itself, so they're declared here.
//
// The wildcard below types every `phaxuser:` import as `any`. For a shared
// library you control, declare its shape too. A specific declaration takes
// priority over the wildcard, so you get real type checking:
//
//     declare module "phaxuser:lib/math.js" {
//         export function clamp(value: number, min: number, max: number): number;
//     }

declare module "phaxuser:*";
