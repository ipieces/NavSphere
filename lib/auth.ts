import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import type { NextAuthConfig } from 'next-auth'
import { isAdminUser } from './admin-users'

const config = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: { scope: 'repo' }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 确保获取正确的GitHub用户名，并进行类型检查
      const githubUsername = typeof profile?.login === 'string' 
        ? profile.login 
        : typeof user?.name === 'string' 
          ? user.name 
          : null
      
      if (!isAdminUser(githubUsername)) {
        console.log(`拒绝用户登录: ${githubUsername} (不在管理员列表中)`)
        return false // 拒绝登录
      }
      
      console.log(`允许管理员用户登录: ${githubUsername}`)
      return true
    },
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      // 添加用户信息到token，确保类型安全
      if (typeof profile?.login === 'string') {
        token.githubUsername = profile.login
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.accessToken = token.accessToken as string
        // 添加GitHub用户名到session
        session.user.githubUsername = token.githubUsername as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.GITHUB_SECRET
} satisfies NextAuthConfig

const handler = NextAuth(config)

export const auth = handler.auth
export const { handlers: { GET, POST } } = handler