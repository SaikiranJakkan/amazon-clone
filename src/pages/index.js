import Head from "next/head";
import Header from "../components/header";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Amazon</title>
      </Head>

      {/* Header */}
      <Header></Header>
    </div>
  );
}
