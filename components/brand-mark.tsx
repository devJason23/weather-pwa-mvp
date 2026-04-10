import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  href?: string;
  className?: string;
  tone?: "light" | "dark";
  compact?: boolean;
};

export function BrandMark({
  href,
  className,
  tone = "dark",
  compact = false
}: BrandMarkProps) {
  const content = (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative shrink-0", compact ? "h-12 w-12 sm:h-14 sm:w-14" : "h-16 w-16 sm:h-20 sm:w-20")}>
        <Image
          src="/hoopsmith-logo.png"
          alt="HoopSmith logo"
          fill
          sizes={compact ? "56px" : "80px"}
          priority={!compact}
          className={cn(
            "object-contain",
            tone === "light" ? "drop-shadow-[0_14px_28px_rgba(0,0,0,0.35)]" : "drop-shadow-[0_10px_18px_rgba(16,20,24,0.12)]"
          )}
        />
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex">
      {content}
    </Link>
  );
}
