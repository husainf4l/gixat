import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section - Professional Style */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text Content */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
                Control Every <span style={{ color: '#1b75bb' }}>Job</span><br />
                Every <span style={{ color: '#1b75bb' }}>Car</span>
              </h1>
              <p className="text-base text-gray-600 mb-6 leading-relaxed max-w-lg">
                GIXAT is your one-stop fleet maintenance solution designed to streamline operations, reduce downtime, and enhance transparency across your automotive business.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/auth/login"
                  className="text-white font-semibold py-2 px-6 rounded-lg transition shadow-lg hover:shadow-xl inline-flex items-center justify-center text-sm hover:opacity-90"
                  style={{ backgroundColor: '#1b75bb' }}
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/signup"
                  className="font-semibold py-2 px-6 rounded-lg transition shadow-lg hover:shadow-xl inline-flex items-center justify-center text-sm hover:opacity-90"
                  style={{ backgroundColor: '#ffc31c', color: '#333' }}
                >
                  Book a Demo
                </Link>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl transform rotate-2 opacity-10"></div>
                <img
                  src="/images/logo/heroimage2.jpg"
                  alt="GIXAT Fleet Management Solution"
                  className="relative w-full h-auto rounded-3xl shadow-2xl border border-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Everything Workshops Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powerful tools designed for the way you work, streamlining operations and reducing unnecessary downtime.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Order Management</h3>
              <p className="text-15px text-gray-600 leading-relaxed">Track repair status, technician assignments, and progress in real time with comprehensive visibility.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Records</h3>
              <p className="text-15px text-gray-600 leading-relaxed">Maintain complete service history for every customer vehicle with detailed documentation.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Inventory & Parts</h3>
              <p className="text-15px text-gray-600 leading-relaxed">Monitor stock levels, track usage, and receive intelligent alerts for low quantities.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Analytics</h3>
              <p className="text-15px text-gray-600 leading-relaxed">View revenue trends, expenses, and technician efficiency at a glance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Device Mockups Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">See GIXAT in Action</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Intuitive, purpose-built interfaces designed specifically for automotive professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* MacBook Mockup */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-lg bg-black rounded-t-3xl rounded-b-3xl p-3 shadow-2xl border-8 border-gray-800">
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-b from-gray-50 to-white p-8 space-y-6 h-72">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="space-y-3">
                        <div className="h-2 bg-gray-100 rounded w-full"></div>
                        <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                        <div className="h-2 bg-gray-100 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full max-w-lg h-4 bg-gray-800 rounded-b-3xl shadow-2xl"></div>
              <p className="text-16px font-medium text-gray-900 mt-8 text-center">Job Orders & Dispatch</p>
            </div>

            {/* iPhone Mockup */}
            <div className="flex flex-col items-center">
              <div className="w-48 bg-black rounded-3xl p-3 shadow-2xl border-8 border-gray-900">
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-b from-gray-50 to-white p-4 space-y-4 h-96">
                    <div className="h-8 bg-gray-100 rounded flex items-center px-3">
                      <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-100 rounded w-full"></div>
                      <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-16px font-medium text-gray-900 mt-8 text-center">Mobile Management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits by User Type */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Built for Every Role</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              No matter your position, GIXAT delivers the tools and insights you need to succeed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Business Owners */}
            <div className="group">
              <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-lg h-full">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">For Business Owners</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Real-time operational dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Revenue and profitability reports</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Technician performance tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Cost analysis and forecasting</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Technicians */}
            <div className="group">
              <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:bg-emerald-50 transition-all duration-300 shadow-sm hover:shadow-lg h-full">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">For Technicians</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Clear daily work assignments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Real-time job status updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Digital time tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Mobile app for on-the-go access</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Customers */}
            <div className="group">
              <div className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:bg-purple-50 transition-all duration-300 shadow-sm hover:shadow-lg h-full">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">For Customers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Live service status notifications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Service history and maintenance tips</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Transparent pricing and estimates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    <span className="text-14px text-gray-600">Online appointment scheduling</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Hear From Workshop Leaders</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Real stories from real workshops making a difference with GIXAT
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-10 bg-white border border-gray-200 rounded-2xl">
              <p className="text-17px text-gray-700 mb-8 leading-relaxed italic">"GIXAT reduced our administrative work by 40% in the first month. Our team is now focused on customer service rather than paperwork. The ROI is undeniable."</p>
              <div className="border-t border-gray-100 pt-6">
                <p className="text-16px font-semibold text-gray-900">David Rodriguez</p>
                <p className="text-15px text-gray-500">Owner, Rodriguez Auto Care</p>
              </div>
            </div>

            <div className="p-10 bg-white border border-gray-200 rounded-2xl">
              <p className="text-17px text-gray-700 mb-8 leading-relaxed italic">"The mobile app makes our technicians more efficient. They can update job status from anywhere, and we have complete visibility. It's a game-changer for our operation."</p>
              <div className="border-t border-gray-100 pt-6">
                <p className="text-16px font-semibold text-gray-900">Sarah Martinez</p>
                <p className="text-15px text-gray-500">Manager, Premier Motors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Pricing Built for Your Growth</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Simple, transparent pricing that scales with your workshop. No hidden fees.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="p-10 bg-white border border-gray-200 rounded-2xl">
              <h3 className="text-22px font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-16px text-gray-600 mb-8">Perfect for small workshops</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-gray-400 text-lg">✓</span>
                  <span>Up to 5 users</span>
                </li>
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-gray-400 text-lg">✓</span>
                  <span>Work order management</span>
                </li>
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-gray-400 text-lg">✓</span>
                  <span>Basic reporting</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 border border-gray-300 rounded-lg text-16px font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="relative p-10 bg-white border border-blue-300 rounded-2xl ring-1 ring-blue-100 shadow-lg">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="inline-block px-4 py-1 bg-blue-600 rounded-full text-14px font-bold text-white">Most Popular</span>
              </div>
              <h3 className="text-22px font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-16px text-gray-600 mb-8">For growing workshops</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-blue-600 text-lg font-bold">✓</span>
                  <span>Up to 25 users</span>
                </li>
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-blue-600 text-lg font-bold">✓</span>
                  <span>Inventory management</span>
                </li>
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-blue-600 text-lg font-bold">✓</span>
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 bg-blue-600 rounded-lg text-16px font-semibold text-white hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-10 bg-white border border-gray-200 rounded-2xl">
              <h3 className="text-22px font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-16px text-gray-600 mb-8">For large organizations</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-gray-400 text-lg">✓</span>
                  <span>Unlimited users</span>
                </li>
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-gray-400 text-lg">✓</span>
                  <span>Multi-location support</span>
                </li>
                <li className="flex items-center gap-3 text-16px text-gray-600">
                  <span className="text-gray-400 text-lg">✓</span>
                  <span>Dedicated account manager</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 border border-gray-300 rounded-lg text-16px font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto px-8 py-16">
          {/* Footer Top */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <h3 className="text-20px font-bold text-white mb-4">GIXAT</h3>
              <p className="text-15px text-gray-400 leading-relaxed">
                Workshop management software trusted by automotive businesses worldwide.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-16px font-semibold text-white mb-6">Product</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-16px font-semibold text-white mb-6">Solutions</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">For Owners</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">For Technicians</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">For Customers</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Case Studies</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-16px font-semibold text-white mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-16px font-semibold text-white mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="text-15px text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-15px text-gray-400">
                © 2025 GIXAT. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20v-7.21H5.5V9.25h2.79V7.02c0-2.7 1.65-4.18 4.07-4.18 1.16 0 2.16.09 2.45.13v2.84h-1.68c-1.32 0-1.57.63-1.57 1.55V9.25h3.13l-4.07 3.54v7.21h-3.73z"/>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.162 5.656a8.384 8.384 0 01-2.402.658A4.196 4.196 0 0021.6 4.15a8.387 8.387 0 01-2.663 1.02 4.184 4.184 0 00-7.168 3.814 11.874 11.874 0 01-8.622-4.37 4.185 4.185 0 001.295 5.585 4.179 4.179 0 01-1.897-.523v.052a4.185 4.185 0 003.355 4.101 4.21 4.21 0 01-1.89.072A4.188 4.188 0 007.97 16.65a8.395 8.395 0 01-6.191 1.732 11.83 11.83 0 006.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.36-.013-.54a8.496 8.496 0 002.087-2.165z"/>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.372 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
