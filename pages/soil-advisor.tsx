import Head from 'next/head';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { allProducts } from '../data/products';
import { writeCart } from '../lib/cart';

const plans:Record<string,{title:string;why:string;ids:string[]}>={
  pet:{title:'Pet Lawn Recovery Plan',why:'Neutralize repeated pet-lawn stress while supporting the root zone.',ids:['NWS_014','NWS_011']},
  clay:{title:'Compacted Soil Plan',why:'Improve water movement and support stronger roots in tight soil.',ids:['NWS_001','NWS_011']},
  garden:{title:'Living Garden Plan',why:'Combine living compost with kelp support for beds and transplants.',ids:['NWS_013','NWS_006']},
  pasture:{title:'Pasture Recovery Plan',why:'Support larger grass areas with a pasture fertilizer and recovery system.',ids:['NWS_021','NWS_022']},
  lawn:{title:'Lawn Growth Plan',why:'Pair lawn treatment with humic, fulvic, and kelp root-zone support.',ids:['NWS_018','NWS_011']},
};

export default function SoilAdvisor(){
  const router=useRouter(); const [problem,setProblem]=useState('pet'); const [area,setArea]=useState('small');
  const plan=plans[problem]; const products=useMemo(()=>plan.ids.map(id=>allProducts.find(p=>p.id===id)).filter(Boolean),[plan]);
  const buildCart=()=>{writeCart(products.map((p)=>{const size=p!.sizes?.[area==='large'&&p!.sizes.length>1?1:0];return{productId:p!.id,productName:p!.name,sizeName:size?.name,sku:size?.sku,image:p!.image,price:size?.price??p!.price,quantity:1};}));router.push('/cart');};
  return <Layout><Head><title>Soil &amp; Lawn Product Advisor | Nature&apos;s Way Soil</title><meta name="description" content="Answer two questions and get a personalized Nature's Way Soil product plan."/></Head><main className="max-w-4xl mx-auto px-4 py-14">
    <div className="text-center mb-10"><p className="uppercase tracking-widest text-green-700 font-semibold">Free product advisor</p><h1 className="text-4xl font-bold mt-2">What does your soil need?</h1><p className="text-gray-600 mt-3">Answer two quick questions. We&apos;ll build a practical starting plan—no guessing.</p></div>
    <div className="grid md:grid-cols-2 gap-7"><section className="bg-white border rounded-2xl p-6 space-y-6"><label className="block font-semibold">Main problem<select value={problem} onChange={e=>setProblem(e.target.value)} className="mt-2 w-full border rounded-lg p-3"><option value="pet">Dog urine spots or pet lawn damage</option><option value="clay">Compacted clay or poor drainage</option><option value="garden">Garden beds, vegetables, or transplants</option><option value="pasture">Hay field or pasture recovery</option><option value="lawn">Weak, yellow, or stressed lawn</option></select></label>
      <label className="block font-semibold">Treatment area<select value={area} onChange={e=>setArea(e.target.value)} className="mt-2 w-full border rounded-lg p-3"><option value="small">Small yard, garden, or spot treatment</option><option value="large">Large lawn, route, farm, or facility</option></select></label><p className="text-xs text-gray-500">Recommendations are general product guidance, not a laboratory soil diagnosis. Application needs vary by soil and site conditions.</p></section>
      <section className="bg-green-50 border border-green-200 rounded-2xl p-6"><h2 className="text-2xl font-bold">{plan.title}</h2><p className="text-gray-700 mt-2 mb-5">{plan.why}</p><div className="space-y-3">{products.map(p=>{const s=p!.sizes?.[area==='large'&&p!.sizes.length>1?1:0];return <div key={p!.id} className="bg-white rounded-xl p-4 flex justify-between gap-3"><div><strong>{p!.name}</strong><p className="text-sm text-gray-500">{s?.name}</p></div><span className="font-bold text-green-700">${(s?.price??p!.price).toFixed(2)}</span></div>;})}</div><button onClick={buildCart} className="btn-primary w-full mt-6">Build My Recommended Cart</button></section>
    </div></main></Layout>;
}
