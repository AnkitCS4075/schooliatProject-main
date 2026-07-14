import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Career Opportunities at SchooliAt | Work With Us",
    description:
        "Explore career opportunities at SchooliAt. Join our mission to transform school management with smart, secure, and scalable ERP solutions.",
    keywords: [
        "SchooliAt Careers",
        "School ERP Jobs",
        "Education Technology Jobs",
        "EdTech Jobs India",
    ],
    robots: "index, follow",
    alternates: {
        canonical: "https://schooliat.com/opportunity",
    },
    openGraph: {
        title: "Career Opportunities at SchooliAt",
        description:
            "Join SchooliAt and help build next-generation school ERP solutions.",
        url: "https://schooliat.com/opportunity",
        siteName: "SchooliAt",
        type: "website",
    },
};

export default function OpportunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
