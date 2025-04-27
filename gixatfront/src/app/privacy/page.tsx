import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[#0F1118] to-[#1A1D2B] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-[#1A1D2B]/70 rounded-xl p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              سياسة <span className="text-cyan-400">الخصوصية</span>
            </h1>

            <div className="space-y-8 text-gray-200 text-right">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">مقدمة</h2>
                <p>
                  نحن في رؤية ٣٤ نقدر خصوصية زوار موقعنا ونلتزم بحماية بياناتهم
                  الشخصية. توضح سياسة الخصوصية هذه نوع المعلومات التي نجمعها
                  وكيفية استخدامها.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  جمع المعلومات
                </h2>
                <p>
                  نحن نجمع معلومات عندما تقوم بالتسجيل في موقعنا، أو تملأ
                  نموذجًا، أو تشترك في النشرة البريدية، أو تستخدم خدماتنا. قد
                  تشمل المعلومات التي نجمعها:
                </p>
                <ul className="list-disc list-inside pr-6 space-y-2">
                  <li>الاسم والبريد الإلكتروني</li>
                  <li>رقم الهاتف</li>
                  <li>معلومات الاتصال الأخرى</li>
                  <li>معلومات الاستخدام وبيانات التصفح</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  استخدام المعلومات
                </h2>
                <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                <ul className="list-disc list-inside pr-6 space-y-2">
                  <li>تخصيص تجربتك وتلبية احتياجاتك الفردية</li>
                  <li>تحسين موقعنا وخدماتنا</li>
                  <li>إرسال رسائل بريد إلكتروني دورية</li>
                  <li>تقديم المحتوى والعروض المناسبة لك</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  حماية المعلومات
                </h2>
                <p>
                  نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير
                  المصرح به أو الكشف أو التعديل أو الإتلاف. نحن نستخدم تقنيات
                  التشفير المناسبة وأنظمة الأمان لضمان سلامة بياناتك.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  ملفات تعريف الارتباط
                </h2>
                <p>
                  نستخدم ملفات تعريف الارتباط (cookies) لفهم وحفظ تفضيلاتك
                  لزيارات مستقبلية، وتجميع بيانات مجمعة عن حركة الموقع والتفاعل
                  حتى نتمكن من توفير تجربة موقع أفضل في المستقبل.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  مشاركة المعلومات مع أطراف ثالثة
                </h2>
                <p>
                  نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف
                  خارجية. قد نشارك المعلومات مع شركات موثوقة تساعدنا في تشغيل
                  موقعنا، أو إدارة أعمالنا، أو خدمتك، طالما أن هذه الأطراف توافق
                  على الحفاظ على سرية هذه المعلومات.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  تحديثات سياسة الخصوصية
                </h2>
                <p>
                  قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنخطرك
                  بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة. ننصحك
                  بمراجعة هذه الصفحة بشكل دوري للبقاء على اطلاع بالتغييرات.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  الاتصال بنا
                </h2>
                <p>
                  إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يمكنك التواصل
                  معنا من خلال:
                </p>
                <ul className="list-disc list-inside pr-6 space-y-2">
                  <li>البريد الإلكتروني: info@widd.com</li>
                  <li>رقم الهاتف: +966 12 345 6789</li>
                  <li>صفحة التواصل على موقعنا</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
