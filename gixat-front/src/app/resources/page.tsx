import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Resources() {
  const resourceCards = [
    {
      title: "Documentation",
      icon: "📚",
      cta: "Open Docs →",
    },
    {
      title: "Tutorials & Training Videos",
      icon: "▶",
      cta: "Watch Tutorials →",
    },
    {
      title: "Customer Support",
      icon: "💬",
      cta: "Reach Support →",
    },
  ];

  const learningArticles = [
    {
      title: "Reducing job delays",
      description: "Structure workflow hand-offs to keep operations flowing smoothly.",
    },
    {
      title: "Communication routines",
      description: "How to implement clear technician-to-front-desk communication.",
    },
    {
      title: "Spare-parts management",
      description: "Smart inventory strategies to avoid loss and repeated ordering.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Resources for <span style={{ color: '#1b75bb' }}>GIXAT</span>
            </h1>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The GIXAT Resource Hub is designed to help workshops not only learn the platform, but elevate their entire operational standard.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Workshops are dynamic environments — vehicles arrive unexpectedly, tasks evolve in real time, parts availability changes daily, and customers require timely updates. This hub ensures your team is equipped with the knowledge and structure to operate efficiently, consistently, and confidently.
            </p>

            <p className="text-lg font-semibold text-gray-900 mb-6">
              GIXAT resources are built around one goal: Make your workshop smoother, faster, and more reliable — without chaos.
            </p>
          </div>

          {/* Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resourceCards.map((card, idx) => (
              <div
                key={idx}
                className="p-8 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  {card.title}
                </h3>
                <a
                  href="#"
                  className="text-sm font-medium transition-colors"
                  style={{ color: '#1b75bb' }}
                >
                  {card.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Documentation</h2>
          <p className="text-sm font-medium text-gray-600 mb-8">
            Clear, structured guidance for every feature and workflow.
          </p>

          <p className="text-base text-gray-700 leading-relaxed mb-8">
            The Documentation Center acts as the single source of truth for how your workshop should use GIXAT. It provides step-by-step written instructions along with examples of real service scenarios.
          </p>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">What the documentation helps you do:</h3>
            <ul className="space-y-2">
              {[
                "Set up your workshop profile, service types, and labor rates",
                "Configure technician roles, permission levels, and bay assignments",
                "Open work orders and track each stage of the repair process",
                "Log visual inspections and attach evidence photos",
                "Manage spare parts, suppliers, and reorder thresholds",
                "Generate and update invoices with accurate labor and parts itemization",
                "View daily, weekly, and monthly workshop performance data",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Best for:</h3>
            <ul className="space-y-2">
              {[
                "Workshop managers standardizing processes",
                "Technicians needing clarity in workflow steps",
                "New staff onboarding",
                "Multi-branch businesses aligning procedures",
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="#"
            className="inline-block text-sm font-medium transition-colors"
            style={{ color: '#1b75bb' }}
          >
            Open Documentation →
          </Link>
        </div>
      </section>

      {/* Tutorials Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Tutorials & Training Videos</h2>
          <p className="text-sm font-medium text-gray-600 mb-8">
            Real workflows demonstrated clearly and visually.
          </p>

          <p className="text-base text-gray-700 leading-relaxed mb-8">
            Workshops operate in motion — video training is the fastest way to learn. Our tutorials simulate real workday activity so new and existing staff can follow along without disruption.
          </p>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Video Playlists:</h3>
            <ul className="space-y-2">
              {[
                "Getting Started for New Users",
                "Front Desk Workflows (Appointments → Work Orders → Delivery)",
                "Technician Workflow and Job Completion Steps",
                "Inventory Officers / Storekeeper Operations",
                "Manager / Owner Performance Review Dashboards",
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Example Training Scenario:</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              A customer arrives with a brake noise complaint. Watch how the front desk logs the vehicle, opens a work order, assigns a technician, records test findings, sends a quote, tracks parts usage, and closes the job with full documentation. This ensures everyone on the team works the same way, reducing errors and miscommunication.
            </p>
          </div>

          <Link
            href="#"
            className="inline-block text-sm font-medium transition-colors"
            style={{ color: '#1b75bb' }}
          >
            Watch Tutorials →
          </Link>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Customer Support</h2>
          <p className="text-sm font-medium text-gray-600 mb-8">
            Reliable, human, knowledgeable support.
          </p>

          <p className="text-base text-gray-700 leading-relaxed mb-8">
            Support is not just technical — it must understand the reality of workshop pressure. That's why GIXAT support is structured around fast, clear, context-aware assistance.
          </p>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">We can help with:</h3>
            <ul className="space-y-2">
              {[
                "Troubleshooting workflow bottlenecks",
                "Guiding new team members in real time",
                "Advising on setup for multi-bay or multi-branch operations",
                "Best practices for inventory and job scheduling",
                "Recovering data or resolving input mistakes",
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Support Channels:</h3>
            <ul className="space-y-2">
              {[
                "Live Chat (during working hours)",
                "Email Ticket Desk (24/7)",
                "Priority Support (Pro & Enterprise)",
                "Optional On-Site or Remote Training Sessions",
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/contact-us"
            className="inline-block text-sm font-medium transition-colors"
            style={{ color: '#1b75bb' }}
          >
            Reach Support →
          </Link>
        </div>
      </section>

      {/* Learning Center Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Learning Center</h2>
          <p className="text-sm font-medium text-gray-600 mb-8">
            Operational knowledge designed to improve real-world workshop performance.
          </p>

          <p className="text-base text-gray-700 leading-relaxed mb-12">
            This section focuses on business efficiency, not just software usage. We share proven strategies used by high-performing workshops.
          </p>

          {/* Featured Guides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {learningArticles.map((article, idx) => (
              <div
                key={idx}
                className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {article.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Featured Guides:</h3>
            <ul className="space-y-2">
              {[
                "Reducing job delays by structuring workflow hand-offs",
                "How to implement clear technician-to-front-desk communication routines",
                "Smart spare-parts management to avoid loss, leakage, or repeated ordering",
                "Techniques to increase customer trust through transparent updates",
                "How to prepare your workshop for seasonal service load changes",
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-700 mb-6 italic">
            Teams learn not only how to use GIXAT, but how to operate better as a workshop.
          </p>

          <Link
            href="#"
            className="inline-block text-sm font-medium transition-colors"
            style={{ color: '#1b75bb' }}
          >
            Explore Learning Center →
          </Link>
        </div>
      </section>

      {/* Product Updates Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Updates & Roadmap</h2>
          <p className="text-sm font-medium text-gray-600 mb-8">
            The platform grows as your business grows.
          </p>

          <p className="text-base text-gray-700 leading-relaxed mb-8">
            We continuously evolve GIXAT based on real workshop feedback. Our roadmap is practical, field-tested, and focused on solving real operational problems.
          </p>

          <div className="p-6 bg-white rounded-lg border border-gray-200 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Updates include:</h3>
            <ul className="space-y-2">
              {[
                "Workflow optimizations",
                "UI and usability improvements",
                "Performance upgrades for faster interaction",
                "New modules based on industry needs (e.g., fleet service mode, bay analytics, technician KPI scoring)",
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-700 mb-6 italic">
            Visibility builds trust. You always know what's coming next — no surprise transitions.
          </p>

          <Link
            href="#"
            className="inline-block text-sm font-medium transition-colors"
            style={{ color: '#1b75bb' }}
          >
            View Release Notes →
          </Link>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">Why This Matters</h2>
          <p className="text-base text-gray-700 leading-relaxed mb-8">
            Workshops thrive on coordination, timing, clarity, and actionable information. The GIXAT Resources Hub ensures:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                {[
                  {
                    without: "Information is tribal and inconsistent",
                    with: "Knowledge is documented, teachable, repeatable",
                  },
                  {
                    without: "New staff require weeks to learn",
                    with: "Training time is reduced dramatically",
                  },
                  {
                    without: "Service quality varies between technicians",
                    with: "Service quality becomes standardized",
                  },
                  {
                    without: "Customer trust depends on the employee, not the business",
                    with: "Customer trust becomes system-driven",
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-700 border-r border-gray-200">
                      <span className="text-gray-500 mr-3">✗</span>
                      {row.without}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      <span className="text-green-600 mr-3">✓</span>
                      {row.with}
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
          <h2 className="text-4xl font-bold text-white mb-6">Get Started with Resources Today</h2>
          <p className="text-lg text-blue-100 mb-8">
            Equip your team with the knowledge and tools they need to succeed.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

