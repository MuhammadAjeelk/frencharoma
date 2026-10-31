import Image from "next/image";
import Link from "next/link";
import { PHOTO_HOVER } from "@/lib/design";
import Cta, { cropCta } from "./Cta";

// One piece of homepage artwork as a link, with its button drawn on top. The
// box keeps the slot's designed shape, so a wrongly-sized upload is cropped,
// never stretched; the alt text stands in for the text drawn into the art.
//
// `crop` shows only a slice of the art on every device — { start, span } in
// percent of its width — for the phone cards cut from the edition banner.
// `phoneCrop` does the same below md only, when the phone spec draws a box
// narrower than the art (1788 × 767 cards in a 637 × 300 phone box). Either
// way the button is re-placed so it stays on the same spot of the art.
// `cta` overrides the slot's own button.
const position = (c) => (c && c.span < 100 ? `${(c.start / (100 - c.span)) * 100}% center` : "center");

export default function ArtCard({
  art,
  href,
  cta = art?.cta,
  crop,
  phoneCrop = art?.phoneCardCrop,
  sizes,
  priority = false,
  round = false,
  className = "",
}) {
  if (!art?.src) return null;
  const phone = crop || phoneCrop;
  const ratio = (c) => (art.width * (c ? c.span : 100)) / 100 / art.height;
  const deskCta = cta && crop ? cropCta(cta, crop.start, crop.span) : cta;
  const phoneCta = cta && phone ? cropCta(cta, phone.start, phone.span) : cta;

  return (
    <Link
      href={href || art.href || "/collections/shop-all"}
      aria-label={crop ? cta?.label || art.alt : art.alt}
      className={`@container group relative block overflow-hidden aspect-[var(--ar)] md:aspect-[var(--ar-md)] ${round ? "rounded-full" : ""} ${className}`}
      style={{ "--ar": ratio(phone), "--ar-md": ratio(crop) }}
    >
      <Image
        src={art.src}
        alt={art.alt || ""}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${PHOTO_HOVER}`}
        style={{ objectPosition: position(phone) }}
      />
      <Cta cta={deskCta} phone={phoneCta} />
    </Link>
  );
}
