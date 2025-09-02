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
        <div className="animate-fade-in-left">
          <Clock className="w-24 h-24 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </div>
  );
}
