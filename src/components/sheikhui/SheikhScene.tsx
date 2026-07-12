"use client";
import { motion } from "framer-motion";
import SheikhHero from "./SheikhHero";
import FloatingProducts from "./FloatingProducts";
import FloatingFlags from "./FloatingFlags";
import SheikhUniverse from "./SheikhUniverse";

export default function SheikhScene() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[90vh] overflow-hidden bg-[radial-gradient(ellipse_at_center,_#78350f_0%,_#0c0a09_70%)] py-12">
      {/* Dynamic 3D interactive Experience - "Sheikh Universe" */}
      <div className="w-full max-w-7xl mx-auto relative z-20">
        <SheikhUniverse />
      </div>

      {/* شیخ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0 }}
        className="z-20 mt-12"
      >
        <SheikhHero />
      </motion.div>

      {/* محصولات */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute right-[8%] bottom-[20%] flex flex-col gap-6 
                   sm:bottom-[25%] sm:right-[10%]
                   md:bottom-[20%] md:right-[12%]
                   lg:right-[15%]"
      >
        <FloatingProducts />
      </motion.div>

      {/* پرچم‌ها */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute left-[8%] bottom-[20%] flex flex-col gap-5 
                   sm:bottom-[25%] sm:left-[10%]
                   md:bottom-[20%] md:left-[12%]
                   lg:left-[15%]"
      >
        <FloatingFlags />
      </motion.div>

      {/* نور طلایی نرم */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-radial from-amber-400/40 to-transparent blur-3xl z-10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  );
}
