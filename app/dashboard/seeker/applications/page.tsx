// My Applications — seeker dashboard page, from the Figma
// "Seeker / My Applications" (stats bento + applications table).
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { PageContainer } from "@/components/dashboard/page-shell"
import { getApplications } from "@/lib/api/applications"

import { ApplicationsBoard } from "./_components/applications-board"

export default async function MyApplicationsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // Get token using better-auth in a server component (Module 54-2)
    const tokenResponse = await auth.api.getToken({
        headers: await headers()
    })
    const token = typeof tokenResponse === "object" && tokenResponse !== null && "token" in tokenResponse
        ? (tokenResponse as { token: string }).token
        : (tokenResponse as string | null)

    const applications = await getApplications(
        `applicantId=${session?.user.id}`,
        token || undefined
    )

    return (
        <PageContainer width="wide">
            <ApplicationsBoard applications={applications} />
        </PageContainer>
    )
}
