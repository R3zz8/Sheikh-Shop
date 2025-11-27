"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const items = [
  { src: "/assets/products/dates.png", delay: 0 },
  { src: "/assets/products/honey.png", delay: 0.4 },
  { src: "/assets/products/saffron.png", delay: 0.8 },
];

export default function FloatingProducts() {
  return (
    <div className="flex flex-col gap-4 items-center">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{
            delay: item.delay + 1.2,
            duration: 1.5,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="w-[70px] sm:w-[80px] md:w-[90px] lg:w-[100px]"
        >
          <Image
            src={item.src}
            alt="product"
            width={100}
            height={100}
            className="object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
}
