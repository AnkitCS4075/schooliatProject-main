"use client";
import { Phone, Mail, MapPin } from "lucide-react";

export default function TopBar() {
  return (
    <div className="w-full bg-slate-900 text-slate-100 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          {/* Left Info */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-4 lg:gap-6 flex-wrap">
            <a
              href="tel:+918551919628"
              className="flex items-center gap-1.5 sm:gap-2 hover:text-emerald-400 transition-colors"
              aria-label="Call us"
            >
              <Phone size={12} className="sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">+91 8551919628</span>
            </a>

            <span className="hidden xs:block text-slate-500">|</span>

            <a
              href="mailto:info@schooliat.com"
              className="flex items-center gap-1.5 sm:gap-2 hover:text-emerald-400 transition-colors"
              aria-label="Email us"
            >
              <Mail size={12} className="sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">info@schooliat.com</span>
            </a>

            <span className="hidden xs:block text-slate-500">|</span>

            <span className="flex items-center gap-1.5 sm:gap-2">
              <MapPin size={12} className="sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Mumbai, India</span>
            </span>
          </div>

          {/* Right Social Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="#"
              className="hover:text-emerald-400 transition-colors"
              aria-label="YouTube"
            >
              <i className="ri-youtube-fill text-base sm:text-lg"></i>
            </a>
            <a
              href="#"
              className="hover:text-emerald-400 transition-colors"
              aria-label="Facebook"
            >
              <i className="ri-facebook-fill text-base sm:text-lg"></i>
            </a>
            <a
              href="#"
              className="hover:text-emerald-400 transition-colors"
              aria-label="LinkedIn"
            >
              <i className="ri-linkedin-fill text-base sm:text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
