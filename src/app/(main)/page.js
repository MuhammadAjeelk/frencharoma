import HeroCarousel from "@/components/HeroCarousel";
import BrandMarquee from "@/components/BrandMarquee";
import ShopByGender from "@/components/ShopByGender";
import ShopByCategory from "@/components/ShopByCategory";
import BestSellers from "@/components/BestSellers";
import SpecialOffers from "@/components/SpecialOffers";
import Discovery from "@/components/Discovery";
import WhyChooseUs from "@/components/WhyChooseUs";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroCarousel />
      <Reveal>
        <BrandMarquee />
      </Reveal>
      <Reveal>
        <ShopByGender />
      </Reveal>
      <Reveal>
        <ShopByCategory />
      </Reveal>
      <Reveal>
        <BestSellers />
      </Reveal>
      <Reveal>
        <SpecialOffers />
      </Reveal>
      <Reveal>
        <Discovery />
      </Reveal>
      <Reveal>
        <WhyChooseUs />
      </Reveal>
    </div>
  );
}
