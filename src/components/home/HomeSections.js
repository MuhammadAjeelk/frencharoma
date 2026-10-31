import Image from "next/image";
import Link from "next/link";
import { DEFAULT_MEDIA, SITE_MEDIA_SECTIONS } from "@/lib/siteMedia";
import { PHOTO_HOVER } from "@/lib/design";
import ArtCard from "./ArtCard";
import Cta from "./Cta";
import HomeHeading from "./HomeHeading";
import SnapRow from "./SnapRow";
import BrandMarquee from "./BrandMarquee";

// The homepage sections of the 2026-10 mockups. Every image, and the slot list
// of each section, comes from the admin-managed registry (src/lib/siteMedia.js).
//
// Spacing is the mockups' own. Desktop values are the 1369px mockup's pixels.
// Phones follow the 756-unit phone spec in vw (1 unit = 100/756 vw), so every
// section keeps its drawn proportions on any phone: 458-unit sections with a
// 31-unit top pad, a 45.5-unit title, 20.5 units to a 300-unit card row, and
// 61 units below; 24-unit side gutters, 13-unit gaps between cards and 37
// between brand circles; 360-unit offer banners 20 units apart. Desktop content
// spans the full width less a 2.41vw margin each side, as drawn.

const FRAME = "md:px-[2.41vw]";

// Section grounds. Phones and desktop alternate them differently.
const CREAM = "bg-[var(--fa-home-cream)]";
const WHITE = "bg-[var(--fa-home-white)]";

const slotsOf = (id) => SITE_MEDIA_SECTIONS.find((s) => s.id === id)?.slots || [];

// Three wide cards: gender, season, scent profile.
const CARD_SIZES = "(max-width: 767px) 85vw, 32vw";

function CardRow({ id, media, label }) {
  return (
    <SnapRow label={label}>
      {slotsOf(id).map((slot) => (
        <ArtCard key={slot.key} art={media[slot.key]} sizes={CARD_SIZES} />
      ))}
    </SnapRow>
  );
}

// Section padding and the gap under the heading, phone then desktop.
function Section({ ground, pad, children }) {
  return <section className={`${ground} ${pad}`}>{children}</section>;
}

export function ShopByGender({ media = DEFAULT_MEDIA }) {
  return (
    <Section ground={CREAM} pad="pt-[4.1vw] pb-[8.07vw] md:pt-[7px] md:pb-0">
      <HomeHeading title="Shop by Gender" href="/collections/shop-all" desktop={false} />
      <div className={`mt-[2.71vw] md:mt-0 ${FRAME}`}>
        <CardRow id="gender" media={media} label="Shop by gender" />
      </div>
    </Section>
  );
}

export function ShopByBrand({ media = DEFAULT_MEDIA }) {
  return (
    <Section ground={`${WHITE} md:bg-[var(--fa-home-cream)]`} pad="pt-[4.1vw] pb-[8.07vw] md:pt-[35px] md:pb-[67px]">
      <HomeHeading eyebrow="Iconic Brands" title="Shop by Brand" href="/collections/shop-all?view=brands" />
      <div className={`mt-[2.71vw] md:mt-[27px] ${FRAME}`}>
        <div className="md:px-[4.38vw]">
          <BrandMarquee
            label="Shop by brand"
            gapClass="gap-[4.89vw] md:gap-[2.37vw]"
            itemClass="w-[39.68vw] md:w-[calc((100%-5*2.37vw)/6)]"
            items={slotsOf("brands").map((slot) => (
              <ArtCard key={slot.key} art={media[slot.key]} round sizes="(max-width: 767px) 37vw, 13vw" />
            ))}
          />
        </div>
      </div>
    </Section>
  );
}

export function ShopBySeason({ media = DEFAULT_MEDIA }) {
  return (
    <Section ground={CREAM} pad="pt-[4.1vw] pb-[8.07vw] md:pt-[21px] md:pb-[38px]">
      <HomeHeading eyebrow="Seasonal Scents" title="Shop by Season" href="/collections/shop-all" />
      <div className={`mt-[2.71vw] md:mt-[21px] ${FRAME}`}>
        <CardRow id="seasons" media={media} label="Shop by season" />
      </div>
    </Section>
  );
}

// Desktop: one banner, a button on each half, each half its own link.
// Phones: two cards cut from the same banner — the left `phoneCrop`% for
// Luxury and the right for Premium — each with its half's button.
export function ShopByEdition({ media = DEFAULT_MEDIA }) {
  const art = media["editions.banner"];
  if (!art?.src) return null;
  const [luxury, premium] = art.ctas || [];
  const span = art.phoneCrop || 47;

  return (
    <Section ground={WHITE} pad="pt-[4.1vw] pb-[8.07vw] md:pt-[30px] md:pb-[59px]">
      <HomeHeading eyebrow="Find Your Style" title="Shop by Edition" href="/collections/shop-all" />

      <div className="mt-[2.71vw] md:hidden">
        <SnapRow label="Shop by edition">
          {luxury && <ArtCard art={art} href={luxury.href} cta={luxury} crop={{ start: 0, span }} sizes="85vw" />}
          {premium && <ArtCard art={art} href={premium.href} cta={premium} crop={{ start: 100 - span, span }} sizes="85vw" />}
        </SnapRow>
      </div>

      <div className={`hidden md:block mt-[14px] ${FRAME}`}>
        <div className="@container group relative overflow-hidden" style={{ aspectRatio: `${art.width} / ${art.height}` }}>
          <Image src={art.src} alt={art.alt} fill sizes="96vw" className={`object-cover ${PHOTO_HOVER}`} />
          {/* Each half of the banner opens its edition; the buttons are links too. */}
          {luxury && <Link href={luxury.href} aria-label={luxury.label} className="absolute inset-y-0 left-0 w-1/2" />}
          {premium && <Link href={premium.href} aria-label={premium.label} className="absolute inset-y-0 right-0 w-1/2" />}
          {(art.ctas || []).map((cta) => (
            <Cta key={cta.label} cta={cta} href={cta.href} />
          ))}
        </div>
      </div>
    </Section>
  );
}

export function ShopByScent({ media = DEFAULT_MEDIA }) {
  return (
    <Section ground={`${WHITE} md:bg-[var(--fa-home-cream)]`} pad="pt-[4.1vw] pb-[8.07vw] md:pt-[33px] md:pb-[42px]">
      <HomeHeading
        eyebrow="Choose Your Experience"
        title="Shop by Scent Profile"
        href="/collections/shop-all"
        desktopLink={{ href: "/collections/shop-all", label: "More", top: 64 }}
        className={FRAME}
      />
      <div className={`mt-[2.71vw] md:mt-[31px] ${FRAME}`}>
        <CardRow id="scents" media={media} label="Shop by scent profile" />
      </div>
    </Section>
  );
}

// Discovery Box, Special Offers, Bundle Offers: edge-to-edge banners. Phones
// and desktop get different files, shapes and button spots, so each device
// renders its own; only the one on screen is downloaded.
function OfferBanner({ desktop, phone }) {
  return (
    <>
      <div className="md:hidden">
        <ArtCard art={phone} sizes="100vw" />
      </div>
      <div className="hidden md:block">
        <ArtCard art={desktop} sizes="100vw" />
      </div>
    </>
  );
}

export function OfferBanners({ media = DEFAULT_MEDIA }) {
  const ids = ["discoveryBox", "specialOffers", "bundleOffers"];
  return (
    <section className="bg-white flex flex-col gap-[2.65vw] pb-[2.65vw] md:gap-[27px] md:pb-0">
      {ids.map((id) => (
        <OfferBanner key={id} desktop={media[`promo.${id}`]} phone={media[`promo.${id}.mobile`]} />
      ))}
    </section>
  );
}
