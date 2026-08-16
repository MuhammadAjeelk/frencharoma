"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import DesktopNav, { NavList } from "@/components/PrimaryNav";

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
      <div className="w-full overflow-hidden border-t-2 border-t-[#b8964e]/70 border-b border-b-[#e6ddc9] bg-[#f6efe2]">
        <div className="flex w-max animate-marquee py-2">
          {[0, 1].map((dup) => (
            <div
              key={dup}
              className="flex items-center shrink-0"
              aria-hidden={dup === 1}
            >
              {marqueeItems.map((item, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-6 text-[13px] font-medium tracking-wide text-[#4a3f2a] whitespace-nowrap">
                    {item}
                  </span>
                  <svg
                    className="w-4 h-4 text-[#b8964e] shrink-0"
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

      <header className="header relative z-50 border-b border-[#e6ddc9] bg-[#f6efe2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Section */}
          <div className="flex items-center justify-between py-1.5 lg:py-2">
            {/* Left — Search */}
            <div className="flex items-center gap-2 flex-1 lg:flex-none overflow-visible">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 focus:outline-none"
                aria-label="Menu"
              >
                <img src="/icons/menu.svg" alt="Menu" className="w-5 h-5" />
              </button>

              {/* Desktop Search */}
              <div className="hidden lg:block relative overflow-visible">
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className={`flex items-center gap-2 py-2 focus:outline-none text-[#1a1a2e] hover:text-[#b8964e] transition-colors duration-200 whitespace-nowrap ${
                    isSearchExpanded ? "invisible" : ""
                  }`}
                  aria-label="Search"
                >
                  <img
                    src="/icons/search.svg"
                    alt="Search"
                    className="w-5 h-5"
                  />
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
                        className="w-64 px-4 py-2 pl-10 pr-10 border-0 rounded-lg focus:outline-none focus:ring-0 bg-[#f1ede6] text-[13px]"
                        autoFocus
                        onBlur={() => {
                          setTimeout(() => {
                            if (!searchQuery.trim()) setIsSearchExpanded(false);
                          }, 200);
                        }}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Image
                          src="/icons/search.svg"
                          alt="Search"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchExpanded(false);
                          setSearchQuery("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6b6560] hover:text-red-500 transition-colors"
                        aria-label="Close search"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Live suggestions */}
                      {searchQuery.trim() && (
                        <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-[#e8e4df] rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-20 overflow-hidden animate-fadeIn">
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
                                  className={`flex items-center gap-3 px-3 py-2 transition-colors border-l-[3px] ${
                                    i === searchActive
                                      ? "bg-[#b8964e]/15 border-[#b8964e]"
                                      : "border-transparent hover:bg-[#f6efe2]"
                                  }`}
                                >
                                  <div className="relative w-9 h-9 rounded-md overflow-hidden bg-gray-50 shrink-0 border border-[#f0ece7]">
                                    {p.images?.main ? (
                                      <Image src={p.images.main} alt={p.name} fill className="object-cover" sizes="36px" />
                                    ) : null}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-[12px] font-medium truncate ${i === searchActive ? "text-[#8a6d2a]" : "text-[#1f1a16]"}`}>{p.name}</p>
                                    <p className="text-[11px] text-[#a09890] truncate">
                                      Impression of: {p.impressionName || p.brand || (p.brands && p.brands[0]) || "French Aromas"}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                              <Link
                                href={`/collections/shop-all?search=${encodeURIComponent(searchQuery.trim())}`}
                                onClick={() => setIsSearchExpanded(false)}
                                className="block px-4 py-2.5 text-[12px] font-semibold text-[#b8964e] hover:bg-[#faf8f5] border-t border-[#f0ece7] transition-colors"
                              >
                                See all results for “{searchQuery.trim()}”
                              </Link>
                            </>
                          ) : (
                            <p className="px-4 py-3 text-[12px] text-[#a09890]">
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
                className="lg:hidden flex items-center gap-2 p-2 focus:outline-none hover:opacity-70"
                aria-label="Search"
              >
                <Image
                  src="/icons/search.svg"
                  alt="Search"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
            </div>

            {/* Logo — Center */}
            <div
              className={`flex-1 flex justify-center ${isSearchOpen ? "lg:flex hidden" : "flex"}`}
            >
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="French Aromas"
                  width={96}
                  height={36}
                  className="h-auto w-auto max-w-[92px] mix-blend-multiply transition-transform duration-300 hover:scale-105"
                  priority
                />
              </Link>
            </div>

            {/* Right — Wishlist, Account, Cart */}
            <div className="flex items-center gap-5 lg:gap-6 flex-1 justify-end lg:flex-none">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="group hidden lg:block relative focus:outline-none text-[#1a1a2e] hover:text-[#b8964e] transition-colors duration-200"
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
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 rounded bg-[#1a1a2e] text-white text-[10px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  Wishlist
                </span>
              </Link>

              {/* Account */}
              <div className="group hidden lg:block relative" ref={accountRef}>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center focus:outline-none text-[#1a1a2e] hover:text-[#b8964e] transition-colors duration-200"
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
                  <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 rounded bg-[#1a1a2e] text-white text-[10px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    Account
                  </span>
                )}
                {isAccountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#e8e4df] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-lg py-2 z-50 animate-fadeIn">
                    {loading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Loading...
                      </div>
                    ) : user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/track-order"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Track Order
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Log In
                        </Link>
                        <Link
                          href="/account/signup"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                className="group flex items-center focus:outline-none relative text-[#1a1a2e] hover:text-[#b8964e] transition-colors duration-200"
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
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 rounded bg-[#1a1a2e] text-white text-[10px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                  Cart
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center py-2 border-t border-[#e6ddc9]/70">
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
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-white z-50 transform transition-transform lg:hidden overflow-y-auto shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 focus:outline-none"
                  aria-label="Close menu"
                >
                  <Image
                    src="/icons/close.svg"
                    alt="Close"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
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
                            className="w-full flex items-center justify-between py-3 text-sm font-medium uppercase tracking-wide"
                          >
                            {item.name}
                            <Image
                              src="/icons/caret.svg"
                              alt=""
                              width={16}
                              height={16}
                              className={`w-4 h-4 transition-transform ${mobileSubOpen === index ? "rotate-180" : ""}`}
                            />
                          </button>
                          {mobileSubOpen === index && (
                            <ul className="pl-4 space-y-0.5 mt-1 mb-2">
                              {item.submenu.map((sub, si) =>
                                sub.heading ? (
                                  <li
                                    key={si}
                                    className="pt-3 pb-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-500"
                                  >
                                    {sub.heading}
                                  </li>
                                ) : (
                                  <li key={si}>
                                    <Link
                                      href={sub.href}
                                      className={`group/link flex items-center py-2 text-sm transition-opacity hover:opacity-70 ${
                                        sub.accent
                                          ? "font-bold text-[#1a1a2e] uppercase tracking-wide"
                                          : sub.standalone
                                            ? "font-semibold"
                                            : "pl-3"
                                      }`}
                                      onClick={() => {
                                        setMobileSubOpen(null);
                                        setIsMenuOpen(false);
                                      }}
                                    >
                                      {!sub.accent && !sub.standalone && (
                                        <span className="mr-2 text-[#b8964e]">
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
                                  <li className="pt-3 pb-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                    Shop by Fragrance Family
                                  </li>
                                  <li>
                                    <ul className="max-h-56 overflow-y-auto">
                                      {families.map((f) => (
                                        <li key={f}>
                                          <Link
                                            href={`/collections/shop-all?scentFamily=${encodeURIComponent(f)}`}
                                            className="group/link flex items-center py-2 pl-3 text-sm transition-opacity hover:opacity-70"
                                            onClick={() => {
                                              setMobileSubOpen(null);
                                              setIsMenuOpen(false);
                                            }}
                                          >
                                            <span className="mr-2 text-[#b8964e]">
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
                            className="w-full flex items-center justify-between py-3 text-sm font-medium uppercase tracking-wide"
                          >
                            {item.name}
                            <Image
                              src="/icons/caret.svg"
                              alt=""
                              width={16}
                              height={16}
                              className={`w-4 h-4 transition-transform ${mobileSubOpen === index ? "rotate-180" : ""}`}
                            />
                          </button>
                          {mobileSubOpen === index && (
                            <ul className="pl-4 space-y-0.5 mt-1 mb-2 max-h-64 overflow-y-auto">
                              {brands.map((b) => (
                                <li key={b}>
                                  <Link
                                    href={`/collections/shop-all?search=${encodeURIComponent(b)}`}
                                    className="block py-1.5 text-sm hover:opacity-70 transition-opacity"
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
                                <li className="py-2 text-sm text-gray-400">
                                  Loading...
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="block py-3 text-sm font-medium uppercase tracking-wide"
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
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 py-3 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5"
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
                  <div className="py-3 text-sm text-gray-500">Loading...</div>
                ) : user ? (
                  <>
                    <div className="py-3 border-b border-gray-100 mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 py-3 text-sm font-medium text-gray-900"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center gap-2 py-3 text-sm font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Image
                        src="/icons/account.svg"
                        alt="Account"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 py-3 text-sm font-medium text-red-600"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/account/login"
                      className="flex items-center gap-2 py-3 text-sm font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Image
                        src="/icons/account.svg"
                        alt="Account"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      Log In
                    </Link>
                    <Link
                      href="/account/signup"
                      className="flex items-center gap-2 py-3 text-sm font-medium"
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
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
            <div className="bg-white w-full h-full flex flex-col border-t border-gray-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Search</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 focus:outline-none hover:opacity-70"
                  aria-label="Close search"
                >
                  <Image
                    src="/icons/close.svg"
                    alt="Close"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
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
                    className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-base"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2"
                    aria-label="Search"
                  >
                    <Image
                      src="/icons/search.svg"
                      alt="Search"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
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
