import fs from "fs";
import path from "path";
import PoliticaDadosClient from "./PoliticaDadosClient";

const POLICY_VERSION = "pending-policy-text-v1";
const DATA_POLICY_PATH = path.join(process.cwd(), "content", "legal", "data-policy.md");

function getPolicyContent(): string {
  if (!fs.existsSync(DATA_POLICY_PATH)) {
    return "# Política de Dados\n\nDocumento de política não encontrado.";
  }

  return fs.readFileSync(DATA_POLICY_PATH, "utf8");
}

export default function PoliticaDadosPage() {
  const policyContent = getPolicyContent();

  return (
    <PoliticaDadosClient
      policyContent={policyContent}
      policyVersion={POLICY_VERSION}
    />
  );
}
