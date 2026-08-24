---
alwaysApply: true
---
---
description: Core architecture rules for the e-commerce Admin Panel
alwaysApply: true
---

# Admin Panel Architecture

This repository contains the administrative panel for the e-commerce application.

Technology:

- Next.js
- TypeScript
- Backend API
- PostgreSQL is accessed ONLY through the Backend

The Admin Panel is responsible for:

- Dashboard
- Product management
- Category management
- Product variant management
- Inventory management
- Order management
- User management
- Coupon management
- Promotions
- Reports
- Settings
- Other administrative functionality

---

# Backend Is the Source of Truth

The Admin Panel must NOT directly access PostgreSQL.

The Admin Panel communicates only through Backend APIs.

Architecture:

Admin UI
→ Hooks / Services
→ API Client
→ Backend API
→ Database

---

# Business Logic

Business logic belongs to the Backend.

Do not implement authoritative business rules inside the Admin Panel.

Examples:

- Product pricing
- Discount calculation
- Tax calculation
- Inventory rules
- Coupon validation
- Order rules
- Payment verification
- Refund rules
- Authorization

The Admin Panel should send commands to the Backend and display the Backend response.

---

# Code Organization

Keep responsibilities separated:

Pages
→ Components
→ Hooks
→ Services/API Client
→ Backend

Do not put large API calls and business logic directly inside page components.

---

# Before Implementing a Feature

Before writing code:

1. Inspect the existing project structure.
2. Search for similar pages.
3. Search for existing components.
4. Search for existing API services.
5. Check existing table/form/modal patterns.
6. Check backend API contract.
7. Check shared contracts if available.
8. Identify whether the feature requires backend changes.

Do not immediately create new components without checking existing ones.

---

# Reuse Existing Patterns

If the application already has:

- DataTable
- SearchBar
- FilterPanel
- Pagination
- Modal
- Drawer
- Form
- Button
- PageHeader
- Breadcrumb
- StatusBadge
- ConfirmDialog
- EmptyState
- LoadingState

reuse them.

Do not create another implementation of the same pattern.

---

# Code Changes

Make focused changes.

Do not:

- rewrite unrelated pages
- change the entire design system
- introduce unnecessary libraries
- duplicate existing components
- change API contracts without checking consumers