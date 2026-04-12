import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      userId?: string // Custom user_id for our system
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    userId?: string // Custom user_id for our system
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string // Custom user_id for our system
  }
}
