// src/app/(protected)/billing/page.tsx
'use client'
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { createCheckOutSession } from '@/lib/stripe';
import { api } from '@/trpc/react'
import { CreditCard, Info } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import { GlassmorphicCard, GlassmorphicCardHeader, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';

const BillingPage = () => {
    const searchParams = useSearchParams();
    const paymentStatus = searchParams.get('payment_status');
    
    const { data: user } = api.project.getMyCredits.useQuery();
    const refetch = useRefetch();
    const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100])
    const creditsToBuyAmount = creditsToBuy[0]!
    const price = (creditsToBuyAmount / 50).toFixed(2);
    
    // Handle successful payment return
    useEffect(() => {
        if (paymentStatus === 'success') {
            // Refetch user credits data
            refetch();
            
            // Show success toast
            toast.success('Payment successful');
            
            // Clean up URL (remove query parameter)
            const url = new URL(window.location.href);
            url.searchParams.delete('payment_status');
            window.history.replaceState({}, '', url.toString());
        }
    }, [paymentStatus, refetch]);

    return (
        <div className="max-w-3xl mx-auto text-white">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <GlassmorphicCard className="mb-8">
                    <GlassmorphicCardHeader className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-indigo-600/20">
                            <CreditCard className="h-6 w-6 text-indigo-200" />
                        </div>
                        <GlassmorphicCardTitle>
                            Billing & Credits
                        </GlassmorphicCardTitle>
                    </GlassmorphicCardHeader>
                    
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white/70">Available Credits</span>
                            <span className="text-2xl font-bold text-white">{user?.credits || 0}</span>
                        </div>
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" 
                                style={{ width: `${Math.min(100, ((user?.credits || 0) / 10))}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <div className='glassmorphism border border-white/20 p-4 rounded-xl bg-indigo-900/20 mb-6'>
                        <div className='flex items-center gap-2'>
                            <Info className='size-5 text-indigo-200' />
                            <p className='text-white/90'>
                                Each credit allows you to index 1 file in a repository.
                            </p>
                        </div>
                        <p className='mt-2 text-white/70 ml-7'>
                            E.g. If your project has 100 files, you will need 100 credits to index it.
                        </p>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-white">Purchase Credits</h3>
                        
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-white/70">Amount to purchase</span>
                                <span className="font-semibold text-white">{creditsToBuyAmount} credits</span>
                            </div>
                            <Slider 
                                defaultValue={[100]} 
                                value={creditsToBuy} 
                                onValueChange={value => setCreditsToBuy(value)} 
                                max={1000} 
                                min={10} 
                                step={10}
                                className="py-4"
                            />
                            <div className="flex justify-between text-sm text-white/60">
                                <span>10 credits</span>
                                <span>1000 credits</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="text-white/70">Total Price</h4>
                                <p className="text-2xl font-bold">${price}</p>
                            </div>
                            <Button 
                                onClick={() => {
                                    createCheckOutSession(creditsToBuyAmount)
                                }}
                                className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900"
                                size="lg"
                            >
                                Buy {creditsToBuyAmount} credits
                            </Button>
                        </div>
                    </div>
                </GlassmorphicCard>
            </motion.div>
            
            <div className="glassmorphism border border-white/20 p-6 rounded-xl text-center text-white/70">
                <h3 className="text-white text-lg mb-2">Need More Credits?</h3>
                <p>For enterprise plans or custom pricing, contact our sales team at <a href="mailto:sales@aetheria.ai" className="text-indigo-300 hover:text-indigo-200 transition-colors">sales@aetheria.ai</a></p>
            </div>
        </div>
    )
}

export default BillingPage