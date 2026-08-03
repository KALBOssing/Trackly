# Fixing Your Supabase Upload Error — Step by Step

This walks through fixing the exact error from your log:

```
Profile picture upload failed: {
  code: 'PGRST125',
  details: null,
  hint: null,
  message: 'Invalid path specified in request URL'
}
```

**In plain terms:** your website tried to save an uploaded file to Supabase,
but the web address it used to do that was malformed somehow. This almost
always comes down to one of three things: your bucket name, your
`SUPABASE_URL` value, or a missing bucket. Go through these in order — most
people find it in Step 2 or 3.

---

## Step 1 — Confirm the bucket exists and is named correctly

1. Go to your Supabase project → left sidebar → **Storage**.
2. Look at the list of buckets. You need one named **exactly**:
   ```
   trackly-uploads
   ```
   - No capital letters, no extra spaces, no typos like `trackly_uploads`
     or `trackly-upload`.
3. If it's missing, click **New bucket**, type `trackly-uploads` exactly,
   and continue to Step 2 before creating it.
4. Click into the bucket (or check it while creating it) and confirm it's
   set to **Public**. If it says "Private," click the bucket's settings
   (usually a gear or the "..." menu) and toggle it to Public.

If you had to create or fix the bucket just now, skip to **Step 4**
(redeploy) after finishing this step — that alone might be the whole fix.

---

## Step 2 — Confirm `SUPABASE_URL` is exactly right

This is the most common cause of the specific error you saw. A trailing
slash or a stray space from copy-pasting is enough to break it.

1. In Supabase: **Project Settings → Data API**. Copy the **Project URL**
   shown there. It should look exactly like:
   ```
   https://xxxxxxxxxxxxxxxxx.supabase.co
   ```
   with nothing before `https://` and nothing after `.co` — no trailing
   `/`, no extra characters.
2. Go to Vercel → your project → **Settings → Environment Variables**.
3. Find `SUPABASE_URL`. Click the three dots → **Edit**.
4. **Delete the entire existing value** and paste the URL you just copied
   fresh from Supabase. Don't edit the old one — replace it completely,
   so there's no chance of a leftover character.
5. Do the same for `NEXT_PUBLIC_SUPABASE_URL` — it should be the identical
   value.
6. Save both.

*(Note: even if this specific error is more forgiving now — I made the code
itself automatically strip stray trailing slashes and spaces in the latest
update, so this exact mistake shouldn't cause problems going forward. It's
still worth fixing at the source.)*

---

## Step 3 — Confirm your service role key is correct

1. In Supabase: **Project Settings → API Keys**.
2. Find the **service_role** (sometimes labeled **secret**) key. Click to
   reveal it, then copy it.
3. In Vercel → **Settings → Environment Variables**, find
   `SUPABASE_SERVICE_ROLE_KEY`, edit it, delete the old value entirely,
   and paste the fresh copy.
4. Double-check you didn't accidentally paste the **anon/public** key into
   this field by mistake (they're both long strings and easy to mix up) —
   the service_role one is usually longer and Supabase will label it
   clearly when you reveal it.

---

## Step 4 — Redeploy

Environment variable changes don't apply automatically to a site that's
already live.

1. Go to Vercel → **Deployments**.
2. Click the three dots on the topmost (most recent) deployment →
   **Redeploy**.
3. Wait for it to finish (green "Ready" status).

---

## Step 5 — Test it

1. Visit your live site, log in, go to your profile.
2. Try uploading a profile picture again.
3. **If it works:** you're done.
4. **If it still fails:** go to Vercel → **Deployments** → click the
   current deployment → **Runtime Logs** (not Build Logs this time —
   Runtime Logs show what happens when someone actually uses the site).
   Try the upload again while that log page is open, and copy whatever
   new error appears. Send that to me exactly as it appears — the message
   will be different from `PGRST125` if the cause has changed, and that
   difference tells us exactly what to fix next.

---

## Why this happens

Supabase Storage is built on top of a database-facing API layer. When the
address your app uses to reach it doesn't match what Supabase expects —
wrong bucket name, malformed URL, or a key that doesn't have permission —
Supabase can't tell *what* about the request is wrong, so it reports a
generic "invalid path" error rather than something specific like "bucket
not found." That's why this needs a step-by-step process of elimination
rather than a single obvious fix.
