import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// Product data structure
type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
};

// List of all products
const products: Product[] = [
  {
    id: "widd360",
    title: "Widd-360",
    description:
      "كاميرا بزاوية 360° مدمجة في زي اللاعبين لتجربة مشاهدة استثنائية",
    image: "/images/section/widd360.webp",
    link: "/products/widd360",
  },

  {
    id: "widdpost",
    title: "WIDD-post",
    description: "منصة تحليل رياضي متكاملة للمدربين والمحللين",
    image: "/images/section/widdpost.webp",
    link: "/products/widdpost",
  },
  {
    id: "widd-var",
    title: "WIDD-var",
    description: "نظام حكم الفيديو المساعد بتكلفة مناسبة لجميع الأندية",
    image: "/images/section/var.webp",
    link: "/products/widd-var",
  },
  {
    id: "widdone",
    title: "WIDD-one",
    description:
      "حل متكامل للأندية يجمع بين تقنيات حكم الفيديو المساعد والتحليل الفني",
    image: "/images/section/widdone.webp",
    link: "/products/widdone",
  },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-12 text-center">منتجاتنا</h1>
          <p className="text-xl text-center mb-16 max-w-3xl mx-auto">
            مجموعة متكاملة من الحلول التقنية المبتكرة لتطوير الرياضة السعودية
            والعربية
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                href={product.link}
                key={product.id}
                className="group bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative w-full aspect-video">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                </div>
                <div className="p-6 flex-grow">
                  <h2 className="text-2xl font-bold mb-3">{product.title}</h2>
                  <p className="text-gray-300">{product.description}</p>
                </div>
                <div className="p-6 pt-0">
                  <span className="inline-block text-blue-400 group-hover:text-blue-300 font-semibold">
                    عرض التفاصيل <span className="ml-2">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              طلب استشارة مجانية
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
