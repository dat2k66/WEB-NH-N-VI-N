/* ============================================================
 📁 FILE: src/components/ui/Select.tsx
   → Component chọn danh sách (Select)
============================================================ */
import type { SelectHTMLAttributes } from "react";

export function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`px-3 py-2 border rounded-md ${props.className || ""}`}
    >
      {children}
    </select>
  );
}
