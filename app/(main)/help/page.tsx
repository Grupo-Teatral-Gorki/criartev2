import { Clock } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="flex items-center justify-center transition-colors mt-20">
      <div className="text-center p-8 rounded-2xl shadow-lg bg-white dark:bg-navy">
        <h1 className="text-4xl font-bold text-primary dark:text-orange mb-4">
          Página em Desenvolvimento
        </h1>
        <p className="text-lg text-navy dark:text-light mb-6">
          Estamos trabalhando para trazer essa funcionalidade em breve.
        </p>
        <div className="animate-fade-in-left">
          <Clock className="w-24 h-24 text-primary dark:text-orange" />
        </div>
      </div>
    </div>
  );
}
