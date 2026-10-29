import HeroCarousel from "@/components/HeroCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import BestSellers from "@/components/BestSellers";
import Reveal from "@/components/Reveal";
import BundleOfferModal from "@/components/BundleOfferModal";
import {
  ShopByGender,
  ShopByBrand,
  ShopBySeason,
  ShopByEdition,
  ShopByScent,
  OfferBanners,
} from "@/components/home/HomeSections";
import CustomerStrip from "@/components/home/CustomerStrip";
import ElevateBand from "@/components/home/ElevateBand";
import getSiteMedia from "@/lib/getSiteMedia";

// Static page. Images, hero slides and reviews are read when the page is
// rendered — at build, after an admin saves, and at most hourly so new reviews
// reach the customer strip — never per visitor.
export const revalidate = 3600;

// The phone and desktop mockups stack the sections in different orders, so
// each one carries its position for both: `order-N md:order-M`.
export default async function Home() {
  const { media, heroSlides, reviews } = await getSiteMedia();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--fa-dark)]">
      <div className="order-1">
        <HeroCarousel slides={heroSlides} />
      </div>
      <Reveal className="order-2">
        <WhyChooseUs media={media} />
      </Reveal>
      <Reveal className="order-4 md:order-3">
        <ShopByGender media={media} />
      </Reveal>
      <Reveal className="order-3 md:order-4">
        <ShopByBrand media={media} />
      </Reveal>
      <Reveal className="order-6 md:order-5">
        <BestSellers />
      </Reveal>
      <Reveal className="order-7 md:order-6">
        <ShopBySeason media={media} />
      </Reveal>
      <Reveal className="order-5 md:order-7">
        <ShopByEdition media={media} />
      </Reveal>
      <Reveal className="order-8">
        <ShopByScent media={media} />
      </Reveal>
      <Reveal className="order-9">
        <OfferBanners media={media} />
      </Reveal>
      <div className="order-10">
        <CustomerStrip reviews={reviews} />
      </div>
      <div className="order-11">
        <ElevateBand />
      </div>
      <BundleOfferModal />
    </div>
  );
}
