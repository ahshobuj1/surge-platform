import ZerodraftLogo from "@/app/component/shared/ZeroDraftLogo";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#EFF2FA] via-[#DCE2F3] to-[#B5BEE0] relative overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="w-full max-w-[400px] flex flex-col items-center z-10">
        <Link href="/" className="mb-6 hover:opacity-90 transition-opacity">
          <ZerodraftLogo className="mb-0" />
        </Link>
        {children}
      </div>
    </div>
  );
}

