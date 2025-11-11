
import type { SelectHTMLAttributes } from "react";

export function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 transition-shadow duration-200 ${props.className || ""}`}
    >
      {children}
    </select>
  );
}
