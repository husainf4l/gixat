import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function WiddVarPage() {
  return (
    <main className="min-h-screen bg-gray-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            WIDD VAR – تقنية تحكيم متطورة
          </h1>

          <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
            <Image
              src="/images/section/var.webp"
              alt="Widd VAR Technology"
              fill
              className="object-cover"
            />
          </div>

          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-xl leading-relaxed mb-6">
              تقدم تقنية <strong>رؤيا VAR</strong> نظام تحكيم متطور يعتمد على
              الذكاء الاصطناعي لتقديم قرارات دقيقة وفورية. مصممة لتعزيز نزاهة
              المباريات وتقليل الأخطاء البشرية في التحكيم.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">المميزات الرئيسية</h2>
            <ul className="space-y-3 mb-8">
              <li>تحليل مباشر للقطات بدقة عالية</li>
              <li>تقنية تتبع اللاعبين والكرة بالذكاء الاصطناعي</li>
              <li>سرعة فائقة في اتخاذ القرارات</li>
              <li>تحديد خط التسلل بدقة متناهية</li>
              <li>واجهة سهلة الاستخدام للحكام</li>
            </ul>

            <div className="mt-12">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                طلب عرض توضيحي
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
