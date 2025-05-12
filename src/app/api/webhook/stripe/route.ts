// src/app/api/webhook/stripe/route.ts

import { headers } from "next/headers";
import Stripe from "stripe";
import { NextResponse } from 'next/server';
import { db } from "@/server/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil'
})

export async function POST(request: Request) {
    const body = await request.text();
    const signature = (await headers()).get('Stripe-Signature') as string;
    
    if (!signature) {
        console.error('Missing Stripe signature');
        return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }
    
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        console.error('Invalid signature', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Webhook received: ${event.type}`);
    
    try {
        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            
            // Retrieve important data
            const credits = Number(session.metadata?.['credits']);
            const userId = session.client_reference_id;
            
            console.log(`Processing payment for user: ${userId}, credits: ${credits}`);
            
            if (!userId || !credits) {
                console.error('Missing userId or credits', { userId, credits });
                return NextResponse.json({ error: 'Missing userId or credits' }, { status: 400 });
            }
            
            // Record the transaction
            const transaction = await db.stripeTransction.create({
                data: {
                    userId,
                    credits
                }
            });
            
            console.log(`Created transaction record: ${transaction.id}`);
            
            // Update user credits
            const updatedUser = await db.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits: {
                        increment: credits
                    }
                },
                select: {
                    id: true,
                    credits: true
                }
            });
            
            console.log(`Updated user credits: ${updatedUser.credits}`);
            
            return NextResponse.json({ 
                message: 'Credits added successfully',
                transactionId: transaction.id,
                userId: updatedUser.id,
                newCreditBalance: updatedUser.credits
            }, { status: 200 });
        }
        
        // Return a 200 response for other event types
        return NextResponse.json({ received: true });
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}