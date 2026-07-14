"use client";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function GetInTouch() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      city: formData.get("city"),
      phone: formData.get("phone"),
      school: formData.get("school"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycby9mz_bhGTCZDX-AxREq8zuc4cPGCViIdR6EyA6YIoO4NuM-OPMWAO9Vyl-dLaXBvYc/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        toast.success("Thank you! Your request has been submitted.");
        formRef.current?.reset();
      } else if (result.status === "duplicate") {
        toast.error("This email is already registered.");
      } else {
        toast.error("Submission failed. Please try again." + result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again later." + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative bg-gradient-to-br from-slate-50 via-white to-[#e9f2df] py-10 sm:py-12 md:py-14 lg:py-16"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            Get in Touch
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            We would love to help you transform your school digitally
          </p>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
          {/* Left Info Card */}
          <div className="relative order-2 lg:order-1">
            {/* Decorative background effects */}
            <div className="absolute -top-10 sm:-top-20 -left-10 sm:-left-20 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-[#6f8f3e]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -right-10 sm:-right-20 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-blue-200/40 rounded-full blur-3xl"></div>

            {/* Glass Card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 lg:p-10 space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10 border border-white/50 hover:shadow-2xl transition-all duration-300">
              {/* Address */}
              <div className="flex gap-3 sm:gap-4 md:gap-5 items-start pt-5 sm:pt-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#6f8f3e] to-[#5a752f] text-white text-lg sm:text-xl shadow-md">
                  📍
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-500 text-xs sm:text-sm">Our Address</p>
                  <h4 className="font-semibold text-slate-900 text-sm sm:text-base md:text-lg leading-snug mt-1">
                    SchooliAT ERP System<br />
                    Connect with us at:
                  </h4>
                  <p className="text-slate-600 mt-2 text-xs sm:text-sm leading-relaxed">
                    C-205, Shree Jayshree Apartment, Dewanman, <br className="hidden sm:block" />
                    Vasai West, Mumbai, Maharashtra, 401 202, India
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

              {/* Hours */}
              <div className="flex gap-3 sm:gap-4 md:gap-5 items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#6f8f3e] to-[#5a752f] text-white text-lg sm:text-xl shadow-md">
                  ⏰
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-500 text-xs sm:text-sm">Hours of Operation</p>
                  <h4 className="font-semibold text-slate-900 text-sm sm:text-base md:text-lg mt-1">
                    Mon – Sat : 9:30 AM – 6:30 PM
                  </h4>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

              {/* Contact */}
              <div className="flex gap-3 sm:gap-4 md:gap-5 items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#6f8f3e] to-[#5a752f] text-white text-lg sm:text-xl shadow-md">
                  📞
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-slate-500 text-xs sm:text-sm">Contact</p>

                  <div className="space-y-1 mt-1">
                    <a
                      href="tel:+918551919628"
                      className="block text-slate-900 font-medium text-xs sm:text-sm md:text-base break-words hover:text-[#6f8f3e] transition-colors"
                    >
                      +91 8551919628
                    </a>
                    <a
                      href="tel:+918218158916"
                      className="block text-slate-900 font-medium text-xs sm:text-sm md:text-base break-words hover:text-[#6f8f3e] transition-colors"
                    >
                      +91 8218158916
                    </a>
                    <a
                      href="tel:+918318825286"
                      className="block text-slate-900 font-medium text-xs sm:text-sm md:text-base break-words hover:text-[#6f8f3e] transition-colors"
                    >
                      +91 8318825286
                    </a>
                  </div>

                  <a
                    href="mailto:info@schooliat.com"
                    className="text-[#6f8f3e] font-semibold mt-3 text-xs sm:text-sm md:text-base break-words hover:underline block"
                  >
                    info@schooliat.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="relative order-1 lg:order-2">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-[#6f8f3e]/20 blur-2xl rounded-3xl"></div>

            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
              {/* Header strip */}
              <div className="bg-gradient-to-br from-[#6f8f3e] to-[#5a752f] p-4 sm:p-5 md:p-6 text-white">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                  Get Free Demo
                </h3>
                <p className="text-xs sm:text-sm opacity-90 mt-1">
                  See how SchooliAT simplifies school management
                </p>
              </div>

              {/* Form */}
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="p-4 sm:p-5 md:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5"
              >
                <Input name="name" placeholder="Your Name*" />
                <Input name="email" placeholder="Your Email*" />
                <Input name="phone" placeholder="Your Number*" />
                <Input name="school" placeholder="Your School*" />
                <Input name="city" placeholder="Your City*" className="sm:col-span-2" />

                <textarea
                  name="message"
                  placeholder="Message"
                  rows={4}
                  className="sm:col-span-2 w-full rounded-xl border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm placeholder-black/50 text-black/80 focus:ring-2 focus:ring-[#6f8f3e] focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="sm:col-span-2 mt-2 sm:mt-3 md:mt-4 bg-[#6f8f3e] hover:bg-[#5a752f] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-3.5 md:py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#6f8f3e]/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-in-out w-full text-sm sm:text-base disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                >
                  {loading ? "Submitting..." : "🚀 Request Free Demo"}
                </button>

                <p className="sm:col-span-2 text-center text-xs text-gray-500 mt-2">
                  * Smart solution for modern schools. No spam. Ever.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Accent */}
      <div className="absolute left-0 bottom-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 bg-[#6f8f3e] rounded-tr-full opacity-10"></div>
    </section>
  );
}

/* Reusable components */
function Input({
  name,
  placeholder,
  className = "",
}: {
  name: string;
  placeholder: string;
  className?: string;
}) {
  const isRequired = name === "email" || name === "phone" || name === "name";
  return (
    <input
      name={name}
      placeholder={placeholder}
      required={isRequired}
      type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
      className={`w-full rounded-xl text-black/80 border placeholder-black/50 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-[#6f8f3e] focus:outline-none ${className}`}
    />
  );
}
