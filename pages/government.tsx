import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Government() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    project: '',
    phone: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('sending');
    
    try {
      const response = await fetch('/api/government-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', organization: '', project: '', phone: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Federal Contracting | Nature's Way Soil</title>
        <meta name="description" content="HUBZone certified organic soil solutions for federal construction and site restoration projects. CAGE: 9TYW7, UEI: MM7NWZETLWR3." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-green-800">
                Nature's Way Soil
              </Link>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">CAGE:</span> 9TYW7 | <span className="font-semibold">UEI:</span> MM7NWZETLWR3
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Federal Contracting & Government Solutions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              HUBZone certified organic soil amendments and liquid fertilizers for federal construction, 
              site restoration, and erosion control projects
            </p>
          </div>

          {/* Certifications Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <div className="text-blue-600 font-bold text-lg mb-1">HUBZone</div>
              <div className="text-sm text-gray-600">Certified Small Business</div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <div className="text-green-600 font-bold text-lg mb-1">BioPreferred</div>
              <div className="text-sm text-gray-600">USDA Certified Product</div>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
              <div className="text-purple-600 font-bold text-lg mb-1">SAM Registered</div>
              <div className="text-sm text-gray-600">Active & Compliant</div>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
              <div className="text-orange-600 font-bold text-lg mb-1">Micro-Purchase</div>
              <div className="text-sm text-gray-600">Ready for Orders &lt;$10K</div>
            </div>
          </div>

          {/* Key Information */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-gray-500 uppercase mb-1">CAGE Code</div>
                <div className="text-xl font-bold text-gray-900">9TYW7</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 uppercase mb-1">UEI</div>
                <div className="text-xl font-bold text-gray-900">MM7NWZETLWR3</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 uppercase mb-1">Primary NAICS</div>
                <div className="text-xl font-bold text-gray-900">325314</div>
                <div className="text-sm text-gray-600">Fertilizer Manufacturing</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 uppercase mb-1">Additional NAICS</div>
                <div className="text-sm text-gray-700">325998, 562910, 541620, 561730</div>
              </div>
            </div>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Federal Construction & Site Work</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Post-construction site restoration
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Erosion control and slope stabilization
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Disturbed soil remediation
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Military base landscaping projects
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Environmental Programs</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  NAVFAC environmental initiatives
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Native vegetation establishment
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Sustainable grounds management
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  BioPreferred procurement compliance
                </li>
              </ul>
            </div>
          </div>

          {/* Value Propositions */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Work With Us</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-3">For Prime Contractors</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Meet HUBZone subcontracting goals</li>
                  <li>✓ BioPreferred products for sustainable procurement</li>
                  <li>✓ Fast micro-purchase process (&lt;$10K)</li>
                  <li>✓ Direct credit card acceptance available</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-3">For Site Work Subcontractors</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Bulk pricing for large projects</li>
                  <li>✓ LTL freight delivery available</li>
                  <li>✓ Net-30 terms for qualified contractors</li>
                  <li>✓ Technical support and product guidance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Product Overview */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Liquid Fertilizers</h3>
                <p className="text-sm text-gray-600 mb-3">Organic nitrogen and micronutrient solutions</p>
                <div className="text-sm text-gray-700">
                  <div>• Fish & Kelp formulations</div>
                  <div>• Microbe-enhanced options</div>
                  <div>• Ready-to-use concentrates</div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Activated Biochar</h3>
                <p className="text-sm text-gray-600 mb-3">Carbon-rich soil amendment for structure and retention</p>
                <div className="text-sm text-gray-700">
                  <div>• Improves water retention</div>
                  <div>• Enhances nutrient availability</div>
                  <div>• Long-term soil building</div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Living Compost</h3>
                <p className="text-sm text-gray-600 mb-3">Microbially active organic matter</p>
                <div className="text-sm text-gray-700">
                  <div>• Biological soil activation</div>
                  <div>• Erosion control support</div>
                  <div>• Native plant establishment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Examples */}
          <div className="bg-gray-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Micro-Purchase Pricing Examples</h2>
            <p className="text-gray-600 mb-6">Typical project pricing for orders under $10,000 (freight included)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-gray-900 mb-2">Small Site</div>
                <div className="text-3xl font-bold text-green-600 mb-2">$500-$1,500</div>
                <div className="text-sm text-gray-600">
                  <div>• 1-5 acres</div>
                  <div>• Basic restoration</div>
                  <div>• 10-30 gallons liquid</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-green-500">
                <div className="text-lg font-bold text-gray-900 mb-2">Medium Project</div>
                <div className="text-3xl font-bold text-green-600 mb-2">$2,500-$5,000</div>
                <div className="text-sm text-gray-600">
                  <div>• 5-15 acres</div>
                  <div>• Erosion control focus</div>
                  <div>• 50-100 gallons + biochar</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-lg font-bold text-gray-900 mb-2">Large Application</div>
                <div className="text-3xl font-bold text-green-600 mb-2">$8,000-$15,000</div>
                <div className="text-sm text-gray-600">
                  <div>• 15+ acres</div>
                  <div>• Comprehensive program</div>
                  <div>• Bulk liquid + amendments</div>
                </div>
              </div>
            </div>
          </div>

          {/* RFQ Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request a Quote</h2>
            <p className="text-gray-600 mb-6">
              Submit your project details and we'll respond within 24 hours with a detailed quote and technical specifications.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Site restoration, erosion control, landscaping"
                  value={formData.project}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please include: acreage, timeline, specific requirements, and any relevant contract or solicitation numbers"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <button
                type="submit"
                disabled={submitStatus === 'sending'}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {submitStatus === 'sending' ? 'Sending...' : 'Submit RFQ'}
              </button>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  Thank you! We'll respond to your RFQ within 24 hours.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  There was an error submitting your request. Please email us directly at natureswaysoil@natureswaysoil.com
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Direct Contact</h2>
            <div className="text-gray-700">
              <div className="mb-2">
                <strong>Email:</strong> natureswaysoil@natureswaysoil.com
              </div>
              <div className="mb-2">
                <strong>Location:</strong> Snow Hill, NC 28580
              </div>
              <div>
                <strong>Website:</strong> <Link href="/" className="text-green-600 hover:text-green-700">natureswaysoil.com</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
