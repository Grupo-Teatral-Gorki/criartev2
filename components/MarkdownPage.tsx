import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownPageProps = {
  content: string;
};

export default function MarkdownPage({ content }: MarkdownPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <article
        className="mx-auto w-full max-w-[780px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-10 text-slate-800 dark:text-slate-100 shadow-soft
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6
          [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4
          [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
          [&_p]:leading-7 [&_p]:mb-4
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-2
          [&_strong]:font-semibold"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </main>
  );
}
