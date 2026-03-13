import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import MarkdownPage from "@/components/MarkdownPage";

type LegalPageParams = {
  slug: string;
};

type LegalPageProps = {
  params: Promise<LegalPageParams>;
};

const LEGAL_CONTENT_DIR = path.join(process.cwd(), "content", "legal");

function getMarkdownFilePath(slug: string): string {
  return path.join(LEGAL_CONTENT_DIR, `${slug}.md`);
}

function getLegalContent(slug: string): string | null {
  const markdownFilePath = getMarkdownFilePath(slug);

  if (!fs.existsSync(markdownFilePath)) {
    return null;
  }

  return fs.readFileSync(markdownFilePath, "utf8");
}

export async function generateStaticParams(): Promise<LegalPageParams[]> {
  if (!fs.existsSync(LEGAL_CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(LEGAL_CONTENT_DIR);

  return files
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => ({ slug: fileName.replace(/\.md$/, "") }));
}

export default async function LegalDocumentPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const markdownContent = getLegalContent(slug);

  if (!markdownContent) {
    notFound();
  }

  return <MarkdownPage content={markdownContent} />;
}
