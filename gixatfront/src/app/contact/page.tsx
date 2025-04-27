"use client";

import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faInstagram,
  faLinkedin,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

config.autoAddCss = false;

const ContactPage = () => {
  const contactInfo = [
    {
      type: "العنوان",
      value: "123 شارع أب تاون، الرياض، المملكة العربية السعودية",
    },
    {
      type: "البريد الإلكتروني",
      value: "contact@upthouse.com",
    },
    {
      type: "رقم الهاتف",
      value: "+966 55 123 4567",
    },
    {
      type: "ساعات العمل",
      value: "الأحد - الخميس: 9 صباحًا - 6 مساءً",
    },
  ];

  const socialMedia = [
    { name: "تويتر", url: "https://twitter.com/upthouse", icon: faTwitter },
    {
      name: "إنستغرام",
      url: "https://instagram.com/upthouse",
      icon: faInstagram,
    },
    {
      name: "لينكدإن",
      url: "https://linkedin.com/company/upthouse",
      icon: faLinkedin,
    },
    { name: "فيسبوك", url: "https://facebook.com/upthouse", icon: faFacebook },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#0F1118] to-[#1A1D2B] py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-extrabold mb-6 text-white">
              تواصل <span className="text-cyan-400">معنا</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              نحن هنا للإجابة على استفساراتكم والاستماع إلى آرائكم. لا تترددوا
              في التواصل معنا من خلال أي من وسائل الاتصال المتاحة.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:w-3/5"
            >
              <div className="bg-gradient-to-r from-gray-900 to-[#1A1D2B] rounded-xl shadow-2xl p-8">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                  أرسل لنا رسالة
                </h2>
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-gray-300 mb-2"
                      >
                        الاسم
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full bg-[#1E2235] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="الاسم الكامل"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-gray-300 mb-2"
                      >
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full bg-[#1E2235] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="example@upthouse.com"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="subject"
                      className="block text-gray-300 mb-2"
                    >
                      الموضوع
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full bg-[#1E2235] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="موضوع الرسالة"
                    />
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="block text-gray-300 mb-2"
                    >
                      الرسالة
                    </label>
                    <textarea
                      id="message"
                      className="w-full bg-[#1E2235] text-white rounded-lg p-3 h-36 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="اكتب رسالتك هنا..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all"
                  >
                    إرسال الرسالة
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:w-2/5"
            >
              <div className="bg-gradient-to-r from-gray-900 to-[#1A1D2B] rounded-xl shadow-2xl p-8 h-full">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                  معلومات التواصل
                </h2>

                <div className="space-y-6 mb-8">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start">
                      <div>
                        <h4 className="text-white font-semibold">
                          {info.type}
                        </h4>
                        <p className="text-gray-300">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-4">
                    تابعنا على وسائل التواصل الاجتماعي
                  </h4>
                  <div className="flex space-x-4">
                    {socialMedia.map((platform, index) => (
                      <a
                        key={index}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-[#1E2235] flex items-center justify-center text-xl hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 transition-all"
                        aria-label={platform.name}
                      >
                        <FontAwesomeIcon
                          icon={platform.icon}
                          className="text-white text-2xl"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;
