import Image from "next/image";
import Link from "next/link";
import { PHOTO_HOVER } from "@/lib/design";

// One piece of homepage artwork as a link. The art carries its own text and
// button, so there is no overlay — the alt text stands in for it. The box keeps
// the slot's designed shape, so a wrongly-sized upload is cropped, not stretched.
export default function ArtCard({ art, href, sizes, priority = false, round = false, className = "" }) {
  if (!art?.src) return null;
  return (
    <Link
      href={href || art.href || "/collections/shop-all"}
      aria-label={art.alt}
      className={`group relative block overflow-hidden ${round ? "rounded-full" : ""} ${className}`}
      style={{ aspectRatio: `${art.width} / ${art.height}` }}
    >
      <Image
        src={art.src}
        alt={art.alt || ""}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${PHOTO_HOVER}`}
      />
    </Link>
  );
}
