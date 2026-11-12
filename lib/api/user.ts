import { authClient } from "@/lib/auth-client"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"

export const getUserPremiumById = async (userId: string) => {
    const response = await fetch(`${BASE_URL}/users/${userId}/premium`)
    return response.json()
}

export const getProfile = async (customToken?: string) => {
    let token = customToken
    if (!token && typeof window !== "undefined") {
        const { data } = await authClient.token()
        token = data?.token
    }
    const headers: Record<string, string> = {}
    if (token) {
        headers["Authorization"] = `Bearer ${token}`
    }
    const response = await fetch(`${BASE_URL}/api/profile`, { headers })
    return response.json()
}