import Image from "next/image";

interface ZeroDraftLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ZerodraftLogo = ({ className = "mb-8", size = "lg" }: ZeroDraftLogoProps) => {
  const dimensions =
    size === "sm"
      ? { width: 120, height: 12 }
      : size === "md"
      ? { width: 150, height: 15 }
      : { width: 180, height: 18 };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/Logo - Black.svg"
        alt="zerodraft"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="h-auto w-auto object-contain max-h-7"
      />
    </div>
  );
};

export default ZerodraftLogo;