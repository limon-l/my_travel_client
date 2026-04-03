# Wanderlust Client

Production-ready Next.js client for Wanderlust travel booking.

## Live URLs
- Frontend: https://my-travel-client.vercel.app
- Backend API: https://my-travel-server-0d5q.onrender.com/api

## Key Features
- Authentication with NextAuth (Credentials + Google OAuth)
- Role-aware UI (Admin and Client)
- Client booking workflow:
  - Clients can request only admin-assigned dates
  - New requests are created as `Pending`
  - Status updates to `Confirmed` or `Rejected` after admin action
- Admin workflow:
  - Add Travel Date from package cards
  - Assign/disable tour dates in Dashboard Requests
  - Approve/reject booking requests
- Visual availability UX:
  - Available tours appear clear
  - Tours without active dates appear blurred for clients

## Performance Improvements
- Reduced unnecessary bookings API calls (skips for admin users)
- Memoized package filtering to reduce client-side recomputation
- Stable component updates with guarded async state updates

## Tech Stack
- Next.js 16 (App Router)
- React 19
- NextAuth
- Tailwind CSS
- Axios

## Local Setup
1. Install dependencies:
   - `npm install`
2. Create `.env.local` in client root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

3. Run:
   - `npm run dev`
4. Build check:
   - `npm run build`

## Demo Admin Credentials
- Email: `admin@wanderlust.com`
- Password: `admin123`

## Important Pages
- Packages: `/packages`
- Login: `/login`
- Admin Requests + Date Management: `/dashboard/requests`
- User Bookings: `/dashboard/bookings`

## Deployment Notes (Vercel)
Set environment variables in Vercel Project Settings:
- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_URL` (must be production URL)
- `NEXTAUTH_SECRET`
- OAuth/Firebase variables

If auth loops back to login, verify `NEXTAUTH_URL` is not localhost in production.

## Troubleshooting
### `Booking request API failed (404)`
Your backend deployment is missing latest routes. Redeploy backend service and ensure it serves:
- `GET /api/admin/bookings`
- `PUT /api/tours/:id/available-dates`

### `Update failed (404)` when assigning dates
Same root cause: production backend has old build. Redeploy backend from correct repo/root.
