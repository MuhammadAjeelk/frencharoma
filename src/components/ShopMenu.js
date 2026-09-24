"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { COLORS } from "@/lib/design";
import { SCENTS } from "@/lib/scentProfiles";
import styles from "./ShopMenu.module.css";

const SHOP = "/collections/shop-all";
const groups = [
  { title: "Shop", links: [
    ["All Perfumes", "", "grid"], ["Men", "?gender=men", "bottle"],
    ["Women", "?gender=women", "bottle"], ["Unisex", "?gender=unisex", "bottle"],
  ] },
  { title: "For You", links: [
    ["Best Sellers", "?bestSeller=true", "star"], ["New Arrivals", "?newArrival=true", "gift"],
    ["Special Offers", "?specialOffer=true", "tag"], ["Signature Scents", "?signature=true", "spark"],
  ] },
  { title: "Shop by Edition", links: [
    ["Luxury Edition", "?edition=luxury", "crown"], ["Premium Edition", "?edition=premium", "diamond"],
  ] },
];
const palette = { "--shop-ink": COLORS.ink, "--shop-gold": COLORS.gold, "--shop-ground": COLORS.lightGround };
const paths = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  bottle: "M9 3h6v4H9z M8 7h8v3l2 2v9H6v-9l2-2z M10 14h4v3h-4z",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z",
  gift: "M3 8h18v4H3z M5 12v9h14v-9 M12 8v13 M12 8C3 8 5 1 9 3c2 1 3 5 3 5s1-4 3-5c4-2 6 5-3 5",
  spark: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z",
  tag: "M3 3h9l9 9-9 9-9-9z M7 7h.01",
  crown: "m3 6 4 4 5-7 5 7 4-4-2 13H5z M6 16h12",
  diamond: "m3 8 4-5h10l4 5-9 13z M3 8h18 M7 3l5 18 5-18",
  leaf: "M20 3C8 3 2 8 5 16c8 5 15-1 15-13Z M4 21 16 8",
  sun: "M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5l1.5 1.5 M5 19l1.5-1.5 M17.5 6.5l1.5-1.5 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  close: "m6 6 12 12 M6 18 18 6",
  back: "M20 12H4 M10 6l-6 6 6 6",
  floral: "M12 9C4-3 1 11 9 12c-12 8 2 12 3 3 8 12 12-2 3-3 12-8-2-12-3-3Z M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  woody: "m12 2-6 7h3l-5 6h5l-4 5h14l-4-5h5l-5-6h3z M12 20v3",
  musky: "M7 21c-7-6 5-10 0-18 M12 21c-7-6 5-10 0-18 M17 21c-7-6 5-10 0-18",
  fruity: "M12 7c-10-5-12 5-6 13 2 3 4 0 6 0s4 3 6 0c6-8 4-18-6-13Z M12 7c0-4 2-5 5-5 M12 6C7 6 6 4 6 2c4 0 6 1 6 4",
  spicy: "M14 3c-2 3-4 4-3 7 1 2 4 1 5-1 1 6-3 12-12 12 2-2 3-5 3-8 M14 3l4-1",
  leather: "m8 3 8 0 4 8-3 9H7l-3-9z M8 3l4 4 4-4",
  amber: "M12 3c0 6-6 6-6 12a6 6 0 0 0 12 0c0-3-2-5-3-6 0 5-4 3-3-6Z",
};
function Icon({ name }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths.leaf} /></svg>;
}
function MenuLink({ label, query, icon, onSelect, featured }) {
  return <Link href={`${SHOP}${query}`} onClick={onSelect} className={`${styles.link} ${featured ? styles.featured : ""}`}>
    <Icon name={icon} /><span>{label}</span><span className={styles.chevron} aria-hidden="true">›</span>
  </Link>;
}
function Group({ group, onSelect }) {
  return <section className={styles.group} aria-label={group.title}>
    <h3>{group.title}</h3>
    <ul>{group.links.map(([label, query, icon]) => <li key={label}><MenuLink label={label} query={query} icon={icon} featured={!query} onSelect={onSelect} /></li>)}</ul>
  </section>;
}
const scentIcons = ["leaf", "fruity", "floral", "spicy", "woody", "musky", "leaf", "leather", "amber", "leaf"];
function Scents({ onSelect }) {
  return <div className={styles.scents}>
    <ul>{SCENTS.map((scent, i) => <li key={scent.name}><MenuLink label={scent.name} query={`?scentFamily=${encodeURIComponent(scent.name)}`} icon={scentIcons[i]} onSelect={onSelect} /></li>)}</ul>
  </div>;
}
function AllPerfumes({ onSelect }) {
  return <Link href={SHOP} className={styles.all} onClick={onSelect}>View All Perfumes <Icon name="arrow" /></Link>;
}
function Content({ onSelect, mobile = false }) {
  const intro = <div className={styles.intro}><span className={styles.eyebrow}>Explore our collection</span><h2>Shop All</h2><p>Discover 100+ inspired fragrances for every mood, every moment.</p></div>;
  if (mobile) return <div className={styles.mobileContent}>
    {intro}
    {groups.map(group => <Group key={group.title} group={group} onSelect={onSelect} />)}
    <details className={styles.accordion} open><summary>Shop by Scent <span aria-hidden="true">⌄</span></summary><Scents onSelect={onSelect} /></details>
    <div className={styles.mobileCta}><AllPerfumes onSelect={onSelect} /></div>
  </div>;
  return <div className={styles.layout}>
    <div className={styles.navigation}>
      {intro}
      <div className={styles.columns}>
        <div className={styles.leftColumn}><Group group={groups[0]} onSelect={onSelect} /><Group group={groups[2]} onSelect={onSelect} /><AllPerfumes onSelect={onSelect} /></div>
        <div className={styles.rightColumn}><Group group={groups[1]} onSelect={onSelect} /><section className={styles.scentSection} aria-label="Shop by Scent"><h3>Shop by Scent</h3><Scents onSelect={onSelect} /></section></div>
      </div>
    </div>
    <Link href={`${SHOP}?signature=true`} onClick={onSelect} className={styles.promo} aria-label="Explore Signature Scents">
      <div className={styles.photo}><Image src="/images/home/hero-shop-all-v2.webp" alt="French Aromas perfume collection in Paris" fill sizes="1400px" /><div className={styles.promoTitle}><h3>Find Your<br />Signature Scent</h3><p>Timeless Fragrances.<br />A More Beautiful You.</p><span /></div></div>
      <span className={styles.promoCaption}>Inspired by a more beautiful tomorrow</span>
    </Link>
  </div>;
}

export function DesktopShopMenu({ label, className, open, setOpen }) {
  const root = useRef(null);
  const trigger = useRef(null);
  const panel = useRef(null);
  const timer = useRef(null);
  const id = useId();
  const close = () => setOpen(false);
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); } };
    const resize = () => {
      if (window.innerWidth < 1024) setOpen(false);
      if (panel.current) panel.current.style.maxHeight = `${Math.max(100, Math.min(760, window.innerHeight - panel.current.getBoundingClientRect().top - 12))}px`;
    };
    resize();
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("resize", resize); };
  }, [open, setOpen]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <div ref={root} className={styles.desktopRoot} style={palette}
    onMouseEnter={() => { clearTimeout(timer.current); setOpen(true); }}
    onMouseLeave={() => { timer.current = setTimeout(() => { if (!root.current?.contains(document.activeElement)) setOpen(false); }, 140); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls={id} className={`flex items-center gap-1 py-2 ${className}`}
      onClick={() => setOpen(true)} onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); requestAnimationFrame(() => root.current?.querySelector("a")?.focus()); } }}>
      {label}<span aria-hidden="true" className={styles.caret}>⌄</span>
    </button>
    {open && <div ref={panel} id={id} className={styles.panel} aria-label="Shop collection navigation">
      <button type="button" className={styles.close} onClick={() => { close(); trigger.current?.focus(); }} aria-label="Close Shop menu"><Icon name="close" /></button>
      <Content onSelect={close} />
    </div>}
  </div>;
}

function MobilePanel({ onClose, onSelect }) {
  const panel = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The nested panel is portalled outside the original drawer. Make background
    // siblings inert while it owns focus, restoring their previous state on exit.
    const host = panel.current.parentElement;
    const siblings = [...document.body.children].filter(el => el !== host && el instanceof HTMLElement);
    const inertValues = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    panel.current.querySelector("button")?.focus();
    const keydown = event => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "Tab") {
        const nodes = [...panel.current.querySelectorAll("a, button, summary")].filter(el => el.getClientRects().length);
        const first = nodes[0], last = nodes.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const resize = () => { if (window.innerWidth >= 1024) onClose(); };
    document.addEventListener("keydown", keydown);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      siblings.forEach((el, i) => { el.inert = inertValues[i]; });
      document.removeEventListener("keydown", keydown);
      window.removeEventListener("resize", resize);
      if (previous?.isConnected) previous.focus();
    };
  }, [onClose]);
  return createPortal(<div className={styles.mobileOverlay} style={palette} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={panel} className={styles.mobilePanel} role="dialog" aria-modal="true" aria-label="Shop All navigation">
      <div className={styles.mobileBrand}><button type="button" onClick={onClose} aria-label="Back to menu"><Icon name="back" /></button><Image src="/logo-dark.png" width={100} height={75} alt="French Aromas" /></div>
      <button type="button" className={styles.mobileClose} onClick={onClose} aria-label="Close Shop menu"><Icon name="close" /></button>
      <Content onSelect={onSelect} mobile />
    </div>
  </div>, document.body);
}
export function MobileShopMenu({ label, className, onSelect }) {
  const [open, setOpen] = useState(false);
  // Stable callbacks keep the focus/scroll lifecycle tied to the panel mount.
  const close = useCallback(() => setOpen(false), []);
  return <>
    <button type="button" className={className} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>{label}<span aria-hidden="true">›</span></button>
    {open && <MobilePanel onClose={close} onSelect={() => { setOpen(false); onSelect(); }} />}
  </>;
}
