/* ============================================================
 📁 FILE: src/components/ui/Input.tsx
   → Component ô nhập dữ liệu (Input)
============================================================ */
import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 ${
        props.className || ""
      }`}
    />
  );
}
