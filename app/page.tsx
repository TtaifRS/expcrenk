import nakshiCollection from '@/lib/nakshiCollection'
import {
	Hero,
	ProductDescription,
	ProductGallery,
	ProductGrid,
} from './components/home'

import products from '@/lib/featuredProducts'

export default function Home() {
	return (
		<>
			<main>
				<Hero />
				<ProductGallery products={products} />
				<ProductDescription
					heading="Nokhsi"
					subHeading="Chador"
					paragraph="Experience the exquisite artistry of the Nokshi Chador, a bespoke shawl meticulously hand-stitched by artisans in rural Bangladesh. This sustainable textile art features intricate 'Nakshi' embroidery, blending timeless tradition with modern elegance for a unique, wearable masterpiece."
					largeImageSrc="/images/nakshi-1.png"
					smallImageSrc="/images/product-gallery/nakshi-2.png"
				/>
				<ProductGrid products={nakshiCollection} limit={8} />
			</main>
		</>
	)
}
