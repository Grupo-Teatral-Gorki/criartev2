import Image from "next/image";

const Footer = () => (
  <footer className="flex justify-end p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 absolute bottom-0 left-0 w-full z-10 shadow-soft">
    <div className="flex items-center mx-2">
      <Image
        alt="Logo Gorki"
        className="max-w-[90px] mr-5 rounded-lg"
        src="https://styxx-public.s3.sa-east-1.amazonaws.com/gorki.png"
        width={90}
        height={0}
      />
      <div className="flex flex-col text-slate-700 dark:text-slate-300">
        <p className="mb-2">
          <strong className="font-semibold text-slate-900 dark:text-slate-100">Suporte</strong>
        </p>
        <p className="text-sm">WhatsApp: (16) 98142-3000</p>
        <p className="text-sm">Tel: (16) 3421-9152</p>
        <p className="text-sm">Email: producaocultural@grupoteatralgorki.com</p>
      </div>
    </div>
  </footer>
);

export default Footer;
