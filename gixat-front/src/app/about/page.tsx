import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Main About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Hero Intro */}
          <div className="mb-20">
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              GIXAT is a modern automotive workshop management platform designed to bring structure, transparency, and efficiency to garage operations.
              Workshops today manage multiple moving parts — incoming vehicles, repair tasks, parts inventory, customer communications, technician scheduling, and financial tracking.
              When these processes are handled manually or across unrelated tools, delays, errors, and confusion become inevitable.
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-6">
              GIXAT centralizes all of these workflows into one intelligent system.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            {/* Left Column - Text Content */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">About <span style={{ color: '#1b75bb' }}>GIXAT</span></h1>
              
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                <span className="text-gray-900 font-semibold">GIXAT</span> is an automotive workshop management platform designed to centralize and streamline daily operations. It brings work orders, service history, inventory control, team coordination, and financial tracking into one unified system, helping workshops operate with clarity and efficiency.
              </p>

              <p className="text-base text-gray-700 leading-relaxed mb-8">
                With GIXAT, every task becomes trackable and structured. Workshops gain real-time visibility into job progress, accurate parts usage insights, consistent pricing, faster communication, and reliable service records — improving workflow, customer satisfaction, and profitability.
              </p>

              <div className="space-y-3 mb-12">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-semibold mt-0.5">•</span>
                  <span className="text-gray-700">Real-time Work Order Tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-semibold mt-0.5">•</span>
                  <span className="text-gray-700">Full Vehicle Service Records</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-semibold mt-0.5">•</span>
                  <span className="text-gray-700">Smart Inventory and Parts Control</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-semibold mt-0.5">•</span>
                  <span className="text-gray-700">Financial and Performance Reporting</span>
                </div>
              </div>
            </div>

            {/* Right Column - MacBook Pro Mockup */}
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                {/* MacBook Pro Frame */}
                <div className="bg-black rounded-t-3xl p-3 shadow-2xl">
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    {/* Notch */}
                    <div className="flex justify-center pt-3 pb-2">
                      <div className="w-32 h-2 bg-black rounded-full"></div>
                    </div>
                    
                    {/* Dashboard Content */}
                    <div className="bg-white p-8 space-y-6 h-80">
                      {/* Header */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Dashboard</h3>
                        <p className="text-xs text-gray-500 mt-1">Workshop Operations Overview</p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600 mb-1">Active Jobs</p>
                          <p className="text-lg font-semibold text-gray-900">12</p>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600 mb-1">Parts Inventory</p>
                          <p className="text-lg font-semibold text-gray-900">847</p>
                        </div>
                      </div>

                      {/* Work Orders Table */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Recent Work Orders</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">WO-2024-1201</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">In Progress</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">WO-2024-1200</span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* MacBook Bottom */}
                <div className="bg-gray-800 h-4 rounded-b-3xl shadow-2xl"></div>
              </div>
            </div>
          </div>

          {/* Challenges & Solutions */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Common Workshop Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 font-medium mb-3">✗ Without GIXAT</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Miscommunication between technicians and front desk</li>
                  <li>• Lost work cards or service notes</li>
                  <li>• Inconsistent pricing or undocumented labor</li>
                  <li>• Difficulty tracking parts usage and timing</li>
                  <li>• Customer follow-up delays</li>
                  <li>• Lack of profitability visibility</li>
                </ul>
              </div>

              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-900 font-medium mb-3">✓ With GIXAT</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Clear job status at every stage</li>
                  <li>• All notes and history centralized</li>
                  <li>• Consistent, tracked pricing</li>
                  <li>• Real-time inventory awareness</li>
                  <li>• Fast, professional communication</li>
                  <li>• Complete performance transparency</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Platform Benefits */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">What GIXAT Provides</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              The platform provides a complete operational environment where you can create and assign work orders, record inspection details, track job progress in real time, manage parts availability, maintain comprehensive service history for every vehicle, schedule appointments, issue invoices, and monitor financial performance — all without switching between different apps or paper documentation.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Every activity in the workshop becomes trackable, documented, and measurable. Whether you manage a single garage or multiple branches, GIXAT is built to scale. You can define roles, permissions, and workflows to match your workshop's structure. Managers gain oversight, technicians get clarity, and customers receive a professional service experience from start to finish.
            </p>
          </div>

          {/* Industries Served */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Industries We Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Automotive Repair & Maintenance",
                "Tire & Wheel Services",
                "Bodywork & Paint Centers",
                "Electrical & Diagnostic Specialists",
                "Fleet Service Operations"
              ].map((industry, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition">
                  <p className="text-gray-900 font-medium">{industry}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gray-900 text-white rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8">
              Make running a workshop easier, more organized, and more profitable. GIXAT doesn't replace the experience of your team — it enhances it, enabling your business to deliver consistent quality and faster service with full confidence in every step.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
