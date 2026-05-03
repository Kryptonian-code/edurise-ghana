
## 1. Admin / Staff Invitation Flow

Goal: Promote teachers and additional admins via a secure, single-use invite link instead of relying on the hardcoded founder email.

**Database (migration)**
- New table `staff_invitations`:
  - `email`, `role` (admin | teacher), `token_hash` (sha256), `invited_by`, `expires_at` (default `now() + 7 days`), `accepted_at`, `accepted_by`, `revoked_at`.
- RLS: only admins can `select / insert / update`. No public read.
- Postgres function `accept_staff_invitation(_token text)` — `SECURITY DEFINER`:
  - Hashes the token, finds a matching row that is not expired / accepted / revoked, matches on `auth.email() = invitation.email`, then inserts the role into `user_roles` (with `ON CONFLICT DO NOTHING`) and stamps `accepted_at` / `accepted_by = auth.uid()`. Returns the granted role.
- Replace the hardcoded-email branch in `handle_new_user`: every new signup defaults to `parent`. Promotion happens only via accepted invitations. (Keep retroactive admin row for the founder so you don't get locked out.)

**Edge function `invite-staff`** (admin-only, JWT verified in code)
- Validates input with zod (`email`, `role`).
- Confirms caller has `admin` role via `has_role`.
- Generates a random token (32 bytes, base64url), stores only the SHA-256 hash, returns the plaintext token + invite URL once.
- Sends the invite email through the existing transactional email queue (or surfaces the link in-app for copy/share if email isn't set up yet — see Section 4).

**Frontend**
- `src/pages/admin/InvitationsPage.tsx` (route `/admin/invitations`, admin-only):
  - Form to invite by email + role (admin/teacher).
  - Table of pending / accepted / revoked invites with copy-link, resend, revoke actions.
- `src/pages/AcceptInvitePage.tsx` (route `/accept-invite?token=...`):
  - If not signed in: prompt sign-up/sign-in with the invited email pre-filled, then auto-call `accept_staff_invitation` after auth.
  - If signed in: call RPC immediately, show success + redirect to the matching portal.
- Add "Invitations" link to the admin sidebar.

## 2. Role-Based Routes & UI Permissions

**Routing (`src/App.tsx`)**
- Keep `/admin/*` as `allowedRoles={["admin"]}`.
- New `/teacher/*` group wrapped in `ProtectedRoute allowedRoles={["teacher","admin"]}` using a new `TeacherLayout` with its own sidebar:
  - `/teacher` (overview), `/teacher/classes`, `/teacher/attendance`, `/teacher/results`, `/teacher/announcements` (read-only).
- `/parent/*` group wrapped in `ProtectedRoute allowedRoles={["parent","admin"]}` using a `ParentLayout`:
  - `/parent` (children overview), `/parent/fees`, `/parent/attendance`, `/parent/results`, `/parent/announcements`.
- `ProtectedRoute` enhancement: when a signed-in user hits a route they lack, redirect to *their* home portal (not `/`) and show a toast.
- Login redirect already routes by role — keep, but also honour `?redirect=` and the `state.from` location for the invite flow.

**UI gating helper**
- Add `useHasRole(role)` and `<RoleGate roles={[...]}>` in `src/contexts/AuthContext.tsx` so any button/link can be conditionally rendered.
- Apply to: admin-only actions inside shared components (delete student, edit fee, publish announcement, CMS links, settings tabs).
- `DashboardLayout` sidebar: filter items by role so a teacher viewing an admin-shared component never sees admin-only entries.

## 3. What I Recommend Next (stability roadmap)

In rough priority order — pick what matters and I'll execute:

1. **Migrate remaining `localStorage` modules to Supabase**: students, fees, attendance, results, announcements, branding, CMS. Right now data is split between the DB and the browser, which breaks multi-device use and RLS guarantees.
2. **Storage uploads with signed access**: wire student photos and the school logo to the existing `student-photos` / `school-assets` buckets; tighten the public-bucket linter warning by scoping read policies.
3. **Audit log table** (`audit_events`) for sensitive actions: invitations, role grants, fee edits, result changes, student deletions. Helps trust and debugging.
4. **Auth hardening**: enable HIBP leaked-password check, add a `/reset-password` flow, optional Google sign-in, require email verification before accessing portals.
5. **Email infrastructure**: stand up the transactional email pipeline so invitations, fee receipts, admission status updates, and announcement digests are sent automatically.
6. **Server-driven fee/result calculations**: move totals, balances, and WAEC grading into Postgres views/functions so report cards and parent statements are always consistent.
7. **Notifications + parent linking**: in-app inbox, plus admin UI for linking parent accounts to student records (`parent_students`).
8. **Production polish**: 404/empty/error states for every async screen, skeletons instead of blank flashes, global error boundary, basic e2e smoke tests, and a one-screen "Setup checklist" on the admin dashboard (school info, logo, classes, first invite).

## Technical Details

- Token storage uses `encode(digest(token, 'sha256'), 'hex')` via `pgcrypto`; the plaintext token is returned only from the edge function response.
- `accept_staff_invitation` runs as `SECURITY DEFINER` with `SET search_path = public, extensions` and validates `auth.uid() IS NOT NULL` plus email match to prevent token sharing.
- Edge function uses `@supabase/supabase-js` with the user's JWT for the `has_role` check and the service-role key only for the insert into `staff_invitations`.
- `AuthContext` already exposes `roles`; we'll add memoised `isAdmin`, `isTeacher`, `isParent`, and a `primaryPortalPath` helper to centralise redirect logic.
- New layouts (`TeacherLayout`, `ParentLayout`) reuse the existing `DashboardLayout` shell with a role-specific `sidebarItems` array — no visual redesign.

## Files to Add / Edit

- Add: `supabase/migrations/<ts>_staff_invitations.sql`, `supabase/functions/invite-staff/index.ts`, `src/pages/admin/InvitationsPage.tsx`, `src/pages/AcceptInvitePage.tsx`, `src/layouts/TeacherLayout.tsx`, `src/layouts/ParentLayout.tsx`, `src/components/RoleGate.tsx`.
- Edit: `src/App.tsx` (routes), `src/contexts/AuthContext.tsx` (role helpers), `src/components/ProtectedRoute.tsx` (smart redirect), `src/layouts/DashboardLayout.tsx` (role-filtered sidebar + Invitations link), `src/pages/LoginPage.tsx` (honour redirect param).

## Confirm Before I Build

- Proceed with **Sections 1 + 2** now (invites + role-based routes/UI).
- For Section 3, tell me which item(s) to tackle next — my suggestion is **#1 (finish Supabase migration)** followed by **#5 (email infrastructure)** so invitations actually email out.
