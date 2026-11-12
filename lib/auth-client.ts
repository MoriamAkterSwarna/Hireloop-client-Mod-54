import type { auth } from "@/lib/auth"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins"

// `inferAdditionalFields<typeof auth>` pulls in the server schema so fields
// declared in `lib/auth.ts` (e.g. `user.additionalFields.role`) are typed here.
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    jwtClient(),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient;
