// One-off: copy brand logos from ~/Downloads into public/uploads/brands/<slug>.png
// Usage: node scripts/copy-brand-logos.js
const fs = require("fs");
const path = require("path");
const os = require("os");

const dl = path.join(os.homedir(), "Downloads");
const out = path.join(process.cwd(), "public/icons/brands");
fs.mkdirSync(out, { recursive: true });

// API-brand slug -> exact Downloads filename
const map = {
  ajmal: "Ajmal.png",
  azzaro: "Azzaro.png",
  burberry: "Burberry.png",
  "carolina-herrera": "Carolina Herrera (1).png",
  "christian-dior": "Christian Dior.png",
  creed: "Creed.png",
  davidoff: "Davidoff.png",
  "dolce-and-gabbana": "Dolce & Gabbana.png",
  "ex-nihilo": "Ex Nihilo.png",
  "giorgio-armani": "Giorgio Armani.png",
  givenchy: "Givenchy.png",
  gucci: "Gucci (1).png",
  hermes: "Hermes.png",
  "issey-miyake": "Issey Miyake.png",
  "jean-paul-gaultier": "Jean Paul Gaultier.png",
  kilian: "Kilian.png",
  "louis-vuitton": "Louis Vuitton.png",
  "maison-francis-kurkdjian": "Maison Francis Kurkdjian.png",
  "maison-martin-margiela": "Maison Margiela.png",
  montale: "Montale.png",
  nasomatto: "Nasomatto.png",
  nishane: "Nishane (1).png",
  "ormonde-jayne": "Ormonde Jayne.png",
  "paco-rabbane": "Paco Rabanne.png",
  "parfums-de-marly": "Parfums de Marly.png",
  "thierry-mugler": "Thierry Mugler.png",
  "tom-ford": "Tom Ford.png",
  "victoria-s-secret": "Victoria's Secret.png",
  "viktor-and-rolf": "Viktor & Rolf.png",
  xerjoff: "Xerjoff.png",
  "yves-saint-laurent": "Yves Saint Laurent.png",
};

let ok = 0;
const miss = [];
for (const [slug, file] of Object.entries(map)) {
  const src = path.join(dl, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(out, slug + ".png"));
    ok++;
  } else {
    miss.push(file);
  }
}
console.log("copied:", ok);
if (miss.length) console.log("MISSING:", miss);
console.log("brands dir now has:", fs.readdirSync(out).length, "files");
