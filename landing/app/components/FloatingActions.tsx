"use client";

import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function FloatingActions() {
  const phoneNumber = "+918551919628";
  const whatsappMessage = encodeURIComponent(
    "Hello SchooliAT, I would like to know more about your School ERP."
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

  return (
    <div className="fixed right-3 sm:right-4 md:right-5 bottom-3 sm:bottom-4 md:bottom-5 z-50 flex flex-col gap-2 sm:gap-3">
      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl hover:shadow-green-500/40 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-in-out"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-white text-xl sm:text-2xl md:text-3xl" />
      </a>

      {/* Call */}
      <a
        href="tel:+918551919628"
        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl hover:shadow-orange-500/40 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-in-out"
        aria-label="Call us"
      >
        <FaPhoneAlt className="text-white text-base sm:text-lg md:text-xl" />
      </a>
    </div>
  );
}
