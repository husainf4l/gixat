import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Features() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            Powerful <span style={{ color: '#1b75bb' }}>Features</span>
          </h1>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Built to Power Every Corner of Your Workshop
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            GIXAT is more than a management platform — it's your all-in-one digital command center for automotive service excellence.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Every feature is purpose-built for the automotive industry, blending intelligent automation, deep analytics, and intuitive design.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Whether you manage a small repair bay or a nationwide operation, GIXAT gives you everything you need to run smarter, faster, and with total confidence.
          </p>
        </div>
      </section>

      {/* Work Order Management */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Order Management</h2>
          <p className="text-base font-semibold text-gray-900 mb-4">Plan. Execute. Deliver.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            GIXAT streamlines the entire lifecycle of every job — from creation to completion — keeping your team organized and your customers informed in real time.
          </p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Highlights:</h3>
            <ul className="space-y-2">
              {[
                "Create and assign jobs instantly to technicians.",
                "Track live progress, status, and completion time.",
                "Capture digital signatures for transparent approvals.",
                "Prioritize urgent tasks automatically based on workload.",
                "Visualize all ongoing work on one intelligent dashboard."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Result: Fewer errors. Faster turnarounds. Happier customers.
          </p>
        </div>
      </section>

      {/* Service Records */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Records</h2>
          <p className="text-base font-semibold text-gray-900 mb-4">Every detail, one click away.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            Never lose track of what's been done — or what's next. GIXAT stores your complete service history for every vehicle, every visit.
          </p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Highlights:</h3>
            <ul className="space-y-2">
              {[
                "Maintain lifetime service history linked by VIN or license plate.",
                "Access repair notes, invoices, and photos instantly.",
                "Generate inspection reports with digital timestamps.",
                "Attach before/after visuals to improve transparency."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Result: Paperless, searchable, and always accurate service documentation.
          </p>
        </div>
      </section>

      {/* Inventory & Parts Management */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory & Parts Management</h2>
          <p className="text-base font-semibold text-gray-900 mb-4">Your stock, smarter than ever.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            GIXAT turns parts management into a proactive system that prevents shortages and overstock automatically.
          </p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Highlights:</h3>
            <ul className="space-y-2">
              {[
                "Real-time tracking of parts usage and stock levels.",
                "Smart alerts for low inventory and reorder thresholds.",
                "Supplier integration for seamless restocking.",
                "Multi-location inventory synchronization.",
                "Cost-per-job tracking to reduce waste and leakage."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Result: Stock what you need, when you need it — and never lose money on forgotten parts.
          </p>
        </div>
      </section>

      {/* Financial Analytics */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Analytics</h2>
          <p className="text-base font-semibold text-gray-900 mb-4">Understand your business at a glance.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            Make every decision data-driven with live financial dashboards designed for automotive metrics.
          </p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Highlights:</h3>
            <ul className="space-y-2">
              {[
                "Track daily revenue, expenses, and job profitability.",
                "View technician efficiency reports and labor cost ratios.",
                "Compare performance across branches or time periods.",
                "Export detailed reports for accountants or partners."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Result: Financial clarity that drives growth and accountability.
          </p>
        </div>
      </section>

      {/* Customer Management */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Management</h2>
          <p className="text-base font-semibold text-gray-900 mb-4">Turn every client into a lifelong partner.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            With GIXAT's built-in CRM, your customer relationships become as strong as your service quality.
          </p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Highlights:</h3>
            <ul className="space-y-2">
              {[
                "Full customer profiles with contact info and service history.",
                "Automated reminders for service due dates or follow-ups.",
                "SMS and email integration for communication and promotions.",
                "Personalized loyalty programs and satisfaction tracking."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Result: Loyal customers, repeat visits, and stronger word-of-mouth reputation.
          </p>
        </div>
      </section>

      {/* Mobile Access */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mobile Access</h2>
          <p className="text-base font-semibold text-gray-900 mb-4">Your workshop in your pocket.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            Empower your team to manage work on the go — in the bay, on the road, or at a client site.
          </p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Highlights:</h3>
            <ul className="space-y-2">
              {[
                "Mobile app optimized for iOS and Android.",
                "Instant access to work orders, service history, and time tracking.",
                "Offline mode with auto-sync once online.",
                "Technician clock-in/out and photo uploads directly from mobile."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Result: Uninterrupted operations. Real-time visibility. Seamless performance.
          </p>
        </div>
      </section>

      {/* Appointment Scheduling */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Scheduling</h2>
          <p className="text-base font-semibold text-gray-900 mb-4">Simplify how customers connect with your shop.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            Online booking meets smart scheduling — optimizing both customer convenience and team efficiency.
          </p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Highlights:</h3>
            <ul className="space-y-2">
              {[
                "Branded booking portal with live availability.",
                "Auto-assign technicians based on skill or workload.",
                "Calendar integration with Google, Outlook, or iCal.",
                "Automated notifications and reminders for both parties."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Result: Fewer missed appointments, smoother operations, and happier customers.
          </p>
        </div>
      </section>

      {/* Reporting & Insights */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reporting & Insights</h2>
          <p className="text-base font-semibold text-gray-900 mb-4">Your business, decoded.</p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            GIXAT translates complex workshop data into actionable insights that guide your next big decision.
          </p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Highlights:</h3>
            <ul className="space-y-2">
              {[
                "Custom report builder for finance, operations, and performance.",
                "Real-time dashboards for multi-location analytics.",
                "Repair time benchmarking and cost per service type.",
                "Export data in PDF, Excel, or API formats for advanced analysis."
              ].map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Result: Transparency and intelligence in every decision you make.
          </p>
        </div>
      </section>

      {/* Why GIXAT Features Stand Out */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">Why GIXAT Features Stand Out</h2>

          <div className="space-y-12">
            {/* Purpose-Built for Automotive */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Purpose-Built for Automotive</h3>
              <p className="text-base text-gray-700">
                GIXAT isn't a generic business tool — it's a platform engineered by automotive professionals.
              </p>
              <p className="text-base text-gray-700">
                Every workflow, metric, and automation was designed around real-world shop challenges — not adapted from another industry.
              </p>
            </div>

            {/* Industry Expertise */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Industry Expertise</h3>
              <p className="text-base text-gray-700">
                Our team blends decades of experience from the automotive and software sectors.
              </p>
              <p className="text-base text-gray-700">
                We've lived your day-to-day, and we've built GIXAT to simplify it.
              </p>
            </div>

            {/* User-Friendly Design */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">User-Friendly Design</h3>
              <p className="text-base text-gray-700">
                The power of enterprise software, delivered with the simplicity of a smartphone app.
              </p>
              <p className="text-base text-gray-700">
                Minimal clicks, clear navigation, and zero learning curve mean your team is productive from day one.
              </p>
            </div>

            {/* Always Evolving */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Always Evolving</h3>
              <p className="text-base text-gray-700">
                The automotive world never stops moving — and neither do we.
              </p>
              <p className="text-base text-gray-700">
                GIXAT continuously evolves with regular feature updates, AI enhancements, and user-driven innovation.
              </p>
            </div>

            {/* Seamless Integrations */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Integrations</h3>
              <p className="text-base text-gray-700 mb-4">
                Your workflow shouldn't stop where software does.
              </p>
              <p className="text-base text-gray-700 mb-6">
                GIXAT connects effortlessly with your favorite tools to create a unified ecosystem.
              </p>
              <p className="text-base font-semibold text-gray-900 mb-4">Supported Integrations:</p>
              <ul className="space-y-2">
                {[
                  "Payment Processing (Stripe, PayPal, POS)",
                  "Accounting Software (QuickBooks, Xero)",
                  "Email & SMS (Twilio, SendGrid, WhatsApp API)",
                  "CRM Systems (HubSpot, Zoho, Salesforce)",
                  "API Access for custom systems",
                  "Calendar Apps (Google, Outlook, iCal)",
                  "Document Storage (Google Drive, Dropbox)",
                  "Notification Systems (Slack, Microsoft Teams)"
                ].map((item: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700">{item}</li>
                ))}
              </ul>
              <p className="text-base font-semibold text-gray-900 mt-6">
                Result: Seamless operations, connected data, and one powerful control hub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for the Future */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Built for the Future</h2>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            From local repair shops to corporate service centers, GIXAT empowers you to deliver faster service, smarter decisions, and higher profits.
          </p>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            Every feature was crafted to save time, reduce friction, and bring clarity to your automotive business.
          </p>
          <p className="text-lg font-semibold text-gray-900">
            Your shop. Your data. Your growth — powered by GIXAT.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
