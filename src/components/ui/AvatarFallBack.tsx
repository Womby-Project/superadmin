// src/components/ui/AvatarWithFallback.tsx
import React from "react";

interface AvatarWithFallbackProps {
  src?: string | null;
  name: string;
  size?: number;
  fallbackBg?: string; // tailwind bg color, e.g. "bg-gray-300"
  className?: string;
}

const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  name,
  size = 40,
  fallbackBg = "bg-gray-300",
  className = "",
}) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  const [errored, setErrored] = React.useState(false);

  return src && !errored ? (
    <img
      src={src}
      alt={name}
      className={`rounded-full object-cover border ${className}`}
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold border ${fallbackBg} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </div>
  );
};

export default AvatarWithFallback;
