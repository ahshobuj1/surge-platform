interface ZeroDraftLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ZerodraftLogo = ({ className = "mb-10", size = "lg" }: ZeroDraftLogoProps) => {
  const fontSizeClass =
    size === "sm"
      ? "text-xl md:text-2xl"
      : size === "md"
      ? "text-3xl md:text-4xl"
      : "text-4xl md:text-5xl";

  return (
    <div className={`flex justify-center ${className}`}>
      <h1
        className={`${fontSizeClass} tracking-widest font-bold text-foreground select-none`}
        style={{
          fontFamily: "'Courier New', monospace",
          letterSpacing: "0.15em",
          textShadow: "0 0 0 transparent",
          WebkitTextStroke: "0.5px currentColor",
          paintOrder: "stroke fill",
        }}
      >
        {"zerodraft".split("").map((char, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              backgroundImage:
                "radial-gradient(circle, currentColor 1.2px, transparent 1.2px)",
              backgroundSize: "4px 4px",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "hsl(228 20% 15%)",
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default ZerodraftLogo;