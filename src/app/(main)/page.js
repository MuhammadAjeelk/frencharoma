import HeroCarousel from "@/components/HeroCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import BrandMarquee from "@/components/BrandMarquee";
import ShopByGender from "@/components/ShopByGender";
import ShopByEditions from "@/components/ShopByEditions";
import BestSellers from "@/components/BestSellers";
import ShopBySeason from "@/components/ShopBySeason";
import ShopByScentProfile from "@/components/ShopByScentProfile";
import Reveal from "@/components/Reveal";
import getSiteMedia from "@/lib/getSiteMedia";

// Static page. The image map is read when the page is rendered — at build, and
// again only after an admin replaces an image — never per visitor.
export default async function Home() {
  const media = await getSiteMedia();

  return (
    <div className="min-h-screen bg-[var(--fa-dark)]">
      <HeroCarousel media={media} />
      <Reveal><WhyChooseUs media={media} /></Reveal>
      <Reveal><BrandMarquee media={media} /></Reveal>
      <Reveal><ShopByGender media={media} /></Reveal>
      <Reveal><ShopByEditions media={media} /></Reveal>
      <Reveal><BestSellers /></Reveal>
      <Reveal><ShopBySeason media={media} /></Reveal>
      <Reveal><ShopByScentProfile media={media} /></Reveal>
    </div>
  );
}
