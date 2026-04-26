# CampusConnect Feature Roadmap

This roadmap is based on the current application shape:

- Public event discovery
- Student registration, email verification, and login
- Admin login and moderation
- Event creation and applicant review
- Notifications, profile management, and bulk email to applicants

The goal is to extend the product in layers that fit the current codebase instead of jumping straight into large rewrites.

## Phase 1: High-Value, Low-Risk

These features build directly on the flows that already exist.

### 1. Saved Events

Why:
- Helps students keep track of interesting opportunities
- Easy UX win with strong repeat-use value

Frontend:
- Add bookmark action on event cards
- Add a `Saved` section inside the student workspace

Backend needs:
- `saved_events` join table
- Endpoints to save, unsave, and list saved events

### 2. Event Editing and Draft Mode

Why:
- Organizers currently create and submit in one step
- Drafts reduce accidental submissions and make the app feel more complete

Frontend:
- Add draft/save/update actions in the event form
- Add edit controls in `Managed events`

Backend needs:
- Event update endpoint expansion
- Draft status such as `DRAFT`
- Approval resubmission flow

### 3. Applicant Filters

Why:
- Organizers need faster review once applicant volume grows
- Strongly aligned with existing application status workflow

Frontend:
- Filter by status, department, year, skills
- Search within event applicants

Backend needs:
- Query params on event applications endpoint
- Optional sorting by date or status

### 4. Organizer Notes on Applicants

Why:
- Makes shortlisting practical
- Useful before adding full chat or interview workflows

Frontend:
- Add note field on application cards
- Show notes only to the event organizer

Backend needs:
- Organizer-only note column or related notes table
- Create/update endpoint

## Phase 2: Core Product Maturity

These features make CampusConnect feel like a real operational platform.

### 5. Resume and Portfolio Uploads

Why:
- Student applications become much more useful
- Organizers can evaluate beyond a short text message

Frontend:
- File upload in profile and/or application form
- Resume preview or download actions

Backend needs:
- File storage strategy
- Profile/application attachment fields
- Secure file access rules

### 6. Custom Application Questions

Why:
- Different events need different screening
- Gives organizers more control without manual back-and-forth

Frontend:
- Builder for application questions in event creation/editing
- Dynamic application form for students

Backend needs:
- Question schema per event
- Answer storage per application

### 7. Rich Notifications

Why:
- The app already has notifications, so this is a natural upgrade
- Great leverage across many workflows

Frontend:
- Notification grouping
- Action links from notifications
- Unread counters by category

Backend needs:
- Notification type and metadata payloads
- More sources: saved events, edits, approvals, selections

### 8. Waitlist and Capacity Tracking

Why:
- Important for real event operations
- Extends event lifecycle cleanly

Frontend:
- Capacity indicators
- Waitlist state in student and organizer views

Backend needs:
- Waitlist logic
- Auto-promotion rules if selected students drop

## Phase 3: Communication Layer

These features deepen collaboration and move the app from listing platform to workflow platform.

### 9. In-App Chat

Why:
- Reduces email-only coordination
- Great for selected or shortlisted applicants

Frontend:
- Chat panel in workspace
- Conversation list and unread indicators

Backend needs:
- Message model
- Conversation model
- Socket support for real-time delivery

### 10. Announcement Composer

Why:
- Organizers often need to message all applicants or selected groups
- Pairs perfectly with the email functionality already present

Frontend:
- Announcement templates
- Send by email, in-app, or both

Backend needs:
- Announcement records
- Multi-channel delivery strategy

### 11. Scheduled Reminders

Why:
- Keeps users engaged without manual follow-up
- Strong value for deadlines and event-day operations

Frontend:
- Reminder settings in event management

Backend needs:
- Background job scheduling
- Reminder templates

## Phase 4: Admin Intelligence

These features help admins manage the platform as it grows.

### 12. Admin Review Comments

Why:
- Current rejection flow is too fixed
- Real moderation needs structured feedback

Frontend:
- Comment box when approving/rejecting events
- Event creator sees moderation feedback

Backend needs:
- Approval comment storage
- Comment included in event status responses

### 13. User Management

Why:
- Needed once more users join
- Important trust and safety control

Frontend:
- User list with role/status filters
- Suspend/reactivate actions

Backend needs:
- User admin endpoints
- Audit-safe status transitions

### 14. Analytics Dashboard

Why:
- Helps justify the product and understand adoption
- Strong demo value

Frontend:
- Charts for event activity, applications, approvals, engagement

Backend needs:
- Aggregation endpoints
- Time-based reporting queries

## Recommended Build Order

If the goal is to improve the app quickly without destabilizing it:

1. Saved events
2. Event editing + draft mode
3. Applicant filters
4. Organizer notes
5. Resume uploads
6. Custom application questions
7. Rich notifications
8. Admin review comments
9. Analytics dashboard
10. Chat and announcements

## Best Next 3 Features

If we want the highest payoff for the next implementation cycle, build these next:

### 1. Applicant Filters
- Fast to add
- Immediately improves organizer workflow
- Works with current event/application UI

### 2. Event Editing + Draft Mode
- Fixes a real lifecycle gap
- Makes organizer experience feel much more complete

### 3. Resume Uploads
- Big jump in practical usefulness
- Makes applications more serious

## Suggested Technical Strategy

To keep the project healthy while adding these features:

- Keep using the shared `api` client in `src/lib/api.js`
- Expand `WorkspacePage.jsx` only for nearby features, then split by role once the file grows too large
- Move major workflows into dedicated hooks or subcomponents before Phase 3
- Prefer backend-first schema additions for saved items, notes, questions, and uploads
- Add route-level docs as features land so frontend and backend stay aligned

## Suggested Future Refactor

Before adding chat or analytics, it would help to break the current workspace into:

- `StudentWorkspace`
- `OrganizerWorkspace`
- `AdminWorkspace`
- Shared cards and list components for events, applications, and notifications

That refactor is not required for Phase 1, but it will make Phase 3 and Phase 4 much easier.
