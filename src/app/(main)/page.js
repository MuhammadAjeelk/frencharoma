import HeroCarousel from "@/components/HeroCarousel";
import BrandMarquee from "@/components/BrandMarquee";
import ShopByGender from "@/components/ShopByGender";
import ShopByCategory from "@/components/ShopByCategory";
import BestSellers from "@/components/BestSellers";
import BundleOffers from "@/components/BundleOffers";
import SpecialOffers from "@/components/SpecialOffers";
import Discovery from "@/components/Discovery";
import WhatMakesUsSpecial from "@/components/WhatMakesUsSpecial";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroCarousel />

      <BrandMarquee />

      <ShopByGender />

      <ShopByCategory />

      <BestSellers />

      <BundleOffers />

      <SpecialOffers />
      <Discovery />

      <WhatMakesUsSpecial />
    </div>
  );
}
