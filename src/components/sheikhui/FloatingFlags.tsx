"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const flags = [
  "/assets/flags/uae.png",
  "/assets/flags/ksa.png",
  "/assets/flags/qatar.png",
  "/assets/flags/oman.png",
];

export default function FloatingFlags() {
  return (
    <div className="flex flex-col gap-3 items-center">
      {flags.map((src, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{
            delay: 2.5 + i * 0.3,
            duration: 1.5,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="w-[45px] sm:w-[55px] md:w-[65px] lg:w-[75px]"
        >
          <Image
            src={src}
            alt="flag"
            width={75}
            height={75}
            className="object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
}
