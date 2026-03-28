# Flourish — Moderator Guide

_For community moderators of the Flourish mutual aid board (London, Ontario)_

---

## What is a Moderator?

Moderators are trusted community members who help keep the Flourish board welcoming, safe, and useful. Moderation on Flourish is light-touch by design — the community is built on trust. Your job is to catch clear violations, not police every post.

---

## What Can Moderators Do?

- **Approve** posts that are fine to show on the board
- **Reject** posts that violate community guidelines (with or without a reason)
- **View the admin dashboard** at `/admin` with board statistics and the moderation queue
- **Add new moderators** (admin-role only)
- **Remove moderators** (admin-role only)

Moderators do **not** have access to private messages, user account details, or contact information beyond what's publicly visible on a post.

---

## How to Log In

Flourish uses **magic link login** — no password required.

1. Go to [flourish.ourlondon.xyz/auth](https://flourish.ourlondon.xyz/auth)
2. Enter the email address you were added as a moderator with
3. Click "Send magic link"
4. Check your inbox and click the link
5. You'll be signed in and redirected to your account

Your magic link expires after a few minutes. If it doesn't work, request a new one.

---

## Accessing the Admin Dashboard

Once logged in, go to [flourish.ourlondon.xyz/admin](https://flourish.ourlondon.xyz/admin).

**Dashboard sections:**

| Section | What it shows |
|---|---|
| Overview | Total posts, active count, posts needing review, rejected count |
| Posts Needing Review | Active posts without an approved/rejected status |
| Quick Links | Board, About page, Feedback page, this guide |
| Moderators | (Admin only) List of mods, add/remove |

---

## How to Approve or Reject Posts

There are **two ways** to moderate a post:

### From the Admin Dashboard

1. Log in and go to `/admin`
2. Under **Posts Needing Review**, you'll see a list of posts
3. Click **✓ Approve** to approve — the post stays visible on the board
4. Click **✕ Reject** to reject:
   - An optional reason field appears
   - Type a brief reason (e.g. "commercial listing", "off-topic") or leave it blank
   - Click **Confirm** to finalize
5. The post disappears from the moderation queue

### From the Board (post cards)

When you're logged in as a moderator, every post card on the main board shows a small moderation bar at the bottom with **✓ Approve** and **✕ Reject** buttons.

### From Individual Post Pages

When viewing a post at `/post/[id]` while logged in as a moderator, you'll see a moderation panel with the same Approve/Reject buttons.

---

## Moderation Guidelines

### What to Approve

Approve posts that:
- Involve a **genuine need or offer** — items, services, skills, or space
- Are from the **London, Ontario** area (or reasonable travel distance)
- Are **not commercial** — one-off community exchanges only
- Use **respectful, inclusive language**
- Don't expose someone's personal information without consent

When in doubt, **approve**. The bar for rejection should be high.

### What to Reject

Reject posts that are clearly:

| Type | Examples |
|---|---|
| **Commercial listings** | A business advertising regular services for pay, Kijiji-style product sales |
| **Spam** | Repeated identical posts, gibberish, test posts |
| **Harmful content** | Anything promoting harm, harassment, illegal activity |
| **Irrelevant** | Completely off-topic (e.g. political rants, ads for events outside the community) |
| **Privacy violations** | Posts that expose someone else's personal info without consent |

### What NOT to Reject

Do **not** reject posts based on:
- Your personal opinion of whether the need/offer is "worthy"
- Political views expressed in a post (unless they cross into harmful territory)
- Unconventional requests — Flourish is for all kinds of community exchange
- Grammar, spelling, or writing style

---

## Rejection Reasons

When rejecting a post, a brief reason helps the community understand expectations, even if it's never shown publicly. Good reasons include:
- `commercial listing`
- `spam / duplicate`
- `off-topic`
- `harmful content`
- `outside service area`

Keep it factual, not judgmental.

---

## Edge Cases

**I'm not sure if I should reject this.** → Default to approve. Flourish is built on trust. Only reject what's clearly inappropriate.

**This post seems to be from a vulnerable person asking for help.** → Approve it and consider if there's a way the community can respond.

**I see the same person posting many times.** → Not automatically a problem if posts are genuine. Only flag if it looks like spam.

**A post has already received responses.** → Moderation actions still apply, but consider the impact. If the exchange is already happening and the post seems fine, leave it.

**Someone is harassing another user.** → Contact an admin immediately. Flourish doesn't currently have a formal reporting system, but we're working on it.

---

## Code of Conduct for Moderators

As a Flourish moderator, you agree to:

1. **Act in good faith** — moderate to protect the community, not to advance personal views
2. **Be consistent** — apply the same standards to all posts regardless of who posted them
3. **Be transparent** — when rejecting, provide a brief reason that others can understand
4. **Protect privacy** — never share information about posters outside the context of moderation
5. **Raise issues** — if you see patterns of misuse, escalate to an admin
6. **Step back** — if you have a personal conflict of interest with a post, don't moderate it
7. **Be human** — the board is for real people with real needs. Treat every post with that in mind.

Moderators who abuse their access will be removed.

---

## Admin-Only: Managing Moderators

If you have the **admin** role, you can manage the moderator list from the `/admin` dashboard.

**To add a moderator:**
1. Scroll to the Moderators section
2. Enter their email address (and optionally their name)
3. Click **Add**
4. They will have moderator access the next time they log in with that email

**To remove a moderator:**
1. Find them in the list
2. Click **Remove** next to their name
3. Their access is revoked immediately

Note: You cannot remove yourself from the moderator list.

---

## Need Help?

Contact the board admin at [1heenal@gmail.com](mailto:1heenal@gmail.com) or use the [feedback form](https://flourish.ourlondon.xyz/feedback).

---

_Flourish is open source (MIT license). The code lives on GitHub._
