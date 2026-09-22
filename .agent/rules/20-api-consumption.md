---
alwaysApply: true
---
---
description: Backend API consumption rules for the Admin Panel
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# API Consumption Rules

The Backend is the source of truth.

Never invent API endpoints or response structures.

Before implementing an API integration:

1. Inspect backend API documentation/contract.
2. Check shared contracts.
3. Check existing API services.
4. Check request schema.
5. Check response schema.
6. Check authentication requirements.
7. Check authorization requirements.
8. Check pagination/filtering/sorting.

---

# API Architecture

Prefer:

Page
→ Hook
→ Service
→ API Client
→ Backend

Do not scatter raw fetch/axios calls throughout components.

Reuse the project's centralized API client.

---

# API Services

Group API calls logically.

Example:

product.service.ts
order.service.ts
user.service.ts
category.service.ts
coupon.service.ts

Do not create random API calls directly inside UI components when a service layer exists.

---

# Backend Values Are Authoritative

Never trust frontend values for:

- Price
- Discount
- Tax
- Inventory
- Order total
- Payment status
- Coupon validity

The backend validates and calculates authoritative values.

---

# API Errors

Handle relevant statuses consistently:

400
401
403
404
409
422
429
500

Do not treat every response as successful.

Display safe error messages.

Do not expose raw backend/database errors.

---

# Mutations

After mutations such as:

- create
- update
- delete
- status change

ensure the UI reflects the authoritative backend state.

Prefer proper cache invalidation/refetching over manually guessing the new state.

Do not use arbitrary delays such as:

setTimeout(() => refetch(), 1000)

to hide synchronization problems.

---

# API Changes

Before modifying API usage:

1. Search all Admin Panel consumers.
2. Search User Panel consumers.
3. Check Backend.
4. Check shared contracts.
5. Determine breaking-change impact.