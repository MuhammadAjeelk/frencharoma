"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MENU_PANEL, FOCUS_RING } from "@/lib/design";

const SHOP_FLAGS = ["bestSeller", "specialOffer", "bundle", "signature", "newArrival", "search"];

// The nav band is taupe with black labels; the panels that drop out of it are
// dark, so they read as part of the same chrome as the logo bar above.
const TAB =
  "text-[13px] font-semibold uppercase tracking-[0.08em] text-black transition-colors duration-200";
const TAB_ACTIVE = "underline underline-offset-[6px] decoration-2";
const TAB_IDLE = "hover:underline hover:underline-offset-[6px] hover:decoration-2";

const tabClass = (active) => `${TAB} ${active ? TAB_ACTIVE : TAB_IDLE} ${FOCUS_RING}`;

// A row inside a dropdown. Square — the panel is the frame, the rows are not.
const ROW = "transition-colors text-[#cbbfae] hover:bg-[#c9a25a]/10 hover:text-[#e3c489]";

// The heading device from the homepage, sized to its own text.
function PanelHeading({ children, className = "" }) {
  return (
    <div className={`px-5 pt-3 pb-1 ${className}`}>
      <span className="inline-block">
        <span className="block font-[family-name:var(--font-playfair)] italic text-[15px] text-[#c9a25a]">
          {children}
        </span>
        <span className="mt-1 block h-px w-full bg-[linear-gradient(90deg,transparent_0%,#c9a25a_25%,#c9a25a_75%,transparent_100%)]" />
      </span>
    </div>
  );
}

function Bullet() {
  return <span className="mr-2 text-[#c9a25a]">•</span>;
}

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
                <Link
                  href={item.href && item.href !== "#" ? item.href : "#"}
                  onClick={() => setOpenDropdown(null)}
                  className={`flex items-center gap-1 py-2 ${tabClass(active)}`}
                >
                  {item.name}
                  <img src="/icons/caret.svg" alt="" className="w-3 h-3 opacity-50" />
                </Link>
                {openDropdown === index && (
                  <div
                    className={`absolute top-full left-0 mt-0 py-2 z-50 animate-fadeIn flex ${MENU_PANEL} ${families.length > 0 ? "w-[520px]" : "w-64"}`}
                  >
                    <div className={families.length > 0 ? "w-1/2 border-r border-[#c9a25a]/25" : "w-full"}>
                      {item.submenu.map((sub, si) =>
                        sub.heading ? (
                          <PanelHeading key={si}>{sub.heading}</PanelHeading>
                        ) : (
                          <Link
                            key={si}
                            href={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`group/link flex items-center ${ROW} ${FOCUS_RING} ${
                              sub.accent
                                ? "px-5 py-2 text-[13px] font-bold uppercase tracking-wide text-[#e3c489]"
                                : sub.standalone
                                  ? "px-5 py-1.5 text-[13px] font-semibold text-[#efe7db]"
                                  : "pl-8 pr-5 py-1 text-[13px]"
                            }`}
                          >
                            {!sub.accent && !sub.standalone && <Bullet />}
                            <span className="group-hover/link:underline underline-offset-4 decoration-1">
                              {sub.name}
                            </span>
                          </Link>
                        ),
                      )}
                    </div>

                    {families.length > 0 && (
                      <div className="w-1/2 flex flex-col">
                        <PanelHeading>Shop by Fragrance Family</PanelHeading>
                        <div className="overflow-y-scroll scrollbar-always-gold max-h-72 px-1">
                          {families.map((f) => (
                            <Link
                              key={f}
                              href={`/collections/shop-all?scentFamily=${encodeURIComponent(f)}`}
                              onClick={() => setOpenDropdown(null)}
                              className={`group/link flex items-center pl-7 pr-4 py-1 text-[13px] ${ROW} ${FOCUS_RING}`}
                            >
                              <Bullet />
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
                <button className={`flex items-center gap-1 py-2 ${tabClass(active)}`}>
                  {item.name}
                  <img src="/icons/caret.svg" alt="" className="w-3 h-3 opacity-50" />
                </button>
                {openDropdown === index && (
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[500px] pt-1 pb-4 z-50 animate-fadeIn ${MENU_PANEL}`}
                  >
                    <div className="pb-3 border-b border-[#c9a25a]/25 mb-3">
                      <PanelHeading>Browse by Brand (A–Z)</PanelHeading>
                    </div>
                    <div className="grid grid-cols-3 gap-x-1 max-h-80 overflow-y-scroll scrollbar-always-gold px-3">
                      {brands.length > 0 ? (
                        brands.map((b) => (
                          <Link
                            key={b}
                            href={`/collections/shop-all?search=${encodeURIComponent(b)}`}
                            className={`group/link flex items-center px-3 py-1 text-[13px] ${ROW} ${FOCUS_RING}`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <Bullet />
                            <span className="truncate group-hover/link:underline underline-offset-4 decoration-1">
                              {b}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="col-span-3 px-3 py-2 text-[13px] text-[#a99d8c]">
                          Loading brands...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link href={item.href} className={`block py-2 ${tabClass(active)}`}>
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
