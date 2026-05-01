import Head from 'next/head';

const amazonReviewUrl = 'https://www.amazon.com/review/create-review';

export default function SoilSuccessGuide() {
  return (
    <>
      <Head>
        <title>Soil Success Guide | Nature&apos;s Way Soil</title>
        <meta
          name="description"
          content="How to use Nature's Way Soil Living Compost with Worm Castings & Biochar for containers, raised beds, transplants, and gardens."
        />
      </Head>

      <main className="min-h-screen bg-[#f7f3ea] text-[#1f2f1f]">
        <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="rounded-3xl bg-white p-8 shadow-lg md:p-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#4f7d3a]">
              Nature&apos;s Way Soil
            </p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Your Soil Success Guide
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#445544]">
              Thank you for choosing Nature&apos;s Way Soil Living Compost with Worm Castings & Biochar. This quick guide helps you get stronger roots, better moisture retention, and healthier soil from your first application.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {['20% Worm Castings', '20% Activated Biochar', 'Living Soil Formula', 'Made Fresh Weekly'].map((item) => (
                <div key={item} className="rounded-2xl border border-[#d8e3ce] bg-[#f2f7ec] p-4 text-center font-semibold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-8">
          <div className="grid gap-6 md:grid-cols-3">
            <GuideCard
              title="Containers & Pots"
              amount="Use 1–2 cups per plant"
              text="Mix lightly into potting soil around the root zone. Water after application to activate the compost, castings, biochar, and biology."
            />
            <GuideCard
              title="Raised Beds & Garden Beds"
              amount="Blend 1 part compost to 4 parts soil"
              text="Work into the top few inches of soil before planting, or side-dress established plants and water in well."
            />
            <GuideCard
              title="Transplants"
              amount="Add 1–2 cups per planting hole"
              text="Mix with native soil before placing the plant. Avoid planting roots into a pocket of straight amendment."
            />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="rounded-3xl bg-[#24351f] p-8 text-white md:p-10">
            <h2 className="text-3xl font-extrabold">Best Results Checklist</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ChecklistItem text="Mix into soil instead of leaving a thick dry layer on top." />
              <ChecklistItem text="Water after applying so the biochar and compost can begin working in the root zone." />
              <ChecklistItem text="Use less than bulk compost. This is a concentrated soil amendment, not filler." />
              <ChecklistItem text="Reapply every 4–6 weeks during the growing season for containers and heavy feeders." />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-md">
              <h2 className="text-2xl font-extrabold">Common Mistakes to Avoid</h2>
              <ul className="mt-5 space-y-3 leading-7 text-[#445544]">
                <li><strong>Do not over-apply.</strong> A small amount near the root zone is usually better than a heavy layer.</li>
                <li><strong>Do not let it sit dry.</strong> Water helps activate the compost and move nutrients into the soil.</li>
                <li><strong>Do not use as the only seed-starting medium.</strong> Blend with a proper seed-starting mix for best structure.</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-md">
              <h2 className="text-2xl font-extrabold">What to Expect</h2>
              <p className="mt-5 leading-7 text-[#445544]">
                This product supports soil fertility and plant health over time. Results vary based on soil condition, plant type, watering, sunlight, and weather. Most customers get the best results by mixing it into the root zone and keeping soil evenly moist after application.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8 pb-16">
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg md:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#4f7d3a]">
              Thank you for supporting a small farm
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">How did it work for your plants?</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#445544]">
              Your honest feedback helps other gardeners choose the right soil amendment and helps our small business grow.
            </p>
            <a
              href={amazonReviewUrl}
              className="mt-8 inline-flex rounded-full bg-[#4f7d3a] px-8 py-4 text-lg font-bold text-white shadow-md hover:bg-[#3f672e]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leave Honest Feedback on Amazon
            </a>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#667066]">
              We never ask for only positive reviews. Please share your real experience so we can keep improving.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function GuideCard({ title, amount, text }: { title: string; amount: string; text: string }) {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-md">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="mt-4 rounded-2xl bg-[#f2f7ec] p-4 font-bold text-[#4f7d3a]">{amount}</p>
      <p className="mt-4 leading-7 text-[#445544]">{text}</p>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 leading-7">
      <span className="mr-2 font-bold">✓</span>{text}
    </div>
  );
}
