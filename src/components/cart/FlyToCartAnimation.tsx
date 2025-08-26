'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface FlyToCartAnimationProps {
    isVisible: boolean;
    productImage: string;
    productName: string;
    onAnimationComplete: () => void;
}

export default function FlyToCartAnimation({
    isVisible,
    productImage,
    productName,
    onAnimationComplete,
}: FlyToCartAnimationProps) {
    const [animationState, setAnimationState] = useState<'idle' | 'flying' | 'complete'>('idle');

    useEffect(() => {
        if (isVisible) {
            setAnimationState('flying');
        }
    }, [isVisible]);

    const handleAnimationComplete = () => {
        setAnimationState('complete');
        onAnimationComplete();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed z-[9999] pointer-events-none"
                    initial={{
                        scale: 0.8,
                        opacity: 0,
                    }}
                    animate={{
                        scale: animationState === 'flying' ? 1 : 0.3,
                        opacity: animationState === 'flying' ? 1 : 0,
                    }}
                    exit={{
                        scale: 0.3,
                        opacity: 0,
                    }}
                    transition={{
                        duration: 0.8,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    onAnimationComplete={handleAnimationComplete}
                    style={{
                        position: 'fixed',
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}
                >
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400 shadow-lg">
                        <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20" />
                    </div>

                    {/* Trail effect */}
                    <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/30 to-orange-400/30"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: 'easeOut',
                        }}
                    />

                    {/* Sparkle effects */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-amber-300 rounded-full"
                            initial={{
                                scale: 0,
                                opacity: 0,
                                x: 0,
                                y: 0,
                            }}
                            animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                                x: Math.cos((i * 120) * (Math.PI / 180)) * 30,
                                y: Math.sin((i * 120) * (Math.PI / 180)) * 30,
                            }}
                            transition={{
                                duration: 0.6,
                                delay: i * 0.1,
                                ease: 'easeOut',
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
} 