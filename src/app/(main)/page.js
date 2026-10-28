import HeroCarousel from "@/components/HeroCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import BrandMarquee from "@/components/BrandMarquee";
import ShopByGender from "@/components/ShopByGender";
import ShopByEditions from "@/components/ShopByEditions";
import BestSellers from "@/components/BestSellers";
import ShopBySeason from "@/components/ShopBySeason";
import ShopByScentProfile from "@/components/ShopByScentProfile";
import Reveal from "@/components/Reveal";
import BundleOfferModal from "@/components/BundleOfferModal";
import getSiteMedia from "@/lib/getSiteMedia";

// Static page. The image map and hero slides are read when the page is
// rendered — at build, and again only after an admin saves — never per visitor.
export default async function Home() {
  const { media, heroSlides } = await getSiteMedia();

  return (
    <div className="min-h-screen bg-[var(--fa-dark)]">
      <HeroCarousel slides={heroSlides} />
      <Reveal><WhyChooseUs media={media} /></Reveal>
      <Reveal><BrandMarquee media={media} /></Reveal>
      <Reveal><ShopByGender media={media} /></Reveal>
      <Reveal><ShopByEditions media={media} /></Reveal>
      <Reveal><BestSellers /></Reveal>
      <Reveal><ShopBySeason media={media} /></Reveal>
      <Reveal><ShopByScentProfile media={media} /></Reveal>
      <BundleOfferModal />
    </div>
  );
}
