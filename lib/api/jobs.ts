// Single data-access module for the jobs API (Express on :5000).
// Replaces the old split between `lib/api/jobs.ts` and `lib/actions/jobs.ts`.

import type { JobFormData, JobRow } from "@/lib/types/jobs"
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

export const getJobs = async (query = ''): Promise<JobRow[]> => {
    const res = await fetch(`${BASE_URL}/jobs?${query}`)
    return res.json()
}

export const getJobById = async (jobId: string, customToken?: string): Promise<JobRow> => {
    const token = await resolveToken(customToken);
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, { headers })
    return res.json()
}

export const createJob = async (data: JobFormData, customToken?: string) => {
    const token = await resolveToken(customToken);
    const headers: Record<string, string> = {
        "content-type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/jobs`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    })
    return res.json()
}

export const deleteJob = async (jobId: string, customToken?: string) => {
    const token = await resolveToken(customToken);
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers,
    })
    return res.json()
}
