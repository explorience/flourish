# Potluck — Product Requirements Document

**Version:** 0.1.0
**Date:** March 16, 2026
**Status:** Draft

-----

## 1. Vision

Potluck is a lightweight coordination tool that makes it effortless for people to collectively contribute to shared events and gatherings. It is the first module in a broader coordination stack — a simple, beautiful utility that answers one question: *“What do we need, and who’s bringing what?”*

The aesthetic is solarpunk cozy tech — warm, grassroots, minimal, and Apple-clean. It should feel like a handwritten sign-up sheet at a community potluck, but digital and delightful.

-----

## 2. Core Concepts

|Concept           |Description                                                                                                                                            |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
|**Potluck**       |A coordination container tied to an event, gathering, or shared need. Has a title, description, date/time, location, banner image, and a pool of needs.|
|**Need**          |Something the host has identified as required. Has a name, emoji, optional quantity, optional point value, and a claim status.                         |
|**Offer**         |Something a participant volunteers to bring — either by claiming an existing need or proposing something new (if the host allows open offers).         |
|**Host**          |The person who creates and manages the potluck. Can verify contributions and assign points.                                                            |
|**Participant**   |Anyone who claims a need or makes an offer. May or may not have an account.                                                                            |
|**Potluck Points**|An optional reputation layer. The host assigns point values to needs; participants earn points when the host verifies their contribution.              |

-----

## 3. User Roles

### 3.1 Host

- Creates and edits potlucks
- Defines needs (name, emoji, quantity, point value)
- Sets access level (invite-only, link-shared, public)
- Toggles whether open offers are accepted
- Verifies that participants followed through on their commitments
- Requires an account

### 3.2 Participant

- Browses available potlucks (public) or accesses via link/invite
- Claims a need or submits an open offer
- Can participate without an account (guest mode with name + optional email)
- Creating an account enables point accumulation and history

### 3.3 Guest (no account)

- Can claim needs or make offers using just a display name
- Cannot accumulate points across potlucks
- Prompted (not forced) to create an account after first interaction

-----

## 4. Access Levels

|Level          |Behavior                                                                                                 |
|---------------|---------------------------------------------------------------------------------------------------------|
|**Invite Only**|Host sends invitations (email or generated single-use codes). Only invited users can view or participate.|
|**Link Shared**|Anyone with the unique potluck URL can view and participate. Not discoverable publicly.                  |
|**Public**     |Listed on the Potluck homepage. Anyone can view and participate.                                         |

-----

## 5. Feature Requirements

### 5.1 Potluck Creation (Host)

**Required fields:**

- Title (text, max 100 chars)
- Description (text, max 500 chars)
- Date & time (with timezone)
- Location (free text — address, venue name, or “Online”)
- Access level (invite-only / link / public)
- Open offers toggle (yes/no — default: yes)

**Optional fields:**

- Banner image (upload, max 5MB, displayed as title card)
- Points enabled toggle (default: off)

### 5.2 Needs Management (Host)

- Add needs: emoji picker + name + optional quantity + optional point value
- Edit or remove needs at any time
- Reorder needs via drag-and-drop
- See claim status at a glance (unclaimed / claimed by whom)

### 5.3 Claiming & Offering (Participant)

- View all needs with their emoji, name, quantity, and claim status
- Claim a need with one tap (assigns it to you)
- Unclaim if plans change
- Submit an open offer (if host allows): emoji + name + optional description
- Guest participants enter a display name on first interaction

### 5.4 Potluck Dashboard (Host View)

- Summary: title card with banner, event details, progress bar (X of Y needs claimed)
- Needs list with claim status and participant names
- Open offers section (if enabled)
- Participant list
- Verification controls (post-event): mark each contribution as verified or unverified
- Share controls: copy link, invite via email

### 5.5 Potluck View (Participant View)

- Title card with banner and event details
- Needs list — can claim/unclaim
- Open offers section — can add an offer
- Personal summary: what you’ve committed to bringing
- Points earned (if enabled and account exists)

### 5.6 Public Homepage

- List of public potlucks, sorted by date (upcoming first)
- Each shown as a card: banner thumbnail, title, date, location, progress indicator
- Simple search/filter by date or keyword

### 5.7 User Profiles & Accounts

- Sign up with email + password or OAuth (Google)
- Profile: display name, avatar (optional), total potluck points, participation history
- Account is optional for participation but required for hosting and point accumulation
- Profile page shows: potlucks hosted, potlucks participated in, total points

### 5.8 Potluck Points (Optional Feature)

- Host enables points when creating the potluck
- Host assigns a point value (integer) to each need
- After the event, host reviews contributions and marks them as verified
- Verified contributions award the assigned points to the participant’s profile
- Points are purely reputational (no currency, no exchange — yet)
- Open offers can also be assigned points by the host post-hoc

### 5.9 Notifications

- Email notification when someone claims a need (to host)
- Email notification when host verifies your contribution (to participant)
- Keep notifications minimal — no spam

-----

## 6. Non-Functional Requirements

|Requirement      |Target                                                                                |
|-----------------|--------------------------------------------------------------------------------------|
|**Performance**  |Page load < 2s on 3G. Realtime updates on claims via Supabase Realtime.               |
|**Accessibility**|WCAG 2.1 AA compliance. Keyboard navigable. Screen reader friendly.                   |
|**Mobile**       |Mobile-first responsive design. Touch-friendly claim/offer interactions.              |
|**Deployment**   |Vercel (frontend + API routes) + Supabase (database, auth, storage, realtime).        |
|**Security**     |Row-level security in Supabase. Rate limiting on public endpoints. Input sanitization.|
|**Simplicity**   |Entire MVP should be deployable from a single repo. No microservices.                 |

-----

## 7. Out of Scope (v1)

- On-chain attestations and reputation
- Complex workflow management (post-pool coordination)
- Payment or monetary exchange
- Chat or messaging between participants
- Calendar integrations
- Mobile native apps
- Multi-host / co-host roles
- Recurring potlucks

-----

## 8. Success Metrics

- A host can create a potluck and share it in under 2 minutes
- A guest participant can claim a need in under 30 seconds (no account required)
- Public potlucks are discoverable and browsable on the homepage
- Points system functions end-to-end when enabled

-----

## 9. Design Principles

1. **Cozy over corporate.** Warm colors, rounded shapes, generous whitespace. Solarpunk optimism.
1. **Minimal over maximal.** Every screen should have one clear action. No feature creep.
1. **Accessible over exclusive.** Guest participation is first-class. Accounts are encouraged, not gated.
1. **Legible over clever.** Clear labels, obvious affordances, no jargon.
1. **Modular over monolithic.** Built as a self-contained module that can plug into a larger coordination stack.