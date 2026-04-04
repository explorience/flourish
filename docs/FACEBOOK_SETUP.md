# Facebook Cross-Posting Setup Guide

This gets Flourish auto-posting new listings to your Facebook Page/Group.

## What you need

- A Facebook account that administers the Page or Group you want to post to
- ~15 minutes

## Step 1: Create a Facebook App

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Log in with your Facebook account
3. Click **My Apps** → **Create App**
4. Select **Business** type → Next
5. App name: `Flourish Community Exchange` (or whatever you like)
6. Contact email: your email
7. Business Account: skip or select your existing one
8. Click **Create App**

## Step 2: Add the Pages API product

1. In your new app dashboard, click **Add Product** in the left sidebar
2. Find **Facebook Login for Business** and click **Set Up**
3. Skip the quickstart — go back to the dashboard
4. In the left sidebar, go to **App Settings** → **Basic**
5. Note your **App ID** and **App Secret** — you'll need these

## Step 3: Get a Page Access Token

### Option A: Graph API Explorer (quickest)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the **Facebook App** dropdown
3. Click **Generate Access Token**
4. When prompted for permissions, grant these:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
5. Click **Generate Access Token** and authorize
6. Now in the explorer, make this request:
   ```
   GET /me/accounts
   ```
7. This returns your Pages. Find the one you want and copy its:
   - `id` — this is your **Page ID**
   - `access_token` — this is your **Page Access Token**

### Option B: Posting to a Group instead

If you want to post to a Facebook Group (not a Page):

1. Same as above, but request these permissions:
   - `publish_to_groups`
2. In the Graph API Explorer, request:
   ```
   GET /me/groups
   ```
3. Find your group and copy its `id`
4. Use this as `FB_PAGE_ID` (the code works the same for groups)

## Step 4: Make the token long-lived

The token from Step 3 expires in ~1 hour. Convert it:

1. In your browser, go to:
   ```
   https://graph.facebook.com/v19.0/oauth/access_token?
     grant_type=fb_exchange_token&
     client_id=YOUR_APP_ID&
     client_secret=YOUR_APP_SECRET&
     fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
   ```
   (Replace the three values)

2. The response gives you a long-lived token (~60 days)

3. To get a **permanent** page token (never expires), use the long-lived user token:
   ```
   GET /me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN
   ```
   The page access tokens returned here are permanent as long as:
   - The user remains an admin of the page
   - The app permissions aren't revoked

## Step 5: Set environment variables

Add these to your Vercel project (Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `FB_PAGE_ID` | The Page/Group ID from Step 3 |
| `FB_PAGE_ACCESS_TOKEN` | The long-lived token from Step 4 |

## Step 6: Test it

After deploying, you can test with curl:

```bash
curl -X POST https://flourish.ourlondon.xyz/api/facebook \
  -H "Content-Type: application/json" \
  -d '{
    "post": {
      "type": "offer",
      "title": "Test post - please ignore",
      "details": "Testing the auto-posting integration",
      "category": "other",
      "contact_name": "Admin"
    }
  }'
```

Check your Facebook Page/Group — the post should appear within a few seconds.

## Step 7: Enable in Flourish

Once I wire the auto-posting into the moderation approval flow, there'll be an admin toggle in the dashboard (like the vouch toggle). When a moderator approves a post, it'll auto-post to Facebook if the toggle is on.

## Troubleshooting

**"OAuthException: (#200) Permissions error"**
→ Your token doesn't have `pages_manage_posts`. Regenerate with the correct permissions.

**"Application request limit reached"**
→ Facebook rate limits: 200 calls/user/hour. You won't hit this unless something is looping.

**"Error validating access token"**
→ Token expired. Regenerate a long-lived token (Step 4).

**Posts not appearing on Page**
→ If your app is in Development mode, posts are only visible to app admins. Go to App Review → make the app Live (or add team members as testers).

## App Review (for production)

Facebook apps in Development mode can only post on behalf of people who are admins/developers/testers of the app. For a community exchange board, this is probably fine — you're the only one posting.

If you ever need other people to connect their pages, you'd need to submit for App Review. But for auto-posting from your own Page, Development mode works.

## Notes

- The current implementation posts to the Page **feed** (wall). Posts appear as "from the Page."
- Format: emoji + type + title + details + category + link back to Flourish
- No images yet (that's a separate feature — #26)
- Rate: one Facebook post per approved Flourish listing. If you approve 5 posts at once, that's 5 Facebook posts.
