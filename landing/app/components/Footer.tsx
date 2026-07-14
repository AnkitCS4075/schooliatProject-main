import Link from "next/link";
import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#6f8f3e] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide">
              SchooliAT
            </h2>
            <p className="text-xs sm:text-sm text-[#e9f2df] mt-3 sm:mt-4 leading-relaxed">
              SchooliAT is a smart school management platform that simplifies
              attendance, homework, communication, and academic tracking for
              schools, teachers, parents, and students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#e9f2df]">
              <li className="hover:text-white cursor-pointer transition-colors">
                <Link href="/">Home</Link>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                <a href="/about">About Us</a>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                <Link href="#features">Features</Link>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                <Link href="#contact">Contact Us</Link>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                <Link href="/opportunity">Opportunity</Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              Solutions
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#e9f2df]">
              <li>Attendance Management</li>
              <li>Homework & Notices</li>
              <li>Fees & Transport</li>
              <li>Parent–Teacher Communication</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#e9f2df]">
              <li>📍 Mumbai, India</li>
              <li>
                <a
                  href="tel:+918551919628"
                  className="hover:text-white transition-colors"
                >
                  📞 +91 8551919628
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@schooliat.com"
                  className="hover:text-white transition-colors break-all"
                >
                  📧 info@schooliat.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#e9f2df] text-center sm:text-left">
            <p>© {currentYear} SchooliAT. All rights reserved.</p>
            <p className="sm:mt-0">
              Designed & Developed by NEXTIN VISION 
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
