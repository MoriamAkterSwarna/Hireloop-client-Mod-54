import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const getSession = async () => {
    "use server";
    const session = await auth.api.getSession({
        headers: await headers()
    })
    return session;
}

export const getToken = async (): Promise<string | null> => {
    "use server";
    try {
        const tokenResponse = await auth.api.getToken({
            headers: await headers()
        });
        if (typeof tokenResponse === "object" && tokenResponse !== null && "token" in tokenResponse) {
            return (tokenResponse as { token: string }).token;
        }
        return tokenResponse as string | null;
    } catch (error) {
        console.error("Error retrieving token:", error);
        return null;
    }
}
