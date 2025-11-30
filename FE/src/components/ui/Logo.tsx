import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide", className)}
    >
      {/* House Outline */}
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      
      {/* Mushroom Outline (Centered inside) */}
      {/* Stem */}
      <path d="M12 21v-6" /> 
      {/* Cap */}
      <path d="M8 15c0-2.5 1.5-4.5 4-4.5s4 2 4 4.5" />
      {/* Ground line for mushroom inside (optional, but helps ground it) */}
      <path d="M10 21h4" />
    </svg>
  );
}

