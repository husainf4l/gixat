"use client";

import React from "react";
import { Lightbulb, MousePointerClick, Brain, ArrowDown } from "lucide-react";

export default function ChallengePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1" dir="rtl">
        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-start gap-4 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                التحديات
              </h1>
            </div>

            <div className="space-y-8">
              {/* Challenge Section */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="space-y-4 flex-1 order-2 md:order-1">
                    <h2 className="text-xl font-bold text-white">
                      التحدي الرئيسي هو تحويل الزجاج الشفاف إلى زجاج أسود للحصول
                      على تجربة واقع افتراضي بدقة 4K
                    </h2>

                    <p className="text-gray-300 text-lg">
                      نريد تطوير نظام يمكنه تحويل الزجاج الشفاف العادي إلى شاشة
                      واقع افتراضي عالي الدقة للتطبيقات المختلفة بما في ذلك
                      السيارات وتجارب القيادة الافتراضية.
                    </p>
                  </div>

                  <div className="w-full md:w-1/2 order-1 md:order-2">
                    <img
                      src="/images/section/var.webp"
                      alt="Widd Var Challenge"
                      className="w-full rounded-lg shadow-xl h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Solution Approach Section */}
              <div className="flex justify-center my-4">
                <div className="flex flex-col items-center">
                  <ArrowDown className="h-10 w-10 text-purple-500 my-2" />
                  <div className="text-purple-400 font-semibold text-lg">
                    نهجنا للحل
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-700/50">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-1/2 order-1">
                    <img
                      src="/images/challange1.png"
                      alt="Our Solution Approach"
                      className="w-full rounded-lg shadow-xl h-auto"
                    />
                  </div>

                  <div className="space-y-4 flex-1 order-2">
                    <h2 className="text-xl font-bold text-white">
                      الحل: نهجنا الأول لاختبار البحث والتطوير
                    </h2>

                    <p className="text-gray-300 text-lg">
                      استخدام زجاجتين رفيعتين بينهما مغناطيس أسود في بيئة
                      كهربائية وتدار بواسطة وكيل ذكاء اصطناعي. هذا التصميم يسمح
                      بالتحكم الدقيق في شفافية الزجاج وتحويله لعرض محتوى الواقع
                      الافتراضي.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technology Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                  <div className="bg-blue-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-100">
                    التكنولوجيا
                  </h3>
                  <p className="text-gray-400">
                    تطوير تقنية متطورة للزجاج الذكي القابل للتحول
                  </p>
                </div>

                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                  <div className="bg-green-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <MousePointerClick className="h-6 w-6 text-green-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-100">
                    التحكم الكهربائي
                  </h3>
                  <p className="text-gray-400">
                    نظام كهربائي متقدم للتحكم في المغناطيس بين طبقات الزجاج
                  </p>
                </div>

                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                  <div className="bg-amber-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-amber-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-100">
                    الذكاء الاصطناعي
                  </h3>
                  <p className="text-gray-400">
                    وكيل ذكاء اصطناعي لإدارة وتحسين عمليات التحول في الزجاج
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
