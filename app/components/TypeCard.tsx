import Link from "next/link";

interface TypeCardProps {
  title: string;
  description?: string;
  link: string;
  linkString: string;
}

const TypeCard = ({ title, link, description, linkString }: TypeCardProps) => {
  return (
    <div className="flex flex-col items-center justify-around gap-6 bg-slate-100 p-8 rounded-3xl min-w-[170px] min-h-[100px]">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-sm text-justify">{description}</p>}
      <Link
        href={link}
        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-soft hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02]"
      >
        {linkString}
      </Link>
    </div>
  );
};

export default TypeCard;
