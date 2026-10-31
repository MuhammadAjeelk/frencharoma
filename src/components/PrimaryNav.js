"use client";

import Link from "next/link";
import { DesktopShopMenu } from "./ShopMenu";
import { usePathname, useSearchParams } from "next/navigation";
import { MENU_PANEL, FOCUS_RING } from "@/lib/design";

const SHOP_FLAGS = ["bestSeller", "specialOffer", "bundle", "signature", "newArrival", "search"];

// The nav sits in the charcoal header (2026-10 mockup): white Arial caps,
// spaced evenly around a gap where the logo's own "FRENCH AROMAS" lettering
// lines up with them. Size and spacing come from --nav-font / --nav-gap /
// --nav-logo-w set by Header. The panels that drop out of it are dark too.
const TAB =
  "font-[Arial,Helvetica,sans-serif] text-[length:var(--nav-font)] font-bold uppercase leading-none whitespace-nowrap text-white transition-colors duration-200";
const TAB_ACTIVE = "text-[var(--fa-gold-hover)]";
const TAB_IDLE = "hover:text-[var(--fa-gold-hover)]";

const tabClass = (active) => `${TAB} ${active ? TAB_ACTIVE : TAB_IDLE} ${FOCUS_RING}`;

// A row inside a dropdown. Square — the panel is the frame, the rows are not.
const ROW = "transition-colors text-[var(--fa-on-dark)] hover:bg-[var(--fa-gold)]/10 hover:text-[var(--fa-gold-hover)]";

// The heading device from the homepage, sized to its own text.
function PanelHeading({ children, className = "" }) {
  return (
    <div className={`px-5 pt-3 pb-1 ${className}`}>
      <span className="inline-block">
        <span className="block font-[family-name:var(--font-playfair)] italic text-[15px] text-[var(--fa-gold)]">
          {children}
        </span>
        <span className="mt-1 block h-px w-full bg-[linear-gradient(90deg,transparent_0%,var(--fa-gold)_25%,var(--fa-gold)_75%,transparent_100%)]" />
      </span>
    </div>
  );
}

function Bullet() {
  return <span className="mr-2 text-[var(--fa-gold)]">•</span>;
}

// Pure nav list — receives an isItemActive() so it can render both statically
// (fallback: always false) and reactively (via DesktopNav below).
export function NavList({
  menuItems,
  isItemActive,
  openDropdown,
  setOpenDropdown,
  families,
  familiesStatus,
  brands,
}) {
  return (
    <ul className="flex items-center gap-[var(--nav-gap)]">
      {menuItems.map((item, index) => {
        if (item.spacer) {
          return <li key={index} aria-hidden="true" className="shrink-0 w-[var(--nav-logo-w)]" />;
        }
        const active = isItemActive(item);
        return (
          <li
            key={index}
            className={item.shopMenu ? "static group" : "relative group"}
            onMouseEnter={() =>
              item.brandDropdown && setOpenDropdown(index)
            }
            onMouseLeave={() => { if (!item.shopMenu) setOpenDropdown(null); }}
          >
            {item.shopMenu ? (
              <DesktopShopMenu label={item.name} className={tabClass(active)} caret={false}
                open={openDropdown === index} setOpen={(open) => setOpenDropdown(current => open ? index : current === index ? null : current)}
                families={families} status={familiesStatus} />
            ) : item.brandDropdown ? (
              <>
                <button className={`flex items-center py-2 ${tabClass(active)}`}>
                  {item.name}
                </button>
                {openDropdown === index && (
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[500px] pt-1 pb-4 z-50 animate-fadeIn ${MENU_PANEL}`}
                  >
                    <div className="pb-3 border-b border-[var(--fa-gold)]/25 mb-3">
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
                        <p className="col-span-3 px-3 py-2 text-[13px] text-[var(--fa-muted-dark)]">
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
    if (item.shopMenu) {
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
