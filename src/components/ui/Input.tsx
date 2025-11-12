
import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                 text-gray-900 placeholder:text-gray-400 bg-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 transition-shadow duration-200 ${props.className || ""}`}
    />
  );
}
