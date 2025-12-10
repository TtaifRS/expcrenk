import ProductCard from './ProductCard'
import styles from '../styles/ProductCard.module.css'

interface Product {
	id: string | number
	title: string
	category: string
	price: number | string
	imageSrc: string
	href?: string
}

interface ProductGridProps {
	products: Product[]
	limit?: number
	className?: string
}

export default function ProductGrid({
	products,
	limit,
	className = '',
}: ProductGridProps) {
	const displayedProducts = limit ? products.slice(0, limit) : products

	return (
		<section className={`${styles.container} ${className}`}>
			<div className={styles.grid}>
				{displayedProducts.map((product) => (
					<ProductCard
						key={product.id}
						href={product.href || `#product-${product.id}`}
						imageSrc={product.imageSrc}
						imageAlt={product.title}
						category={product.category}
						title={product.title}
						price={product.price}
					/>
				))}
			</div>
		</section>
	)
}
