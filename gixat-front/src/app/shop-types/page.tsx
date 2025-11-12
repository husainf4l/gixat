import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShopTypes() {

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            Shop <span style={{ color: '#1b75bb' }}>Types</span>
          </h1>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            GIXAT is built to scale with your business — from local garages to multinational automotive networks.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Whether you run a single repair shop or manage hundreds of vehicles across cities, GIXAT adapts to your needs with flexible modules, smart automation, and enterprise-level performance.
          </p>

          <p className="text-lg font-semibold text-gray-900">
            Each shop type below highlights how GIXAT transforms your operations, team, and customer experience.
          </p>
        </div>
      </section>

      {/* Independent Auto Repair */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Independent Auto Repair</h2>
          <p className="text-base text-gray-600 mb-6">For local workshops and small repair businesses with 2–10 technicians.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">Simple, affordable, and powerful — everything you need to stay organized and deliver exceptional service without the complexity of enterprise systems.</p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Benefits:</h3>
            <ul className="space-y-2">
              {[
                "Affordable pricing designed for growing shops with limited staff.",
                "Easy work order creation and job tracking with technician assignments.",
                "Built-in customer scheduling and SMS reminders.",
                "Digital inspections with photo uploads and signatures.",
                "Simplified inventory tracking for parts and consumables.",
                "Quick financial summaries — invoices, payments, and cash flow reports."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700"><strong>Perfect for:</strong> Local mechanics, independent garages, and small auto service centers looking to modernize operations without high upfront costs.</p>
          </div>
        </div>
      </section>

      {/* Multi-Location Repair Network */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Multi-Location Repair Network</h2>
          <p className="text-base text-gray-600 mb-6">For regional repair chains and franchise networks.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">Centralize control across all your workshops with unified reporting, shared inventory, and customer consistency — while maintaining location-level flexibility.</p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Benefits:</h3>
            <ul className="space-y-2">
              {[
                "Real-time visibility into all shop operations across regions.",
                "Centralized inventory that syncs automatically across locations.",
                "Unified customer database with history accessible from any branch.",
                "Cross-location performance analytics and profitability insights.",
                "Location-based permissions for managers and technicians.",
                "Brand consistency tools for estimates, invoices, and communications."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700"><strong>Ideal for:</strong> Chains and franchise operations managing multiple branches or service bays under one brand.</p>
          </div>
        </div>
      </section>

      {/* Fleet Service Center */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fleet Service Center</h2>
          <p className="text-base text-gray-600 mb-6">For companies managing corporate, government, or logistics vehicle fleets.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">Stay in control of every vehicle with automated maintenance, compliance tracking, and predictive insights that reduce downtime and costs.</p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Benefits:</h3>
            <ul className="space-y-2">
              {[
                "Fleet tracking dashboard showing real-time status and service needs.",
                "Preventive maintenance scheduling based on mileage or usage data.",
                "Compliance and inspection reports for government or commercial fleets.",
                "Bulk work order management for batch servicing.",
                "Predictive maintenance powered by usage patterns and repair history.",
                "Advanced cost-per-vehicle analytics and utilization summaries."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700"><strong>Essential for:</strong> Fleet operators, corporate vehicle services, government maintenance centers, and logistics companies managing 20–10,000+ vehicles.</p>
          </div>
        </div>
      </section>

      {/* Dealership Service Department */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dealership Service Department</h2>
          <p className="text-base text-gray-600 mb-6">For dealerships offering after-sales repair and warranty services.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">Seamlessly integrate your service operations with sales and customer relations — and deliver top-tier, brand-aligned service experiences.</p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Benefits:</h3>
            <ul className="space-y-2">
              {[
                "Integration with DMS & CRM systems (Dealertrack, CDK, Reynolds).",
                "Automated warranty and recall management.",
                "Real-time technician tracking and service time optimization.",
                "Customer feedback and satisfaction monitoring.",
                "Parts inventory management synced with dealership orders.",
                "Custom dashboards for service advisors and department leads."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700"><strong>Built for:</strong> Dealerships looking to unify vehicle sales and post-sale maintenance under one intelligent ecosystem.</p>
          </div>
        </div>
      </section>

      {/* Specialty Service Centers */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Specialty Service Centers</h2>
          <p className="text-base text-gray-600 mb-6">For focused automotive services such as transmission, electrical, or collision repair.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">GIXAT adapts to your specialization with flexible templates, vendor tracking, and compliance management tailored to your workflow.</p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Benefits:</h3>
            <ul className="space-y-2">
              {[
                "Customizable service workflows specific to your expertise.",
                "Vendor and supplier coordination for specialized parts.",
                "Technical document storage for service manuals and diagnostics.",
                "Certification and compliance tracking for safety and licensing.",
                "Before-and-after image documentation and auto-generated reports.",
                "Integration with diagnostic tools and IoT devices (optional)."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700"><strong>Customized for:</strong> Transmission shops, body repair specialists, detailing services, and diagnostic centers.</p>
          </div>
        </div>
      </section>

      {/* Corporate Maintenance Operations */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Corporate Maintenance Operations</h2>
          <p className="text-base text-gray-600 mb-6">For large enterprises maintaining internal vehicle fleets.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">Manage everything in one place — with deep analytics, role-based access, and full compliance visibility.</p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Benefits:</h3>
            <ul className="space-y-2">
              {[
                "Enterprise-grade security & role-based permissions.",
                "Custom integrations with ERP, HR, and telematics systems.",
                "Advanced analytics & forecasting for cost and performance tracking.",
                "Multi-department reporting (Finance, Logistics, HR).",
                "Dedicated account manager & priority SLA support.",
                "Custom API access for integrating GIXAT with internal IT infrastructure."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700"><strong>Perfect for:</strong> Corporations with logistics departments, mining or construction companies, government agencies, and large service networks.</p>
          </div>
        </div>
      </section>

      {/* Features Comparison Table */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Features by Business Size</h2>
          <p className="text-sm font-medium text-gray-600 mb-8">
            Compare features across different business sizes to find the right fit for your operation.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Small</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Medium</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
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
                ].map((row: any[], i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row[0]}</td>
                    <td className="px-6 py-4 text-center">
                      {row[1] ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">✗</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row[2] ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">✗</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row[3] ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">✗</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Find Your Perfect Solution</h2>
          <p className="text-lg text-blue-100 mb-8">
            No matter your shop type, GIXAT has the right features and pricing for you.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            View Pricing & Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
