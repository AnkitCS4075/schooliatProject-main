import type { Metadata } from "next";
import TeamImage from "../components/TeamImage";

export const metadata: Metadata = {
  title: "About Us – SchooliAt",
  description:
    "Meet the leadership team behind SchooliAt, building people-centric and scalable ERP solutions for schools.",
  alternates: { canonical: "https://schooliat.com/about" },
};

const team = [
  {
    name: "Anusha R. Srivastava",
    role: "Co-Founder",
    image: "/team/anusha.jpg",
    description:
      "MBA in Human Resources from MONIRBA, Allahabad University. Experienced in managing large-scale hiring operations and leading teams of 200+ employees, bringing people-centric and structured workflows to SchooliAt.",
  },
  {
    name: "Nitin Ghanshyam Upadhyay",
    role: "Co-Founder",
    image: "/team/nitin.jpg",
    description:
      "MBA in Finance from MONIRBA, Allahabad University. Former Education Counselor guiding 500+ students, with strong experience in MSME and FPO procurement operations, ensuring scalable and process-driven systems.",
  },
  {
    name: "Gaurav Prajapati",
    role: "Co-Founder",
    image: "/team/Gaurav-developer.jpg",
    description:
      "MCA candidate from HBTU, Kanpur with hands-on expertise in MERN stack, PHP, and modern web technologies, leading SchooliAt's technical architecture and product scalability.",
  },
  {
    name: "Shivam Kumar",
    role: "Co-Founder",
    image: "/team/Shivam.jpg",
    description:
      "MBA graduate from MONIRBA, Allahabad University, with hands-on teaching experience. His practical understanding of classroom and academic workflows helps us design ERP solutions that genuinely support teachers and students.",
  },
  {
    name: "Amit Verma",
    role: "Co-Founder",
    image: "/team/amit.jpg",
    description:
      "Co-Founder at SchooliAt, collaborating with the founding team to build a reliable school management platform focused on simplicity, scalability, and operational efficiency.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-[#1f2937]">
      {/* HERO */}
      <section className="bg-[#f6fbf1] py-10 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
            About <span className="text-[#6f8f3e]">SchooliAt</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#4b5563] leading-relaxed max-w-3xl mx-auto">
            SchooliAt is built with a mission to simplify school management
            through reliable, scalable, and people-centric ERP solutions. We
            combine technology, operational experience, and educational insight
            to create systems that truly work for schools.
          </p>
        </div>
      </section>

      {/* TEAM INTRO */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4">
            Meet the Team Behind SchooliAt
          </h2>
          <p className="text-[#4b5563] text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            A leadership team combining education, operations, and technology to
            build practical ERP solutions for modern schools.
          </p>
        </div>
      </section>

      {/* TEAM CARDS */}
      <section className="pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-[#e9f2df] rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4] sm:aspect-[4/5]">
                <TeamImage
                  src={member.image}
                  alt={`${member.name} - ${member.role}`}
                  priority={index < 3}
                />

                {/* Name Badge */}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-white px-2 sm:px-3 py-1 rounded-full shadow text-xs sm:text-sm font-medium z-10">
                  {member.name}
                </div>
              </div>

              {/* Index */}
              <div className="mt-4 sm:mt-5 text-xs sm:text-sm font-semibold text-[#6f8f3e]">
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* Role */}
              <h3 className="mt-1 text-base sm:text-lg md:text-xl font-semibold">
                {member.role}
              </h3>

              {/* Description */}
              <p className="mt-2 text-xs sm:text-sm md:text-base text-[#4b5563] leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* VISION */}
      <section className="bg-[#f6fbf1] py-10 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4">
            Our Vision
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#4b5563] leading-relaxed max-w-3xl mx-auto">
            To become a trusted digital partner for schools by delivering
            secure, scalable, and easy-to-use ERP solutions that improve
            efficiency, transparency, and collaboration across the education
            ecosystem.
          </p>
        </div>
      </section>
    </main>
  );
}
