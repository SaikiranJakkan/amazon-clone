import Head from "next/head";
import Banner from "../components/Banner";
import Header from "../components/header";
import ProductFeed from "../components/ProductFeed";

export default function Home({ products }) {
  return (
    <div className="bg-gray-100">
      <Head>
        <title>Amazon</title>
      </Head>

      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <Banner />   
        <ProductFeed products={products}/>
      </main>   
    </div>
  );
}

export async function getServerSideProps(context){
  const products = await fetch("https://fakestoreapi.com/products").then(
    (res) => res.json()
  );

  return {
    props: {
      products,
    }
  }
}