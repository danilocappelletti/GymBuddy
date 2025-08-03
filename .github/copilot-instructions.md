<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sbookyway - Booking Platform

This is a comprehensive Next.js booking platform called Sbookyway with the following features:

## Technology Stack
- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe integration
- **UI Components**: Radix UI components
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Key Features
1. **Booking System**: Manage classes, courses, and activities with time slots
2. **Credit System**: Pre-purchased credit bundles for booking activities
3. **User Roles**: Admin, Instructor, and Customer roles with different permissions
4. **Instructor Dashboard**: Personal menu for instructors to view assigned activities
5. **Waiting Lists**: Automatic waiting list management with notifications
6. **Advanced Reporting**: Detailed analytics on attendance and credit usage
7. **Live Classes**: Integration with video conferencing platforms
8. **Media Management**: Activity photos and branding support

## Database Schema
The application uses a comprehensive database schema with the following main models:
- **User**: Admin, Instructor, and Customer users with role-based access
- **Activity**: Classes and courses that can be booked
- **Class**: Specific time slots for activities
- **Booking**: User bookings with status tracking
- **CreditPackage**: Pre-purchased credit bundles
- **WaitingList**: Queue management for full classes
- **CreditTransaction**: Track credit purchases and usage

## Development Guidelines
- Use TypeScript for all components and API routes
- Follow Next.js App Router conventions
- Implement proper error handling and validation
- Use Prisma for database operations
- Implement responsive design with Tailwind CSS
- Follow accessibility best practices
- Use server components when possible for better performance

## Code Style
- Use functional components with TypeScript
- Implement proper prop types and interfaces
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow the existing folder structure in src/
- Use absolute imports with @ alias for src/ directory
