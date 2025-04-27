"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const FeaturesSection: React.FC = () => {
  const products = [
    {
      id: "widd360",
      name: "Widd360",
      description:
        "كاميرا بزاوية 360° مدمجة في زي اللاعبين، تنقل رؤية واقعية مباشرة من قلب الحدث.",
      imageSrc: "/images/section/widd360.webp",
      link: "/products/widd360",
    },

    {
      id: "widdpost",
      name: "WIDDpost",
      description:
        "ميزة ذكية تُحوّل اللحظات المميزة إلى منشورات تلقائية قابلة للمشاركة على المنصات الاجتماعية.",
      imageSrc: "/images/section/widdpost.webp",
      link: "/products/widdpost",
    },

    {
      id: "widdone",
      name: "WIDDone",
      description: "متجر تطبيقات مخصص لنظارات WIDD VAR .",
      imageSrc: "/images/section/widdone.webp",
      link: "/products/widdone",
    },

    {
      id: "widdvar",
      name: "WIDDvar",
      description:
        " منظومة هجينة تجمع بين الواقع المعزز , الواقع الافتراضي بطريقة تحترم الحضور وتعزز اللحظة.",
      imageSrc: "/images/section/var.webp",
      link: "/products/widd-var",
    },
  ];
  return (
    <section className="w-full bg-background dark:bg-gray-900 text-foreground dark:text-white overflow-hidden p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={product.link}
            className="relative flex flex-col justify-end overflow-hidden group transition-all duration-700 aspect-[6/4] rounded-xl cursor-pointer"
          >
            {/* Background Image without Overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src={product.imageSrc}
                alt={product.name}
                fill
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Content with subtle gradient for readability */}
            <div className="relative z-10 p-4 md:p-6 space-y-2 w-full bg-gradient-to-t from-black/40 via-black/20 to-transparent rounded-b-xl">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                {product.name}
              </h3>
              <p className="text-sm text-white">{product.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
