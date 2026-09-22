---
alwaysApply: true
---
---
description: Admin authentication, authorization and security rules
alwaysApply: true
---

# Admin Security

The Admin Panel is NOT a security boundary.

Frontend protection exists for UX.

Backend protection exists for security.

---

# Authorization

Every privileged operation must be authorized by the Backend.

Examples:

- Create product
- Update product
- Delete product
- Update inventory
- Change order status
- Manage users
- Create/update coupon
- Process refunds
- Access reports
- Change configuration

---

# UI Permissions

Frontend permissions may be used to:

- hide navigation items
- hide buttons
- disable actions
- control page visibility

But frontend permissions must NEVER be considered sufficient security.

The backend must independently verify permissions.

---

# Authentication

Use the established authentication system.

Do not create separate authentication mechanisms for individual admin pages.

Handle:

- session expiry
- unauthorized API responses
- logout
- permission failures

consistently.

---

# Resource-Level Authorization

Do not assume that an admin has unlimited access to every resource.

If the backend supports granular permissions, the Admin Panel must respect them.

---

# Secrets

Never expose:

- database credentials
- JWT signing secrets
- payment provider secret keys
- private cloud credentials
- SMTP passwords
- backend private keys

Never place these in browser-accessible environment variables.

---

# Sensitive Information

Do not unnecessarily display:

- password hashes
- authentication tokens
- payment credentials
- private user information

Only display information required for the admin task.

---

# Destructive Actions

Destructive actions should:

1. Clearly communicate the action.
2. Use the common confirmation component.
3. Call the backend.
4. Handle failure.
5. Refresh/update authoritative state.

Never assume deletion succeeded before receiving backend confirmation.