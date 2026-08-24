---
alwaysApply: true
---
---
description: Synchronization rules between Admin Panel, User Panel, Backend and shared contracts
alwaysApply: true
---

# Multi-Repository Synchronization

The e-commerce system contains:

- User Panel
- Admin Panel
- Backend
- PostgreSQL
- Optional shared contracts package

The Backend owns business logic and API behavior.

The Admin Panel is an API consumer.

---

# Shared Contracts

If a shared contracts package exists, use it.

Shared contracts may contain:

- API request types
- API response types
- DTOs
- Enums
- Validation schemas

Do not independently recreate shared business types.

Examples:

OrderStatus
PaymentStatus
ProductStatus
UserRole

---

# API Changes

Before changing API usage:

1. Check Backend.
2. Check User Panel consumers.
3. Check Admin Panel consumers.
4. Check shared contracts.
5. Identify breaking changes.
6. Update affected projects.

---

# Cross-System Features

A feature may affect multiple layers.

Example:

Adding a product field:

Database
→ Backend
→ API Contract
→ Admin Panel
→ User Panel

Example:

Adding a new order status:

Backend
→ API contract
→ Admin Panel
→ User Panel

Do not implement only the frontend portion and consider the feature complete.

---

# Business Logic

Do not implement business-critical rules in the Admin Panel.

Backend owns:

- Pricing
- Discounts
- Tax
- Inventory
- Coupons
- Orders
- Payments
- Refunds
- Authorization

Admin Panel sends commands and displays backend results.

---

# Contract Stability

Treat API responses as contracts.

Before changing:

- field names
- field types
- enum values
- pagination structures
- error structures

search all consumers.

Prefer backward-compatible API evolution when practical.