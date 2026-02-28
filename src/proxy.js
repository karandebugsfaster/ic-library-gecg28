// // src/middleware.js

// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function proxy(request) {
//   const token = await getToken({ 
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET 
//   });

//   const path = request.nextUrl.pathname;

//   // Public paths
//   const publicPaths = ['/login', '/register', '/'];
//   const isPublicPath = publicPaths.some(p => path.startsWith(p));

//   // If trying to access protected route without auth
//   if (!isPublicPath && !token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // Role-based protection
//   if (token) {
//     // Check if session is invalidated
//     if (token.sessionInvalidatedAt && 
//         new Date(token.sessionInvalidatedAt) > new Date(token.iat * 1000)) {
//       return NextResponse.redirect(new URL('/login?session=expired', request.url));
//     }

//     // Check account status
//     if (token.status !== 'active') {
//       return NextResponse.redirect(new URL('/login?account=inactive', request.url));
//     }

//     // Manager routes
//     if (path.startsWith('/manager') && token.role !== 'manager') {
//       return NextResponse.redirect(new URL('/unauthorized', request.url));
//     }

//     // Faculty routes
//     if (path.startsWith('/faculty') && token.role !== 'faculty') {
//       return NextResponse.redirect(new URL('/unauthorized', request.url));
//     }

//     // Student routes
//     if (path.startsWith('/student') && token.role !== 'student') {
//       return NextResponse.redirect(new URL('/unauthorized', request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/manager/:path*',
//     '/faculty/:path*',
//     '/student/:path*',
//     '/api/requests/:path*',
//     '/api/users/:path*',
//   ],
// };
// src/middleware.js

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // If not authenticated and trying to access protected routes
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check session invalidation
    if (token?.sessionInvalidatedAt) {
      const tokenIssuedAt = token.iat * 1000;
      const sessionInvalidatedAt = new Date(token.sessionInvalidatedAt).getTime();

      if (sessionInvalidatedAt > tokenIssuedAt) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Check account status
    if (token?.status !== 'active') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based access control
    if (pathname.startsWith('/manager') && token?.role !== 'manager') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/faculty') && token?.role !== 'faculty') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/student') && token?.role !== 'student') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/manager/:path*', '/faculty/:path*', '/student/:path*'],
};