"use client"

import { AuthForm, AuthFormData } from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get("redirectTo") ?? "/"

    console.log("redirect to", redirectTo)

    const handleSignIn = async (data: AuthFormData) => {
        const { data: SignInResponse, error } = await authClient.signIn.email({
            email: data.email,
            password: data.password,
            rememberMe: true,
            callbackURL: redirectTo,
        })

        console.log("sign in response", SignInResponse, error)
    }

    return <AuthForm mode="signin" onSubmit={handleSignIn} />
}
