import Image from "next/image";

const Footer = () => (
  <footer className="flex justify-end p-5 bg-white dark:bg-primary absolute bottom-0 left-0 w-full z-10 shadow-md">
    <div className="flex items-center mx-2">
      <Image
        alt="Logo Gorki"
        className="max-w-[90px] mr-5"
        src="https://styxx-public.s3.sa-east-1.amazonaws.com/gorki.png"
        width={90}
        height={0}
      />
      <div className="flex flex-col">
        <p>
          <strong className="font-semibold">Suporte</strong>
        </p>
        <p>WhatsApp: (16) 98142-3000</p>
        <p>Tel: (16) 3421-9152</p>
        <p>Email: producaocultural@grupoteatralgorki.com</p>
      </div>
    </div>
  </footer>
);

export default Footer;
