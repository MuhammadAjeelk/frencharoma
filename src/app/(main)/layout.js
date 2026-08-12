import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddedToCartPopup from "@/components/AddedToCartPopup";

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <AddedToCartPopup />
    </>
  );
}
