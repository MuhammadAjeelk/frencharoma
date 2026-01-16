This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)

### MongoDB Setup

1. **Create a `.env.local` file** in the root directory:

```bash
MONGODB_URI=mongodb://localhost:27017/frencharomas
```

For **MongoDB Atlas** (cloud), use:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

2. **For local MongoDB development:**
   - Install MongoDB locally, or
   - Use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

### Development

First, install dependencies (if not already done):

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Test the database connection by visiting: [http://localhost:3000/api/test-db](http://localhost:3000/api/test-db)

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

### Database Connection

The app uses Mongoose for MongoDB connection management. The connection is cached globally to prevent multiple connections during development.

- Database connection utility: `src/lib/db.js`
- Models directory: `src/lib/models/`
- Example model: `src/lib/models/Example.js`

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
