"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    { name: "Signature Scents", href: "/collections/shop-all?signature=true", standalone: true },
    { heading: "Shop by Gender" },
    { name: "For Men", href: "/collections/shop-all?gender=men" },
    { name: "For Women", href: "/collections/shop-all?gender=women" },
    { name: "For Unisex", href: "/collections/shop-all?gender=unisex" },
    { heading: "Shop by Category" },
    { name: "Luxury Edition", href: "/collections/shop-all?edition=luxury" },
    { name: "Premium Edition", href: "/collections/shop-all?edition=premium" },
    { heading: "Shop by Season" },
    { name: "For Autumn & Winter", href: "/collections/shop-all?tags=autumn-winter" },
    { name: "For Spring & Summer", href: "/collections/shop-all?tags=spring-summer" },
  ];

  const menuItems = [
    { name: "SHOP", href: "#", submenu: shopSubmenu },
    { name: "BEST SELLERS", href: "/collections/shop-all?bestSeller=true" },
    { name: "SHOP BY BRAND", href: "#", brandDropdown: true },
    { name: "BUNDLE OFFERS", href: "/collections/shop-all?bundle=true" },
    { name: "SPECIAL OFFERS", href: "/collections/shop-all?specialOffer=true" },
    { name: "DISCOVERY BOX", href: "/collections/discovery-box" },
    { name: "BLOGS", href: "/blogs/blog" },
  ];

  return (
    <>
      <header className="header relative z-50 border-b border-[#e8e4df] bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Section */}
          <div className="flex items-center justify-between py-3 lg:py-4">
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
                  className={`flex items-center gap-2 p-2 focus:outline-none hover:opacity-70 transition-opacity whitespace-nowrap ${
                    isSearchExpanded ? "invisible" : ""
                  }`}
                  aria-label="Search"
                >
                  <img src="/icons/search.svg" alt="Search" className="w-5 h-5" />
                  <span className="text-[13px] font-medium uppercase tracking-[0.12em]">Search</span>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search perfumes..."
                        className="w-64 px-4 py-2.5 pl-10 pr-10 border border-[#e8e4df] rounded-lg focus:outline-none focus:border-[#1a1a2e] bg-white text-[13px]"
                        autoFocus
                        onBlur={() => {
                          setTimeout(() => {
                            if (!searchQuery.trim()) setIsSearchExpanded(false);
                          }, 200);
                        }}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Image src="/icons/search.svg" alt="Search" width={20} height={20} className="w-5 h-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsSearchExpanded(false); setSearchQuery(""); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-70"
                        aria-label="Close search"
                      >
                        <img src="/icons/close.svg" alt="Close" className="w-4 h-4" />
                      </button>
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
                <Image src="/icons/search.svg" alt="Search" width={20} height={20} className="w-5 h-5" />
              </button>
            </div>

            {/* Logo — Center */}
            <div className={`flex-1 flex justify-center ${isSearchOpen ? "lg:flex hidden" : "flex"}`}>
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="French Aromas"
                  width={120}
                  height={45}
                  className="h-auto w-auto max-w-[120px] mix-blend-multiply"
                  priority
                />
              </Link>
            </div>

            {/* Right — Wishlist, Account, Cart */}
            <div className="flex items-center gap-3 flex-1 justify-end lg:flex-none">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden lg:block relative focus:outline-none hover:opacity-70 transition-opacity"
                aria-label="Wishlist"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <div className="hidden lg:block relative" ref={accountRef}>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="p-2 focus:outline-none hover:opacity-70 transition-opacity"
                  aria-label="Account"
                >
                  <img src="/icons/account.svg" alt="Account" className="w-5 h-5" />
                </button>
                {isAccountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#e8e4df] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-lg py-2 z-50 animate-fadeIn">
                    {loading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    ) : user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        {isAdmin && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsAccountOpen(false)}>
                            Admin Panel
                          </Link>
                        )}
                        <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsAccountOpen(false)}>
                          My Account
                        </Link>
                        <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsAccountOpen(false)}>
                          My Orders
                        </Link>
                        <Link href="/track-order" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsAccountOpen(false)}>
                          Track Order
                        </Link>
                        <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsAccountOpen(false)}>
                          Wishlist
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/account/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsAccountOpen(false)}>
                          Log In
                        </Link>
                        <Link href="/account/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsAccountOpen(false)}>
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className="focus:outline-none relative hover:opacity-70 transition-opacity" aria-label="Cart">
                <img src="/icons/cart.svg" alt="Cart" className="w-11 h-11" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center py-2.5 border-t border-[#e8e4df]/70">
            <ul className="flex items-center gap-7">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className="relative group"
                  onMouseEnter={() => (item.submenu || item.brandDropdown) && setOpenDropdown(index)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {item.submenu ? (
                    <>
                      <button className="flex items-center gap-1 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#1f1a16] hover:text-[#b8964e] transition-colors duration-200">
                        {item.name}
                        <img src="/icons/caret.svg" alt="" className="w-3 h-3 opacity-50" />
                      </button>
                      {openDropdown === index && (
                        <div className={`absolute top-full left-0 mt-0 bg-white border border-[#e8e4df] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-lg py-2 z-50 animate-fadeIn flex ${families.length > 0 ? "w-[520px]" : "w-64"}`}>
                          {/* Left: sections */}
                          <div className={families.length > 0 ? "w-1/2 border-r border-[#f0ece7]" : "w-full"}>
                            {item.submenu.map((sub, si) =>
                              sub.heading ? (
                                <p key={si} className="px-5 pt-2 pb-0.5 text-[12px] font-bold text-[#1a1a2e] tracking-wide">
                                  {sub.heading}
                                </p>
                              ) : (
                                <Link
                                  key={si}
                                  href={sub.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className={`group/link flex items-center transition-colors hover:bg-[#faf8f5] ${
                                    sub.accent
                                      ? "px-5 py-1.5 text-[13px] font-bold uppercase tracking-wide text-[#1a1a2e] hover:text-[#0f0f24]"
                                      : sub.standalone
                                      ? "px-5 pt-2 pb-1 text-[13px] font-semibold text-[#1f1a16] hover:text-[#b8964e]"
                                      : "pl-8 pr-5 py-1 text-[13px] text-[#4a4540] hover:text-[#1a1a2e]"
                                  }`}
                                >
                                  {!sub.accent && !sub.standalone && (
                                    <span className="mr-2 text-[#b8964e]">•</span>
                                  )}
                                  <span className="group-hover/link:underline underline-offset-4 decoration-1">
                                    {sub.name}
                                  </span>
                                </Link>
                              )
                            )}
                          </div>

                          {/* Right: fragrance families */}
                          {families.length > 0 && (
                            <div className="w-1/2 flex flex-col">
                              <p className="px-5 pt-2 pb-0.5 text-[12px] font-bold text-[#1a1a2e] tracking-wide">
                                Shop by Fragrance Family
                              </p>
                              <div className="overflow-y-scroll scrollbar-always max-h-72 px-1">
                                {families.map((f) => (
                                  <Link
                                    key={f}
                                    href={`/collections/shop-all?scentFamily=${encodeURIComponent(f)}`}
                                    onClick={() => setOpenDropdown(null)}
                                    className="group/link flex items-center pl-7 pr-4 py-1 text-[13px] text-[#4a4540] hover:text-[#1a1a2e] hover:bg-[#faf8f5] rounded-md transition-colors"
                                  >
                                    <span className="mr-2 text-[#b8964e]">•</span>
                                    <span className="truncate group-hover/link:underline underline-offset-4 decoration-1">
                                      {f}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : item.brandDropdown ? (
                    <>
                      <button className="flex items-center gap-1 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#1f1a16] hover:text-[#b8964e] transition-colors duration-200">
                        {item.name}
                        <img src="/icons/caret.svg" alt="" className="w-3 h-3 opacity-50" />
                      </button>
                      {openDropdown === index && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[500px] bg-white border border-[#e8e4df] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-lg py-4 z-50 animate-fadeIn">
                          <div className="px-5 pb-3 border-b border-[#f0ece7] mb-3">
                            <p className="text-[11px] font-semibold text-[#b8964e] uppercase tracking-[0.16em]">Browse by Brand (A–Z)</p>
                          </div>
                          <div className="grid grid-cols-3 gap-x-1 max-h-80 overflow-y-scroll scrollbar-always px-3">
                            {brands.length > 0 ? (
                              brands.map((b) => (
                                <Link
                                  key={b}
                                  href={`/collections/shop-all?search=${encodeURIComponent(b)}`}
                                  className="group/link flex items-center px-3 py-1 text-[13px] text-[#4a4540] hover:text-[#1a1a2e] hover:bg-[#faf8f5] rounded-md transition-colors"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <span className="mr-2 text-[#b8964e]">•</span>
                                  <span className="truncate group-hover/link:underline underline-offset-4 decoration-1">
                                    {b}
                                  </span>
                                </Link>
                              ))
                            ) : (
                              <p className="col-span-3 px-3 py-2 text-[13px] text-[#a09890]">Loading brands...</p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="block py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#1f1a16] hover:text-[#b8964e] transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-white z-50 transform transition-transform lg:hidden overflow-y-auto shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 focus:outline-none" aria-label="Close menu">
                  <Image src="/icons/close.svg" alt="Close" width={20} height={20} className="w-5 h-5" />
                </button>
              </div>

              <nav>
                <ul className="space-y-1">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      {item.submenu ? (
                        <div>
                          <button
                            onClick={() => setMobileSubOpen(mobileSubOpen === index ? null : index)}
                            className="w-full flex items-center justify-between py-3 text-sm font-medium uppercase tracking-wide"
                          >
                            {item.name}
                            <Image
                              src="/icons/caret.svg" alt="" width={16} height={16}
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
                                      onClick={() => { setMobileSubOpen(null); setIsMenuOpen(false); }}
                                    >
                                      {!sub.accent && !sub.standalone && (
                                        <span className="mr-2 text-[#b8964e]">•</span>
                                      )}
                                      <span className="group-hover/link:underline underline-offset-4 decoration-1">
                                        {sub.name}
                                      </span>
                                    </Link>
                                  </li>
                                )
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
                                            onClick={() => { setMobileSubOpen(null); setIsMenuOpen(false); }}
                                          >
                                            <span className="mr-2 text-[#b8964e]">•</span>
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
                            onClick={() => setMobileSubOpen(mobileSubOpen === index ? null : index)}
                            className="w-full flex items-center justify-between py-3 text-sm font-medium uppercase tracking-wide"
                          >
                            {item.name}
                            <Image
                              src="/icons/caret.svg" alt="" width={16} height={16}
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
                                    onClick={() => { setMobileSubOpen(null); setIsMenuOpen(false); }}
                                  >
                                    {b}
                                  </Link>
                                </li>
                              ))}
                              {brands.length === 0 && <li className="py-2 text-sm text-gray-400">Loading...</li>}
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
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>

                {loading ? (
                  <div className="py-3 text-sm text-gray-500">Loading...</div>
                ) : user ? (
                  <>
                    <div className="py-3 border-b border-gray-100 mb-2">
                      <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-900" onClick={() => setIsMenuOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/account" className="flex items-center gap-2 py-3 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                      <Image src="/icons/account.svg" alt="Account" width={20} height={20} className="w-5 h-5" />
                      My Account
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 py-3 text-sm font-medium text-red-600"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/account/login" className="flex items-center gap-2 py-3 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                      <Image src="/icons/account.svg" alt="Account" width={20} height={20} className="w-5 h-5" />
                      Log In
                    </Link>
                    <Link href="/account/signup" className="flex items-center gap-2 py-3 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
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
          <div className="fixed inset-0 bg-black z-40 lg:hidden" onClick={() => setIsSearchOpen(false)} />
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
            <div className="bg-white w-full h-full flex flex-col border-t border-gray-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Search</h2>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 focus:outline-none hover:opacity-70" aria-label="Close search">
                  <Image src="/icons/close.svg" alt="Close" width={20} height={20} className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-4">
                <form action="/collections/shop-all" method="get" className="relative">
                  <input
                    type="search"
                    name="search"
                    placeholder="Search perfumes..."
                    className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-base"
                    autoFocus
                  />
                  <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 p-2" aria-label="Search">
                    <Image src="/icons/search.svg" alt="Search" width={20} height={20} className="w-5 h-5" />
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
