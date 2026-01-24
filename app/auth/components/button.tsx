import { CircleNotchIcon } from "@phosphor-icons/react";
import React from "react";

export function Button({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="bg-black text-white py-3 rounded-lg w-full font-bold uppercase tracking-wide hover:bg-gray-800 active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-h-13"
    >
      {isLoading ? (
        <CircleNotchIcon className="w-6 h-6 animate-spin text-white" />
      ) : (
        children
      )}
    </button>
  );
}
