"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { useTheme } from "@/context/ThemeContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {} = useTheme();

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUsername(null);
      // Redirect to home page after sign out
      window.location.href = "/";
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    // Close menu when user resizes window from mobile to desktop
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Get username from localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);

          console.log("User data structure:", userData);

          if (userData.firstName) {
            setUsername(userData.firstName);
          } else if (userData.user && userData.user.firstName) {
            setUsername(userData.user.firstName);
          } else {
            setUsername(
              userData.name ||
                userData.displayName ||
                userData.fullName ||
                (userData.user ? userData.user.name : null) ||
                "User"
            );
          }
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
          setUsername("User");
        }
      }
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? "bg-[#10121A] text-white shadow-lg"
          : "bg-transparent text-white"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="m-4  cursor-pointer">
            <Logo width={90} height={30} />
          </div>
        </Link>

        {/* Hamburger menu button - visible only on mobile */}
        <button
          className="lg:hidden flex flex-col justify-center items-center"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </button>

        {/* Desktop navigation - hidden on mobile */}
        <div className="hidden lg:flex items-center">
          <ul className="flex space-x-6 ml-4">
            <li>
              <Link href="/" className="hover:underline">
                الرئيسية
              </Link>
            </li>
            {username && (
              <li>
                <Link href="/app" className="hover:underline">
                  لوحة التحكم
                </Link>
              </li>
            )}
            <li>
              <Link href="/products" className="hover:underline">
                منتجاتنا
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                من نحن
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                تواصل معنا
              </Link>
            </li>
          </ul>

          <div className="border-r border-gray-400 h-6 mx-4"></div>

          {username ? (
            <div className="flex items-center">
              <div className="text-sm m-2">
                <span className="m-2">مرحبًا،</span>
                <span className="font-bold">{username}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-400 hover:text-red-500 transition-colors duration-300"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-sky-800 hover:bg-sky-900 text-white px-3 py-1 rounded-md transition-colors duration-300"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`lg:hidden fixed inset-0 bg-[#10121A] z-40 transition-all duration-300 pt-20 px-4 ${
          isMenuOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col items-center space-y-6 text-xl">
          <li>
            <Link
              href="/"
              className="hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              الرئيسية
            </Link>
          </li>
          {username && (
            <li>
              <Link
                href="/app"
                className="hover:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                لوحة التحكم
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/products"
              className="hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              منتجاتنا
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              من نحن
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              تواصل معنا
            </Link>
          </li>
        </ul>

        <div className="mt-12 flex flex-col items-center">
          {username ? (
            <div className="flex flex-col items-center">
              <div className="text-lg mb-4">
                <span className="mr-2">مرحبًا،</span>
                <span className="font-bold">{username}</span>
              </div>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="text-red-400 hover:text-red-500 transition-colors duration-300"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-sky-800 hover:bg-sky-900 text-white px-6 py-2 rounded-md transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
