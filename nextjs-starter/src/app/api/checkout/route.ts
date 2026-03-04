import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/ironixpay";
import type { Network } from "@/lib/ironixpay";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, network = "TRON" } = body as {
            amount: number;
            network?: Network;
        };

        if (!amount || amount < 1_000_000) {
            return NextResponse.json(
                { error: "Amount must be at least 1,000,000 (1 USDT)" },
                { status: 400 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const orderId = `order_${Date.now()}`;

        const session = await createCheckoutSession({
            amount,
            currency: "USDT",
            network,
            success_url: `${appUrl}/success`,
            cancel_url: `${appUrl}/cancel`,
            client_reference_id: orderId,
        });

        return NextResponse.json({
            id: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal error" },
            { status: 500 }
        );
    }
}
