---
alwaysApply: true
---
---
description: Consistent CRUD patterns for the Admin Panel
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: false
---

# Admin CRUD Rules

CRUD functionality should follow consistent patterns throughout the Admin Panel.

---

# List Pages

Every standard list page should use the application's common structure:

Page Header
→ Search / Filters
→ Data Table
→ Pagination

Where appropriate:

Page Header
├── Title
├── Description
└── Primary Action

---

# List Page Requirements

A data list should properly handle:

- Loading
- Empty state
- Error state
- Pagination
- Search
- Filtering
- Sorting where required
- Row actions

Do not implement each state differently for every module.

---

# Table Actions

Use a consistent action pattern.

Common actions:

- View
- Edit
- Delete
- Activate
- Deactivate
- Change status

Use the common action menu/button components.

---

# Create Pages

Use a consistent structure:

Page Header
→ Form
→ Form Actions

Form actions should normally include:

- Save
- Cancel

Use common form components.

---

# Edit Pages

Follow the same structure as Create pages wherever possible.

Do not create a completely different form layout for editing unless there is a real requirement.

---

# Details Pages

Use a consistent details layout.

Example:

Page Header
→ Summary
→ Main Information
→ Related Information
→ Actions

---

# Delete

Do not immediately remove UI state before backend confirmation.

Flow:

User clicks Delete
→ Confirmation
→ Backend request
→ Success
→ Refresh/invalidate data

If backend fails:

→ Keep resource
→ Show error

---

# Status Changes

For actions such as:

Activate
Deactivate
Approve
Reject
Cancel
Archive

use a consistent confirmation/action pattern.

Never assume the status changed before backend confirmation.

---

# Search

Use server-side search for large datasets.

Do not download the entire database table and filter thousands of records in the browser.

---

# Filters

Use consistent filter controls.

Examples:

- Status
- Category
- Date range
- Payment status
- Order status

Use the existing filter components.

---

# Pagination

Use the same pagination component and behavior throughout the Admin Panel.

Do not create separate pagination implementations for each module.

---

# Forms

Use the same:

- input styles
- labels
- validation messages
- spacing
- buttons
- error handling

throughout CRUD forms.

---

# Reuse

If Product CRUD and Category CRUD use the same table/form/modal pattern, reuse the common components.

Do not copy the entire implementation and modify it manually.

---

# API Contract

CRUD pages must follow the Backend API contract.

Never assume:

- IDs
- response fields
- status values
- validation rules
- permissions

are the same as another module.

Check the actual API contract.