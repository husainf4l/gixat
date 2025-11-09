import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Resources() {
  const resources = [
    {
      category: "Getting Started",
      items: [
        { title: "Setup Guide", description: "Complete walkthrough of setting up your GIXAT account" },
        { title: "Best Practices", description: "Industry best practices for workshop management" },
        { title: "Video Tutorials", description: "Step-by-step video guides for all features" }
      ]
    },
    {
      category: "Documentation",
      items: [
        { title: "API Documentation", description: "Comprehensive API reference for integrations" },
        { title: "Feature Guide", description: "Detailed guides for every GIXAT feature" },
        { title: "Integrations", description: "How to connect GIXAT with your other tools" }
      ]
    },
    {
      category: "Support",
      items: [
        { title: "Help Center", description: "Common questions and troubleshooting guides" },
        { title: "Contact Support", description: "Reach our expert support team" },
        { title: "Community Forum", description: "Connect with other GIXAT users" }
      ]
    },
    {
      category: "Learning",
      items: [
        { title: "Webinars", description: "Free training sessions and product demos" },
        { title: "Case Studies", description: "Real success stories from GIXAT customers" },
        { title: "Blog", description: "Industry insights and company updates" }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              <span style={{ color: '#1b75bb' }}>Resources</span> & Support
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed with GIXAT. Guides, tutorials, documentation, and support are available 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resources.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-bold text-gray-900 mb-6">{section.category}</h3>
                <div className="space-y-4">
                  {section.items.map((item, i) => (
                    <a
                      key={i}
                      href="#"
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-300 border border-gray-200 transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">How Can We Help?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose how you'd like to get support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Chat</h3>
              <p className="text-gray-600 mb-6">Instant support from our team. Available 24/7 for urgent issues.</p>
              <a href="#" className="text-blue-600 font-semibold hover:text-blue-700">Start Chat →</a>
            </div>

            <div className="p-10 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Support</h3>
              <p className="text-gray-600 mb-6">Send us detailed questions and attachments. Response within 24 hours.</p>
              <a href="mailto:support@gixat.com" className="text-emerald-600 font-semibold hover:text-emerald-700">Email Us →</a>
            </div>

            <div className="p-10 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Schedule Call</h3>
              <p className="text-gray-600 mb-6">One-on-one consultation with a product specialist.</p>
              <a href="#" className="text-purple-600 font-semibold hover:text-purple-700">Book Now →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              { q: "How long does implementation take?", a: "Most implementations take 2-4 weeks. We provide full migration support and training." },
              { q: "Can I integrate GIXAT with existing systems?", a: "Yes! GIXAT integrates with most accounting software, payment processors, and CRM systems." },
              { q: "What kind of support do you offer?", a: "We offer 24/7 email and chat support, plus phone support for enterprise customers." },
              { q: "Is my data secure?", a: "Absolutely. We use enterprise-grade encryption and comply with industry security standards." }
            ].map((item, i) => (
              <details key={i} className="p-6 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer group">
                <summary className="font-semibold text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Need More Help?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our support team is always ready to help you succeed with GIXAT.
          </p>
          <Link
            href="/contact-us"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition text-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
