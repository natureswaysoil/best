import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface FormState {
  agency: string;
  name: string;
  email: string;
  phone: string;
  agencyType: string;
  useCase: string;
  message: string;
}

const INITIAL: FormState = { agency: '', name: '', email: '', phone: '', agencyType: '', useCase: '', message: '' };

export default function GovernmentPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/government-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setForm(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Government &amp; Institutional Procurement — Nature&apos;s Way Soil</title>
        <meta name="description" content="USDA BioPreferred certified soil amendments for federal, state, and municipal buyers. Bulk orders, purchase orders, and sustainable land management solutions." />

      </Head>

      <style jsx global>{`
        .gov-page { font-family: 'IBM Plex Sans', sans-serif; color: #1e2022; background: #f7f3ec; }
        .gov-page *, .gov-page *::before, .gov-page *::after { box-sizing: border-box; }
        .gov-page h1, .gov-page h2, .gov-page h3 { font-family: 'Libre Baskerville', serif; }

        /* Gov info bar */
        .g-bar { background: #0d3522; color: rgba(255,255,255,0.8); font-size: 0.68rem;
          letter-spacing: 0.09em; text-transform: uppercase; padding: 7px 2rem;
          display: flex; align-items: center; gap: 0; flex-wrap: wrap; }
        .g-bar-item { padding: 0 1.2rem; border-right: 1px solid rgba(255,255,255,0.18); white-space: nowrap; }
        .g-bar-item:first-child { padding-left: 0; }
        .g-bar-link { margin-left: auto; color: #e8c97a; text-decoration: none; font-weight: 600; padding-right: 0; border: none; }
        .g-bar-link:hover { text-decoration: underline; }

        /* Nav */
        .g-nav { background: white; border-bottom: 1px solid #ede7da; padding: 0 2rem;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px; position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .g-logo { display: flex; align-items: center; gap: 10px; font-family: 'Libre Baskerville', serif;
          font-weight: 700; font-size: 1.05rem; color: #0d3522; text-decoration: none; }
        .g-logo img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
        .g-nav-links { display: flex; gap: 1.8rem; list-style: none; margin: 0; padding: 0;
          font-size: 0.84rem; font-weight: 500; }
        .g-nav-links a { color: #1e2022; text-decoration: none; }
        .g-nav-links a:hover { color: #1a5c42; }
        .g-nav-cta { background: #0d3522; color: white; padding: 9px 20px; border-radius: 3px;
          font-size: 0.84rem; font-weight: 600; text-decoration: none; transition: background 0.2s; }
        .g-nav-cta:hover { background: #1a5c42; }

        /* Hero */
        .g-hero { background: linear-gradient(138deg, #0a2c1c 0%, #0d3522 55%, #164d37 100%);
          color: white; padding: 5rem 2rem 4.5rem; position: relative; overflow: hidden; }
        .g-hero::after { content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 78% 50%, rgba(200,168,75,0.13) 0%, transparent 58%);
          pointer-events: none; }
        .g-hero-inner { max-width: 1100px; margin: 0 auto; display: grid;
          grid-template-columns: 1fr auto; gap: 4rem; align-items: center; position: relative; z-index: 1; }
        .g-eyebrow { display: inline-block; background: rgba(200,168,75,0.15);
          border: 1px solid rgba(200,168,75,0.35); color: #e8c97a; font-size: 0.68rem;
          font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 5px 13px; border-radius: 2px; margin-bottom: 1.4rem;
          font-family: 'IBM Plex Sans', sans-serif; }
        .g-hero h1 { font-size: clamp(1.9rem, 3.5vw, 3rem); line-height: 1.2; margin: 0 0 1.2rem; }
        .g-hero h1 em { font-style: italic; color: #e8c97a; }
        .g-hero-sub { font-size: 0.975rem; color: rgba(255,255,255,0.78); max-width: 540px;
          margin-bottom: 2.4rem; line-height: 1.8; }
        .g-hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
        .btn-gold { background: #c8a84b; color: #0d3522; padding: 13px 28px; border-radius: 3px;
          font-weight: 700; font-size: 0.875rem; text-decoration: none;
          letter-spacing: 0.03em; transition: background 0.2s; display: inline-block; }
        .btn-gold:hover { background: #e8c97a; }
        .btn-wht { border: 1.5px solid rgba(255,255,255,0.42); color: white; padding: 13px 28px;
          border-radius: 3px; font-weight: 500; font-size: 0.875rem; text-decoration: none;
          transition: background 0.2s; display: inline-block; }
        .btn-wht:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.7); }
        .g-creds { display: flex; flex-direction: column; gap: 0.9rem; }
        .g-cred { background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.17);
          border-radius: 5px; padding: 0.85rem 1.2rem; min-width: 160px; }
        .g-cred-label { font-size: 0.62rem; color: rgba(255,255,255,0.52); text-transform: uppercase;
          letter-spacing: 0.1em; margin-bottom: 3px; font-family: 'IBM Plex Sans', sans-serif; }
        .g-cred-val { font-size: 0.85rem; font-weight: 600; }

        /* Trust bar */
        .g-trust { background: white; border-bottom: 2px solid #ede7da; padding: 1.1rem 2rem; }
        .g-trust-inner { max-width: 1100px; margin: 0 auto; display: flex;
          align-items: center; gap: 2.2rem; flex-wrap: wrap; justify-content: center; }
        .g-trust-item { font-size: 0.79rem; font-weight: 500; color: #1e2022;
          white-space: nowrap; display: flex; align-items: center; gap: 7px; }
        .g-dot { width: 6px; height: 6px; border-radius: 50%; background: #1a5c42; flex-shrink: 0; }

        /* Section base */
        .g-sec { padding: 4.5rem 2rem; }
        .g-in { max-width: 1100px; margin: 0 auto; }
        .g-slabel { font-size: 0.67rem; font-weight: 600; letter-spacing: 0.16em;
          text-transform: uppercase; color: #1a5c42; margin-bottom: 0.4rem;
          font-family: 'IBM Plex Sans', sans-serif; }
        .g-stitle { font-size: clamp(1.5rem, 2.8vw, 2.2rem); color: #0d3522;
          margin-bottom: 0.85rem; line-height: 1.25; }
        .g-slead { font-size: 0.935rem; color: #6b7280; max-width: 580px; line-height: 1.78; }

        /* Use cases */
        .g-uses { background: #ede7da; }
        .g-use-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(255px, 1fr));
          gap: 1.2rem; margin-top: 2.4rem; }
        .g-use-card { background: white; border-radius: 3px; padding: 1.7rem;
          border-top: 3px solid #0d3522; transition: transform 0.2s, box-shadow 0.2s; }
        .g-use-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.09); }
        .g-use-title { font-family: 'IBM Plex Sans', sans-serif; font-weight: 700;
          font-size: 0.93rem; margin-bottom: 0.5rem; color: #0d3522; }
        .g-use-desc { font-size: 0.84rem; color: #6b7280; line-height: 1.65; }
        .g-use-tag { display: inline-block; margin-top: 0.85rem; background: #eef5f1;
          color: #1a5c42; font-size: 0.67rem; font-weight: 600; letter-spacing: 0.07em;
          padding: 3px 9px; border-radius: 2px; text-transform: uppercase;
          font-family: 'IBM Plex Sans', sans-serif; }

        /* Certs */
        .g-certs { background: white; }
        .g-cert-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1.2rem; margin-top: 2.4rem; }
        .g-cert-card { border: 1.5px solid #ede7da; border-radius: 3px; padding: 1.35rem;
          display: flex; gap: 1rem; align-items: flex-start; }
        .g-cert-icon { width: 38px; height: 38px; background: #0d3522; border-radius: 3px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .g-cert-icon svg { width: 18px; height: 18px; stroke: white; fill: none; stroke-width: 2; }
        .g-cert-name { font-family: 'IBM Plex Sans', sans-serif; font-weight: 700;
          font-size: 0.87rem; color: #0d3522; margin-bottom: 3px; }
        .g-cert-desc { font-size: 0.78rem; color: #6b7280; line-height: 1.6; }

        /* Products */
        .g-prods { background: #f7f3ec; }
        .g-prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
          gap: 1.2rem; margin-top: 2.4rem; }
        .g-prod-card { background: white; border-radius: 3px; border: 1px solid #ede7da;
          overflow: hidden; transition: box-shadow 0.2s; }
        .g-prod-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09); }
        .g-prod-img { background: #f1f0ee; height: 165px; display: flex;
          align-items: center; justify-content: center; }
        .g-prod-ico { width: 58px; height: 58px; background: #ede7da; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; }
        .g-prod-ico svg { width: 28px; height: 28px; stroke: #1a5c42; fill: none; stroke-width: 1.5; }
        .g-prod-body { padding: 1.15rem; }
        .g-prod-title { font-family: 'IBM Plex Sans', sans-serif; font-weight: 700;
          font-size: 0.89rem; margin-bottom: 0.35rem; }
        .g-prod-desc { font-size: 0.77rem; color: #6b7280; margin-bottom: 0.85rem; }
        .g-prod-specs { list-style: none; padding: 0; font-size: 0.74rem;
          color: #1a5c42; margin-bottom: 0.85rem; }
        .g-prod-specs li::before { content: '— '; }
        .g-prod-foot { display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid #ede7da; padding-top: 0.85rem; }
        .g-prod-price { font-size: 0.97rem; font-weight: 700; color: #0d3522; }
        .g-prod-price span { font-size: 0.67rem; color: #6b7280; font-weight: 400; display: block; }
        .btn-sm { background: #0d3522; color: white; padding: 7px 14px; border-radius: 3px;
          font-size: 0.77rem; font-weight: 600; text-decoration: none; }
        .btn-sm:hover { background: #1a5c42; }

        /* Procurement + RFQ */
        .g-proc { background: #0d3522; color: white; }
        .g-proc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem;
          margin-top: 2.4rem; align-items: start; }
        .g-step { display: flex; gap: 1.2rem; padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1); align-items: flex-start; }
        .g-step:last-child { border: none; }
        .g-step-n { width: 29px; height: 29px; border: 1.5px solid #c8a84b; color: #c8a84b;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 0.73rem; font-weight: 700; flex-shrink: 0; margin-top: 2px;
          font-family: 'IBM Plex Sans', sans-serif; }
        .g-step-title { font-family: 'IBM Plex Sans', sans-serif; font-weight: 600;
          font-size: 0.88rem; margin-bottom: 3px; }
        .g-step-desc { font-size: 0.79rem; color: rgba(255,255,255,0.58); line-height: 1.65; }
        .g-rfq-box { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.18);
          border-radius: 5px; padding: 1.9rem; }
        .g-rfq-box h3 { font-size: 1.2rem; margin: 0 0 0.35rem; }
        .g-rfq-box > p { font-size: 0.84rem; color: rgba(255,255,255,0.62); margin: 0 0 1.3rem; }
        .g-form input, .g-form select, .g-form textarea {
          width: 100%; padding: 10px 13px; background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.22); border-radius: 3px; color: white;
          font-size: 0.84rem; margin-bottom: 0.6rem; font-family: 'IBM Plex Sans', sans-serif;
          outline: none; transition: border-color 0.2s; }
        .g-form input::placeholder, .g-form textarea::placeholder { color: rgba(255,255,255,0.36); }
        .g-form input:focus, .g-form select:focus, .g-form textarea:focus { border-color: #c8a84b; }
        .g-form select option { color: #1e2022; background: white; }
        .g-form textarea { resize: vertical; min-height: 82px; }
        .g-form button { width: 100%; background: #c8a84b; color: #0d3522; border: none;
          padding: 12px; border-radius: 3px; font-weight: 700; font-size: 0.875rem;
          cursor: pointer; font-family: 'IBM Plex Sans', sans-serif; letter-spacing: 0.03em;
          transition: background 0.2s; }
        .g-form button:hover:not(:disabled) { background: #e8c97a; }
        .g-form button:disabled { opacity: 0.55; cursor: not-allowed; }
        .g-success { background: rgba(45,122,90,0.22); border: 1px solid rgba(45,122,90,0.45);
          border-radius: 3px; padding: 1rem 1.2rem; font-size: 0.875rem; color: #a7f3d0; line-height: 1.7; }
        .g-err { background: rgba(200,50,50,0.18); border: 1px solid rgba(200,50,50,0.38);
          border-radius: 3px; padding: 1rem 1.2rem; font-size: 0.875rem; color: #fca5a5;
          margin-top: 0.8rem; }

        /* Sustainability */
        .g-sus { background: #ede7da; }
        .g-sus-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 3.5rem;
          align-items: start; margin-top: 2.4rem; }
        .g-metric { background: white; border-radius: 3px; padding: 1rem 1.35rem;
          border-left: 4px solid #1a5c42; margin-bottom: 0.95rem; }
        .g-metric-label { font-size: 0.7rem; color: #6b7280; text-transform: uppercase;
          letter-spacing: 0.07em; margin-bottom: 3px; font-family: 'IBM Plex Sans', sans-serif; }
        .g-metric-val { font-size: 1.5rem; font-weight: 700; color: #0d3522;
          font-family: 'Libre Baskerville', serif; line-height: 1.2; }
        .g-metric-note { font-size: 0.74rem; color: #6b7280; }
        .g-sus-text h3 { font-size: 1.4rem; color: #0d3522; margin: 0 0 0.85rem; }
        .g-sus-text p { font-size: 0.875rem; color: #6b7280; line-height: 1.8; margin-bottom: 0.85rem; }
        .g-sus-list { list-style: none; padding: 0; margin-top: 1.1rem; }
        .g-sus-list li { display: flex; gap: 10px; padding: 0.5rem 0;
          border-bottom: 1px solid #ede7da; font-size: 0.845rem; }
        .g-sus-list li::before { content: '—'; color: #1a5c42; font-weight: 700; flex-shrink: 0; }

        /* Footer */
        .g-footer { background: #1e2022; color: rgba(255,255,255,0.62); padding: 3.5rem 2rem 2rem; }
        .g-footer-in { max-width: 1100px; margin: 0 auto; }
        .g-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2.5rem; margin-bottom: 2.5rem; }
        .g-footer-brand { font-family: 'Libre Baskerville', serif; color: white;
          font-size: 1.05rem; margin-bottom: 0.6rem; }
        .g-footer-tag { font-size: 0.77rem; color: rgba(255,255,255,0.42);
          margin-bottom: 1.2rem; line-height: 1.7; }
        .g-footer-badges { display: flex; gap: 5px; flex-wrap: wrap; }
        .g-badge { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.13);
          border-radius: 2px; padding: 3px 9px; font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.07em; text-transform: uppercase; color: #e8c97a;
          font-family: 'IBM Plex Sans', sans-serif; }
        .g-footer-col h5 { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.32); margin: 0 0 0.9rem; font-family: 'IBM Plex Sans', sans-serif; }
        .g-footer-col ul { list-style: none; padding: 0; margin: 0; }
        .g-footer-col li { margin-bottom: 0.42rem; }
        .g-footer-col a { color: rgba(255,255,255,0.58); text-decoration: none; font-size: 0.82rem; }
        .g-footer-col a:hover { color: white; }
        .g-footer-bot { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1rem; font-size: 0.73rem; color: rgba(255,255,255,0.28); }
        .g-footer-bot a { color: rgba(255,255,255,0.42); text-decoration: none; margin-left: 1.4rem; }

        @media (max-width: 768px) {
          .g-hero-inner, .g-proc-grid, .g-sus-grid { grid-template-columns: 1fr; }
          .g-creds { flex-direction: row; flex-wrap: wrap; }
          .g-footer-top { grid-template-columns: 1fr 1fr; }
          .g-nav-links { display: none; }
          .g-bar-item:nth-child(n+3) { display: none; }
        }
      `}</style>

      <div className="gov-page">
        {/* Info Bar */}
        <div className="g-bar">
          <span className="g-bar-item">SAM.gov Registered Vendor</span>
          <span className="g-bar-item">USDA BioPreferred Partner</span>
          <span className="g-bar-item">Buy American Act Compliant</span>
          <span className="g-bar-item">NAICS: 325314 · 111419</span>
          <a href="#rfq" className="g-bar-item g-bar-link">Request Bulk Quote &rarr;</a>
        </div>

        {/* Nav */}
        <nav className="g-nav">
          <Link href="/" className="g-logo">
            <img src="/logo.png" alt="Nature's Way Soil" />
            Nature&apos;s Way Soil
          </Link>
          <ul className="g-nav-links">
            <li><a href="#use-cases">Applications</a></li>
            <li><a href="#certifications">Certifications</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#sustainability">Sustainability</a></li>
            <li><Link href="/shop">All Products</Link></li>
          </ul>
          <a href="#rfq" className="g-nav-cta">Request Bulk Quote</a>
        </nav>

        {/* Hero */}
        <section className="g-hero">
          <div className="g-hero-inner">
            <div>
              <div className="g-eyebrow">Government &amp; Institutional Procurement</div>
              <h1>Organic Soil Amendments<br />for <em>Public Land Management</em></h1>
              <p className="g-hero-sub">
                Nature&apos;s Way Soil supplies USDA BioPreferred certified fertilizers, biochar blends,
                and living compost for federal, state, and municipal land stewardship programs.
              </p>
              <div className="g-hero-btns">
                <a href="#rfq" className="btn-gold">Request an RFQ</a>
                <a href="#products" className="btn-wht">View Product Catalog</a>
              </div>
            </div>
            <div className="g-creds">
              {[
                { label: 'Program', val: 'USDA BioPreferred' },
                { label: 'Origin', val: 'Made in USA' },
                { label: 'Orders', val: '50 lbs – Pallet+' },
                { label: 'Payment', val: 'Net-30 / PO' },
              ].map(c => (
                <div className="g-cred" key={c.label}>
                  <div className="g-cred-label">{c.label}</div>
                  <div className="g-cred-val">{c.val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <div className="g-trust">
          <div className="g-trust-inner">
            {['Buy American Act Compliant', 'SAM.gov Registered', 'USDA BioPreferred Partner',
              'Net-30 Terms Available', 'Purchase Orders Accepted', 'Dedicated Gov Account Manager'].map(t => (
              <div className="g-trust-item" key={t}>
                <span className="g-dot" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <section className="g-sec g-uses" id="use-cases">
          <div className="g-in">
            <p className="g-slabel">Applications</p>
            <h2 className="g-stitle">Built for Public Sector Land Management</h2>
            <p className="g-slead">Our products are used across federal, state, and municipal properties requiring sustainable soil health solutions that align with conservation mandates.</p>
            <div className="g-use-grid">
              {[
                { t: 'Federal Parks & Forests', d: 'Restore native plant ecosystems and rehabilitate disturbed soils in national parks, wilderness areas, and federal land management projects.', tag: 'USFS / NPS / BLM' },
                { t: 'Municipal Parks & Greenways', d: 'Appropriate for public spaces including community parks, athletic fields, and urban green infrastructure programs.', tag: 'City & County Parks' },
                { t: 'Erosion & Watershed Control', d: 'Biochar and mycorrhizae amendments help stabilize disturbed soils along roads, waterways, and restoration sites, reducing runoff.', tag: 'Corps of Engineers / DOT' },
                { t: 'Military Base Landscaping', d: 'Maintain base grounds and community spaces with products that align with DoD environmental standards and require fewer synthetic inputs.', tag: 'DoD / Military Bases' },
                { t: 'School & University Grounds', d: 'Reduce synthetic fertilizer use on educational campuses. Appropriate for school gardens and student-accessible green spaces.', tag: 'K–12 / Higher Ed' },
                { t: 'USDA Conservation Programs', d: 'Align with USDA NRCS soil health initiatives and EQIP program requirements, supporting conservation practice standards for soil carbon building.', tag: 'NRCS / EQIP Eligible' },
              ].map(u => (
                <div className="g-use-card" key={u.t}>
                  <div className="g-use-title">{u.t}</div>
                  <div className="g-use-desc">{u.d}</div>
                  <span className="g-use-tag">{u.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="g-sec g-certs" id="certifications">
          <div className="g-in">
            <p className="g-slabel">Certifications &amp; Compliance</p>
            <h2 className="g-stitle">Meeting Government Procurement Standards</h2>
            <p className="g-slead">Products manufactured to meet federal and state regulatory requirements for bio-based inputs and responsible environmental practices.</p>
            <div className="g-cert-grid">
              {[
                { n: 'USDA BioPreferred Partner', d: 'Select products carry the USDA BioPreferred designation, directly supporting federal agencies\' mandatory bio-based purchasing requirements.' },
                { n: 'SAM.gov Registered Vendor', d: 'Active registration in the System for Award Management. CAGE code and UEI available upon request for contract documentation.' },
                { n: 'Buy American Compliant', d: 'All products manufactured domestically on our family farm, fully compliant with Buy American Act and Build America, Buy America provisions.' },
                { n: 'SDS & TDS on Request', d: 'Full Safety Data Sheets and Technical Data Sheets provided for all products to support procurement and compliance documentation packages.' },
                { n: 'Net-30 / Purchase Orders', d: 'Government purchase orders accepted. Net-30 payment terms available for qualifying agencies and institutions upon application.' },
                { n: 'Contract Supply Agreements', d: 'Able to support multi-year supply agreements, scheduled delivery programs, and volume-based contract pricing for consistent program needs.' },
              ].map(c => (
                <div className="g-cert-card" key={c.n}>
                  <div className="g-cert-icon">
                    <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <div className="g-cert-name">{c.n}</div>
                    <div className="g-cert-desc">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="g-sec g-prods" id="products">
          <div className="g-in">
            <p className="g-slabel">Product Catalog</p>
            <h2 className="g-stitle">Soil Solutions for Every Scale</h2>
            <p className="g-slead">Available in standard retail sizes through full pallet orders. Custom blends and bulk formulations available for institutional contracts.</p>
            <div className="g-prod-grid">
              {[
                { t: 'Enhanced Living Compost Blend', d: '20% worm castings · 20% activated biochar · 60% aged compost', s: ['High microbial activity', 'Improves water retention and aeration', '25 lb, 50 lb, and bulk tote options'], p: 'From $24.99' },
                { t: 'Liquid Seaweed & Humic Acid', d: '4.5% North Atlantic Kelp · 4.5% Humic Acid concentrate', s: ['Cold-pressed North Atlantic kelp', 'Stimulates root development', 'Gallon and 5-gallon sizes available'], p: 'From $24.99' },
                { t: 'Activated Biochar Amendment', d: 'Premium wood-source biochar pre-charged with microbes', s: ['Permanently improves soil structure', 'Net carbon-negative input', 'Pallet quantities available'], p: 'Quote-based' },
                { t: 'Premium Worm Castings', d: 'Pure vermicompost from on-farm worm beds', s: ['Slow-release NPK profile', 'Odor-free, safe for all plant types', '5 lb through 50 lb bags'], p: 'From $19.99' },
                { t: 'Fermented Duckweed Fertilizer', d: 'High-protein aquatic plant extract', s: ['High organic nitrogen source', 'Increased nutrient bioavailability', 'Bulk drums available'], p: 'Quote-based' },
                { t: 'Custom Bulk Blends', d: 'Tailored formulations for specific soil types and program goals', s: ['Soil analysis consultation included', 'Custom NPK ratios available', 'Minimum order: 1 pallet'], p: 'Custom pricing' },
              ].map(p => (
                <div className="g-prod-card" key={p.t}>
                  <div className="g-prod-img">
                    <div className="g-prod-ico">
                      <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707M12 8a4 4 0 110 8 4 4 0 010-8z"/></svg>
                    </div>
                  </div>
                  <div className="g-prod-body">
                    <div className="g-prod-title">{p.t}</div>
                    <div className="g-prod-desc">{p.d}</div>
                    <ul className="g-prod-specs">{p.s.map(s => <li key={s}>{s}</li>)}</ul>
                    <div className="g-prod-foot">
                      <div className="g-prod-price">{p.p}<span>Bulk pricing available</span></div>
                      <a href="#rfq" className="btn-sm">Get Quote</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link href="/shop" className="btn-gold">View Complete Product Catalog</Link>
            </div>
          </div>
        </section>

        {/* Procurement + RFQ */}
        <section className="g-sec g-proc" id="rfq">
          <div className="g-in">
            <p className="g-slabel" style={{ color: 'rgba(200,168,75,0.85)' }}>Procurement</p>
            <h2 className="g-stitle" style={{ color: 'white' }}>Simple Government Purchasing Process</h2>
            <p className="g-slead" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Streamlined to align with government procurement requirements, from micro-purchases to multi-year supply contracts.
            </p>
            <div className="g-proc-grid">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { n: '1', t: 'Submit Your RFQ or Requirements', d: 'Use the form or email your RFQ document directly to government@natureswaysoil.com. All government inquiries receive a response within one business day.' },
                  { n: '2', t: 'Receive Quote & Documentation', d: 'Itemized pricing, product specifications, SDS/TDS documents, and USDA BioPreferred certifications for your procurement package.' },
                  { n: '3', t: 'Issue Purchase Order or Contract', d: 'Government purchase orders accepted directly. Net-30 payment terms available for approved agencies. GSA-compatible pricing on request.' },
                  { n: '4', t: 'Scheduled Delivery', d: 'Delivery across the contiguous US. Multi-year supply agreements and standing orders available for consistent program needs.' },
                  { n: '5', t: 'Technical Support & Reporting', d: 'Dedicated account manager, soil consultation services, and outcome data available to support program documentation and reporting.' },
                ].map(s => (
                  <li className="g-step" key={s.n}>
                    <div className="g-step-n">{s.n}</div>
                    <div>
                      <div className="g-step-title">{s.t}</div>
                      <div className="g-step-desc">{s.d}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="g-rfq-box">
                <h3>Request a Bulk Quote</h3>
                <p>A government procurement specialist will respond within one business day.</p>
                {status === 'success' ? (
                  <div className="g-success">
                    Your RFQ has been received. A member of our government sales team will contact you
                    within one business day with pricing, product documentation, and next steps.
                  </div>
                ) : (
                  <form className="g-form" onSubmit={submit}>
                    <input name="agency" value={form.agency} onChange={handle} placeholder="Agency or Organization Name" required />
                    <input name="name" value={form.name} onChange={handle} placeholder="Your Name and Title" required />
                    <input name="email" value={form.email} onChange={handle} placeholder="Email Address (.gov preferred)" type="email" required />
                    <input name="phone" value={form.phone} onChange={handle} placeholder="Phone Number" type="tel" />
                    <select name="agencyType" value={form.agencyType} onChange={handle}>
                      <option value="">Agency Type</option>
                      <option>Federal Agency</option>
                      <option>State Government</option>
                      <option>County / Municipal</option>
                      <option>Military / DoD</option>
                      <option>School / University</option>
                      <option>Tribal Government</option>
                      <option>Other Public Entity</option>
                    </select>
                    <select name="useCase" value={form.useCase} onChange={handle}>
                      <option value="">Primary Use Case</option>
                      <option>Parks &amp; Recreation</option>
                      <option>Land Restoration</option>
                      <option>Road / Highway Landscaping</option>
                      <option>Watershed / Erosion Control</option>
                      <option>Athletic Fields</option>
                      <option>Community Gardens</option>
                      <option>Agricultural Program</option>
                      <option>Other</option>
                    </select>
                    <textarea name="message" value={form.message} onChange={handle}
                      placeholder="Describe your project, estimated quantities, and any specific certification or contract vehicle requirements..."
                      required />
                    <button type="submit" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Submitting...' : 'Submit RFQ Request'}
                    </button>
                    {status === 'error' && (
                      <div className="g-err">
                        Submission failed. Please email us directly at government@natureswaysoil.com
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability */}
        <section className="g-sec g-sus" id="sustainability">
          <div className="g-in">
            <p className="g-slabel">Environmental Impact</p>
            <h2 className="g-stitle">Supporting Federal Sustainability Goals</h2>
            <p className="g-slead">Our products help agencies meet goals under federal sustainability mandates, bio-based procurement requirements, and environmental stewardship programs.</p>
            <div className="g-sus-grid">
              <div>
                {[
                  { l: 'Carbon Profile', v: 'Net Negative', n: 'Biochar permanently sequesters carbon in soil' },
                  { l: 'Water Retention Improvement', v: '20–35%', n: 'Reduces irrigation requirements on treated land' },
                  { l: 'Domestic Manufacturing', v: '100% USA', n: 'Family farm, all lower 48 states' },
                  { l: 'USDA BioPreferred', v: 'Designated', n: 'Qualifying products carry federal designation' },
                ].map(m => (
                  <div className="g-metric" key={m.l}>
                    <div className="g-metric-label">{m.l}</div>
                    <div className="g-metric-val">{m.v}</div>
                    <div className="g-metric-note">{m.n}</div>
                  </div>
                ))}
              </div>
              <div className="g-sus-text">
                <h3>Aligned with Federal Sustainability Mandates</h3>
                <p>Nature&apos;s Way Soil products help agencies meet goals established under Executive Orders on Federal Sustainability, the Inflation Reduction Act&apos;s conservation provisions, and USDA soil health initiatives.</p>
                <p>Biochar amendments provide one of the most measurable strategies for permanent carbon sequestration in managed soils, supporting EPA greenhouse gas reduction goals and USDA soil carbon programs.</p>
                <ul className="g-sus-list">
                  <li>Supports EO 14057 (Federal Sustainability) procurement goals</li>
                  <li>USDA BioPreferred designation on qualifying products</li>
                  <li>Compatible with USDA NRCS Practice Standard 336 (Soil Carbon)</li>
                  <li>Supports LEED and Sustainable Sites certification projects</li>
                  <li>Reduces nutrient runoff — supports Clean Water Act compliance</li>
                  <li>No hazardous waste streams generated in production</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="g-footer">
          <div className="g-footer-in">
            <div className="g-footer-top">
              <div>
                <div className="g-footer-brand">Nature&apos;s Way Soil</div>
                <div className="g-footer-tag">From our family farm to public lands across America.</div>
                <div className="g-footer-badges">
                  {['USDA BioPreferred', 'SAM.gov', 'Buy American', 'Made in USA'].map(b => (
                    <span className="g-badge" key={b}>{b}</span>
                  ))}
                </div>
              </div>
              <div className="g-footer-col">
                <h5>Products</h5>
                <ul>
                  <li><Link href="/shop">All Products</Link></li>
                  <li><Link href="/shop">Living Compost</Link></li>
                  <li><Link href="/shop">Biochar</Link></li>
                  <li><Link href="/shop">Worm Castings</Link></li>
                  <li><a href="#rfq">Bulk Orders</a></li>
                </ul>
              </div>
              <div className="g-footer-col">
                <h5>Government</h5>
                <ul>
                  <li><a href="#rfq">Request an RFQ</a></li>
                  <li><a href="#certifications">Certifications</a></li>
                  <li><a href="#sustainability">Sustainability</a></li>
                  <li><a href="mailto:government@natureswaysoil.com">government@natureswaysoil.com</a></li>
                </ul>
              </div>
              <div className="g-footer-col">
                <h5>Company</h5>
                <ul>
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><Link href="/policies/shipping">Shipping</Link></li>
                  <li><Link href="/policies/returns">Returns</Link></li>
                </ul>
              </div>
            </div>
            <div className="g-footer-bot">
              <span>&copy; 2025 Nature&apos;s Way Soil. All rights reserved.</span>
              <div>
                <Link href="/policies/privacy" style={{ color: 'rgba(255,255,255,0.42)', textDecoration: 'none', marginLeft: '1.4rem' }}>Privacy Policy</Link>
                <Link href="/policies/terms" style={{ color: 'rgba(255,255,255,0.42)', textDecoration: 'none', marginLeft: '1.4rem' }}>Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
