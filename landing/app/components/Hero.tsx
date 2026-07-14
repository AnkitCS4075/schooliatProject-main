"use client";
import Image from "next/image";
import { useState } from "react";
import ScholiAt_Hero_section_Image from "@/public/images/ScholiAt_Hero_section_Image.png";
import BookDemoModal from "./BookDemoModal";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <BookDemoModal open={isModalOpen} onClose={closeModal} />
      <section className="bg-white py-8 sm:py-10 md:py-12 lg:py-16 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <span className="inline-block mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-[#6f8f3e] bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                School Management Platform
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight mt-4 sm:mt-6">
                SchooliAT{" "}
                <span className="text-[#6f8f3e] block sm:inline mt-1 sm:mt-0">
                  | School Management App
                </span>
              </h1>

              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                SchooliAT is a{" "}
                <strong className="text-slate-900">
                  smart, secure, and AI Powered School Management App
                </strong>{" "}
                focused on simplifying school operations and improving communication
                between <strong className="text-slate-900">schools, parents, and teachers</strong>.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button
                  onClick={openModal}
                  className="bg-[#6f8f3e] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg hover:bg-[#5a752f] transition-all duration-300 ease-in-out w-full sm:w-auto font-medium text-sm sm:text-base shadow-md hover:shadow-xl hover:shadow-[#6f8f3e]/30 hover:-translate-y-1 active:scale-95"
                >
                  Book a Demo →
                </button>
              </div>
            </div>

            {/* Right Side Image */}
            <div className="relative mt-4 sm:mt-6 lg:mt-0 order-1 lg:order-2">
              <div className="relative w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/3]">
                <Image
                  src={ScholiAt_Hero_section_Image}
                  alt="SchooliAT ERP Dashboard"
                  fill
                  className="rounded-xl sm:rounded-2xl shadow-xl object-cover"
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
