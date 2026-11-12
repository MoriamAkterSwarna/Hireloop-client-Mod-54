// Roles mirror the `user.additionalFields.role` enum in `lib/auth.ts`.
export type UserRole = "seeker" | "recruiter" | "admin"

export type UserProfile = {
    id: string
    name: string
    email: string
    role: UserRole
    image?: string
    title?: string
    phone?: string
    location?: string
    bio?: string
    company?: string
    website?: string
    premium?: boolean
    createdAt?: string
    updatedAt?: string
}

