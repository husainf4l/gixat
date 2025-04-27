import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function WiddPostPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">WIDDpost – تحليل ما بعد المباراة</h1>
          
          <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
            <Image 
              src="/images/section/a2.png" 
              alt="WIDDpost Analysis" 
              fill 
              className="object-cover"
            />
          </div>
          
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-xl leading-relaxed mb-6">
              <strong>WIDDpost</strong> هي منصة متكاملة لتحليل أداء الفرق واللاعبين بعد المباريات.
              تستخدم أحدث تقنيات الذكاء الاصطناعي لتوفير رؤى وتحليلات متعمقة للمدربين والمحللين الرياضيين.
            </p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">المميزات الرئيسية</h2>
            <ul className="space-y-3 mb-8">
              <li>تحليل تفصيلي للأداء الفردي والجماعي</li>
              <li>إحصائيات متقدمة لكل لاعب</li>
              <li>تحليل تكتيكي للهجمات والدفاع</li>
              <li>تقارير قابلة للتخصيص</li>
              <li>أرشفة وحفظ البيانات للمقارنة المستقبلية</li>
            </ul>
            
            <div className="mt-12">
              <Link 
                href="/contact" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                طلب تجربة المنصة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}