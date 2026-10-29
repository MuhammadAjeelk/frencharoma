import Link from "next/link";
import Image from "next/image";
import { DEFAULT_MEDIA, SITE_MEDIA_SECTIONS } from "@/lib/siteMedia";
import { PHOTO_HOVER } from "@/lib/design";
import ArtCard from "./ArtCard";
import HomeHeading from "./HomeHeading";
import SnapRow from "./SnapRow";

// The homepage sections of the 2026-10 mockup. Every image comes from the
// admin-managed map (src/lib/siteMedia.js), and the slot list for each section
// is read from there too, so adding a brand or card is a registry change.
//
// Grounds alternate per device, as drawn: desktop cream / paper bands, phones
// sand / dark. `PHONE_DARK` sections pass tone="dark" to their heading and row.

const GUTTER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const CREAM = "bg-[var(--fa-home-sand)] md:bg-[var(--fa-home-cream)]";
const PAPER = "bg-[var(--fa-home-sand)] md:bg-[var(--fa-home-paper)]";
const PHONE_DARK_CREAM = "bg-[var(--fa-dark)] md:bg-[var(--fa-home-cream)]";

const slotsOf = (id) => SITE_MEDIA_SECTIONS.find((s) => s.id === id)?.slots || [];

// Three wide cards: gender, season, scent profile.
const CARD_SIZES = "(max-width: 767px) 92vw, 33vw";

function CardRow({ id, media, label, tone }) {
  return (
    <SnapRow label={label} tone={tone}>
      {slotsOf(id).map((slot) => (
        <ArtCard key={slot.key} art={media[slot.key]} sizes={CARD_SIZES} />
      ))}
    </SnapRow>
  );
}

export function ShopByGender({ media = DEFAULT_MEDIA }) {
  return (
    <section className={`${CREAM} py-6 md:py-2`}>
      <div className={GUTTER}>
        <HomeHeading title="Shop By Gender" subtitle="Find the scent that reflects you." phoneOnly />
        <CardRow id="gender" media={media} label="Shop by gender" />
      </div>
    </section>
  );
}

export function ShopByBrand({ media = DEFAULT_MEDIA }) {
  return (
    <section className={`${PHONE_DARK_CREAM} py-8 md:pt-10 md:pb-14`}>
      <div className={GUTTER}>
        <HomeHeading
          eyebrow="Iconic Brands"
          title="Shop By Brand"
          subtitle="Discover your favorite houses."
          href="/collections/shop-all?view=brands"
          phoneLinkOnly
          tone="dark"
        />
        <div className="md:px-14">
          <SnapRow
            label="Shop by brand"
            desktop="scroll"
            dots={false}
            tone="dark"
            itemClass="w-[44%] sm:w-[30%] md:w-[calc((100%-120px)/6)]"
          >
            {slotsOf("brands").map((slot) => (
              <ArtCard
                key={slot.key}
                art={media[slot.key]}
                round
                sizes="(max-width: 767px) 44vw, 15vw"
                className="ring-2 ring-[var(--fa-gold)]/70"
              />
            ))}
          </SnapRow>
        </div>
      </div>
    </section>
  );
}

export function ShopBySeason({ media = DEFAULT_MEDIA }) {
  return (
    <section className={`${CREAM} py-8 md:py-10`}>
      <div className={GUTTER}>
        <HomeHeading
          eyebrow="Seasonal Scents"
          title="Shop By Season"
          subtitle="Discover the perfect expression for every time of year."
        />
        <CardRow id="seasons" media={media} label="Shop by season" />
      </div>
    </section>
  );
}

// One banner with two destinations: the left half is Luxury, the right half
// Premium. The halves are separate links over a single image.
export function ShopByEdition({ media = DEFAULT_MEDIA }) {
  const art = media["editions.banner"];
  if (!art?.src) return null;
  return (
    <section className={`${PAPER} py-8 md:py-10`}>
      <div className={GUTTER}>
        <HomeHeading eyebrow="Find Your Style" title="Shop By Edition" subtitle="Crafted for every mood and moment." />
        <div className="group relative overflow-hidden" style={{ aspectRatio: `${art.width} / ${art.height}` }}>
          <Image src={art.src} alt={art.alt} fill sizes="(max-width: 1280px) 100vw, 1280px" className={`object-cover ${PHOTO_HOVER}`} />
          <Link href="/collections/shop-all?edition=luxury" aria-label="Shop Luxury Edition" className="absolute inset-y-0 left-0 w-1/2" />
          <Link href="/collections/shop-all?edition=premium" aria-label="Shop Premium Edition" className="absolute inset-y-0 right-0 w-1/2" />
        </div>
      </div>
    </section>
  );
}

export function ShopByScent({ media = DEFAULT_MEDIA }) {
  return (
    <section className={`${PHONE_DARK_CREAM} py-8 md:py-10`}>
      <div className={GUTTER}>
        <HomeHeading
          eyebrow="Choose Your Experience"
          title="Shop By Scent Profile"
          subtitle="Find the fragrance that matches your style."
          href="/collections/shop-all"
          desktopLinkLabel="More"
          tone="dark"
        />
        <CardRow id="scents" media={media} label="Shop by scent profile" tone="dark" />
      </div>
    </section>
  );
}

// Discovery Box, Special Offers, Bundle Offers: edge-to-edge banners.
export function OfferBanners({ media = DEFAULT_MEDIA }) {
  return (
    <section className="bg-[var(--fa-home-paper)] py-3 md:py-5 space-y-3 md:space-y-6">
      {slotsOf("promos").map((slot) => (
        <ArtCard key={slot.key} art={media[slot.key]} sizes="100vw" />
      ))}
    </section>
  );
}
