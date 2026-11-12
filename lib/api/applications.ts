// Data-access module for the applications API (Express on :5000).
// Follows the `lib/api/jobs.ts` pattern.

import type { ApplicationFormData, ApplicationRow } from "@/lib/types/applications"
import { authClient } from "@/lib/auth-client"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000"

async function resolveToken(customToken?: string): Promise<string | null> {
    if (customToken) return customToken;
    if (typeof window !== "undefined") {
        try {
            const { data } = await authClient.token();
            return data?.token || null;
        } catch {
            return null;
        }
    }
    return null;
}

// GET /applications?applicantId=…
export const getApplications = async (query = "", customToken?: string): Promise<ApplicationRow[]> => {
    const token = await resolveToken(customToken);
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/applications?${query}`, { headers })
    return res.json()
}

export const getApplicationsCount = async (query = "", customToken?: string): Promise<{ count: number }> => {
    const token = await resolveToken(customToken);
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/applications/count?${query}`, { headers })
    return res.json()
}

export const createApplication = async (data: ApplicationFormData, customToken?: string) => {
    const token = await resolveToken(customToken);
    const headers: Record<string, string> = {
        "content-type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/applications`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    })
    return res.json()
}
