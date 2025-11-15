import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Pricing() {
  const plans = [
    {
      title: "Starter",
      description: "For small workshops starting their digital workflow.",
      features: [
        "Job Cards & Work Orders",
        "Basic Vehicle Service History",
        "Simple Inventory Tracking",
        "One Branch Only",
        "Email Support"
      ],
      button: "Get Started",
      highlighted: false
    },
    {
      title: "Pro",
      description: "For growing workshops that need stronger control and reporting.",
      features: [
        "Full Work Order Management",
        "Complete Vehicle History Records",
        "Advanced Inventory & Supplier Tracking",
        "Analytics & Performance Reports",
        "Multi-Staff Access & Roles",
        "Priority Support"
      ],
      button: "Upgrade",
      highlighted: true
    },
    {
      title: "Enterprise",
      description: "For large workshops or multi-branch operations.",
      features: [
        "Multi-Branch & Multi-Location Support",
        "Centralized Reporting",
        "Custom Roles & Permissions",
        "API & System Integrations",
        "Dedicated Success Manager",
        "Custom Deployment Options"
      ],
      button: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Plans for <span style={{ color: '#1b75bb' }}>GIXAT</span></h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Choose the right plan for your workshop. Scale up as you grow.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`flex flex-col h-full rounded-lg border transition-all ${
                  plan.highlighted
                    ? "border-blue-300 shadow-sm bg-white"
                    : "border-gray-200 shadow-sm bg-white hover:shadow-md"
                }`}
                style={{ borderWidth: "1px" }}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {plan.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="flex-grow p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          style={{ color: "#1b75bb" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <div className="p-6 border-t border-gray-100">
                  <button
                    className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
                      plan.highlighted
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-300 text-gray-900 hover:bg-gray-50"
                    }`}
                    style={
                      plan.highlighted
                        ? { backgroundColor: "#1b75bb" }
                        : {}
                    }
                  >
                    {plan.button}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="text-center pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-4">
              Need help choosing a plan? We're here to guide you.
            </p>
            <Link
              href="/contact-us"
              className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              style={{ color: "#1b75bb" }}
            >
              Talk to Us →
            </Link>
          </div>
        </div>
      </section>
      {/* Feature Comparison */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Detailed Feature Comparison</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Pro</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  ["Users", "5", "25", "Unlimited"],
                  ["Work Order Management", "✓", "✓", "✓"],
                  ["Inventory Management", "Basic", "Advanced", "Advanced"],
                  ["Analytics", "Basic", "Advanced", "Advanced"],
                  ["Multi-Location", "✗", "✓", "✓"],
                  ["API Access", "✗", "✓", "✓"],
                  ["Custom Integrations", "✗", "✗", "✓"],
                  ["Mobile App", "✓", "✓", "✓"],
                  ["Customer Portal", "✗", "✓", "✓"],
                  ["Appointment Scheduling", "✗", "✓", "✓"],
                  ["Compliance Reports", "Basic", "Advanced", "Advanced"],
                  ["Dedicated Support", "✗", "✗", "✓"],
                  ["SLA", "None", "None", "99.9% uptime"]
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">{row[0]}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row[1]}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row[2]}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Pricing Questions?</h2>
          </div>

          <div className="space-y-6">
            {[
              { q: "Can I change plans later?", a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle." },
              { q: "Do you offer discounts for annual billing?", a: "Yes. Annual plans include a 15% discount compared to monthly billing. Contact us for volume discounts." },
              { q: "Is there a setup fee?", a: "No setup fees! We handle the migration and setup at no additional charge for all plans." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, bank transfers, and purchase orders for enterprise customers." },
              { q: "Can I try GIXAT before buying?", a: "Absolutely! All plans come with a 14-day free trial. No credit card required to start." }
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

      <Footer />
    </div>
  );
}
