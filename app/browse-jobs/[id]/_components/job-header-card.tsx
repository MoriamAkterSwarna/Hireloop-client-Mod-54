// Header card for the job details page — from the Figma
// "Public / Job Details › Header Section": logo tile, title, company
// line, and the bookmark + Apply Now actions.
"use client"
import type { JobRow } from "@/lib/types/jobs"
import { Bookmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { createApplication, getApplicationsCount } from "@/lib/api/applications"
import { getUserPremiumById } from "@/lib/api/user"
import type { ApplicationFormData } from "@/lib/types/applications"
import { toast } from "@/components/ui/toast"
export function JobHeaderCard({ job }: { job: JobRow }) {
    const { data: session } = useSession()
    const router = useRouter()
    const user = session?.user;

    const handleApplyNow = async () => {
        if (!user) {
            router.push(`/sign-in?redirectTo=/browse-jobs/${job._id}`)
            return
        }
        else if (user.role === 'seeker') {

            // is premium user
            const premiumResult = await getUserPremiumById(user.id)

            console.log('premiumResult', premiumResult)
            // number of jobs applied by this user
            const countResult = await getApplicationsCount(`applicantId=${user.id}`)
            // less more than 10 and not premium user
            if (!premiumResult.premium && countResult.count >= 2) {
                // redirect to the payment page
                router.push('/checkout')
                return
            }
            else {
                // Save the full application snapshot (job + seeker + lifecycle)
                // so the My Applications page can render with no joins.
                const application: ApplicationFormData = {
                    jobId: job._id,
                    userId: user.id,
                    email: user.email,
                    jobTitle: job.title,
                    companyName: job.companyName,
                    jobType: job.jobType,
                    isRemote: job.isRemote,
                    location: job.location,
                    minSalary: job.minSalary,
                    maxSalary: job.maxSalary,
                    salaryFrequency: job.salaryFrequency,
                    deadline: job.deadline,
                    appliedAt: new Date().toISOString(),
                    status: "applied",
                    archived: false,
                }

                const result = await createApplication(application);
                if (result.insertedId) {
                    console.log("Application submitted successfully");
                    toast.add({
                        title: "Application submitted",
                        description: "Your application has been submitted successfully.",
                    })
                    router.push('/browse-jobs')
                }
            }


        }
        else {
            console.log("user is not a job seeker")
        }
    }

    return (
        <section className="flex flex-wrap items-start justify-between gap-6 border border-white/10 bg-[#141418] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.35)] shadow-[inset_0_1px_rgba(255,255,255,0.035)]">
            <div className="flex min-w-0 flex-wrap items-start gap-6">
                {/* Company logo tile: 80px tile, 70px inner logo (Figma) */}
                <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-[#1A1A1F]">
                    <span className="brand-chip flex size-[70px] items-center justify-center rounded-xl text-2xl font-semibold">
                        {job.companyName.charAt(0)}
                    </span>
                </div>

                <div className="min-w-0">
                    <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[#EDEDEF]">
                        {job.title}
                    </h1>

                    {/* Company line with dot separator */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                        <span className="text-[22px] font-semibold text-[#A0A0AB]">
                            {job.companyName}
                        </span>
                        <span aria-hidden className="size-1 rounded-full bg-[#8E9192]" />
                        <span className="capitalize text-base text-[#EDEDEF]">
                            {job.location}
                            {job.isRemote ? " (Remote)" : ""}
                        </span>
                        <span aria-hidden className="size-1 rounded-full bg-[#8E9192]" />
                        <span className="capitalize text-base text-[#EDEDEF]">
                            {job.jobType}
                        </span>

                        {/* Placeholder for a "Verified Employer" badge when the
                            data model gains an employer verification flag. */}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    aria-label={`Bookmark ${job.title}`}
                    // TODO: wire saving/bookmarking.
                    className="flex size-12 items-center justify-center rounded-lg border border-white/10 bg-[#222228] text-[#E5E2E3] transition-colors hover:border-white/25 hover:text-white"
                >
                    <Bookmark aria-hidden className="size-5" />
                </button>
                <button
                    type="button"
                    onClick={handleApplyNow}
                    // TODO: wire the application flow.
                    className="h-12 rounded-lg bg-[#FAFAFA] px-4 text-base font-medium text-[#0B0B0C] shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-colors hover:bg-white"
                >
                    Apply Now
                </button>
            </div>
        </section>
    )
}
