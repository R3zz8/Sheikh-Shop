'use client';

import { motion } from 'framer-motion';
import { Mail, Sparkles, Code, Database, Palette } from 'lucide-react';
import Image from 'next/image';

const skills = [
  { name: 'Next.js', icon: Code, color: 'from-blue-500 to-cyan-500' },
  { name: 'React', icon: Code, color: 'from-cyan-400 to-blue-500' },
  { name: 'Tailwind CSS', icon: Palette, color: 'from-teal-400 to-cyan-500' },
  { name: 'Node.js', color: 'from-green-500 to-emerald-500' },
  { name: 'Prisma', icon: Database, color: 'from-purple-500 to-pink-500' },
  { name: 'PostgreSQL', icon: Database, color: 'from-blue-600 to-indigo-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function AboutUsPage() {
  const handleContact = () => {
    window.location.href = 'mailto:reza@example.com?subject=Project Inquiry&body=Hello Reza, I would like to discuss a project with you.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden">
      {/* Background effects matching header/footer */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Image */}
          <motion.div
            className="mb-12"
            variants={imageVariants}
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative">
                <Image
                  src="/Reza.jpg"
                  alt="Reza Dehghani - Full-Stack Web Developer"
                  width={280}
                  height={280}
                  className="rounded-2xl shadow-2xl shadow-amber-300/25 border-2 border-amber-300/30 object-cover"
                  priority
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-300/10 to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight"
            variants={itemVariants}
          >
            REZA DEHGHANI
            </motion.h1>

          {/* Title */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/8 backdrop-blur-sm rounded-full border border-amber-200/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                Full-Stack Next.js Web Designer & Exporter
              </h2>
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="flex flex-wrap justify-center gap-3">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  className="group relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <div className="px-4 py-2 bg-white/8 backdrop-blur-sm border border-white/15 rounded-lg hover:border-amber-300/50 transition-all duration-300 group-hover:bg-white/12">
                    <div className="flex items-center gap-2">
                      {skill.icon && <skill.icon className="w-4 h-4 text-amber-300" />}
                      <span className="text-white font-medium text-sm">{skill.name}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-300/20 to-orange-300/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            className="mb-12 max-w-3xl mx-auto space-y-6"
            variants={itemVariants}
          >
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              As a company engaged in both ecommerce website development and export sales, we possess deep insights into our client&apos;s requirements.
            </p>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              I am a full-stack web designer and exporter who not only builds conversion-focused ecommerce platforms but also understands how to drive real business results through design.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={handleContact}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-2xl shadow-amber-900/30 hover:shadow-amber-900/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
              <Mail className="w-5 h-5" />
              <span>Contact Me</span>
              <div className="absolute inset-0 rounded-xl border border-amber-300/30 group-hover:border-amber-200/50 transition-colors duration-300" />
            </button>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-amber-300/10 to-orange-300/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-orange-300/10 to-amber-300/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
