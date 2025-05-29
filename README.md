<div align="center">
  <br />
  <img src="https://via.placeholder.com/600x300.png?text=Ticket+SaaS+Banner" alt="Project Banner" width="600">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextdotjs" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
  </div>

  <h3 align="center">Ticket SaaS - Real-Time Event Ticketing Platform</h3>
</div>

## 📋 Table of Contents
- [🤖 Introduction](#introduction)
- [⚙️ Tech Stack](#tech-stack)
- [🔋 Features](#features)
- [🤸 Quick Start](#quick-start)
- [🛠️ Setup Instructions](#setup-instructions)
- [🏗️ Architecture](#architecture)
- [🎫 Usage](#usage)
- [📬 Contact](#contact)
- [📄 License](#license)

## <a name="introduction">🤖 Introduction</a>
Ticket SaaS is a modern, real-time event ticketing platform built with Next.js 14, Convex, Clerk, and Stripe Connect. It features a sophisticated queue system, real-time updates, and secure payment processing, making it ideal for event organizers and attendees. The platform supports seamless ticket purchasing, event management, and real-time analytics with a mobile-friendly, accessible design.

For a step-by-step guide to building this project, check out the accompanying tutorial [link to be added]. For assistance or bug reports, contact the project maintainer.

## <a name="tech-stack">⚙️ Tech Stack</a>
- **Next.js 14**: React framework for server-side and client-side rendering.
- **TypeScript**: Typed JavaScript for enhanced code reliability.
- **Convex**: Backend platform for real-time data synchronization and database management.
- **Clerk**: Authentication and user management platform.
- **Stripe Connect**: Payment gateway for secure, direct transactions.
- **TanStack Query**: Efficient data fetching and state management for real-time updates.
- **Tailwind CSS**: Utility-first CSS framework for responsive styling.
- **shadcn/ui**: Reusable, accessible UI components for rapid development.

## <a name="features">🔋 Features</a>

### For Event Attendees
- **🎫 Real-time Ticket Availability**: Track ticket availability in real-time.
- **⚡ Smart Queuing System**: Receive position updates during ticket purchasing.
- **🕒 Time-Limited Offers**: Complete purchases within a set time window.
- **📱 Mobile-Friendly Management**: Access and manage tickets on any device.
- **🔒 Secure Payments**: Process transactions securely with Stripe.
- **📲 Digital Tickets**: Receive QR-coded tickets for easy access.
- **💸 Automatic Refunds**: Get instant refunds for canceled events.

### For Event Organizers
- **💰 Direct Payments**: Receive payments via Stripe Connect.
- **📊 Real-Time Analytics**: Monitor sales and event performance live.
- **🎯 Automated Queue Management**: Manage ticket queues efficiently.
- **📈 Event Tracking**: Gain insights with detailed analytics.
- **🔄 Ticket Recycling**: Automatically reassign unclaimed tickets.
- **🎟️ Customizable Limits**: Set ticket quantities and restrictions.
- **❌ Event Cancellation**: Cancel events with automated refunds.
- **🔄 Bulk Refunds**: Process multiple refunds seamlessly.

### Technical Features
- **🚀 Real-Time Updates**: Powered by Convex for instant data sync.
- **👤 Authentication**: Secure user management with Clerk.
- **💳 Payment Processing**: Seamless transactions with Stripe Connect.
- **🌐 Hybrid Rendering**: Combines server-side and client-side rendering.
- **🎨 Modern UI**: Built with Tailwind CSS and shadcn/ui for consistency.
- **📱 Responsive Design**: Optimized for all devices.
- **🛡️ Rate Limiting**: Prevents abuse in queue joins and purchases.
- **🔒 Fraud Prevention**: Automated checks for secure transactions.
- **🔔 Toast Notifications**: Real-time user feedback.

### UI/UX Features
- **🎯 Instant Feedback**: Toast notifications for user actions.
- **🎨 Consistent Design**: Unified look with shadcn/ui components.
- **♿ Accessibility**: Fully accessible UI components.
- **🎭 Animations**: Smooth transitions and micro-interactions.
- **🔄 Loading States**: Visual feedback with skeleton loaders and progress indicators.

## <a name="quick-start">🤸 Quick Start</a>
Follow these steps to set up the project locally.

### Prerequisites
Ensure you have the following installed:
- [Node.js 18+](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Stripe Account](https://stripe.com/)
- [Clerk Account](https://clerk.com/)
- [Convex Account](https://www.convex.dev/)

### Cloning the Repository
```bash
git clone https://github.com/talha7k/ticket-saas.git
```

### Installation
Install dependencies:
```bash
npm install
```

### Running the Project
Start the development server:
```bash
npm run dev
```
In a separate terminal, start the Convex development server:
```bash
npx convex dev
```
Open `http://localhost:3000` in your browser to view the project.

## <a name="setup-instructions">🛠️ Setup Instructions</a>

### Environment Variables
Create a `.env.local` file in the project root and add:
```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
- **Convex URL**: Obtain from the Convex dashboard.
- **Clerk Keys**: Get from the Clerk dashboard.
- **Stripe Keys**: Get from the Stripe dashboard.
- **Webhook Secret**: Generated during Stripe CLI setup.
- **App URL**: Set to your local or production URL.

### Setting up Clerk
1. Create a Clerk application at [Clerk](https://clerk.com/).
2. Configure authentication providers (e.g., email, social login).
3. Set redirect URLs for sign-in and sign-up.
4. Add Clerk keys to `.env.local`.

### Setting up Convex
1. Create a Convex account at [Convex](https://www.convex.dev/).
2. Create a new project in the Convex dashboard.
3. Install the Convex CLI:
   ```bash
   npm install convex
   ```
4. Initialize Convex:
   ```bash
   npx convex init
   ```
5. Copy the deployment URL from the Convex dashboard to `.env.local`.
6. Start the Convex development server:
   ```bash
   npx convex dev
   ```
   Keep this running to sync backend functions and database schema.

### Setting up Stripe
1. Create a Stripe account at [Stripe](https://stripe.com/).
2. Enable Stripe Connect in the Stripe dashboard.
3. Configure payment settings (e.g., currencies, payout schedules).
4. Set up webhook endpoints for transaction events.

### Setting up Stripe Webhooks for Local Development
1. Install the Stripe CLI:
   - **macOS**:
     ```bash
     brew install stripe/stripe-cli/stripe
     ```
   - **Windows (using scoop)**:
     ```bash
     scoop install stripe
     ```
   - **Linux**:
     ```bash
     curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
     echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
     sudo apt update
     sudo apt install stripe
     ```
2. Log in to Stripe CLI:
   ```bash
   stripe login
   ```
3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (e.g., `whsec_xxxxx`) to `.env.local` as `STRIPE_WEBHOOK_SECRET`.
5. Keep the webhook forwarding running to receive events locally.

### Setting up UI Components
1. Initialize shadcn/ui:
   ```bash
   npx shadcn-ui@latest init
   ```
2. Install required components:
   ```bash
   npx shadcn-ui@latest add toast button card dialog toaster
   ```
3. Configure toast notifications in your layout (e.g., `app/layout.tsx`).

## <a name="architecture">🏗️ Architecture</a>

### Database Schema
- **Events**: Stores event details (e.g., name, date, ticket quantity).
- **Tickets**: Manages ticket data (e.g., status, QR code).
- **Waiting List**: Tracks users in the queue with position updates.
- **Users**: Stores user data synchronized with Clerk.

### Key Components
- **Real-Time Queue Management**: Handles ticket purchasing queues with Convex.
- **Rate Limiting**: Limits queue joins and purchases to prevent abuse.
- **Automated Offer Expiration**: Manages time-limited ticket offers.
- **Payment Processing**: Integrates Stripe Connect for secure transactions.
- **User Synchronization**: Syncs user data with Clerk and Convex using TanStack Query.

## <a name="usage">🎫 Usage</a>

### Creating an Event
1. Sign up as an event organizer via Clerk.
2. Complete Stripe Connect onboarding.
3. Create an event with details (e.g., name, date, ticket quantity).
4. Publish the event for ticket sales.

### Purchasing Tickets
1. Browse available events.
2. Join the queue for a desired event.
3. Receive a time-limited ticket offer.
4. Complete the purchase using Stripe.
5. Access the digital ticket with a QR code.

### Handling Refunds and Cancellations
- Organizers can cancel events from the dashboard.
- The system automatically processes refunds for ticket holders.
- Users can track refund status in their dashboard.

### User Experience
- **Real-Time Feedback**: Instant purchase confirmations, queue updates, and error notifications.
- **Interactive Elements**: Animated buttons, cards, progress indicators, and skeleton loaders.
- **Success Page**: Confirms ticket purchases with ticket details.
- **Ticket Status**: Tracks ticket and refund status.

## <a name="contact">📬 Contact</a>
For questions or feedback, reach out to:
- **Name**: Talha Khan
- **Email**: talha7k@gmail.com
- **Website**: https://dijitize.com
- **Phone**: 442-421-5593

## <a name="license">📄 License</a>
This project is licensed under the MIT License.
