import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function WiddOnePage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            WIDDone – حل متكامل للأندية
          </h1>

          <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
            <Image
              src="/images/section/a3.png"
              alt="WIDDone Solution"
              fill
              className="object-cover"
            />
          </div>

          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-xl leading-relaxed mb-6">
              <strong>WIDDone</strong> هو نظام متكامل مصمم خصيصًا للأندية، يجمع
              بين تقنيات حكم الفيديو المساعد والتحليل الفني في منصة واحدة سهلة
              الاستخدام، بتكلفة مناسبة للأندية من مختلف المستويات.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">المميزات الرئيسية</h2>
            <ul className="space-y-3 mb-8">
              <li>نظام VAR مبسط سهل التركيب والاستخدام</li>
              <li>تحليل تكتيكي متكامل للفريق</li>
              <li>تدريب وتطوير مهارات اللاعبين</li>
              <li>إعداد تقارير أداء أسبوعية وشهرية</li>
              <li>خدمة دعم فني على مدار الساعة</li>
            </ul>

            <div className="mt-12">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                استفسر عن الباقات المتاحة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
