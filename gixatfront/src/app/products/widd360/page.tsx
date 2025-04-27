import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Widd360Page() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Widd360 – كاميرا بزاوية 360°
          </h1>

          <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
            <Image
              src="/images/widd360.png"
              alt="Widd360 Camera"
              fill
              className="object-cover"
            />
          </div>

          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-xl leading-relaxed mb-6">
              تم تطوير <strong>Widd360</strong> بفكر سعودي ورؤية تقنية عصرية،
              لتكون أول كاميرا مدمجة في زي اللاعبين، تمنح الجمهور تجربة مشاهدة
              استثنائية بزاوية 360° كما لو كان في قلب الملعب.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">المميزات الرئيسية</h2>
            <ul className="space-y-3 mb-8">
              <li>عدسة مزدوجة (أمامية وخلفية) لرؤية محيطية واقعية</li>
              <li>تصوير فائق الوضوح بدقة 4K</li>
              <li>اتصال مباشر بالمنصة السحابية وبث فوري</li>
              <li>مصممة لتحمل الحركة، التعرق، وضغط المباريات</li>
              <li>ابتكار وصناعة سعودية 100%</li>
            </ul>

            <div className="mt-12">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                طلب عرض تجريبي
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
