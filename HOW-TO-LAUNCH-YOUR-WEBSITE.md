# Getting Trackly Online — A Complete Beginner's Guide

You don't need to know how to code for this. Every step below uses a
website with buttons to click — no typing commands, no "terminal." It
will take about 45–60 minutes the first time. Do the steps in order.

---

## What you're setting up

Three free accounts, each doing one job:

| Service | What it does | Cost |
|---|---|---|
| **GitHub** | Stores your website's code | Free |
| **Supabase** | Your database (where lessons, students, grades live) + file storage | Free |
| **Vercel** | Runs your website and makes it live on the internet | Free |

---

## Part 1 — Create your accounts

1. Go to **github.com** → click **Sign up** → follow the prompts. Verify
   your email when it asks.
2. Go to **supabase.com** → click **Start your project** → sign up (you
   can use your GitHub account to sign in, which saves a step).
3. Go to **vercel.com** → click **Sign Up** → choose **Continue with
   GitHub** (this links Vercel to GitHub automatically, which you'll
   need later).

---

## Part 2 — Get the code onto your computer

1. Find the zip file I gave you (something like `trackly-phase3.zip`) and
   **unzip it**. On Windows: right-click it → "Extract All." On a Mac:
   double-click it. You'll get a folder named `trackly`.
2. Remember where that folder is — you'll point to it in the next part.

---

## Part 3 — Put the code on GitHub (using GitHub Desktop, no typing)

1. Go to **desktop.github.com** and download **GitHub Desktop**. Install
   it and open it.
2. Sign in with the GitHub account you just made.
3. Click **File → Add Local Repository**.
4. Click **Choose...** and select the `trackly` folder you unzipped in
   Part 2. Click **Add Repository**.
5. If it says "This directory does not appear to be a Git repository,"
   click **create a repository** in that same message.
   - Name: `trackly` (or anything you like)
   - Leave everything else as-is → click **Create Repository**.
6. You'll see a list of files on the left with a green "+" — that's
   normal, it means GitHub Desktop is ready to save them. In the box at
   the bottom left, type a short summary like `First upload` and click
   **Commit to main**.
7. Click the blue **Publish repository** button at the top.
   - Untick "Keep this code private" only if you're comfortable with
     that — otherwise leave it **checked** (private is the safer
     default; you can still deploy a private repo to Vercel for free).
   - Click **Publish Repository**.

Your code is now on GitHub. You won't need to touch GitHub Desktop again
until you want to make future changes (see the very last section).

---

## Part 4 — Create your database (Supabase)

1. In Supabase, click **New Project**.
   - Name: `trackly`
   - Database Password: click **Generate a password**, then click the
     copy icon and **paste it somewhere safe** (a Notes app, etc.) —
     you'll need it in a minute.
   - Region: pick whichever is closest to you.
   - Click **Create new project**. Wait 1–2 minutes while it sets up.
2. Once it's ready, click the **Connect** button near the top of the
   page (or find **Project Settings → Database** in the left sidebar).
3. Look for **Connection string** and choose the **URI** tab, then pick
   the option labeled **Transaction pooler** (it usually uses port
   `6543` — this version works better with how the website connects).
4. Copy that connection string. It looks like:
   `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-...supabase.com:6543/postgres`
5. Replace `[YOUR-PASSWORD]` in that string with the database password
   you copied in step 1. Save this full string somewhere — this is your
   **`DATABASE_URL`**, and you'll paste it into Vercel in Part 6.

### Turn on file storage (for resources, images, submissions)

6. In the Supabase left sidebar, click **Storage**.
7. Click **New bucket**. Name it exactly: `trackly-uploads`
8. Toggle it to **Public bucket** (so uploaded files can be viewed/
   downloaded) → click **Create bucket**.
9. In the left sidebar, click **Project Settings → API**.
10. You'll need three values from this page in Part 6 — copy each into
    your notes:
    - **Project URL** (this is your `SUPABASE_URL` and
      `NEXT_PUBLIC_SUPABASE_URL` — same value, used twice)
    - **anon public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
    - **service_role** key (this is your `SUPABASE_SERVICE_ROLE_KEY` —
      click "Reveal" to see it). Keep this one especially private.

---

## Part 5 — Make up two secret passwords for the app itself

The app needs two random secret strings it generates and checks
internally (you'll never see or type these anywhere except once, into
Vercel). You don't need to remember them — just generate two different
random strings and save both. Easiest way with no terminal:

1. Go to **generate-secret.vercel.app/32** in your browser. It shows a
   random string. Copy it — this is your **`NEXTAUTH_SECRET`**.
2. Refresh that same page to get a second, different random string.
   Copy it — this is your **`CRON_SECRET`**.

---

## Part 6 — Deploy the website on Vercel

1. In Vercel, click **Add New... → Project**.
2. Find your `trackly` repository in the list (you may need to click
   **Adjust GitHub App Permissions** and grant Vercel access to it
   first) → click **Import**.
3. You'll land on a screen titled "Configure Project." Leave the
   Framework Preset as **Next.js** (it should detect this
   automatically). Don't click Deploy yet.
4. Click to open **Environment Variables**. Add each of the following
   **one at a time** — paste the **Name** on the left and the
   **Value** on the right, then click **Add** after each one:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Supabase connection string from Part 4 |
   | `NEXTAUTH_URL` | leave this for now — see step 8 below |
   | `NEXTAUTH_SECRET` | the first random string from Part 5 |
   | `CRON_SECRET` | the second random string from Part 5 |
   | `SUPABASE_URL` | Project URL from Part 4 |
   | `NEXT_PUBLIC_SUPABASE_URL` | same Project URL again |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key from Part 4 |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key from Part 4 |

5. Click **Deploy**. This takes 2–4 minutes — Vercel is installing
   everything and setting up your database tables automatically. You'll
   see a progress screen; wait for it to say the deployment succeeded.
6. Once it's done, click **Continue to Dashboard**, then find your
   live website address near the top — it looks like
   `https://trackly-something.vercel.app`. Click it to confirm it loads
   (you'll see the homepage).
7. Copy that exact web address.
8. Go back to your Vercel project → **Settings → Environment
   Variables**. Find `NEXTAUTH_URL`, click the three dots next to it →
   **Edit**, and paste your website address as the value (no trailing
   slash, e.g. `https://trackly-something.vercel.app`). Save.
9. Go to the **Deployments** tab, click the three dots on the most
   recent (top) deployment → **Redeploy** → confirm. This restarts the
   site with the correct address now that it knows its own URL.

**Your website is now live.**

---

## Part 7 — Create your teacher account

1. Visit your website address.
2. Click **Register** (or **Sign Up**).
3. Fill in your name, email, and password, and choose **Teacher** as
   the role.
4. Submit — you'll be logged straight in (you do not need to verify
   your email to log in). You now have a teacher account with nothing
   in it yet: no classes, no students, no lessons. Start by creating a
   class from the **Classes** page, then invite students to register
   with the **Student** role and join it.

---

## Optional: Email notifications (deadline reminders, new-lesson emails)

Right now, in-app notifications work, but emails don't send unless you
add one more free account:

1. Go to **resend.com** → sign up → verify your email.
2. Follow their prompts to get an **API key** (Dashboard → API Keys →
   Create API Key).
3. In Vercel → your project → **Settings → Environment Variables**, add:
   - `RESEND_API_KEY` → the key you just copied
   - `EMAIL_FROM` → `Trackly <no-reply@yourdomain.com>` (Resend's free
     tier requires you verify a domain you own to send from a custom
     address — until you do, you can leave this step until later; the
     site works fine without it, it just won't send emails yet)
4. Redeploy (same as Part 6, step 9) for the change to take effect.

---

## A few things worth knowing

- **Scheduled publishing runs once a day.** Lessons/announcements you
  schedule for a future date will go live automatically, checked once
  daily around noon UTC. This is a limit of Vercel's free plan (it only
  allows cron jobs to run once a day). If you need something to publish
  at an exact time, use "Publish Now" instead of scheduling, or upgrade
  to Vercel's paid Pro plan (~$20/month) later, which allows
  minute-by-minute scheduling.
- **The free plans are genuinely free** for a small school — Supabase's
  free database tier and Vercel's free hosting tier both comfortably
  handle a few hundred students. You'll only need to pay if you grow a
  lot, and both services will email you before that happens.
- **If something looks broken after a deploy**, go to Vercel →
  Deployments → click the failed/latest one → **Build Logs**. You don't
  need to understand it — just copy the red error text and share it
  with whoever's helping you fix it (including me, in a future
  conversation).

---

## Making changes later

Any time I (or another developer) hand you updated project files:

1. Unzip the new folder.
2. Open **GitHub Desktop** — it should already be pointed at your
   `trackly` folder from before.
3. **Copy the new/changed files over the old ones** in that same
   folder on your computer (overwrite when asked).
4. GitHub Desktop will show you exactly what changed on the left.
5. Type a short summary at the bottom left (e.g. `Update lessons page`)
   → click **Commit to main** → click **Push origin** at the top.

Vercel is watching your GitHub repository and will **automatically
redeploy your site within a minute or two** every time you push — you
don't need to touch Vercel again for routine updates.
