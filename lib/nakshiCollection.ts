// lib/nakshiCollection.ts

export interface Product {
  id: number
  title: string
  category: string
  price: string        // e.g. "৳3,800"
  imageSrc: string
  href?: string
}

const images = [
  "/images/product-gallery/nakshi-1.png",
  "/images/product-gallery/nakshi-2.png",
  "/images/product-gallery/nakshi-3.png",
  "/images/product-gallery/nakshi-4.png",
  "/images/product-gallery/nakshi-5.png",
] as const

const nakshiCollection: Product[] = [
  { id: 1,  title: "Red Lotus",          category: "Classic",      price: "৳3,800", imageSrc: images[0], href: "/product/red-lotus" },
  { id: 2,  title: "Golden Field",       category: "Harvest",      price: "৳4,200", imageSrc: images[1], href: "/product/golden-field" },
  { id: 3,  title: "Pink Padma",           category: "Signature",    price: "৳4,900", imageSrc: images[2], href: "/product/pink-padma" },
  { id: 4,  title: "Bird Song",          category: "Nature",       price: "৳3,600", imageSrc: images[3], href: "/product/bird-song" },
  { id: 5,  title: "Festive Alpona",     category: "Festive",      price: "৳2,900", imageSrc: images[4], href: "/product/festive-alpona" },
  { id: 6,  title: "Water Lily Pond",    category: "Floral",       price: "৳4,500", imageSrc: images[0], href: "/product/water-lily-pond" },
  { id: 7,  title: "River Waves",        category: "Classic",      price: "৳3,950", imageSrc: images[1], href: "/product/river-waves" },
  { id: 8,  title: "Boat Race",          category: "Heritage",       price: "৳4,100", imageSrc: images[2], href: "/product/boat-race" },
  { id: 9,  title: "Night Jasmine",      category: "Floral",       price: "৳4,800", imageSrc: images[3], href: "/product/night-jasmine" },
  { id: 10, title: "Tree of Life",       category: "Traditional",  price: "৳3,700", imageSrc: images[4], href: "/product/tree-of-life" },
  { id: 11, title: "Village Fair",       category: "Daily Life",   price: "৳2,800", imageSrc: images[0], href: "/product/village-fair" },
  { id: 12, title: "White Conch",        category: "Sacred",       price: "৳3,500", imageSrc: images[1], href: "/product/white-conch" },
  { id: 13, title: "Crane Flower",       category: "Birds",        price: "৳4,600", imageSrc: images[2], href: "/product/crane-flower" },
  { id: 14, title: "Rainbow Thread",     category: "Colorful",     price: "৳3,300", imageSrc: images[3], href: "/product/rainbow-thread" },
  { id: 15, title: "Morning Light",      category: "New Arrival",  price: "৳2,700", imageSrc: images[4], href: "/product/morning-light" },
  { id: 16, title: "River Song",         category: "Classic",      price: "৳4,000", imageSrc: images[0], href: "/product/river-song" },
  { id: 17, title: "Jasmine Vine",       category: "Floral",       price: "৳3,400", imageSrc: images[1], href: "/product/jasmine-vine" },
  { id: 18, title: "Kash Flower Field",  category: "Nature",       price: "৳2,600", imageSrc: images[2], href: "/product/kash-flower-field" },
  { id: 19, title: "Moonlight",          category: "Evening",      price: "৳3,200", imageSrc: images[3], href: "/product/moonlight" },
  { id: 20, title: "Silk Cotton",        category: "Premium",      price: "৳4,700", imageSrc: images[4], href: "/product/silk-cotton" },
]

export default nakshiCollection