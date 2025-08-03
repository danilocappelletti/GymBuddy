# Sbookyway - Professional Booking Platform

A comprehensive Next.js booking platform for managing activities, classes, and courses with advanced features like credit systems, instructor management, and detailed reporting.

## Features

### 🗓️ **Booking System**
- Intuitive interface for scheduling classes, courses, and activities
- Time slot management with capacity controls
- Multi-device support (computer, tablet, phone)
- Administrator entry management

### 💳 **Credit System & Payments**
- Pre-purchased credit bundles for booking activities
- Multiple credit package options
- Stripe integration for secure payments
- In-app purchase system

### 👥 **User Management**
- **Admin**: Full system control and management
- **Instructor**: Personal dashboard with assigned activities
- **Customer**: Booking interface with credit management

### ⏱️ **Advanced Booking Rules**
- Automatic registration management
- Subscription expiration blocking
- Medical certificate validation
- Weekly registration limits (customizable per customer)
- Multiple registration functionality
- Absence management

### 📹 **Live & Recorded Classes**
- Video conferencing platform integration
- JOIN button with encrypted links
- YouTube/Vimeo integration for recorded content
- Live broadcast participation

### 📋 **Waiting Lists**
- Self-enrollment on waiting lists
- Automatic notification when spots become available
- Weekly booking limitations
- Class visibility controls

### 📊 **Advanced Reporting**
- Detailed attendance reports (past and future)
- Credit usage analytics
- Personal detail analysis
- Real-time performance graphs
- Instructor activity reports

### 📱 **Social Sharing**
- Direct sharing to social networks
- SMS and email sharing
- Course/lesson detail sharing
- Location information included

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **UI Components**: Radix UI
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Stripe account (for payments)

### Installation

1. **Clone and setup the project:**
   ```bash
   cd Sbookyway
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and update with your credentials:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   ```

3. **Setup the database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Test Accounts

After running the seed script, you can use these test accounts:

### Customer Account
- **Email:** customer@sbookyway.com
- **Password:** customer123
- **Access:** Customer dashboard with booking features

### Instructor Account
- **Email:** instructor@sbookyway.com
- **Password:** instructor123
- **Access:** Instructor dashboard with class management

### Admin Account
- **Email:** admin@sbookyway.com
- **Password:** admin123
- **Access:** Full system administration

## Database Schema

The application uses a comprehensive database schema with the following main models:

- **User**: Multi-role user system (Admin, Instructor, Customer)
- **Activity**: Classes and courses that can be booked
- **Class**: Specific time slots for activities
- **Booking**: User bookings with status tracking
- **CreditPackage**: Pre-purchased credit bundles
- **WaitingList**: Queue management for full classes
- **CreditTransaction**: Credit purchase and usage tracking

## Project Structure

```
src/
├── app/                   # Next.js App Router pages
│   ├── dashboard/         # User dashboard
│   ├── book-class/        # Class booking interface
│   ├── buy-credits/       # Credit purchase
│   └── reports/           # Analytics and reporting
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features in Detail

### Credit System
- Flexible credit packages with different validity periods
- Automatic credit deduction on booking
- Credit history tracking
- Refund handling

### Booking Management
- Real-time capacity checking
- Automatic waiting list management
- Booking status tracking (Confirmed, Cancelled, Completed)
- Multiple booking support

### Instructor Dashboard
- View assigned activities
- Access subscriber information (admin controlled)
- Activity performance analytics
- Detailed reporting capabilities

### Advanced Reporting
- Attendance tracking with detailed analytics
- Credit usage patterns
- Revenue and performance metrics
- Exportable reports for business analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please refer to the documentation or create an issue in the repository.
