import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ShopTypes() {
  const shopTypes = [
    {
      type: "Independent Auto Repair",
      description: "Single location automotive repair shops with 2-10 technicians",
      benefits: [
        "Affordable pricing perfect for small operations",
        "Simple work order and inventory management",
        "Customer appointment scheduling",
        "Basic financial reporting"
      ],
      ideal: "Perfect for local mechanics and independent repair shops"
    },
    {
      type: "Multi-Location Repair Network",
      description: "Multiple locations with centralized management",
      benefits: [
        "Multi-location coordination and visibility",
        "Centralized inventory management",
        "Cross-location reporting and analytics",
        "Unified customer database across locations"
      ],
      ideal: "Ideal for regional chains and franchise operations"
    },
    {
      type: "Fleet Service Center",
      description: "Service centers managing corporate and government fleets",
      benefits: [
        "Advanced fleet tracking and maintenance scheduling",
        "Compliance and regulatory reporting",
        "Predictive maintenance insights",
        "Bulk work order management"
      ],
      ideal: "Essential for fleet operators and corporate services"
    },
    {
      type: "Dealership Service Department",
      description: "New and used car dealerships with service operations",
      benefits: [
        "Integration with dealership management systems",
        "Warranty tracking and management",
        "Service recall notifications",
        "Customer satisfaction tracking"
      ],
      ideal: "Built for dealership service departments"
    },
    {
      type: "Specialty Service Centers",
      description: "Focused services like transmission, electrical, collision",
      benefits: [
        "Specialized service type customization",
        "Technical documentation tracking",
        "Vendor and parts supplier management",
        "Certification and compliance tracking"
      ],
      ideal: "Customized for specialized automotive services"
    },
    {
      type: "Corporate Maintenance Operations",
      description: "Large corporations with in-house vehicle maintenance",
      benefits: [
        "Enterprise-grade security and compliance",
        "Advanced analytics and reporting",
        "Custom integrations with existing systems",
        "Dedicated account management"
      ],
      ideal: "For large enterprises with fleet maintenance"
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
              Shop <span style={{ color: '#1b75bb' }}>Types</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              GIXAT scales to fit any automotive business. From single-location shops to large enterprise operations, we have a solution for you.
            </p>
          </div>
        </div>
      </section>

      {/* Shop Types Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shopTypes.map((shop, index) => (
              <div key={index} className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.type}</h3>
                <p className="text-sm text-gray-500 mb-4">{shop.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Benefits:</h4>
                  <ul className="space-y-2">
                    {shop.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-600 font-bold mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-blue-600 font-medium">{shop.ideal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Features by Business Size</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each plan includes essential features. Upgrade as your business grows.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Small</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Medium</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  ["Work Order Management", true, true, true],
                  ["Multi-Location Support", false, true, true],
                  ["Advanced Analytics", true, true, true],
                  ["API Access", false, false, true],
                  ["Custom Integrations", false, true, true],
                  ["Dedicated Support", false, true, true],
                  ["Compliance Reporting", true, true, true],
                  ["Unlimited Users", false, false, true]
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">{row[0]}</td>
                    <td className="px-6 py-4 text-center">
                      {row[1] ? <span className="text-green-600 font-bold text-lg">✓</span> : <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row[2] ? <span className="text-green-600 font-bold text-lg">✓</span> : <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row[3] ? <span className="text-green-600 font-bold text-lg">✓</span> : <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how different shop types have benefited from GIXAT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">AR</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Andrea's Auto Repair</p>
                  <p className="text-sm text-gray-600">Independent Shop, 5 Technicians</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 italic">"GIXAT helped us streamline operations and increase our revenue by 35%. Our customers love the appointment scheduling, and we've reduced paperwork by 80%."</p>
              <p className="text-sm text-gray-500">- Andrea Martinez, Owner</p>
            </div>

            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-600">FM</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Fleet Masters Inc.</p>
                  <p className="text-sm text-gray-600">Fleet Service, 50+ Vehicles</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 italic">"Managing our entire fleet across multiple locations is now seamless. The advanced reporting gives us insights we never had before."</p>
              <p className="text-sm text-gray-500">- James Chen, Operations Director</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Find Your Perfect Solution</h2>
          <p className="text-xl text-blue-100 mb-8">
            No matter your shop type, GIXAT has the right features and pricing for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition text-lg"
            >
              View Pricing
            </Link>
            <Link
              href="/contact-us"
              className="inline-block px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-blue-600 transition text-lg"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
