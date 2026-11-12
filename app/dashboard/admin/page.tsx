import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PageContainer, PageHeader } from "@/components/dashboard/page-shell"
import Link from "next/link"
import {
    Users,
    Briefcase,
    FileText,
    Wallet,
    ShieldCheck,
    UserCheck,
    Building2,
    ArrowUpRight,
} from "lucide-react"

const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:5000"

export default async function AdminDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    // Route-level role security check (Module 54-4 / 54-6)
    if (!session?.user) {
        redirect("/sign-in")
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== "admin") {
        redirect(`/dashboard/${userRole || "seeker"}`)
    }

    // Get JWT token using Better Auth in a Server Component (Module 54-2)
    const tokenResponse = await auth.api.getToken({
        headers: await headers(),
    })
    const token =
        typeof tokenResponse === "object" && tokenResponse !== null && "token" in tokenResponse
            ? (tokenResponse as { token: string }).token
            : (tokenResponse as string | null)

    let stats = {
        totalUsers: 0,
        seekers: 0,
        recruiters: 0,
        admins: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalPayments: 0,
    }

    try {
        const res = await fetch(`${BASE_URL}/api/admin/stats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        })
        if (res.ok) {
            stats = await res.json()
        }
    } catch (err) {
        console.error("Failed to fetch admin stats:", err)
    }

    return (
        <PageContainer width="wide">
            <PageHeader
                overline="Administration Control"
                title="System Overview"
                subtitle="Live metrics, role-based access verification, and platform management."
                action={
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                        <ShieldCheck className="size-4" />
                        Admin Access Verified
                    </div>
                }
            />

            {/* Metrics Bento Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="surface-card p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/60">Total Registered Users</span>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#5C53FE]/20 text-[#645AFF]">
                            <Users className="size-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="font-heading text-3xl font-bold text-white">{stats.totalUsers}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                        <span>{stats.seekers} seekers</span>
                        <span>•</span>
                        <span>{stats.recruiters} recruiters</span>
                    </div>
                </div>

                <div className="surface-card p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/60">Active Job Postings</span>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                            <Briefcase className="size-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="font-heading text-3xl font-bold text-white">{stats.totalJobs}</span>
                    </div>
                    <div className="mt-2 text-xs text-emerald-400">Protected recruiter endpoints</div>
                </div>

                <div className="surface-card p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/60">Total Applications</span>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                            <FileText className="size-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="font-heading text-3xl font-bold text-white">{stats.totalApplications}</span>
                    </div>
                    <div className="mt-2 text-xs text-cyan-400">Protected seeker endpoints</div>
                </div>

                <div className="surface-card p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/60">Verified Payments</span>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                            <Wallet className="size-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="font-heading text-3xl font-bold text-white">{stats.totalPayments}</span>
                    </div>
                    <div className="mt-2 text-xs text-amber-400">Stripe checkout verified</div>
                </div>
            </div>

            {/* Quick Management Links */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    href="/dashboard/admin/users"
                    className="group surface-card flex flex-col justify-between p-6 transition-all hover:border-[#645AFF]/50 hover:bg-white/[0.04]"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                            <UserCheck className="size-6" />
                        </div>
                        <ArrowUpRight className="size-5 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                    <div className="mt-6">
                        <h3 className="font-heading text-base font-semibold text-white">Manage Users & Roles</h3>
                        <p className="mt-1 text-xs text-white/60">
                            View registered users, inspect identities, and modify role permissions.
                        </p>
                    </div>
                </Link>

                <Link
                    href="/dashboard/recruiter/jobs"
                    className="group surface-card flex flex-col justify-between p-6 transition-all hover:border-[#645AFF]/50 hover:bg-white/[0.04]"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                            <Briefcase className="size-6" />
                        </div>
                        <ArrowUpRight className="size-5 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                    <div className="mt-6">
                        <h3 className="font-heading text-base font-semibold text-white">Job Listings</h3>
                        <p className="mt-1 text-xs text-white/60">
                            Monitor job posts submitted by recruiters across all industries.
                        </p>
                    </div>
                </Link>

                <Link
                    href="/dashboard/profile"
                    className="group surface-card flex flex-col justify-between p-6 transition-all hover:border-[#645AFF]/50 hover:bg-white/[0.04]"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                            <Building2 className="size-6" />
                        </div>
                        <ArrowUpRight className="size-5 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                    <div className="mt-6">
                        <h3 className="font-heading text-base font-semibold text-white">Admin Profile</h3>
                        <p className="mt-1 text-xs text-white/60">
                            Update admin credentials, contact details, and avatar image.
                        </p>
                    </div>
                </Link>
            </div>
        </PageContainer>
    )
}
