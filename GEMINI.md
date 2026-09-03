# Agent Guidelines & Engineering Rules

Refer to `AGENTS.md` for full engineering standards.

## Core Directives:
1. **Zero `any` Policy**: Strictly no `any` types in TypeScript. Use generics, specific types, or `unknown` with narrowing.
2. **Realtime Form Validation**: Use `mode: "onChange"` in `react-hook-form` so validation feedback is instantaneous as users type.
3. **Robust Error Handling**: Handle errors with proper types (`catch (err: unknown)`), extract API validation details, and display clear messages.
4. **User Feedback**: Include loading states (`loading ? "..." : "..."`), disabled states on submit buttons, and prominent status banners.
5. **Brand & UI Fidelity**: Use official black vector logo (`/Logo - Black.svg`), pill inputs, pill buttons, and soft lavender gradient background.

