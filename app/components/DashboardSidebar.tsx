"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { UserRole } from "@/lib/types/user"
import { PlusCircle } from "lucide-react"
import {
    Bookmark,
    Briefcase,
    Building2,
    FileText,
    LayoutDashboard,
    Users,
    Wallet,
    Settings,
    type LucideIcon,
} from "lucide-react"
import Link from "next/link"

type MenuItem = {
    id: string
    name: string
    url: string
    icon: LucideIcon
}

// Sidebar nav from the `HL 2.0/Sidebar` Figma component (per-role variants).
const menuItemsByRole: Record<UserRole, MenuItem[]> = {
    seeker: [
        { id: "dashboard", name: "Dashboard", url: "/dashboard/seeker", icon: LayoutDashboard },
        { id: "jobs", name: "Jobs", url: "/dashboard/seeker/jobs", icon: Briefcase },
        { id: "saved-jobs", name: "Saved Jobs", url: "/dashboard/seeker/saved-jobs", icon: Bookmark },
        { id: "applications", name: "Applications", url: "/dashboard/seeker/applications", icon: FileText },
        { id: "billing", name: "Billing", url: "/dashboard/seeker/billing", icon: Wallet },
        { id: "settings", name: "Settings", url: "/dashboard/seeker/settings", icon: Settings },
    ],
    recruiter: [
        { id: "dashboard", name: "Dashboard", url: "/dashboard/recruiter", icon: LayoutDashboard },
        { id: "manage-jobs", name: "Manage Jobs", url: "/dashboard/recruiter/jobs", icon: Briefcase },
        { id: "add-job", name: "Add Job", url: "/dashboard/recruiter/jobs/new", icon: PlusCircle },
        { id: "applications", name: "Applications", url: "/dashboard/recruiter/applications", icon: FileText },
        { id: "settings", name: "Settings", url: "/dashboard/recruiter/settings", icon: Settings },
    ],
    admin: [
        { id: "dashboard", name: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
        { id: "users", name: "Users", url: "/dashboard/admin/users", icon: Users },
        { id: "companies", name: "Companies", url: "/dashboard/admin/companies", icon: Building2 },
        { id: "jobs", name: "Jobs", url: "/dashboard/admin/jobs", icon: Briefcase },
        { id: "payments", name: "Payments", url: "/dashboard/admin/payments", icon: Wallet },
        { id: "settings", name: "Settings", url: "/dashboard/admin/settings", icon: Settings },
    ],
}


export function DashboardSidebar() {
    const { data: session } = useSession();
    const role: UserRole = session?.user?.role || 'seeker';

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-white/5 p-4">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-heading text-lg font-bold text-white tracking-tight">
                        Hire<span className="text-[#645AFF]">Loop</span>
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white/70">
                        {role}
                    </span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {menuItemsByRole[role]?.map((item) => (
                            <SidebarMenuItem key={item.id}>
                                <SidebarMenuButton render={<Link href={item.url} />}>
                                    <item.icon />
                                    <span>{item.name}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-white/5 p-3">
                {session?.user ? (
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
                    >
                        <Avatar className="size-8 border border-white/10">
                            {session.user.image ? (
                                <AvatarImage src={session.user.image} alt={session.user.name} />
                            ) : null}
                            <AvatarFallback className="text-xs">
                                {session.user.name?.slice(0, 2).toUpperCase() || "HL"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-xs font-semibold text-white">
                                {session.user.name}
                            </span>
                            <span className="truncate text-[10px] text-white/50">
                                {session.user.email}
                            </span>
                        </div>
                    </Link>
                ) : null}
            </SidebarFooter>
        </Sidebar>
    )
}
