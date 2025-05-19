import EvaluateProjectClient from "../../../../../components/EvaluateProjectClient";

export default function EvaluateProjectPage({
  params,
}: {
  params: { id: string };
}) {
  return <EvaluateProjectClient projectId={params.id} />;
}
