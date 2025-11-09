"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [shopTypesOpen, setShopTypesOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { label: "About", href: "/about" },
    { 
      label: "Features", 
      href: "/features",
      submenu: [
        { label: "Work Order Management", href: "/features#work-orders" },
        { label: "Service Records", href: "/features#service-records" },
        { label: "Inventory Management", href: "/features#inventory" },
        { label: "Analytics", href: "/features#analytics" }
      ]
    },
    { 
      label: "Shop Types", 
      href: "/shop-types",
      submenu: [
        { label: "Independent Repair", href: "/shop-types#independent" },
        { label: "Multi-Location", href: "/shop-types#multi-location" },
        { label: "Fleet Services", href: "/shop-types#fleet" },
        { label: "Dealerships", href: "/shop-types#dealerships" }
      ]
    },
    { label: "Resources", href: "/resources" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact Us", href: "/contact-us" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/images/logo/gixat-logo.png"
              alt="GIXAT Logo"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.submenu ? (
                  <>
                    <button
                      className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium flex items-center gap-1"
                    >
                      {item.label}
                      <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.label}
                          href={subitem.href}
                          className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg transition font-medium text-sm"
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium block"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-white font-medium rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: '#1b75bb' }}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => item.label === "Features" ? setFeaturesOpen(!featuresOpen) : setShopTypesOpen(!shopTypesOpen)}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium flex items-center justify-between"
                    >
                      {item.label}
                      <svg className={`w-4 h-4 transition-transform ${(item.label === "Features" && featuresOpen) || (item.label === "Shop Types" && shopTypesOpen) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {((item.label === "Features" && featuresOpen) || (item.label === "Shop Types" && shopTypesOpen)) && (
                      <div className="ml-4 space-y-2 mt-2 border-l-2 border-blue-200">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.label}
                            href={subitem.href}
                            className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-2 border-t border-gray-200">
              <Link
                href="/auth/login"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition text-center"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
