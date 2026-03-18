import { useState } from 'react';
import Head from 'next/head';

export default function Government() {
  const [formData, setFormData] = useState({
    agency: '',
    contactName: '',
    email: '',
    phone: '',
    agencyType: '',
    useCase: '',
    projectDetails: '',
    budget: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/government-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({
          agency: '',
          contactName: '',
          email: '',
          phone: '',
          agencyType: '',
          useCase: '',
          projectDetails: '',
          budget: ''
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Head>
        <title>Government & Federal Procurement - Nature's Way Soil</title>
        <meta name="description" content="HUBZone certified soil restoration solutions for federal construction, military bases, and land management. USDA BioPreferred. SAM.gov registered." />
      </Head>

      <div className="government-page">
        {/* Rest of component - I'll provide this in the next command */}
      </div>
    </>
  );
}
