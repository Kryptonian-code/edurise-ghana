# EduRise Ghana

EduRise Ghana is a web-based school-management platform for Ghanaian schools. It brings public school information and day-to-day administration into one application.

## Features

- Public school website with admissions and enquiry journeys
- Role-based dashboards for administrators, teachers, parents, and students
- Student, class, attendance, results, report-card, and fee-management tools
- Parent and staff records, announcements, and school branding controls
- Supabase-backed data access and authentication

## Technology

- React, TypeScript, Vite, and Tailwind CSS
- shadcn/ui and React Router
- Supabase for authentication and data services

## Local setup

1. Install Node.js 20 or later.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the Supabase values for your project:

   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Deployment

Build the production assets with `npm run build`. Deploy the generated `dist/` directory to your preferred static hosting provider, and configure the provider with the same Supabase environment variables.

## Security

Do not commit `.env` files, Supabase secrets, student data, or screenshots containing personal information. Use a dedicated Supabase project and least-privilege access policies for each environment.
