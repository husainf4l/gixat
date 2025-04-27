import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[#0F1118] to-[#1A1D2B] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-[#1A1D2B]/70 rounded-xl p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              شروط <span className="text-cyan-400">الاستخدام</span>
            </h1>

            <div className="space-y-8 text-gray-200 text-right">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">مقدمة</h2>
                <p>
                  مرحبًا بك في موقع رؤية ٣٤. باستخدامك لهذا الموقع، فإنك توافق
                  على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل
                  استخدام الموقع.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  قبول الشروط
                </h2>
                <p>
                  باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط
                  والأحكام وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق
                  على أي من هذه الشروط، فيجب عليك عدم استخدام هذا الموقع.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  التغييرات في الشروط
                </h2>
                <p>
                  نحتفظ بالحق في تعديل أو استبدال هذه الشروط في أي وقت. سيتم نشر
                  أي تغييرات على هذه الصفحة. استمرارك في استخدام الموقع بعد نشر
                  أي تغييرات يعني قبولك لهذه التغييرات.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  استخدام الموقع
                </h2>
                <p>
                  تتعهد باستخدام الموقع فقط للأغراض القانونية وبطريقة لا تنتهك
                  حقوق أي طرف ثالث أو تقيد أو تمنع استخدام الموقع من قبل أي طرف
                  ثالث.
                </p>
                <p>يُحظر عليك:</p>
                <ul className="list-disc list-inside pr-6 space-y-2">
                  <li>
                    استخدام الموقع بطريقة قد تسبب ضررًا للموقع أو تقلل من توافره
                  </li>
                  <li>نشر أي محتوى مسيء أو تشهيري أو غير قانوني</li>
                  <li>استخدام الموقع لنشر أو إرسال أي إعلانات غير مصرح بها</li>
                  <li>انتهاك أمن الموقع أو محاولة الوصول إلى معلومات سرية</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  حقوق الملكية الفكرية
                </h2>
                <p>
                  جميع حقوق الملكية الفكرية للموقع والمحتوى المنشور عليه
                  (باستثناء المحتوى المقدم من المستخدمين) تعود ملكيتها لنا أو
                  للمرخصين لنا. جميع الحقوق محفوظة.
                </p>
                <p>لا يجوز لك:</p>
                <ul className="list-disc list-inside pr-6 space-y-2">
                  <li>إعادة نشر مواد من هذا الموقع دون إذن</li>
                  <li>بيع أو تأجير مواد من الموقع</li>
                  <li>استنساخ أو نسخ أو نشر مواد من الموقع لأي غرض تجاري</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  مسؤولية المستخدم
                </h2>
                <p>
                  أنت مسؤول عن جميع الأنشطة التي تتم تحت حسابك وتتعهد بعدم
                  مشاركة معلومات تسجيل الدخول الخاصة بك مع أي شخص آخر.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  إخلاء المسؤولية
                </h2>
                <p>
                  يتم توفير المحتوى والخدمات على موقعنا &quot;كما هي&quot; دون
                  أي ضمان من أي نوع، سواء كان صريحًا أو ضمنيًا. لن نكون مسؤولين
                  عن أي خسائر أو أضرار ناتجة عن استخدام الموقع.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  القوانين الحاكمة
                </h2>
                <p>
                  تخضع هذه الشروط والأحكام وتفسر وفقًا لقوانين المملكة العربية
                  السعودية، وتخضع أي نزاعات للاختصاص الحصري لمحاكم المملكة
                  العربية السعودية.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-cyan-400">
                  الاتصال بنا
                </h2>
                <p>
                  إذا كانت لديك أي أسئلة حول شروط الاستخدام هذه، يمكنك التواصل
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
