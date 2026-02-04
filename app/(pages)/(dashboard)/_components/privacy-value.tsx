"use client";

import { useAuth } from "@/contexts/auth-context";

interface PrivacyValueProps {
  value: string | number;
  className?: string;
}

export function PrivacyValue({ value, className }: PrivacyValueProps) {
  const { user } = useAuth();
  const isPrivate = user?.privacyMode;

  return (
    <span
      className={`transition-all duration-500 ${className} ${
        isPrivate ? "blur-md select-none opacity-50" : "blur-0"
      }`}
    >
      {isPrivate ? "*******" : value}
    </span>
  );
}
