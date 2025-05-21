import EvaluateProjectClient from "../../../../../components/EvaluateProjectClient";

export default async function EvaluateProjectPage({
  params,
}: {
  params: { id: string };
}) {
  return <EvaluateProjectClient projectId={params.id} />;
}
