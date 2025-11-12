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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="/images/logo/gixat-logo.png"
              alt="GIXAT Logo"
              className="h-7 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.submenu ? (
                  <>
                    <button
                      className="px-3.5 py-2 text-sm text-gray-700 hover:text-black rounded-md transition font-500 flex items-center gap-1 hover:bg-gray-100"
                    >
                      {item.label}
                      <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.label}
                          href={subitem.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition font-500"
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="px-3.5 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition font-500 block"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm text-gray-700 hover:text-black font-600 transition hover:bg-gray-100 rounded-md"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm text-white font-600 rounded-md transition hover:opacity-90 bg-black hover:bg-gray-900"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <svg
                className="w-5 h-5"
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
          <div className="md:hidden pb-4 space-y-1 border-t border-gray-200">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => item.label === "Features" ? setFeaturesOpen(!featuresOpen) : setShopTypesOpen(!shopTypesOpen)}
                      className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition font-500 flex items-center justify-between"
                    >
                      {item.label}
                      <svg className={`w-4 h-4 transition-transform opacity-60 ${(item.label === "Features" && featuresOpen) || (item.label === "Shop Types" && shopTypesOpen) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {((item.label === "Features" && featuresOpen) || (item.label === "Shop Types" && shopTypesOpen)) && (
                      <div className="ml-4 space-y-1 mt-1">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.label}
                            href={subitem.href}
                            className="block px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition font-500"
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
                    className="block px-3 py-2.5 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition font-500"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-2 space-y-2 border-t border-gray-200 mt-2">
              <Link
                href="/auth/login"
                className="block px-3 py-2.5 text-sm text-gray-700 hover:text-black font-600 transition rounded-md hover:bg-gray-100"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="block px-3 py-2.5 bg-black hover:bg-gray-900 text-white text-sm font-600 rounded-md transition"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
