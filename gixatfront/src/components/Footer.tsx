const Footer = () => {
  return (
    <footer className="bg-[#10121A] dark:bg-gray-950 text-white dark:text-gray-200 py-6">
      <div className="container mx-auto text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <a
            href="/privacy"
            className="text-sm hover:underline hover:text-cyan-400 transition-colors"
          >
            سياسة الخصوصية
          </a>
          <a
            href="/terms"
            className="text-sm hover:underline hover:text-cyan-400 transition-colors"
          >
            شروط الاستخدام
          </a>
          <a
            href="/contact"
            className="text-sm hover:underline hover:text-cyan-400 transition-colors"
          >
            تواصل معنا
          </a>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} رؤية ٣٤. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
