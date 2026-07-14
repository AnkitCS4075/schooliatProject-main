import React from "react";
import Image from "next/image";
import cardimage from "@/public/images/cardimage.png";

const services = [
  {
    title: "Complete School ERP",
    desc: "Fees, Attendance, Exams, Report Cards & Payroll",
    icon: "📊",
  },
  {
    title: "Centralized Digital Storage",
    desc: "Secure data & document management",
    icon: "☁️",
  },
  {
    title: "Mobile & Web Access",
    desc: "Admin, Teacher, Parent & Student access",
    icon: "📱",
  },
  {
    title: "One School : One Vendor",
    desc: "Single system, single accountability",
    icon: "🔗",
  },
  {
    title: "Printing Solutions",
    desc: "ID Cards, Report Cards & academic printing",
    icon: "🖨️",
  },
  {
    title: "Infrastructure & Procurement",
    desc: "Furniture, Smart Boards, Stationery & Uniforms",
    icon: "🏫",
  },
  {
    title: "Operations & Vendor Management",
    desc: "End-to-end school operations handling",
    icon: "⚙️",
  },
];

export default function WhatWeProvide() {
  return (
    <section className="bg-[#e9f2df] border-b border-[#6f8f3e]/20 py-10 sm:py-12 md:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 px-4">
            What We Provide –{" "}
            <span className="text-[#6f8f3e]">SchooliAT</span>
          </h2>

          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-semibold text-[#6f8f3e] px-4">
            One School : One Vendor - Complete School Solution
          </p>

          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Everything your school needs, technology, operations, and
            infrastructure, delivered through one unified platform.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {services.map((item, index) => (
            <div
              key={index}
              className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#6f8f3e]/10 transform hover:-translate-y-1"
            >
              {/* Background Pattern */}
              <div
                className="absolute inset-0 bg-repeat opacity-40"
                style={{
                  backgroundImage: `url(${cardimage.src})`,
                  backgroundSize: "120px sm:160px",
                }}
              />

              {/* Content */}
              <div className="relative p-5 sm:p-6 md:p-8 h-full flex flex-col">
                {/* Icon */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-[#6f8f3e]/15 text-xl sm:text-2xl mb-4 sm:mb-5 shadow-sm">
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                  {item.desc}
                </p>

                {/* Accent line */}
                <div className="mt-auto pt-4 sm:pt-5">
                  <div className="h-1 w-10 sm:w-12 bg-[#6f8f3e]/60 rounded-full group-hover:w-16 sm:group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
