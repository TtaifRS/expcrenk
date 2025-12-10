export interface Product {
  name: string;
  img: string;
  price: string; 
  tag: string;
  url: string;
}

const products: Product[] = [
  {
    name: "Quilt - Floral Pattern",
    img: "/images/product-gallery/nakshi-1.png",
    price: "$49.99",
    tag: "Handmade",
    url: "#"
  },
  {
    name: "Throw - Geometric Design",
    img: "/images/product-gallery/nakshi-2.png",
    price: "$59.99",
    tag: "Vintage",
    url: "#"
  },
  {
    name: "Bedspread - Abstract Motifs",
    img: "/images/product-gallery/nakshi-3.png",
    price: "$79.99",
    tag: "Organic",
    url: "#"
  },
  {
    name: "Cushion Cover - Paisley Print",
    img: "/images/product-gallery/nakshi-4.png",
    price: "$29.99",
    tag: "Eco-Friendly",
    url: "#"
  },
  {
    name: "Scarf - Boho Style",
    img: "/images/product-gallery/nakshi-5.png",
    price: "$39.99",
    tag: "Artisan Crafted",
    url: "#"
  }
];

export default products;