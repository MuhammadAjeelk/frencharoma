import HeroCarousel from "@/components/HeroCarousel";
import BrandMarquee from "@/components/BrandMarquee";
import ShopByGender from "@/components/ShopByGender";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <BrandMarquee />
      <ShopByGender />
    </div>
  );
}
