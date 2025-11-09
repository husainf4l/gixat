import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Pricing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Simple, Transparent <span style={{ color: '#1b75bb' }}>Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your workshop. Scale up as you grow. No hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="p-10 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-8">Perfect for small workshops just getting started</p>
              
              <div className="mb-8">
                <div className="text-5xl font-black text-gray-900">
                  $99<span className="text-xl text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Billed annually: $990/year</p>
              </div>

              <button className="w-full py-3 px-6 border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors mb-8">
                Get Started
              </button>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">What's included:</h4>
                {[
                  "Up to 5 users",
                  "Work order management",
                  "Customer database",
                  "Basic reporting",
                  "Mobile app access",
                  "Email support"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro - Most Popular */}
            <div className="relative p-10 bg-white border border-blue-300 rounded-2xl ring-1 ring-blue-100 shadow-lg">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="inline-block px-4 py-1 bg-blue-600 rounded-full text-sm font-bold text-white">Most Popular</span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 mb-8">For growing workshops with multiple technicians</p>
              
              <div className="mb-8">
                <div className="text-5xl font-black text-gray-900">
                  $299<span className="text-xl text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Billed annually: $2,990/year (Save $588)</p>
              </div>

              <button className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-8">
                Start Free Trial
              </button>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Everything in Starter, plus:</h4>
                {[
                  "Up to 25 users",
                  "Inventory management",
                  "Advanced analytics",
                  "API access",
                  "Customer portal",
                  "Phone support",
                  "Online appointment scheduling",
                  "Multi-location support"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise */}
            <div className="p-10 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-8">For large organizations with advanced needs</p>
              
              <div className="mb-8">
                <div className="text-5xl font-black text-gray-900">
                  Custom<span className="text-xl text-gray-600 block">pricing</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Contact us for a tailored quote</p>
              </div>

              <button className="w-full py-3 px-6 border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors mb-8">
                Contact Sales
              </button>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Everything in Pro, plus:</h4>
                {[
                  "Unlimited users",
                  "Unlimited locations",
                  "Custom integrations",
                  "Advanced security",
                  "Dedicated account manager",
                  "Priority support",
                  "Custom reporting",
                  "SLA guarantee"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-gray-600 font-bold">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free 14-day trial today. No credit card required. Full access to Pro features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact-us"
              className="inline-block px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-blue-600 transition text-lg"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
