import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Features() {
  const featuresList = [
    {
      title: "Work Order Management",
      description: "Create, assign, and track work orders with real-time status updates. Monitor technician assignments, progress, and completion timelines with full visibility.",
      icon: "📋"
    },
    {
      title: "Service Records",
      description: "Maintain complete service history for every customer vehicle. Track maintenance, repairs, and inspections with detailed documentation and historical data.",
      icon: "📄"
    },
    {
      title: "Inventory & Parts Management",
      description: "Monitor stock levels, track parts usage, and receive intelligent alerts for low inventory. Optimize ordering and reduce unnecessary inventory costs.",
      icon: "📦"
    },
    {
      title: "Financial Analytics",
      description: "View revenue trends, expense analysis, profitability reports, and technician efficiency metrics. Make data-driven business decisions with comprehensive reporting.",
      icon: "📊"
    },
    {
      title: "Customer Management",
      description: "Maintain detailed customer profiles, contact information, and service history. Improve customer relationships with personalized communication and follow-ups.",
      icon: "👥"
    },
    {
      title: "Mobile Access",
      description: "Empower technicians with full access to job information, service records, and updates from their mobile devices. Track time and complete jobs on the go.",
      icon: "📱"
    },
    {
      title: "Appointment Scheduling",
      description: "Allow customers to book appointments online. Automated scheduling optimizes technician workload and reduces administrative overhead.",
      icon: "📅"
    },
    {
      title: "Reporting & Insights",
      description: "Generate detailed reports on performance, revenue, expenses, and operational metrics. Export data for further analysis or business review.",
      icon: "📈"
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
              Powerful <span style={{ color: '#1b75bb' }}>Features</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for automotive workshop management. Every feature built with your workflow in mind.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {featuresList.map((feature, index) => (
              <div key={index} className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Why GIXAT Features Stand Out</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Purpose-built for automotive businesses, not generic solutions adapted for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-white rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Industry Expertise</h3>
              <p className="text-gray-600 leading-relaxed">Built by people who understand the automotive industry inside and out. Every feature reflects real workshop challenges.</p>
            </div>

            <div className="p-10 bg-white rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">User-Friendly Design</h3>
              <p className="text-gray-600 leading-relaxed">Intuitive interfaces that require minimal training. Your team will be productive from day one without a steep learning curve.</p>
            </div>

            <div className="p-10 bg-white rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Always Evolving</h3>
              <p className="text-gray-600 leading-relaxed">Continuous updates and new features based on customer feedback and industry trends. Your software grows with your business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Seamless Integrations</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect GIXAT with your favorite tools and platforms for a unified workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {["Payment Processing", "Accounting Software", "Email & SMS", "CRM Systems", "API Access", "Calendar Apps", "Document Storage", "Notification Systems"].map((integration, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:bg-blue-50 transition">
                <p className="text-gray-900 font-medium">{integration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Experience These Features?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free trial today and see how GIXAT can transform your workshop operations.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition text-lg"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
