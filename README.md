🌍 Wanderlust - Premium Travel Booking Platform

A full-stack, realistic travel agency application built with Next.js (App Router) and Express.js. This platform features role-based access control, secure authentication, and a robust booking system with date-conflict logic.

🚀 Live Demo

Frontend (Vercel): [[https://my-travel-client.vercel.app](https://my-travel-client.vercel.app)]

Backend (Render): [https://my-travel-server1.onrender.com](https://my-travel-server1.onrender.com)

✨ Key Features

🔒 Authentication & Roles

Secure Auth: Login/Register using NextAuth.js (Credentials + Google OAuth).

Split-Screen Design: Professional, realistic authentication UI.

Role-Based Access:

User: Can browse tours, view details, book trips, and manage their own bookings.

Admin: Can Add, Edit, and Delete tour packages via a dedicated Dashboard.

📅 Smart Booking System

Date Selection: Users must select a travel date.

Conflict Prevention: The backend enforces a rule that a user cannot book two tours on the same date.

Persistence: Bookings are stored in MongoDB linked to the specific User profile.

My Bookings: A personalized dashboard for users to view and cancel their confirmed trips.

🎨 Premium UI/UX

Responsive Design: Fully optimized for Mobile, Tablet, and Desktop.

Glassmorphism & Clean Layouts: Uses Tailwind CSS for a modern aesthetic.

Micro-interactions: Hover effects, loading states, and toast notifications.

Dynamic Image Handling: Supports external image links securely.

🛠 Tech Stack

Frontend

Framework: Next.js 14 (App Router)

Styling: Tailwind CSS, Lucide React (Icons)

State/Auth: NextAuth.js, React Hooks

HTTP Client: Axios

Backend

Server: Node.js, Express.js

Database: MongoDB (Mongoose ODM)

Security: BCrypt (Password Hashing), CORS protection

📂 Project Structure

wanderlust/
├── client/                 # Next.js Frontend
│   ├── src/app/            # App Router Pages
│   │   ├── (auth)/         # Login & Register
│   │   ├── (protected)/    # Dashboard (User/Admin)
│   │   └── ...
│   ├── src/components/     # Reusable UI (Navbar, BookButton)
│   └── ...
├── server/                 # Express Backend
│   ├── models/             # Mongoose Schemas (User, Tour, Booking)
│   ├── index.js            # Server Entry Point & Routes
│   └── ...
└── README.md


⚙️ Installation & Setup

1. Clone the Repository

git clone [https://github.com/limon-l/my_travel_client.git](https://github.com/limon-l/my_travel_client.git)
cd my_travel_client


2. Backend Setup

Navigate to the server folder (if separate repo, clone it) and install dependencies:

cd server
npm install


Create a .env file in the server folder:

MONGO_URI=your_mongodb_connection_string
PORT=5000


Start the backend:

node index.js
# Console should say: "Server running on port 5000" & "MongoDB Connected"


3. Frontend Setup

Open a new terminal, navigate to the client folder:

npm install


Create a .env.local file in the root:

# API Connection
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# NextAuth Config
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret


Start the frontend:

npm run dev


Visit http://localhost:3000 in your browser.

🔑 Admin Credentials (Demo)

To access the Manage Inventory and Add Tour pages, use this hardcoded admin account or register a new one with this specific email:

Email: admin@wanderlust.com

Password: admin123

Note: Regular users (any other email) will only see "My Bookings" in the dashboard.

🛣 API Routes

Method
Endpoint
Description

POST/api/register
Create a new user account

POST/api/login
Authenticate user

GET/api/tours
Fetch all tour packages
POST/api/tours
Add a new tour (Admin)
DELETE/api/tours/:id
Delete a tour (Admin)
POST/api/bookings
Book a tour (Date conflict check)
GET/api/bookings/:id
Get specific user bookings

📝 License

This project is open-source and available under the MIT License.
