import { GetStaticProps } from 'next';
import Link from 'next/link';
import { ArrowRight, Dog, Sprout, Tractor, Leaf, Shield, Truck, BadgeCheck } from 'lucide-react';
import Layout from '../components/Layout';
import HeroVideo from '../components/HeroVideo';
import SEO from '../components/SEO';
import { allProducts } from '../data/products';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface HomeProps { featuredProducts: Product[] }

const problems = [
  { title: 'Dog urine spots or lawn odor?', text: 'Start with the lawn-repair system built for pet areas.', href: '/dog-urine-lawn-repair', cta: 'Fix pet lawn problems', icon: Dog },
  { title: 'Pale or slow-growing grass?', text: 'Find lawn nutrition designed for greener-looking, actively growing turf.', href: '/shop', cta: 'Get greener grass', icon: Sprout },
  { title: 'Hard, compacted or tired soil?', text: 'Improve the root zone with humic, kelp, biochar and soil-conditioning options.', href: '/compacted-clay-soil', cta: 'Improve my soil', icon: Leaf },
  { title: 'Thin hay or pasture?', text: 'See larger-acreage products for forage and pasture support.', href: '/pasture-hay-farmers', cta: 'Support pasture recovery', icon: Tractor },
];

function productAction(name: string) {
  const n = name.toLowerCase();
  if (/dog|urine|pet/.test(n)) return 'Fix My Lawn';
  if (/fast green|lawn|nitrogen|iron/.test(n)) return 'Get Greener Grass';
  if (/biochar|charcoal/.test(n)) return 'Build Better Soil';
  if (/hay|pasture/.test(n)) return 'Support My Pasture';
  if (/humic|fulvic|kelp/.test(n)) return 'Feed the Root Zone';
  return 'See Product';
}

export default function Home({ featuredProducts }: HomeProps) {
  return <>
    <SEO
      title="Nature's Way Soil | Lawn, Soil, Garden & Pasture Solutions"
      description="Shop Nature's Way Soil by the problem you want to solve: dog urine lawn spots, pale grass, compacted soil, pasture recovery and root-zone support."
      url="https://natureswaysoil.com"
      type="website"
    />
    <Layout transparentHeader>
      <HeroVideo />

      <section className="py-12 md:py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-sm font-bold tracking-widest text-nature-green-700 uppercase mb-3">Start with your problem</p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">What are you trying to fix?</h2>
            <p className="text-lg text-gray-600">You do not need to understand every soil ingredient first. Pick the problem and we will take you to the most relevant solution.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {problems.map(({ title, text, href, cta, icon: Icon }) => (
              <Link key={title} href={href} className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-nature-green-500 hover:shadow-lg transition-all p-6 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-nature-green-100 flex items-center justify-center mb-5"><Icon className="w-6 h-6 text-nature-green-700" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-5 flex-1">{text}</p>
                <span className="font-semibold text-nature-green-700 flex items-center gap-2">{cta}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-9">
            <div>
              <p className="text-sm font-bold tracking-widest text-nature-green-700 uppercase mb-2">Best places to start</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Popular problem-solvers</h2>
              <p className="text-gray-600 mt-2">Selected for clear use cases and strong customer intent.</p>
            </div>
            <Link href="/shop" className="btn-secondary inline-flex items-center">Shop all products<ArrowRight className="w-4 h-4 ml-2" /></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredProducts.map((product, index) => (
              <article key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                <Link href={`/product/${product.id}`} className="block relative aspect-square bg-white">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain p-5" />
                  {index === 0 && <span className="absolute top-4 left-4 bg-nature-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">START HERE</span>}
                </Link>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wide font-bold text-nature-green-700 mb-2">{product.category}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-5 line-clamp-3">{product.description}</p>
                  <div className="flex items-center justify-between gap-4">
                    <div><span className="text-sm text-gray-500">From</span><div className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</div></div>
                    <Link href={`/product/${product.id}`} className="btn-primary text-sm px-4 py-2.5">{productAction(product.name)}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto container-padding grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border p-6"><BadgeCheck className="w-7 h-7 text-nature-green-700 mb-3"/><h3 className="font-bold text-lg mb-2">Practical product guidance</h3><p className="text-gray-600">Clear application directions and product-specific use information.</p></div>
          <div className="rounded-2xl border p-6"><Truck className="w-7 h-7 text-nature-green-700 mb-3"/><h3 className="font-bold text-lg mb-2">Free shipping over $50</h3><p className="text-gray-600">Build a complete solution and unlock free shipping on qualifying orders.</p></div>
          <div className="rounded-2xl border p-6"><Shield className="w-7 h-7 text-nature-green-700 mb-3"/><h3 className="font-bold text-lg mb-2">30-day guarantee</h3><p className="text-gray-600">Shop with a clear return-and-support promise.</p></div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-nature-green-700 text-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5">Not sure which product fits?</h2>
          <p className="text-lg md:text-xl text-green-100 mb-8">Tell us whether you are working on a lawn, garden, pasture or soil problem and start with the closest solution.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center"><Link href="/shop" className="bg-white text-nature-green-800 font-bold px-7 py-3.5 rounded-xl">Shop by product</Link><Link href="/contact" className="border-2 border-white text-white font-bold px-7 py-3.5 rounded-xl">Ask a product question</Link></div>
        </div>
      </section>
    </Layout>
  </>;
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const score = (p: any) => {
    const text = `${p.name} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase();
    if (/dog.*urine|urine.*dog|pet.*lawn/.test(text)) return 100;
    if (/fast green|nitrogen.*iron|iron.*lawn/.test(text)) return 95;
    if (/liquid biochar|biochar/.test(text)) return 92;
    if (/hay|pasture/.test(text)) return 90;
    if (/humic.*fulvic|fulvic.*kelp|humic.*kelp/.test(text)) return 85;
    return 0;
  };
  const prioritized = [...allProducts].sort((a, b) => score(b) - score(a));
  const selected = prioritized.filter(p => score(p) > 0).slice(0, 6);
  const fallback = selected.length >= 3 ? selected : allProducts.slice(0, 6);
  const featuredProducts = fallback.map(p => ({
    id: p.id,
    name: p.name,
    price: p.sizes?.[0]?.price ?? p.price,
    image: p.image,
    description: p.description,
    category: p.category
  }));
  return { props: { featuredProducts } };
};