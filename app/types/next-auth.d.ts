
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      companyName?: string | null
      firstName?: string | null
      lastName?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: string
    companyName?: string | null
    firstName?: string | null
    lastName?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    companyName?: string
    firstName?: string
    lastName?: string
  }
}
