"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide navbar
        setIsVisible(false);
      } else {
        // Scrolling up - show navbar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const menuItems = [
    { name: "BEST-SELLING", href: "/collections/best-seller-perfumes" },
    { name: "SHOP ALL", href: "/collections/shop-all" },
    {
      name: "COLLECTION",
      href: "#",
      submenu: [
        {
          name: "ARABIAN PRIDE",
          href: "/collections/arabian-pride-collection",
        },
        { name: "LUXURY EDITION", href: "/collections/luxury-edition" },
        { name: "GRANDEUR", href: "/collections/grandeur" },
        { name: "BEAUTIFUL", href: "/collections/beautiful" },
        { name: "PHANTOM", href: "/collections/phanton" },
        { name: "HIGHLAND", href: "/collections/highland" },
        { name: "VELVET", href: "/collections/velvet-collection" },
        { name: "NATURE", href: "/collections/nature-collectio" },
        {
          name: "LINEA DE BELLA COLLECTION",
          href: "/collections/linea-de-bella-collection",
        },
        { name: "ELENIS", href: "/collections/elenis" },
        { name: "HIGHPOINT", href: "/collections/highpoint" },
        { name: "LDB COLLECTION", href: "/collections/ldb-collection" },
        { name: "LABRORATORY", href: "/collections/laboratory-collection" },
        { name: "NOSTALGIA", href: "/collections/nostalgia-collection" },
        { name: "DIVINA", href: "/collections/divina" },
        { name: "ORCHID", href: "/collections/orchid" },
        { name: "CAVALIER", href: "/collections/cavalier" },
        { name: "ROTANA", href: "/collections/rotana" },
        { name: "OXFORD LEATHER", href: "/collections/oxford-collection" },
        { name: "LARANZA", href: "/collections/laranza" },
        { name: "HAIR MIST", href: "/collections/hair-mist" },
        {
          name: "ARABIAN OUD PERFUMES",
          href: "/collections/arabian-oud-perfumes",
        },
      ],
    },
    { name: "NEW ARRIVALS", href: "/collections/new-arrivals" },
    { name: "BRANDS", href: "/collections/top-brands" },
    { name: "GIFT SETS", href: "/collections/gift-sets" },
    { name: "BLOGS", href: "/blogs/blog" },
  ];

  return (
    <>
      <header
        className={`header sticky top-0 z-50 border-b border-gray-200 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Section */}
          <div className="flex items-center justify-between py-4">
            {/* Left Side - Search Input */}
            <div className="flex items-center gap-2 flex-1 lg:flex-none overflow-visible">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 focus:outline-none"
                aria-label="Menu"
              >
                <img src="/icons/menu.svg" alt="Menu" className="w-5 h-5" />
              </button>

              {/* Search - Animated Expand */}
              <div className="hidden lg:block relative overflow-visible">
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className={`flex items-center gap-2 p-2 focus:outline-none hover:opacity-70 transition-opacity whitespace-nowrap ${
                    isSearchExpanded ? "invisible" : ""
                  }`}
                  aria-label="Search"
                >
                  <img
                    src="/icons/search.svg"
                    alt="Search"
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium uppercase tracking-wide">
                    Search
                  </span>
                </button>
                {isSearchExpanded && (
                  <form
                    action="/search"
                    method="get"
                    className="absolute left-0 top-0 z-10"
                    style={{
                      animation: "fadeInSlide 0.3s ease-in-out",
                    }}
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
                        name="q"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="w-64 px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none bg-white text-sm transition-all duration-300"
                        autoFocus
                        onBlur={(e) => {
                          // Close if empty after a short delay
                          setTimeout(() => {
                            if (!e.target.value.trim()) {
                              setIsSearchExpanded(false);
                            }
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                        aria-label="Close search"
                      >
                        <img
                          src="/icons/close.svg"
                          alt="Close"
                          className="w-4 h-4"
                        />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden flex items-center gap-2 p-2 focus:outline-none hover:opacity-70 transition-opacity"
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

            {/* Logo - Center - Hide on mobile when search is open */}
            <Link
              href="/"
              className={`flex-1 flex justify-center ${
                isSearchOpen ? "lg:flex hidden" : "flex"
              }`}
            >
              <div className="flex items-center">
                <Image
                  src="https://www.linea-debella.com/cdn/shop/files/Linea-De-Bella-Logo1_b35278ae-0b10-4868-9659-dcbdcd15d2d6.png?v=1751979015&width=240"
                  alt="Linea De Bella | Divina Perfumes"
                  width={120}
                  height={45}
                  className="h-auto w-auto max-w-[120px]"
                  priority
                />
              </div>
            </Link>

            {/* Right Icons - Account and Cart */}
            <div className="flex items-center gap-4 flex-1 justify-end lg:flex-none">
              {/* Account Icon */}
              <Link
                href="/account/login"
                className="hidden lg:block p-2 focus:outline-none hover:opacity-70 transition-opacity"
                aria-label="Account"
              >
                <img
                  src="/icons/account.svg"
                  alt="Account"
                  className="w-5 h-5"
                />
              </Link>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="focus:outline-none relative hover:opacity-70 transition-opacity"
                aria-label="Cart"
              >
                <img src="/icons/cart.svg" alt="Cart" className="w-11 h-11" />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center justify-center py-4 border-t border-gray-200">
            <ul className="flex items-center gap-8">
              {menuItems.map((item, index) => (
                <li key={index} className="relative group">
                  {item.submenu ? (
                    <div className="relative group">
                      <button
                        onMouseEnter={() => setIsCollectionOpen(true)}
                        onMouseLeave={() => setIsCollectionOpen(false)}
                        className="flex items-center gap-1 py-2 text-sm font-medium uppercase tracking-wide hover:opacity-70 transition-opacity"
                      >
                        {item.name}
                        <img
                          src="/icons/caret.svg"
                          alt=""
                          className="w-3 h-3"
                        />
                      </button>
                      <div
                        className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-md py-2 max-h-96 overflow-y-auto z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                        onMouseEnter={() => setIsCollectionOpen(true)}
                        onMouseLeave={() => setIsCollectionOpen(false)}
                      >
                        {item.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block py-2 text-sm font-medium uppercase tracking-wide hover:opacity-70 transition-opacity"
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
          <div
            className="fixed inset-0 bg-transparent z-40 lg:hidden"
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
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      {item.submenu ? (
                        <div>
                          <button
                            onClick={() =>
                              setIsCollectionOpen(!isCollectionOpen)
                            }
                            className="w-full flex items-center justify-between py-3 text-sm font-medium uppercase tracking-wide"
                          >
                            {item.name}
                            <Image
                              src="/icons/caret.svg"
                              alt=""
                              width={16}
                              height={16}
                              className={`w-4 h-4 transition-transform ${
                                isCollectionOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isCollectionOpen && (
                            <ul className="pl-4 space-y-1 mt-2">
                              {item.submenu.map((subItem, subIndex) => (
                                <li key={subIndex}>
                                  <Link
                                    href={subItem.href}
                                    className="block py-2 text-sm hover:opacity-70 transition-opacity"
                                    onClick={() => {
                                      setIsCollectionOpen(false);
                                      setIsMenuOpen(false);
                                    }}
                                  >
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
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

              <div className="mt-8 pt-8 border-t border-gray-200">
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
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Search Modal - Mobile Full Screen */}
      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
            {/* Search Modal Content */}
            <div className="bg-white w-full h-full flex flex-col border-t border-gray-300">
              {/* Header with Title and Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Search</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 focus:outline-none hover:opacity-70 transition-opacity"
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

              {/* Search Input */}
              <div className="flex-1 p-4">
                <form action="/search" method="get" className="relative">
                  <input
                    type="search"
                    name="q"
                    placeholder="Search..."
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

          {/* Desktop Search Modal */}
          <div className="hidden lg:block">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsSearchOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Search</h2>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 focus:outline-none"
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
                <form action="/search" method="get" className="relative">
                  <input
                    type="search"
                    name="q"
                    placeholder="Search..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
                    aria-label="Search"
                  >
                    <img
                      src="/icons/search.svg"
                      alt="Search"
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
