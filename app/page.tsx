import HeroCarousel from "@/components/HeroCarousel";
import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import { getAllProducts } from "@/lib/actions";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const allProducts = await getAllProducts();
  
  return (
    <>
      <section className="px-6 md:px-20 py-20 border-2 border-red-500">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smart Shopping Starts Here:
              <Image src="/assets/icons/arrow-right.svg"
              alt="arrpw-right"
              width={16}
              height={16} />
            </p>
            <h1 className="head-text">
              Unleash the Power of
              <span className="text-primary"> WebScraper</span>
            </h1>
            <p className="mt-6">
              Powerful, self-serve produt and growth analytics to help you convert, engage, and retain more.
            </p>

            <SearchBar />
          </div>
          <HeroCarousel />
        </div>

      </section>
      <section className="trending-section">
        <h2 className="section-text">Trending</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product)=>(

            <ProductCard product={product} key={product._id}/>

          ))}
        </div>
      </section>

    </>
  )
}

