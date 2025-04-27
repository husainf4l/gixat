import React from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="h-screen relative overflow-hidden">
        {/* Hero Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-cyan-800">
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[length:20px_20px]"></div>
          </div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1118] via-[#0F1118]/80 to-transparent"></div>

        {/* Content */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
              نحن <span className="text-cyan-400">UPT House</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              نبتكر تجارب رقمية فريدة تتجاوز توقعات عملائنا
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="#about-content"
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:-translate-y-1"
              >
                تعرف علينا
              </a>
              <a
                href="/contact"
                className="bg-transparent border-2 border-white hover:border-cyan-400 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:-translate-y-1 hover:text-cyan-400"
              >
                تواصل معنا
              </a>
            </div>
          </div>

          {/* Scroll down indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-8 h-12 rounded-full border-2 border-white flex items-start justify-center">
              <div className="w-1.5 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section
        id="about-content"
        className="py-16 bg-gradient-to-b from-[#0F1118] to-[#1A1D2B]"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">
              من <span className="text-cyan-400">نحن</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              في عصر تتسارع فيه التكنولوجيا وتتغير فيه معايير الإبداع الرقمي،
              تبرز UPT House كواحدة من الكيانات الريادية في مجال بناء المنصات
              الرقمية، وتجارب المستخدم التفاعلية، وتقديم حلول تقنية مصممة خصيصًا
              لتلبية احتياجات السوق الحديث.
            </p>
          </div>

          {/* Vision Section */}
          <div className="bg-gradient-to-r from-gray-900 to-[#1A1D2B] p-8 rounded-xl shadow-2xl mb-16 transform transition-transform hover:scale-105">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">الرؤية</h3>
            <p className="text-gray-300 leading-relaxed">
              تهدف UPT House إلى إعادة تعريف العلاقة بين الإنسان والتكنولوجيا من
              خلال تصميم وتطوير حلول رقمية تضع المستخدم في قلب التجربة. نحن نؤمن
              بأن التقنية ليست غاية بحد ذاتها، بل وسيلة لخلق تجارب مميزة، تدفع
              العلامات التجارية إلى التفاعل الأعمق مع جمهورها.
            </p>
          </div>

          {/* What Makes UPT Unique */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              ما الذي يميز UPT؟
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-4 max-w-4xl mx-auto">
              <li className="hover:text-cyan-400 transition-colors">
                <span className="text-cyan-400 font-bold">
                  نهج تجريبي ومبتكر:
                </span>{" "}
                نحن لا نؤمن بالقوالب الجاهزة. كل مشروع يبدأ بورقة بيضاء، يُرسم
                عليها الحل بما يناسب العلامة التجارية، جمهورها، وأهدافها طويلة
                المدى.
              </li>
              <li className="hover:text-cyan-400 transition-colors">
                <span className="text-cyan-400 font-bold">
                  فهم عميق للسوق المحلي والعالمي:
                </span>{" "}
                بفضل خلفية الفريق المتنوعة، نتمتع بفهم عميق للسوق السعودي
                والخليجي من جهة، والسوق الرقمي العالمي من جهة أخرى.
              </li>
              <li className="hover:text-cyan-400 transition-colors">
                <span className="text-cyan-400 font-bold">
                  فريق متعدد التخصصات:
                </span>{" "}
                يتكون فريقنا من مصممين، مطورين، خبراء تجربة مستخدم، استراتيجيين،
                ومبدعين.
              </li>
              <li className="hover:text-cyan-400 transition-colors">
                <span className="text-cyan-400 font-bold">
                  تركيز على تجربة المستخدم (UX):
                </span>{" "}
                نولي تجربة المستخدم أهمية قصوى، حيث نحرص على بناء منصات وتطبيقات
                سهلة الاستخدام، سريعة، ومتوافقة مع أحدث الاتجاهات التقنية.
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              خدماتنا
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "تصميم تجربة المستخدم (UX) والواجهة (UI)",
                  description:
                    "نصمم تجارب رقمية جذابة وسلسة، مدعومة برؤية بصرية قوية تعكس هوية العميل.",
                },
                {
                  title: "تطوير المواقع والتطبيقات",
                  description:
                    "نستخدم أحدث التقنيات لبناء مواقع إلكترونية وتطبيقات سريعة، آمنة، ومتجاوبة مع جميع الأجهزة.",
                },
                {
                  title: "الهوية البصرية وبناء العلامة التجارية",
                  description:
                    "نساعد العملاء على تشكيل هوية بصرية مميزة تمثلهم في السوق وتخلق صلة حقيقية مع جمهورهم.",
                },
                {
                  title: "الاستشارات الرقمية والتحول الرقمي",
                  description:
                    "نعمل مع المؤسسات لتحديد احتياجاتها الرقمية، ووضع خطط تحول فعالة تعزز الكفاءة وتُسرّع النمو.",
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-900 to-[#1A1D2B] p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105"
                >
                  <h4 className="text-xl font-bold text-cyan-400 mb-2">
                    {service.title}
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Culture Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              ثقافتنا في العمل
            </h3>
            <div className="bg-gradient-to-b from-gray-900/50 to-[#1A1D2B]/60 p-8 rounded-xl shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="md:w-1/2">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    في UPT House، نؤمن بأن بيئة العمل الإبداعية هي أساس
                    الابتكار. نحن نحتضن التنوع، ونتعامل مع كل مشروع كفرصة لتقديم
                    قيمة حقيقية. نُشجّع المبادرات الفردية، ونقدّر روح الفريق،
                    ونعتبر العميل شريكًا في النجاح، لا مجرد متلقي خدمة.
                  </p>
                </div>
                <div className="md:w-1/2 grid grid-cols-2 gap-4">
                  {[
                    { label: "الإبداع" },
                    { label: "التعاون" },
                    { label: "الابتكار" },
                    { label: "التميز" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg flex flex-col items-center justify-center transform transition-all hover:scale-105 hover:from-cyan-500/30 hover:to-blue-500/30"
                    >
                      <span className="text-cyan-400 font-bold text-lg">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-24 mb-16 relative">
            <div className="h-64 md:h-80 lg:h-96 relative overflow-hidden rounded-xl shadow-2xl">
              {/* Banner image */}
              <Image
                src="/path-to-image.jpg"
                alt="Image description"
                width={500}
                height={300}
                className="w-full h-full object-cover"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-transparent to-blue-600/30"></div>

              {/* Content overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-lg p-6 md:p-8 rounded-xl max-w-lg text-left transform transition-transform hover:scale-105">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    لنصنع المستقبل معًا
                  </h3>
                  <p className="text-gray-200">
                    في UPT House، نتطلع دائمًا إلى بناء شراكات جديدة وخلق تجارب
                    رقمية تتجاوز التوقعات
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              فريق <span className="text-cyan-400">العمل</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "محمد الأحمد",
                  position: "المؤسس والرئيس التنفيذي",
                  bio: "خبير في تصميم تجربة المستخدم وتطوير الواجهات مع خبرة 12+ عاما",
                },
                {
                  name: "سارة الخالد",
                  position: "مدير التكنولوجيا",
                  bio: "متخصصة في هندسة البرمجيات وتطوير الحلول المبتكرة",
                },
                {
                  name: "عبدالله العمري",
                  position: "مدير المشاريع",
                  bio: "خبرة واسعة في إدارة المشاريع الرقمية وتطوير الأعمال",
                },
                {
                  name: "نورة القحطاني",
                  position: "مصممة UX/UI",
                  bio: "مبدعة في تصميم تجارب مستخدم فريدة وواجهات مميزة",
                },
              ].map((member, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl shadow-xl transform transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-cyan-500/80 to-blue-600/80 relative overflow-hidden">
                    {/* Placeholder image with layered effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-transparent to-gray-900/80 group-hover:opacity-70 transition-opacity"></div>

                    {/* Geometric pattern overlay */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0,_transparent_2px)] bg-[length:12px_12px]"></div>
                    </div>

                    {/* Member initial */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity transform translate-y-0 group-hover:-translate-y-10 duration-500">
                      <span className="text-6xl font-bold text-white">
                        {member.name.charAt(0)}
                      </span>
                    </div>

                    {/* Info overlay that slides up on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent p-6 transform translate-y-0 opacity-100 group-hover:translate-y-0 transition-transform duration-500 flex flex-col">
                      <h4 className="text-xl font-bold text-white mb-1">
                        {member.name}
                      </h4>
                      <p className="text-cyan-400 text-sm mb-2">
                        {member.position}
                      </p>
                      <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
