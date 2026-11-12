// Payment success — from the Figma "Public / Checkout — Payment
// Successful": centered success card over a blue glow, with a verified
// session box. Receipt details (amount, date, email) and the Stripe
// transaction id (`payment_intent.id`) come from the Checkout Session.

import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { checkoutVerify } from "@/lib/actions/payments"

// Fixed en-US so SSR and client agree.
const formatDate = (unixSeconds: number) =>
    new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

export default async function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>
}) {
    const { session_id } = await searchParams

    if (!session_id) notFound()

    const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["line_items", "payment_intent"],
    })

    if (session.status === "open") {
        return redirect("/")
    }

    if (session.status !== "complete" || session.payment_status !== "paid") {
        return redirect("/checkout?canceled=1")
    }

    // Hand the verified session to the backend (plan activation etc.).
    const result = await checkoutVerify(session_id)
    console.log({ result })

    // Receipt details.
    const paymentIntent =
        typeof session.payment_intent === "object" ? session.payment_intent : null
    const transactionId = paymentIntent?.id ?? session.id
    const amount = (session.amount_total ?? 0).toLocaleString("en-US", {
        style: "currency",
        currency: session.currency || "usd",
    })
    const lineItems = session.line_items?.data ?? []
    const planName = lineItems[0]?.description || "Hireloop Pro Plan"

    // Mono chip for long Stripe ids — truncated visually, selectable fully.
    const idChip = (id: string) => (
        <code
            title={id}
            className="max-w-[190px] truncate rounded bg-[#1f2937] px-2 py-1 font-mono text-[11px] text-[#9ca3af] select-all"
        >
            {id}
        </code>
    )

    return (
        <div className="relative min-h-screen bg-[#08080a]">
            {/* Minimal header, consistent with the checkout flow */}
            <header className="mx-auto flex h-24 w-full max-w-3xl items-center px-4">
                <Link
                    href="/"
                    aria-label="Back"
                    className="mr-6 text-[#a1a1aa] transition-colors hover:text-white"
                >
                    <ArrowLeft aria-hidden className="size-6" />
                </Link>
                <Link href="/" className="font-heading text-lg font-bold text-white">
                    Hireloop
                </Link>
            </header>

            {/* Decorative blue glow behind the card (Figma) */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1e3a8a] blur-[120px]"
            />

            <main className="relative flex items-start justify-center px-4 pb-24">
                <section className="w-full max-w-[512px] rounded-3xl border border-white/10 bg-[#141418] px-10 py-10 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_rgba(255,255,255,0.035)]">
                    <div className="flex justify-center">
                        <span
                            aria-hidden
                            className="flex size-16 items-center justify-center rounded-full bg-[#10b981] shadow-[0_0_0_4px_rgba(16,185,129,0.05)]"
                        >
                            <Check strokeWidth={3} className="size-8 text-white" />
                        </span>
                    </div>

                    <p className="mt-7 inline-flex h-5 items-center rounded border border-[#3b82f6] bg-[#3b82f6]/15 px-[11px] text-[11px] font-medium tracking-[0.34em] text-[#60a5fa] uppercase">
                        Upgrade successful
                    </p>

                    <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#EDEDEF]">
                        Welcome to Hireloop Pro
                    </h1>

                    <p className="mx-auto mt-5 max-w-[366px] text-base leading-[26px] text-[#9ca3af]">
                        Your payment of {amount} was received perfectly. All advanced
                        premium features are unlocked on your account.
                    </p>

                    {/* Verified session box with receipt details */}
                    <div className="mt-10 rounded-xl border border-[#1f2937] bg-black px-4 py-3.5 text-left">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck aria-hidden className="size-5 shrink-0 text-[#6b7280]" />
                            <span className="text-[13px] font-medium text-[#a0a0ab]">
                                Session verified
                            </span>
                            <span className="ml-auto">{idChip(session_id)}</span>
                        </div>

                        <dl className="mt-3 divide-y divide-[#1f2937] border-t border-[#1f2937] pt-1">
                            <div className="flex items-center justify-between gap-4 py-2.5">
                                <dt className="shrink-0 text-[13px] text-[#a0a0ab]">
                                    Transaction ID
                                </dt>
                                <dd>
                                    <code
                                        title={transactionId}
                                        className="block max-w-[240px] truncate rounded bg-[#1f2937] px-2 py-1 font-mono text-[11px] text-[#9ca3af] select-all"
                                    >
                                        {transactionId}
                                    </code>
                                </dd>
                            </div>

                            <div className="flex items-center justify-between gap-4 py-2.5">
                                <dt className="text-[13px] text-[#a0a0ab]">Plan</dt>
                                <dd className="truncate text-[13px] text-[#EDEDEF]">{planName}</dd>
                            </div>

                            <div className="flex items-center justify-between gap-4 py-2.5">
                                <dt className="text-[13px] text-[#a0a0ab]">Amount paid</dt>
                                <dd className="text-[13px] font-medium text-[#EDEDEF]">{amount}</dd>
                            </div>

                            <div className="flex items-center justify-between gap-4 py-2.5">
                                <dt className="text-[13px] text-[#a0a0ab]">Payment date</dt>
                                <dd className="whitespace-nowrap text-[13px] text-[#EDEDEF]">
                                    {formatDate(session.created)}
                                </dd>
                            </div>

                            {session.customer_email ? (
                                <div className="flex items-center justify-between gap-4 py-2.5">
                                    <dt className="text-[13px] text-[#a0a0ab]">Receipt email</dt>
                                    <dd className="truncate text-[13px] text-[#EDEDEF]">
                                        {session.customer_email}
                                    </dd>
                                </div>
                            ) : null}
                        </dl>
                    </div>

                    <Link
                        href="/dashboard/seeker/applications"
                        className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-colors hover:bg-white/90"
                    >
                        Go to My Applications
                        <ArrowRight aria-hidden className="size-4" />
                    </Link>
                </section>
            </main>
        </div>
    )
}
