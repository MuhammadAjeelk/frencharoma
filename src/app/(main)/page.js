import HeroCarousel from "@/components/HeroCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import BrandMarquee from "@/components/BrandMarquee";
import ShopByGender from "@/components/ShopByGender";
import ShopByEditions from "@/components/ShopByEditions";
import BestSellers from "@/components/BestSellers";
import ShopBySeason from "@/components/ShopBySeason";
import ShopByScentProfile from "@/components/ShopByScentProfile";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#322e29]">
      <HeroCarousel />
      <Reveal><WhyChooseUs /></Reveal>
      <Reveal><BrandMarquee /></Reveal>
      <Reveal><ShopByGender /></Reveal>
      <Reveal><ShopByEditions /></Reveal>
      <Reveal><BestSellers /></Reveal>
      <Reveal><ShopBySeason /></Reveal>
      <Reveal><ShopByScentProfile /></Reveal>
    </div>
  );
}
