import 'next-auth'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
      githubUsername?: string
    } & DefaultSession['user']
  }
  interface JWT {
    accessToken?: string
    githubUsername?: string
  }
  interface User {
    accessToken?: string
  }
} 