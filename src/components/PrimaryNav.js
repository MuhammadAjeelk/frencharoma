"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const SHOP_FLAGS = ["bestSeller", "specialOffer", "bundle", "signature", "search"];

// Pure nav list — receives an isItemActive() so it can render both statically
// (fallback: always false) and reactively (via DesktopNav below).
export function NavList({
  menuItems,
  isItemActive,
  openDropdown,
  setOpenDropdown,
  families,
  brands,
}) {
  return (
    <ul className="flex items-center gap-10 xl:gap-12">
      {menuItems.map((item, index) => {
        const active = isItemActive(item);
        return (
          <li
            key={index}
            className="relative group"
            onMouseEnter={() =>
              (item.submenu || item.brandDropdown) && setOpenDropdown(index)
            }
            onMouseLeave={() => setOpenDropdown(null)}
          >
            {item.submenu ? (
              <>
                <button
                  className={`flex items-center gap-1 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${active ? "text-[#b8964e]" : "text-[#1f1a16] hover:text-[#b8964e]"}`}
                >
                  {item.name}
                  <img src="/icons/caret.svg" alt="" className="w-3 h-3 opacity-50" />
                </button>
                {openDropdown === index && (
                  <div
                    className={`absolute top-full left-0 mt-0 bg-white border border-[#e8e4df] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-lg py-2 z-50 animate-fadeIn flex ${families.length > 0 ? "w-[520px]" : "w-64"}`}
                  >
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
                            className={`group/link flex items-center transition-colors hover:bg-[#faf8f5] hover:text-[#b8964e] hover:font-bold ${
                              sub.accent
                                ? "px-5 py-1.5 text-[13px] font-bold uppercase tracking-wide text-[#1a1a2e]"
                                : sub.standalone
                                  ? "px-5 pt-2 pb-1 text-[13px] font-semibold text-[#1f1a16]"
                                  : "pl-8 pr-5 py-1 text-[13px] text-[#4a4540]"
                            }`}
                          >
                            {!sub.accent && !sub.standalone && (
                              <span className="mr-2 text-[#b8964e]">•</span>
                            )}
                            <span className="group-hover/link:underline underline-offset-4 decoration-1">
                              {sub.name}
                            </span>
                          </Link>
                        ),
                      )}
                    </div>

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
                              className="group/link flex items-center pl-7 pr-4 py-1 text-[13px] text-[#4a4540] hover:text-[#b8964e] hover:bg-[#faf8f5] hover:font-bold rounded-md transition-colors"
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
                <button
                  className={`flex items-center gap-1 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${active ? "text-[#b8964e]" : "text-[#1f1a16] hover:text-[#b8964e]"}`}
                >
                  {item.name}
                  <img src="/icons/caret.svg" alt="" className="w-3 h-3 opacity-50" />
                </button>
                {openDropdown === index && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[500px] bg-white border border-[#e8e4df] shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-lg py-4 z-50 animate-fadeIn">
                    <div className="px-5 pb-3 border-b border-[#f0ece7] mb-3">
                      <p className="text-[11px] font-semibold text-[#b8964e] uppercase tracking-[0.16em]">
                        Browse by Brand (A–Z)
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-x-1 max-h-80 overflow-y-scroll scrollbar-always px-3">
                      {brands.length > 0 ? (
                        brands.map((b) => (
                          <Link
                            key={b}
                            href={`/collections/shop-all?search=${encodeURIComponent(b)}`}
                            className="group/link flex items-center px-3 py-1 text-[13px] text-[#4a4540] hover:text-[#b8964e] hover:bg-[#faf8f5] hover:font-bold rounded-md transition-colors"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <span className="mr-2 text-[#b8964e]">•</span>
                            <span className="truncate group-hover/link:underline underline-offset-4 decoration-1">
                              {b}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="col-span-3 px-3 py-2 text-[13px] text-[#a09890]">
                          Loading brands...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={`block py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${active ? "text-[#b8964e]" : "text-[#1f1a16] hover:text-[#b8964e]"}`}
              >
                {item.name}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Query-reactive nav — reads the live route/query and highlights the active tab.
// Rendered inside a <Suspense> in Header (useSearchParams needs a boundary).
export default function DesktopNav(props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isItemActive = (item) => {
    if (item.brandDropdown) {
      return pathname === "/collections/shop-all" && !!searchParams.get("search");
    }
    if (item.submenu) {
      return (
        pathname === "/collections/shop-all" &&
        !SHOP_FLAGS.some((k) => searchParams.get(k))
      );
    }
    if (!item.href || item.href === "#") return false;
    const [path, qs] = item.href.split("?");
    if (path.startsWith("/blogs")) return pathname.startsWith("/blogs");
    if (pathname !== path) return false;
    if (!qs) return true;
    const params = new URLSearchParams(qs);
    for (const [k, v] of params.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  };

  return <NavList {...props} isItemActive={isItemActive} />;
}
