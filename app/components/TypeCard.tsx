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
        className="px-6 py-3 bg-primary text-slate-100 font-semibold rounded-lg shadow-md hover:bg-buttonHover focus:outline-none focus:ring-2 focus:ring-buttonHover focus:ring-opacity-75 transition duration-150 ease-in-out"
      >
        {linkString}
      </Link>
    </div>
  );
};

export default TypeCard;
