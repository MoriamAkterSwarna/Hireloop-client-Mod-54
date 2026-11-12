import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import { UserRoleRow, type UserItem } from "./_components/user-role-row"
import { Users } from "lucide-react"

const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:5000"

export default async function AdminUsersPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        redirect("/sign-in")
    }

    const currentRole = (session.user as { role?: string })?.role
    if (currentRole !== "admin") {
        redirect(`/dashboard/${currentRole || "seeker"}`)
    }

    // Get JWT token using Better Auth in a Server Component (Module 54-2)
    const tokenResponse = await auth.api.getToken({
        headers: await headers(),
    })
    const token =
        typeof tokenResponse === "object" && tokenResponse !== null && "token" in tokenResponse
            ? (tokenResponse as { token: string }).token
            : (tokenResponse as string | null)

    let usersList: UserItem[] = []

    try {
        const res = await fetch(`${BASE_URL}/api/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        })
        if (res.ok) {
            usersList = await res.json()
        }
    } catch (err) {
        console.error("Failed to fetch users list:", err)
    }

    return (
        <PageContainer width="wide">
            <PageHeader
                overline="User Directory"
                title="Manage Platform Users"
                subtitle="View all registered users and update their access roles dynamically."
            />

            <div className="surface-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Users className="size-5 text-[#645AFF]" />
                        <h2 className="font-heading text-base font-semibold text-white">Registered Users</h2>
                    </div>
                    <span className="text-xs text-white/50">{usersList.length} total members</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/60">
                            <tr>
                                <th scope="col" className="py-3 pl-4 pr-3 sm:pl-6">
                                    User
                                </th>
                                <th scope="col" className="px-3 py-3">
                                    Role
                                </th>
                                <th scope="col" className="px-3 py-3">
                                    Plan
                                </th>
                                <th scope="col" className="py-3 pl-3 pr-4 text-right sm:pr-6">
                                    Change Role
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usersList.length > 0 ? (
                                usersList.map((u) => <UserRoleRow key={u._id} user={u} />)
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-sm text-white/50">
                                        No users registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageContainer>
    )
}
