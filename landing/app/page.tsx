import Navbar from "./components/Navbar";
import TopBar from "./components/Topbar";
import Hero from "./components/Hero";
import GetInTouch from "./components/GetInTouch";
import FeatureSection from "./components/FeatureSection";
import Footer from "./components/Footer";
import WhatWeProvide from "./components/WhatWeProvide";

export const metadata = {
  title: "SchooliAt – Complete School ERP & Digital Management System",
  description:
    "SchooliAt provides a complete school ERP system including fees, attendance, exams, report cards, parent-teacher communication and school management software.",
  keywords: [
    "School ERP",
    "School Management Software",
    "School ERP India",
    "Digital School System",
    "SchooliAt"
  ],
  authors: [{ name: "SchooliAt" }],
  robots: "index, follow",
  openGraph: {
    title: "SchooliAt – Smart School ERP Platform",
    description:
      "One platform for fees, attendance, exams, communication & school operations.",
    url: "https://schooliat.com",
    siteName: "SchooliAt",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "SchooliAt – School ERP Software Logo",
      },
    ],
    type: "website"
  },

  // ✅ ADD THIS (Dynamic Canonical)
  alternates: {
    canonical: "",
  },
};
export default function Home() {
  return (
    <>
      <main className="w-full overflow-x-hidden">
        <Hero />
        <WhatWeProvide />
        <FeatureSection />
        <GetInTouch />
      </main>
    </>
  );
}
