import { Building, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CardLinkProps {
  title: string;
  description: string;
  href: string;
  icon: "city" | "reviewers";
}

const iconMap = {
  city: Building,
  reviewers: Users,
};

export const CardLink = ({ title, description, href, icon }: CardLinkProps) => {
  const Icon = iconMap[icon];

  return (
    <Link href={href}>
      <div className="rounded-2xl text-white bg-navy p-5 flex justify-between items-center transition-all duration-200 cursor-pointer group hover:shadow-lg hover:bg-gray-50 hover:text-primary">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 rounded-full p-3 transition-transform duration-200 group-hover:scale-105">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold ">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <ArrowRight className="text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
};
