"use client"

// Pay action for the checkout page. Real payment collection happens on
// Stripe's hosted Checkout page, so this button has no local card input
// to validate — it just hands off.
//
// TODO: implement the Stripe hand-off — POST to the backend to create a
// Stripe Checkout Session for this order, then redirect the user to
// `session.url` (e.g. router.push or window.location.assign).

export function PayButton({ label }: { label: string }) {
    return (
        <button
            type="button"
            className="h-[60px] w-full rounded-lg bg-[#0070E0] text-lg font-bold text-white shadow-[0_4px_6px_-4px_rgba(94,158,246,0.3),0_10px_15px_-3px_rgba(94,158,246,0.3)] transition-colors hover:bg-[#3F90E5]"
        >
            {label}
        </button>
    )
}
