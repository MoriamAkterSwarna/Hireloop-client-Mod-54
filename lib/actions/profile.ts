"use server"

import { getToken } from "@/lib/core/server";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const updateProfile = async (newProfileData: Record<string, unknown>) => {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/api/profile`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(newProfileData),
  });
  const data = await res.json();
  return data;
};
