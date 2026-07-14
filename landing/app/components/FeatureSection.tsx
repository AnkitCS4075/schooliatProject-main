import React from "react";

const features = [
  {
    title: "School Admin",
    items: [
      "Dashboard & Analytics",
      "Staff Management",
      "Student Management",
      "Timetable Management",
      "Inventory Management",
      "Transport Management",
      "Payroll Management",
    ],
  },
  {
    title: "Teacher",
    items: [
      "Secure Login",
      "Class & Section Selection",
      "Attendance Marking",
      "Homework Assignment",
      "Marks & Result Entry",
      "Student List Management",
    ],
  },
  {
    title: "Parents / Students",
    items: [
      "Login & Registration",
      "Student Dashboard",
      "Attendance Tracking",
      "Homework & Notices",
      "Fees & Transport Info",
      "Awards & Results",
      "Communication & Alerts",
    ],
  },
];

export default function FeatureSection() {
  return (
    <section
      className="bg-[#e9f2df] py-10 sm:py-12 md:py-14 lg:py-16 border-b border-[#6f8f3e]/20"
      id="features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#6f8f3e]">
            Powerful Features for Every Role
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto px-4">
            SchooliAT simplifies school operations by connecting administrators,
            teachers, parents, and students on one smart platform.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 border-t-4 border-[#6f8f3e] transform hover:-translate-y-1"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#6f8f3e] mb-4 sm:mb-6">
                {feature.title}
              </h3>

              <ul className="space-y-2.5 sm:space-y-3">
                {feature.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-800"
                  >
                    <span className="mt-1.5 sm:mt-2 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#6f8f3e] flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
