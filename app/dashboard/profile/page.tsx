"use client"

import * as React from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { imageUploader } from "@/lib/imageUploader"
import { updateProfile } from "@/lib/actions/profile"
import { PageContainer, PageHeader, SectionCard } from "@/components/dashboard/page-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Camera, Loader2, CheckCircle2, User, Mail, Shield, Building, MapPin, Phone } from "lucide-react"

export default function ProfilePage() {
    const { data: session, isPending } = useSession()
    const [submitting, setSubmitting] = React.useState(false)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const objectUrl = URL.createObjectURL(file)
            setPreviewUrl(objectUrl)
        }
    }
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        let imageUrl = session?.user?.image || ""
        const file = formData.get("profileImage") as File
        if (file && file.size > 0) {
            toast.add({
                title: "Uploading image...",
                description: "Uploading your picture to ImgBB.",
            })
            const imgData = await imageUploader(file)
            console.log("ImgBB API Response:", imgData)

            if (imgData?.url) {
                imageUrl = imgData.url
                setPreviewUrl(imgData.url)
            } else if (imgData?.display_url) {
                imageUrl = imgData.display_url
                setPreviewUrl(imgData.display_url)
            }
        }

        const profilePayload = {
            name: (data.name as string) || session?.user?.name,
            title: data.title as string,
            phone: data.phone as string,
            location: data.location as string,
            bio: data.bio as string,
            company: data.company as string,
            website: data.website as string,
            image: imageUrl,
        }
        console.log("Submitting User Profile:", profilePayload)
        const result = await updateProfile(profilePayload)
        console.log("Database Update Result:", result)

        // 2. Also update Better Auth session so UI updates everywhere

        await authClient.updateUser({
            name: profilePayload.name,
            image: imageUrl,
        })


        toast.add({
            title: "Profile Updated",
            description: "Your profile information has been successfully saved.",
        })

    }

    const role = (session?.user as { role?: string })?.role || "seeker"
    const displayImage = previewUrl || session?.user?.image || ""
    const roleBadgeColor =
        role === "admin"
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
            : role === "recruiter"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-purple-500/30 bg-purple-500/10 text-purple-300"

    const initials =
        session?.user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "HL"

    return (
        <PageContainer width="narrow">
            <PageHeader
                overline="Account Settings"
                title="Profile & Preferences"
                subtitle="Manage your personal information, role credentials, and public avatar."
            />

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">
                {/* 1. Profile Picture & ImgBB Upload (54-7 & 54-8) */}
                <SectionCard index={1} title="Profile Photo (ImgBB)">
                    <div className="flex flex-col items-center gap-6 sm:flex-row">
                        <div className="relative group">
                            <Avatar className="size-24 border-2 border-white/20 shadow-xl">
                                {displayImage ? (
                                    <AvatarImage src={displayImage} alt={session?.user?.name || "Profile picture"} />
                                ) : null}
                                <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-[#5C53FE] text-white shadow-md transition-transform hover:scale-110 active:scale-95"
                                title="Change avatar"
                            >
                                <Camera className="size-4" />
                            </button>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-heading text-base font-semibold text-white">Upload New Photo</h3>
                            <p className="mt-1 text-xs text-white/60">
                                Supports JPG, PNG, GIF or WebP. Automatically hosted via ImgBB API.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-white/15 bg-white/5 hover:bg-white/10"
                                >
                                    Select Image
                                </Button>
                                {selectedFile ? (
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                        <CheckCircle2 className="size-3.5" />
                                        {selectedFile.name}
                                    </span>
                                ) : null}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="profileImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* 2. Personal Information */}
                <SectionCard index={2} title="Basic Information">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="name" className="text-xs font-medium text-white/80">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={session?.user?.name || ""}
                                    placeholder="e.g. Jane Doe"
                                    className="pl-9 bg-[#1E1E24] border-white/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="email" className="text-xs font-medium text-white/80">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                                <Input
                                    id="email"
                                    value={session?.user?.email || ""}
                                    disabled
                                    className="pl-9 bg-[#151518] text-white/50 border-white/5 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[11px] text-white/40">Email is linked to your authentication provider.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="title" className="text-xs font-medium text-white/80">
                                Job Title / Headline
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Senior Frontend Engineer"
                                className="bg-[#1E1E24] border-white/10"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone" className="text-xs font-medium text-white/80">
                                Phone Number
                            </Label>
                            <div className="relative">
                                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="+1 (555) 012-3456"
                                    className="pl-9 bg-[#1E1E24] border-white/10"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="location" className="text-xs font-medium text-white/80">
                                Location / City
                            </Label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="e.g. San Francisco, CA (or Remote)"
                                    className="pl-9 bg-[#1E1E24] border-white/10"
                                />
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* 3. Role & Bio */}
                <SectionCard index={3} title="Role & Biography">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#16161A] p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="size-5 text-[#645AFF]" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Current Access Role</p>
                                    <p className="text-xs text-white/50">Verified by Better Auth & JWT Middleware</p>
                                </div>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${roleBadgeColor}`}>
                                {role}
                            </span>
                        </div>

                        {role === "recruiter" ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="company" className="text-xs font-medium text-white/80">
                                        Company Name
                                    </Label>
                                    <div className="relative">
                                        <Building className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                                        <Input
                                            id="company"
                                            name="company"
                                            placeholder="e.g. Acme Tech"
                                            className="pl-9 bg-[#1E1E24] border-white/10"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="website" className="text-xs font-medium text-white/80">
                                        Company Website
                                    </Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        placeholder="https://acme.example.com"
                                        className="bg-[#1E1E24] border-white/10"
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="bio" className="text-xs font-medium text-white/80">
                                Short Biography
                            </Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                rows={4}
                                placeholder="Tell us about yourself, your career path, or what kind of opportunities you are looking for..."
                                className="bg-[#1E1E24] border-white/10 resize-none"
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Submit action */}
                <div className="flex items-center justify-end gap-4">
                    <Button
                        type="submit"
                        disabled={submitting || isPending}
                        className="h-11 min-w-[140px] rounded-lg bg-[#5C53FE] px-6 text-sm font-semibold text-white shadow-lg hover:bg-[#7068FF] active:translate-y-0.5"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </form>
        </PageContainer>
    )
}
