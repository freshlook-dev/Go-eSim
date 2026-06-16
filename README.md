This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

## Recreate the Supabase database

If the database was deleted or reset, recreate the required tables from the SQL bootstrap:

1. Open your Supabase project dashboard.
2. Go to SQL Editor.
3. Paste the contents of `supabase/schema.sql`.
4. Run the query.
5. Confirm `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the same Supabase project.

The app uses three tables: `users`, `orders`, and `esim_purchases`.

## Provider environment variables

The eSIM provider API needs these variables in local `.env.local` and in your deployment platform:

```env
ESIM_API_BASE_URL=https://portal.esimcard.com/api/developer/reseller
ESIM_API_TOKEN=your_provider_api_token
```

If `ESIM_API_TOKEN` is not set, the app falls back to `ESIM_API_EMAIL` and `ESIM_API_PASSWORD` login.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
