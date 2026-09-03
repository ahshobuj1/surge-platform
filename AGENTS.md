# Agent Guidelines & Engineering Rules

These rules are mandatory for all AI agents and developers working on the Surge Platform codebase.

---

## 1. TypeScript Strictness — Zero `any` Policy
- **Never use the `any` type** anywhere in the codebase. ESLint `@typescript-eslint/no-explicit-any` is set to `"error"`.
- Use specific interfaces, types, generics (`<T = unknown>`), or `unknown` with runtime type narrowing (`instanceof`, `typeof`, type guards).
- In `catch` blocks, use `catch (err: unknown)` or typed errors. Never `catch (err: any)`.
- Use `Record<string, unknown>` instead of `Record<string, any>`.
- Always ensure `bun x tsc --noEmit` and `bun run lint` pass with 0 errors before completing any task.

---

## 2. Real-Time Form Validation & Handling
- **Realtime Feedback**: Always configure `react-hook-form` with `mode: "onChange"` (or `"onTouched"`) so validation errors appear and disappear in real time as the user types.
- **Field-Level Validation**:
  - Provide explicit validation rules (e.g. required, email regex pattern, min/max lengths, custom validators) with clear, human-readable messages.
  - Display inline error messages directly below the corresponding input with proper spacing and accessible contrast.
  - Apply visual focus/error states to inputs (e.g., `border-red-400 focus:border-red-500 focus:ring-red-100`).
- **Submit States**:
  - Keep primary submit buttons disabled or visually responsive during form submission (`disabled={loading || !isValid}`).
  - Provide clear loading text or spinners on buttons (e.g. "Logging in...", "Creating account...").

---

## 3. Error Handling & API Communication
- **API Error Hierarchy**: All frontend requests go through `@/lib/api.ts` which throws `ApiError` instances containing `statusCode`, `message`, and structured `data`.
- **Parsing Backend Errors**:
  - Backend errors return `{ statusCode, message, errors: [{ code, message, field }] }`.
  - Always extract field-specific error details so users see exact guidance (e.g. "Password must be at least 6 characters") instead of generic "Validation Failed".
- **Business Logic Guards**:
  - For authentication, inspect `isVerified` in both success responses and error payloads to immediately redirect unverified accounts to `/verify-otp?email=...`.

---

## 4. User Feedback & Interactive States
- **Immediate State Feedback**: Every asynchronous user action must have 3 distinct visual states:
  1. **Idle / Ready**: Clear labels, enabled inputs.
  2. **Pending / Loading**: Button shows loading label, inputs/buttons disabled to prevent race conditions and duplicate submissions.
  3. **Feedback (Success or Error)**: Clean alerts with distinct styling (red for errors, emerald for success) and clear messaging.
- **Auto-Dismiss / Resettable**: Clear error states when the user modifies inputs or retries.

---

## 5. UI Design & Design System Standards
- **Brand Mark**: Always render the official black vector logo (`/Logo - Black.svg`) via `ZeroDraftLogo.tsx`.
- **Auth Flow Layout**:
  - Gradient background: `linear-gradient(135deg, #EFF2FA 0%, #DCE2F3 50%, #B5BEE0 100%)`
  - Cards: `rounded-[28px] bg-white border border-white/80 p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(79,90,140,0.18)]`
  - Inputs: Pill-shaped `rounded-full` (`h-11 border-slate-200 px-4 text-sm`)
  - Buttons: Pill-shaped `rounded-full` (`bg-[#4F62E8] hover:bg-[#4353D3] text-white font-semibold h-11 shadow-[0_4px_14px_rgba(79,98,232,0.3)]`)
- **Typography**: Clean sans-serif typography (`system-ui, -apple-system, sans-serif`).

