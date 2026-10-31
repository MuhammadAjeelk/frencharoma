# French Aromas

Storefront and admin panel for French Aromas, a Dubai-based perfume house.
Built with Next.js 16 (App Router), React 19, Tailwind CSS 4 and MongoDB
(Mongoose).

- Production: https://frencharomas.com (`main` branch)
- Staging: https://staging.frencharomas.com (`staging` branch, password-protected — ask the project owner for the login)

## Run it locally

You need **Node.js 20** and a **MongoDB** database.

```bash
git clone https://github.com/MuhammadAjeelk/frencharoma.git
cd frencharoma
npm install
```

Create `.env.local` in the project root:

```bash
MONGODB_URI=mongodb://localhost:27017/frencharomas
JWT_SECRET=any-long-random-string
# optional
# JWT_EXPIRE=7d
# UPLOAD_DIR=public/uploads/perfumes
# UPLOAD_URL_BASE=/uploads/perfumes
```

If you don't have MongoDB installed, run it in Docker:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:8
```

Create an admin login, then start the dev server:

```bash
node scripts/seed-admin.js      # admin@frencharomas.com / admin123
npm run dev
```

Open http://localhost:3000. The admin panel is at http://localhost:3000/admin.

A fresh database has no products, so the shop pages will be empty. The
homepage still renders, because every homepage image has a built-in default.
Add products through the admin panel, or ask the project owner for a copy of
the staging data.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build. Run this before pushing; it must pass |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `node scripts/<name>.js` | One-off Node + `sharp` scripts (image processing, seeding) |

## How it works

```
src/
  app/
    (main)/        Public storefront: homepage, collections, products, cart,
                   checkout, account, orders, wishlist, track-order
    (admin)/admin  Admin panel: perfumes, orders, homepage images, hero slides
    api/           Route handlers: auth, perfumes, brands, orders, reviews,
                   scent-families, admin/*
  components/      UI. Homepage sections live in components/home/
  lib/
    db.js          Cached Mongoose connection
    models/        Mongoose models: Perfume, Order, User, Review, SiteMedia, HeroSlides
    auth.js        JWT sign/verify (JWT_SECRET)
    upload.js      Saves uploaded images to UPLOAD_DIR
    siteMedia.js   Registry of homepage image slots and their default images
    design.js      Design tokens. Import these instead of retyping hex colours
public/            Static images, fonts, icons
scripts/           Node maintenance scripts
docs/              Design migration plan
```

**Data.** Everything lives in MongoDB: products, orders, users, reviews and
homepage settings. API routes under `src/app/api` read and write it, and
admin routes check for a logged-in user with the `admin` role.

**Images.** Admin uploads are saved to `public/uploads/perfumes` (or
`UPLOAD_DIR`). On the server, nginx serves `/uploads` straight from disk.

**Homepage.** The homepage is static, rebuilt at most once an hour or right
after an admin saves a change. Each homepage image is a *slot* in
`src/lib/siteMedia.js` with a default file. The database stores only the
images an admin has replaced (Admin → Homepage Images). The hero is a list
of slides that admins can add, remove and reorder. Keep the homepage static:
don't call `cookies()`, `headers()` or fetch per request there.

**Design.** Read `CLAUDE.md` and `docs/design-migration.md` before changing
styles. They list the colours, fonts, spacing and rules the site follows.

## Conventions

- **Changed image = new filename** (`-v2`, `-v3`). Next's image cache is keyed
  on the URL, so overwriting a file in place keeps serving the old one.
- A new homepage image gets a slot in `src/lib/siteMedia.js`. Don't hardcode
  a path in the component, or admins can't replace it.
- Keep `npm run build` passing on every commit.

## Branches and deploys

- Work on `staging`. **Pushing to `staging` deploys staging automatically**
  through GitHub Actions (`.github/workflows/deploy-staging.yml`).
- `main` is production. It is deployed by hand on the server, and only by
  the project owner.
