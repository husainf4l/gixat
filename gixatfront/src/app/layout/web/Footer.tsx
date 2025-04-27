const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white py-6 border-t border-slate-800">
      <div className="container mx-auto text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <a
            href="/privacy"
            className="text-sm hover:text-blue-400 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm hover:text-blue-400 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/contact"
            className="text-sm hover:text-blue-400 transition-colors"
          >
            Contact Us
          </a>
        </div>
        <p className="text-sm text-slate-400">
          &copy; {new Date().getFullYear()} GIXAT. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
