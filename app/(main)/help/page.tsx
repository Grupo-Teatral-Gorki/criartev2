import { Clock } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="flex items-center justify-center transition-colors mt-20">
      <div className="text-center p-8 rounded-2xl shadow-soft bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50">
        <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-4">
          Página em Desenvolvimento
        </h1>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
          Estamos trabalhando para trazer essa funcionalidade em breve.
        </p>
        <div className="animate-fade-in-left flex items-center justify-center mb-4">
          <Clock className="w-24 h-24 text-primary-600 dark:text-primary-400" />
        </div>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">Enquanto isso, entre em contato conosco:</p>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">WhatsApp: (16) 98142-3000</p>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">Tel: (16) 3421-9152</p>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">Email: producaocultural@grupoteatralgorki.com</p>
      </div>
    </div>
  );
}
