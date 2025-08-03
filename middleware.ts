import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        if (req.nextUrl.pathname.startsWith('/dashboard') ||
            req.nextUrl.pathname.startsWith('/instructor') ||
            req.nextUrl.pathname.startsWith('/buy-credits') ||
            req.nextUrl.pathname.startsWith('/reports')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/instructor/:path*',
    '/buy-credits/:path*',
    '/reports/:path*'
  ]
}
