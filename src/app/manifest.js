// Icons only. favicon.ico / icon.png / apple-icon.png are picked up by the
// App Router's file convention, but Android home-screen icons are read from
// the manifest, so the 192 and 512 plates are declared here.
//
// Deliberately no `display` and no `theme_color`: this is a storefront, not an
// installable app, and neither the install prompt nor the Android chrome
// colour should change.
export default function manifest() {
  return {
    name: "French Aromas",
    short_name: "French Aromas",
    start_url: "/",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
