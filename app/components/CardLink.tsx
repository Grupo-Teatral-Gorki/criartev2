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
      <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 flex justify-between items-center transition-all duration-300 cursor-pointer group hover:shadow-soft-lg hover:scale-[1.02] border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 text-primary-600 dark:text-primary-400 rounded-2xl p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-soft">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200">{description}</p>
          </div>
        </div>
        <ArrowRight className="text-slate-400 dark:text-slate-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary-500 dark:group-hover:text-primary-400" />
      </div>
    </Link>
  );
};
