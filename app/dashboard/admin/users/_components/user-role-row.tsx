"use client"

import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/toast"
import { Shield, Sparkles, User, Briefcase } from "lucide-react"

const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:5000"

export type UserItem = {
    _id: string
    name: string
    email: string
    image?: string
    role?: "seeker" | "recruiter" | "admin"
    premium?: boolean
    createdAt?: string
}

export function UserRoleRow({ user }: { user: UserItem }) {
    const [currentRole, setCurrentRole] = React.useState(user.role || "seeker")
    const [loading, setLoading] = React.useState(false)

    const handleRoleChange = async (newRole: "seeker" | "recruiter" | "admin") => {
        if (newRole === currentRole) return
        setLoading(true)

        try {
            const { data } = await authClient.token()
            const token = data?.token

            const res = await fetch(`${BASE_URL}/api/users/${user._id}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ role: newRole }),
            })

            const result = await res.json()
            if (res.ok && result.success) {
                setCurrentRole(newRole)
                toast.add({
                    title: "Role Updated",
                    description: `${user.name || user.email}'s role updated to ${newRole}.`,
                })
            } else {
                toast.add({
                    title: "Update Failed",
                    description: result.message || "Could not update user role.",
                })
            }
        } catch (err) {
            console.error("Role update failed:", err)
            toast.add({
                title: "Error",
                description: "Failed to connect to backend server.",
            })
        } finally {
            setLoading(false)
        }
    }

    const initials =
        user.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "HL"

    return (
        <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
            {/* User Info */}
            <td className="py-4 pl-4 pr-3 sm:pl-6">
                <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-white/10">
                        {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                        <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-heading text-sm font-semibold text-white">
                            {user.name || "HireLoop Member"}
                        </span>
                        <span className="text-xs text-white/50">{user.email}</span>
                    </div>
                </div>
            </td>

            {/* Current Role */}
            <td className="px-3 py-4">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                        currentRole === "admin"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            : currentRole === "recruiter"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-purple-500/30 bg-purple-500/10 text-purple-300"
                    }`}
                >
                    {currentRole === "admin" ? (
                        <Shield className="size-3.5" />
                    ) : currentRole === "recruiter" ? (
                        <Briefcase className="size-3.5" />
                    ) : (
                        <User className="size-3.5" />
                    )}
                    {currentRole}
                </span>
            </td>

            {/* Premium status */}
            <td className="px-3 py-4">
                {user.premium ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300">
                        <Sparkles className="size-3" />
                        Premium
                    </span>
                ) : (
                    <span className="text-xs text-white/40">Standard</span>
                )}
            </td>

            {/* Action: Role Switcher (Module 54-6) */}
            <td className="py-4 pl-3 pr-4 text-right sm:pr-6">
                <select
                    disabled={loading}
                    value={currentRole}
                    onChange={(e) =>
                        handleRoleChange(e.target.value as "seeker" | "recruiter" | "admin")
                    }
                    className="rounded-lg border border-white/10 bg-[#1E1E24] px-2.5 py-1 text-xs font-medium text-white transition-colors focus:border-[#645AFF] focus:outline-none disabled:opacity-50"
                >
                    <option value="seeker">Seeker</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                </select>
            </td>
        </tr>
    )
}

