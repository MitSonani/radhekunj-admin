---
alwaysApply: true
---
---
description: UI consistency, shared layouts and reusable components for the Admin Panel
globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "**/*.scss"]
alwaysApply: true
---

# Admin UI Consistency

The Admin Panel must have a consistent visual structure across the entire application.

Do NOT design every page independently.

Before creating a new page, inspect existing pages and reuse their layout and components.

The goal is that Product, Category, Order, User, Coupon, Inventory and other admin pages feel like parts of the same application.

---

# Common Layout

Use the same application shell across admin pages.

Typical structure:

Admin Layout
├── Sidebar
├── Header
├── Breadcrumb
└── Page Content

Do not create a separate sidebar/header/layout for individual pages.

---

# Page Layout

Similar pages should follow the same structure.

For example:

List page:

Page
├── Page Header
│   ├── Title
│   └── Primary Action
├── Search / Filters
├── Data Table
├── Pagination
└── Modals / Drawers

Create page:

Page
├── Page Header
├── Form
└── Actions

Edit page:

Page
├── Page Header
├── Form
└── Actions

Details page:

Page
├── Page Header
├── Summary
├── Details
└── Related Data

Use these patterns consistently.

---

# Reuse Common Components

Before creating a component:

1. Search the existing component directory.
2. Search existing pages for similar UI.
3. Determine whether an existing component can be reused.
4. Extend an existing component if appropriate.
5. Create a new component only when genuinely necessary.

---

# Common Components

Prefer reusable components for repeated patterns.

Examples:

components/
├── layout/
│   ├── AdminLayout
│   ├── Sidebar
│   ├── Header
│   ├── PageHeader
│   └── Breadcrumb
│
├── common/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── DatePicker
│   ├── Modal
│   ├── Drawer
│   ├── ConfirmDialog
│   ├── StatusBadge
│   ├── EmptyState
│   ├── LoadingState
│   └── ErrorState
│
├── table/
│   ├── DataTable
│   ├── TableFilters
│   ├── TablePagination
│   └── TableActions
│
└── forms/
    ├── FormField
    ├── FormActions
    └── FormError

Follow the project's existing folder structure if it differs.

---

# Do Not Duplicate Components

Do not create:

ProductTable
OrderTable
UserTable
CategoryTable

if they are all using the same generic table behavior.

Prefer:

DataTable

with appropriate configuration.

Likewise, do not create:

ProductModal
UserModal
CategoryModal

when the underlying modal behavior is identical.

Create reusable base components and pass appropriate content/configuration.

---

# Avoid Over-Abstraction

Do not create an extremely generic component that becomes difficult to understand.

Create reusable components when there is a real repeated UI pattern.

Do not abstract merely because two pieces of JSX look slightly similar.

---

# Buttons

Use the existing Button component.

Do not create custom button styling for every page.

Use variants such as:

primary
secondary
danger
outline
ghost

if the existing design system supports them.

---

# Status Badges

Use a common StatusBadge component.

For example:

Active
Inactive
Pending
Processing
Shipped
Delivered
Cancelled
Paid
Failed

Do not create separate visual implementations for every status.

---

# Confirmations

Destructive operations should use the common confirmation pattern.

Examples:

- Delete product
- Delete category
- Disable user
- Cancel order
- Remove coupon

Do not implement a completely different confirmation modal on every page.

---

# Spacing

Use the existing spacing system.

Do not randomly introduce values such as:

margin: 17px;
padding: 23px;
gap: 13px;

if the project already has spacing tokens/design utilities.

---

# Typography

Use the existing typography system.

Do not introduce arbitrary heading sizes on individual pages.

---

# Colors

Use existing design tokens/theme variables.

Do not hardcode slightly different colors for each page.

Prefer the application's existing:

- primary
- secondary
- background
- surface
- border
- text
- muted
- success
- warning
- error
- danger

tokens.

---

# Responsive Design

Follow the existing responsive strategy.

Do not create a completely different mobile layout for each page.

Admin tables and forms must remain usable across supported screen sizes.

---

# New Page Rule

Before creating a new page:

1. Find the closest existing page.
2. Copy the structural pattern mentally, not blindly.
3. Reuse its layout.
4. Reuse its components.
5. Reuse its spacing.
6. Reuse its typography.
7. Reuse its table/form patterns.
8. Only introduce new UI where the requirement genuinely differs.

---

# Visual Consistency

If two pages perform similar operations, their:

- headers
- buttons
- filters
- tables
- forms
- modals
- spacing
- typography
- status indicators

should look and behave consistently.

Do not introduce a new visual style without a clear product/design requirement.