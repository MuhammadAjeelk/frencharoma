import Image from "next/image";
import Link from "next/link";
import { PHOTO_HOVER } from "@/lib/design";
import Cta, { cropCta } from "./Cta";

// One piece of homepage artwork as a link, with its button drawn on top. The
// box keeps the slot's designed shape, so a wrongly-sized upload is cropped,
// never stretched; the alt text stands in for the text drawn into the art.
//
// `crop` shows only a slice of the art — { start, span } in percent of its
// width — for the phone cards cut from the edition banner. `cta` overrides the
// slot's own button (that card's button comes from the banner's list).
export default function ArtCard({
  art,
  href,
  cta = art?.cta,
  crop,
  sizes,
  priority = false,
  round = false,
  className = "",
}) {
  if (!art?.src) return null;
  const span = crop ? crop.span : 100;
  const button = cta && crop ? cropCta(cta, crop.start, crop.span) : cta;

  return (
    <Link
      href={href || art.href || "/collections/shop-all"}
      aria-label={crop ? cta?.label || art.alt : art.alt}
      className={`@container group relative block overflow-hidden ${round ? "rounded-full" : ""} ${className}`}
      style={{ aspectRatio: `${(art.width * span) / 100} / ${art.height}` }}
    >
      <Image
        src={art.src}
        alt={art.alt || ""}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${PHOTO_HOVER}`}
        style={crop ? { objectPosition: crop.start === 0 ? "left center" : "right center" } : undefined}
      />
      <Cta cta={button} />
    </Link>
  );
}
