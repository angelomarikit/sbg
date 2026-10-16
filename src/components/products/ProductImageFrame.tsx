import { cn } from "@/lib/utils";

type ProductImageFrameProps = {
  src: string;
  alt: string;
  className?: string;
  size?: "card" | "detail" | "thumb";
};

const sizeClasses = {
  card: "h-52 w-full",
  detail: "h-[min(420px,50vh)] w-full",
  thumb: "h-16 w-16",
};

export function ProductImageFrame({
  src,
  alt,
  className,
  size = "card",
}: ProductImageFrameProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-gradient-to-b from-fresh/40 to-white",
        sizeClasses[size],
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[85%] max-w-[85%] object-contain object-center"
        loading="lazy"
      />
    </div>
  );
}
