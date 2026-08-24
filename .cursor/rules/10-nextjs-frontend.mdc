---
alwaysApply: true
---
---
description: Next.js and TypeScript standards for the Admin Panel
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# Next.js Admin Frontend Rules

Use TypeScript.

Follow the existing Next.js architecture.

Prefer Server Components where appropriate.

Use Client Components only when client-side functionality requires them.

Do not convert entire pages to Client Components unnecessarily.

---

# Page Responsibilities

Pages should primarily compose:

- layouts
- components
- hooks
- API/service calls where appropriate

Avoid putting large business logic blocks inside page files.

---

# Components

Components should have a clear responsibility.

Avoid huge components containing:

- API requests
- table configuration
- form state
- modal state
- business calculations
- complex transformations
- large amounts of JSX

Extract reusable functionality where appropriate.

---

# TypeScript

Avoid `any`.

Do not use `any` simply to silence TypeScript errors.

Do not use `@ts-ignore` unless there is a documented technical reason.

Prefer proper types from shared contracts when available.

---

# Async States

Every API-driven UI should properly handle:

- Loading
- Success
- Empty
- Error

Do not leave stale or broken UI after failed requests.

---

# Forms

Admin forms should handle:

- Initial values
- Validation
- Loading state
- Backend validation errors
- Success state
- Cancel behavior
- Disabled submit state
- Unsaved changes where applicable

Client-side validation is for UX.

Backend validation is authoritative.

---

# Tables

Tables should use the application's common table component/pattern.

Support where required:

- Pagination
- Search
- Filtering
- Sorting
- Row actions
- Loading
- Empty state
- Error state

Do not create a completely different table implementation for each module.

---

# Performance

Avoid:

- loading thousands of records unnecessarily
- duplicate API requests
- unnecessary re-renders
- unnecessary global state
- large client-side transformations

Prefer server-side pagination/filtering/sorting for large datasets.