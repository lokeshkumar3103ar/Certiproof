"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  label: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  function handleCopy() {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground shrink-0"
      title={`Copy ${label}`}
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}
