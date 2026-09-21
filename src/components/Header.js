"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import DesktopNav, { NavList } from "@/components/PrimaryNav";
import {
  MENU_PANEL,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  FIELD_DARK,
  FOCUS_RING,
} from "@/lib/design";

function MaskIcon({ src, className = "w-5 h-5" }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} inline-block bg-current`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(-1);
  const router = useRouter();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSubOpen, setMobileSubOpen] = useState(null);
  const [brands, setBrands] = useState([]);
  const [families, setFamilies] = useState([]);
  const accountRef = useRef(null);
  const { user, logout, isAdmin, loading } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  // Fetch brands for the dropdown
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setBrands(data.brands || []))
      .catch(() => {});
    fetch("/api/scent-families")
      .then((r) => r.json())
      .then((data) => setFamilies(data.families || []))
      .catch(() => {});
  }, []);

  // Live search suggestions (debounced)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/perfumes?search=${encodeURIComponent(q)}&limit=6`)
        .then((r) => r.json())
        .then((d) => setSearchResults(d.perfumes || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAccountOpen(false);
  };

  const shopSubmenu = [
    { name: "Shop All", href: "/collections/shop-all", accent: true },
    {
      name: "Signature Scents",
      href: "/collections/shop-all?signature=true",
      standalone: true,
    },
    { heading: "Shop by Gender" },
    { name: "For Men", href: "/collections/shop-all?gender=men" },
    { name: "For Women", href: "/collections/shop-all?gender=women" },
    { name: "For Unisex", href: "/collections/shop-all?gender=unisex" },
    { heading: "Shop by Collection" },
    { name: "Luxury Edition", href: "/collections/shop-all?edition=luxury" },
    { name: "Premium Edition", href: "/collections/shop-all?edition=premium" },
    { heading: "Shop by Season" },
    {
      name: "For Winter & Autumn",
      href: "/collections/shop-all?tags=autumn,winter",
    },
    {
      name: "For Summer & Spring",
      href: "/collections/shop-all?tags=spring,summer",
    },
  ];

  const menuItems = [
    { name: "SHOP ALL", href: "/collections/shop-all", submenu: shopSubmenu },
    { name: "BEST SELLERS", href: "/collections/shop-all?bestSeller=true" },
    { name: "SHOP BY BRAND", href: "#", brandDropdown: true },
    { name: "SPECIAL OFFERS", href: "/collections/shop-all?specialOffer=true" },
    { name: "DISCOVERY BOX", href: "/collections/discovery-box" },
    { name: "BLOGS", href: "/blogs/blog" },
  ];


  const baseMarquee = [
    "Original French Perfume Oils",
    "Up To 40% Concentration",
    "Long-lasting Performance",
    "Affordable Luxury",
    "More than 100 Iconic Fragrances",
    "Countrywide Free Shipping",
    "Free Suprise Gift",
    "Trsuted by Regular Customers",
  ];
  // Repeat so a single half is wider than any screen → seamless, gap-free loop.
  const marqueeItems = Array.from({ length: 4 }, () => baseMarquee).flat();

  return (
    <>
      {/* Running announcement bar */}
      <div className="w-full overflow-hidden border-t-2 border-t-[#c9a25a]/70 border-b border-b-[#bda98f] bg-[#d1c0ab]">
        <div className="flex w-max animate-marquee py-2">
          {[0, 1].map((dup) => (
            <div
              key={dup}
              className="flex items-center shrink-0"
              aria-hidden={dup === 1}
            >
              {marqueeItems.map((item, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-6 text-[13px] font-medium tracking-wide text-black whitespace-nowrap">
                    {item}
                  </span>
                  <svg
                    className="w-4 h-4 text-[#c9a25a] shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header className="header relative z-50 border-b border-[#bda98f] bg-[#373838]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Section */}
          <div className="flex items-center justify-between py-1.5 lg:py-2">
            {/* Left — Search */}
            <div className="flex items-center gap-2 flex-1 lg:flex-none overflow-visible">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-2 focus:outline-none text-[#c2a268] hover:text-[#e2c58f] transition-colors ${FOCUS_RING}`}
                aria-label="Menu"
              >
                <MaskIcon src="/icons/menu.svg" />
              </button>

              {/* Desktop Search */}
              <div className="hidden lg:block relative overflow-visible">
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className={`flex items-center gap-2 py-2 focus:outline-none text-[#c2a268] hover:text-[#e2c58f] transition-colors duration-200 whitespace-nowrap ${FOCUS_RING} ${
                    isSearchExpanded ? "invisible" : ""
                  }`}
                  aria-label="Search"
                >
                  <MaskIcon src="/icons/search.svg" />
                  <span className="text-[13px] font-medium uppercase tracking-[0.12em]">
                    Search
                  </span>
                </button>
                {isSearchExpanded && (
                  <form
                    action="/collections/shop-all"
                    method="get"
                    className="absolute left-0 top-0 z-10"
                    style={{ animation: "fadeInSlide 0.3s ease-in-out" }}
                    onSubmit={(e) => {
                      if (!searchQuery.trim()) {
                        e.preventDefault();
                        setIsSearchExpanded(false);
                      }
                    }}
                  >
                    <div className="relative">
                      <input
                        type="search"
                        name="search"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSearchActive(-1);
                        }}
                        onKeyDown={(e) => {
                          if (!searchResults.length) return;
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSearchActive((i) => (i + 1) % searchResults.length);
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setSearchActive(
                              (i) => (i - 1 + searchResults.length) % searchResults.length,
                            );
                          } else if (e.key === "Enter") {
                            if (searchActive >= 0 && searchActive < searchResults.length) {
                              e.preventDefault();
                              const p = searchResults[searchActive];
                              setIsSearchExpanded(false);
                              setSearchQuery("");
                              setSearchActive(-1);
                              router.push(`/collections/shop-all?search=${encodeURIComponent(p.name)}&view=products`);
                            }
                          } else if (e.key === "Escape") {
                            setIsSearchExpanded(false);
                            setSearchActive(-1);
                          }
                        }}
                        placeholder="Search perfumes..."
                        className={`w-64 px-4 py-2 pl-10 pr-10 text-[13px] ${FIELD_DARK}`}
                        autoFocus
                        onBlur={() => {
                          setTimeout(() => {
                            if (!searchQuery.trim()) setIsSearchExpanded(false);
                          }, 200);
                        }}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#c9a25a]">
                        <MaskIcon src="/icons/search.svg" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchExpanded(false);
                          setSearchQuery("");
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#a99d8c] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                        aria-label="Close search"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Live suggestions */}
                      {searchQuery.trim() && (
                        <div className={`absolute left-0 top-full mt-1.5 w-72 z-20 overflow-hidden animate-fadeIn ${MENU_PANEL}`}>
                          {searchResults.length > 0 ? (
                            <>
                              {searchResults.map((p, i) => (
                                <Link
                                  key={p._id}
                                  href={`/collections/shop-all?search=${encodeURIComponent(p.name)}&view=products`}
                                  onClick={() => {
                                    setIsSearchExpanded(false);
                                    setSearchQuery("");
                                    setSearchActive(-1);
                                  }}
                                  onMouseEnter={() => setSearchActive(i)}
                                  className={`flex items-center gap-3 px-3 py-2 transition-colors border-l-[3px] ${FOCUS_RING} ${
                                    i === searchActive
                                      ? "bg-[#c9a25a]/15 border-[#c9a25a]"
                                      : "border-transparent hover:bg-[#c9a25a]/10"
                                  }`}
                                >
                                  <div className="relative w-9 h-9 overflow-hidden bg-[#211d18] shrink-0 border border-[#d1ae6d]">
                                    {p.images?.main ? (
                                      <Image src={p.images.main} alt={p.name} fill className="object-cover" sizes="36px" />
                                    ) : null}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-[12px] font-medium truncate ${i === searchActive ? "text-[#e3c489]" : "text-[#efe7db]"}`}>{p.name}</p>
                                    <p className="text-[11px] text-[#a99d8c] truncate">
                                      {(() => {
                                        const imp = p.impressionName || p.brand || (p.brands && p.brands[0]) || "French Aromas";
                                        return /^signature\s*scent$/i.test(imp) ? imp : `Impression of: ${imp}`;
                                      })()}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                              <Link
                                href={`/collections/shop-all?search=${encodeURIComponent(searchQuery.trim())}`}
                                onClick={() => setIsSearchExpanded(false)}
                                className={`block px-4 py-2.5 text-[12px] font-semibold text-[#c9a25a] hover:bg-[#c9a25a]/10 hover:text-[#e3c489] border-t border-[#c9a25a]/25 transition-colors ${FOCUS_RING}`}
                              >
                                See all results for “{searchQuery.trim()}”
                              </Link>
                            </>
                          ) : (
                            <p className="px-4 py-3 text-[12px] text-[#a99d8c]">
                              {searchLoading ? "Searching…" : `No matches for “${searchQuery.trim()}”`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`lg:hidden flex items-center gap-2 p-2 focus:outline-none text-[#c2a268] hover:text-[#e2c58f] transition-colors ${FOCUS_RING}`}
                aria-label="Search"
              >
                <MaskIcon src="/icons/search.svg" />
              </button>
            </div>

            {/* Logo — Center */}
            <div
              className={`flex-1 flex justify-center ${isSearchOpen ? "lg:flex hidden" : "flex"}`}
            >
              <Link href="/">
                <Image
                  src="/logo-dark.png"
                  alt="French Aromas"
                  width={96}
                  height={36}
                  className="h-auto w-auto max-w-[92px] transition-transform duration-300 hover:scale-105"
                  priority
                />
              </Link>
            </div>

            {/* Right — Wishlist, Account, Cart */}
            <div className="flex items-center gap-5 lg:gap-6 flex-1 justify-end lg:flex-none">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className={`group hidden lg:block relative focus:outline-none text-[#c2a268] hover:text-[#e2c58f] transition-colors duration-200 ${FOCUS_RING}`}
                aria-label="Wishlist"
              >
                <svg
                  className="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-[#c9a25a] text-[#211d18] text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 border border-[#c9a25a]/40 bg-[#211d18] text-[#efe7db] text-[10px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  Wishlist
                </span>
              </Link>

              {/* Account */}
              <div className="group hidden lg:block relative" ref={accountRef}>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className={`flex items-center focus:outline-none text-[#c2a268] hover:text-[#e2c58f] transition-colors duration-200 ${FOCUS_RING}`}
                  aria-label="Account"
                >
                  <svg
                    className="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.6}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </button>
                {!isAccountOpen && (
                  <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 border border-[#c9a25a]/40 bg-[#211d18] text-[#efe7db] text-[10px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    Account
                  </span>
                )}
                {isAccountOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-52 py-2 z-50 animate-fadeIn ${MENU_PANEL}`}>
                    {loading ? (
                      <div className="px-4 py-2 text-sm text-[#a99d8c]">
                        Loading...
                      </div>
                    ) : user ? (
                      <>
                        <div className="px-4 py-2 border-b border-[#c9a25a]/25">
                          <p className="text-sm font-medium text-[#efe7db] truncate">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-[#a99d8c] truncate">
                            {user.email}
                          </p>
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className={`block px-4 py-2 text-sm ${MENU_ITEM} ${FOCUS_RING}`}
                            onClick={() => setIsAccountOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          href="/account"
                          className={`block px-4 py-2 text-sm ${MENU_ITEM} ${FOCUS_RING}`}
                          onClick={() => setIsAccountOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          className={`block px-4 py-2 text-sm ${MENU_ITEM} ${FOCUS_RING}`}
                          onClick={() => setIsAccountOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/track-order"
                          className={`block px-4 py-2 text-sm ${MENU_ITEM} ${FOCUS_RING}`}
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Track Order
                        </Link>
                        <Link
                          href="/wishlist"
                          className={`block px-4 py-2 text-sm ${MENU_ITEM} ${FOCUS_RING}`}
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <button
                          onClick={handleLogout}
                          className={`w-full text-left px-4 py-2 text-sm ${MENU_ITEM_DANGER} ${FOCUS_RING}`}
                        >
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account/login"
                          className={`block px-4 py-2 text-sm ${MENU_ITEM} ${FOCUS_RING}`}
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Log In
                        </Link>
                        <Link
                          href="/account/signup"
                          className={`block px-4 py-2 text-sm ${MENU_ITEM} ${FOCUS_RING}`}
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className={`group flex items-center focus:outline-none relative text-[#c2a268] hover:text-[#e2c58f] transition-colors duration-200 ${FOCUS_RING}`}
                aria-label="Cart"
              >
                <svg
                  className="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-[#c9a25a] text-[#211d18] text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 border border-[#c9a25a]/40 bg-[#211d18] text-[#efe7db] text-[10px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  Cart
                </span>
              </Link>
            </div>
          </div>

        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block bg-[#d1c0ab] border-t border-[#bda98f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center justify-center py-2">
            <Suspense
              fallback={
                <NavList
                  menuItems={menuItems}
                  isItemActive={() => false}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  families={families}
                  brands={brands}
                />
              }
            >
              <DesktopNav
                menuItems={menuItems}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                families={families}
                brands={brands}
              />
            </Suspense>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-[#373838] border-r border-[#c9a25a]/40 z-50 transform transition-transform lg:hidden overflow-y-auto shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="inline-block">
                  <h2 className="font-[family-name:var(--font-playfair)] italic text-xl text-[#c9a25a]">
                    Menu
                  </h2>
                  <span className="mt-1 block h-px w-full bg-[linear-gradient(90deg,transparent_0%,#c9a25a_25%,#c9a25a_75%,transparent_100%)]" />
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className={`p-2 focus:outline-none text-[#c9a25a] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                  aria-label="Close menu"
                >
                  <MaskIcon src="/icons/close.svg" />
                </button>
              </div>

              <nav>
                <ul className="space-y-1">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      {item.submenu ? (
                        <div>
                          <button
                            onClick={() =>
                              setMobileSubOpen(
                                mobileSubOpen === index ? null : index,
                              )
                            }
                            className={`w-full flex items-center justify-between py-3 text-sm font-medium uppercase tracking-wide text-[#efe7db] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                          >
                            {item.name}
                            <MaskIcon
                              src="/icons/caret.svg"
                              className={`w-4 h-4 shrink-0 text-[#c9a25a] transition-transform ${mobileSubOpen === index ? "rotate-180" : ""}`}
                            />
                          </button>
                          {mobileSubOpen === index && (
                            <ul className="pl-4 space-y-0.5 mt-1 mb-2">
                              {item.submenu.map((sub, si) =>
                                sub.heading ? (
                                  <li key={si} className="pt-4 pb-1">
                                    <span className="inline-block">
                                      <span className="block font-[family-name:var(--font-playfair)] italic text-[15px] text-[#c9a25a]">
                                        {sub.heading}
                                      </span>
                                      <span className="mt-1 block h-px w-full bg-[linear-gradient(90deg,transparent_0%,#c9a25a_25%,#c9a25a_75%,transparent_100%)]" />
                                    </span>
                                  </li>
                                ) : (
                                  <li key={si}>
                                    <Link
                                      href={sub.href}
                                      className={`group/link flex items-center py-2 text-sm transition-colors hover:text-[#e3c489] ${FOCUS_RING} ${
                                        sub.accent
                                          ? "font-bold text-[#e3c489] uppercase tracking-wide"
                                          : sub.standalone
                                            ? "font-semibold text-[#efe7db]"
                                            : "pl-3 text-[#cbbfae]"
                                      }`}
                                      onClick={() => {
                                        setMobileSubOpen(null);
                                        setIsMenuOpen(false);
                                      }}
                                    >
                                      {!sub.accent && !sub.standalone && (
                                        <span className="mr-2 text-[#c9a25a]">
                                          •
                                        </span>
                                      )}
                                      <span className="group-hover/link:underline underline-offset-4 decoration-1">
                                        {sub.name}
                                      </span>
                                    </Link>
                                  </li>
                                ),
                              )}
                              {families.length > 0 && (
                                <>
                                  <li className="pt-4 pb-1">
                                    <span className="inline-block">
                                      <span className="block font-[family-name:var(--font-playfair)] italic text-[15px] text-[#c9a25a]">
                                        Shop by Fragrance Family
                                      </span>
                                      <span className="mt-1 block h-px w-full bg-[linear-gradient(90deg,transparent_0%,#c9a25a_25%,#c9a25a_75%,transparent_100%)]" />
                                    </span>
                                  </li>
                                  <li>
                                    <ul className="max-h-56 overflow-y-auto scrollbar-always-gold">
                                      {families.map((f) => (
                                        <li key={f}>
                                          <Link
                                            href={`/collections/shop-all?scentFamily=${encodeURIComponent(f)}`}
                                            className={`group/link flex items-center py-2 pl-3 text-sm text-[#cbbfae] transition-colors hover:text-[#e3c489] ${FOCUS_RING}`}
                                            onClick={() => {
                                              setMobileSubOpen(null);
                                              setIsMenuOpen(false);
                                            }}
                                          >
                                            <span className="mr-2 text-[#c9a25a]">
                                              •
                                            </span>
                                            <span className="group-hover/link:underline underline-offset-4 decoration-1">
                                              {f}
                                            </span>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </li>
                                </>
                              )}
                            </ul>
                          )}
                        </div>
                      ) : item.brandDropdown ? (
                        <div>
                          <button
                            onClick={() =>
                              setMobileSubOpen(
                                mobileSubOpen === index ? null : index,
                              )
                            }
                            className={`w-full flex items-center justify-between py-3 text-sm font-medium uppercase tracking-wide text-[#efe7db] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                          >
                            {item.name}
                            <MaskIcon
                              src="/icons/caret.svg"
                              className={`w-4 h-4 shrink-0 text-[#c9a25a] transition-transform ${mobileSubOpen === index ? "rotate-180" : ""}`}
                            />
                          </button>
                          {mobileSubOpen === index && (
                            <ul className="pl-4 space-y-0.5 mt-1 mb-2 max-h-64 overflow-y-auto scrollbar-always-gold">
                              {brands.map((b) => (
                                <li key={b}>
                                  <Link
                                    href={`/collections/shop-all?search=${encodeURIComponent(b)}`}
                                    className={`block py-1.5 text-sm text-[#cbbfae] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                                    onClick={() => {
                                      setMobileSubOpen(null);
                                      setIsMenuOpen(false);
                                    }}
                                  >
                                    {b}
                                  </Link>
                                </li>
                              ))}
                              {brands.length === 0 && (
                                <li className="py-2 text-sm text-[#a99d8c]">
                                  Loading...
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={`block py-3 text-sm font-medium uppercase tracking-wide text-[#efe7db] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Mobile Account Section */}
              <div className="mt-6 pt-6 border-t border-[#c9a25a]/25">
                <Link
                  href="/wishlist"
                  className={`flex items-center gap-2 py-3 text-sm font-medium text-[#efe7db] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5 shrink-0 text-[#c9a25a]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>

                {loading ? (
                  <div className="py-3 text-sm text-[#a99d8c]">Loading...</div>
                ) : user ? (
                  <>
                    <div className="py-3 border-b border-[#c9a25a]/25 mb-2">
                      <p className="text-sm font-medium text-[#efe7db] truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-[#a99d8c] truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={`flex items-center gap-2 py-3 text-sm font-medium text-[#efe7db] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className={`flex items-center gap-2 py-3 text-sm font-medium text-[#efe7db] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MaskIcon src="/icons/account.svg" className="w-5 h-5 shrink-0 text-[#c9a25a]" />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 py-3 text-sm font-medium text-[#e8927f] hover:text-[#f2ad9e] transition-colors ${FOCUS_RING}`}
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/account/login"
                      className={`flex items-center gap-2 py-3 text-sm font-medium text-[#efe7db] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MaskIcon src="/icons/account.svg" className="w-5 h-5 shrink-0 text-[#c9a25a]" />
                      Log In
                    </Link>
                    <Link
                      href="/account/signup"
                      className={`flex items-center gap-2 py-3 text-sm font-medium text-[#efe7db] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
            <div className="bg-[#373838] w-full h-full flex flex-col border-t-2 border-[#c9a25a]">
              <div className="flex items-center justify-between p-4 border-b border-[#c9a25a]/25">
                <span className="inline-block">
                  <h2 className="font-[family-name:var(--font-playfair)] italic text-xl text-[#c9a25a]">
                    Search
                  </h2>
                  <span className="mt-1 block h-px w-full bg-[linear-gradient(90deg,transparent_0%,#c9a25a_25%,#c9a25a_75%,transparent_100%)]" />
                </span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className={`p-2 focus:outline-none text-[#c9a25a] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                  aria-label="Close search"
                >
                  <MaskIcon src="/icons/close.svg" />
                </button>
              </div>
              <div className="flex-1 p-4">
                <form
                  action="/collections/shop-all"
                  method="get"
                  className="relative"
                >
                  <input
                    type="search"
                    name="search"
                    placeholder="Search perfumes..."
                    className={`w-full px-4 py-3 pl-12 pr-4 text-base ${FIELD_DARK}`}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 text-[#c9a25a] hover:text-[#e3c489] transition-colors ${FOCUS_RING}`}
                    aria-label="Search"
                  >
                    <MaskIcon src="/icons/search.svg" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
