"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type RotatingIconProps = {
  src: string;
  alt?: string;
  size?: number;
  duration?: number;
  className?: string;
};

export default function RotatingIcon({
  src,
  alt = "icon",
  size = 50,
  duration = 8,
  className = "",
}: RotatingIconProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration,
        ease: "linear",
      }}
      className={className}
    >
      <Image src={src} alt={alt} width={size} height={size} />
    </motion.div>
  );
}