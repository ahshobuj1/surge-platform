"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type FloatingIconType = "rss" | "wordpress" | "settings" | "globe";

interface FloatingIconCardProps {
  type: FloatingIconType;
  className?: string;
  delay?: number;
  duration?: number;
}

export default function FloatingIconCard({
  type,
  className = "",
  delay = 0,
  duration = 5,
}: FloatingIconCardProps) {
  const getRotationClass = () => {
    switch (type) {
      case "rss":
        return "-rotate-[12deg]";
      case "wordpress":
        return "rotate-[12deg]";
      case "settings":
        return "-rotate-[8deg]";
      case "globe":
        return "rotate-[12deg]";
      default:
        return "";
    }
  };

  const renderContent = () => {
    switch (type) {
      case "rss":
        return (
          <Image
            src="/rss.svg"
            alt="RSS"
            width={48}
            height={48}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain"
          />
        );
      case "wordpress":
        return (
          <Image
            src="/wordpress.svg"
            alt="WordPress"
            width={48}
            height={48}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain"
          />
        );
      case "settings":
        return (
          <Image
            src="/settings.svg"
            alt="Settings"
            width={32}
            height={32}
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 object-contain"
          />
        );
      case "globe":
        return (
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-[#5365D8]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9.5" fill="#EEF2FE" />
            <ellipse cx="12" cy="12" rx="4.5" ry="9.5" />
            <line x1="2.5" y1="12" x2="21.5" y2="12" />
            <path d="M4.5 7.5h15" />
            <path d="M4.5 16.5h15" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`z-20 pointer-events-auto ${className}`}
    >
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/95 backdrop-blur-xs rounded-xl sm:rounded-2xl shadow-[0_10px_24px_-4px_rgba(0,0,0,0.1),0_3px_8px_-2px_rgba(0,0,0,0.05)] border border-white flex items-center justify-center p-2 sm:p-2.5 transition-transform duration-300 hover:scale-105 ${getRotationClass()}`}
      >
        {renderContent()}
      </div>
    </motion.div>
  );
}

