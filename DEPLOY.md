# Deploying GrainHub to Vercel (free)

Follow these steps in order. Everything here is free — no credit card needed for the basics. Total time: ~30–45 minutes.

---

## Step 1 — Install Git for Windows (if you don't have it)

1. Go to https://git-scm.com/download/win
2. Download and run the installer.
3. Click "Next" through every screen — the defaults are all fine. This installs Git and **Git Bash**, a terminal you'll use below.

Verify by opening **Git Bash** (search for it in the Start menu) and running:

```bash
git --version
```

You should see something like `git version 2.45.0`.

---

## Step 2 — Delete the leftover .git folder

I accidentally left a partial `.git` folder in your project (sandbox hit a permission quirk). We need to delete it before initializing a fresh one.

1. Open File Explorer → navigate to `C:\Users\RichieBarrieau\Desktop\woodwork.io\_Application\grainhub-frontend\`
2. Click the **View** tab at the top → check **Hidden items** so you can see `.git`
3. Right-click the `.git` folder → **Delete**

(Or in Git Bash: `cd /c/Users/RichieBarrieau/Desktop/woodwork.io/_Application/grainhub-frontend && rm -rf .git`)

---

## Step 3 — Initialize git & make your first commit

In **Git Bash**, navigate to the project folder and run these commands one at a time:

```bash
cd /c/Users/RichieBarrieau/Desktop/woodwork.io/_Application/grainhub-frontend

git init -b main
git config user.email "apkrichie@gmail.com"
git config user.name "Richie"

git add .
git commit -m "Initial commit: GrainHub React + Vite frontend"
```

The last command should print something like `15 files changed, 4200 insertions(+)`. If it does, you're good.

---

## Step 4 — Create a GitHub account (if you don't have one)

1. Go to https://github.com/signup
2. Sign up with `apkrichie@gmail.com`.
3. Verify your email.

---

## Step 5 — Create an empty GitHub repo

1. Once logged in, click the **+** in the top right → **New repository**.
2. Repository name: `grainhub` (or `grainhub-frontend`, whatever you like).
3. Keep it **Public** (Vercel's free tier works best with public repos).
4. **DO NOT** check "Initialize with a README" or add a .gitignore — your local repo already has those.
5. Click **Create repository**.

GitHub will show you a page with setup instructions. Copy the section labeled **"…or push an existing repository from the command line"** — it looks like this:

```bash
git remote add origin https://github.com/YOUR-USERNAME/grainhub.git
git branch -M main
git push -u origin main
```

---

## Step 6 — Push your code to GitHub

Paste those three commands into Git Bash (the window that's still open from Step 3).

The first time you push, Git Bash will open a browser window asking you to sign in to GitHub — do that and authorize Git Credential Manager. You only need to do this once.

After the push succeeds, refresh your GitHub repo page — you should see all your files.

---

## Step 7 — Deploy to Vercel

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"** — sign in using the GitHub account you just created.
3. Vercel will ask to install its app on your account — click **Install** and allow it to access your `grainhub` repo.
4. Back on Vercel, click **"Add New Project"** → find `grainhub` in the list → click **Import**.
5. Vercel auto-detects that it's a Vite project. You don't need to change any settings. Just click **Deploy**.

Wait ~30 seconds. When it finishes, you'll get a URL like `https://grainhub-abc123.vercel.app`. **That's your live site.** Share it, bookmark it, open it on your phone.

---

## Step 8 — Every future update

From now on, whenever you change code locally and want to update the live site:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Vercel sees the push, rebuilds, and redeploys in ~30 seconds. No manual upload ever again.

---

## What's next

Once this is live, come back and we'll:
- Wire up the newsletter / contact forms so real email signups are captured (Formspree, free tier)
- Turn on Vercel Analytics so you can see traffic
- (Optional later) Register a real domain and point it here

---

## If something goes wrong

Open Git Bash, run the command, and paste both the command and the full error message back to me. I can diagnose almost anything from the error text.
