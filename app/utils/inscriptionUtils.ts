export type CityWithProjects = {
  processStage?: string;
  typesOfProjects?: Array<{ name: string; label?: string; available?: boolean }>;
};

export function isCityInscriptionOpen(
  city: CityWithProjects | null | undefined
): boolean {
  return city?.processStage === "open";
}

export function isProjectTypeInscriptionOpen(
  city: CityWithProjects | null | undefined,
  projectTypeName: string | null | undefined
): boolean {
  if (!isCityInscriptionOpen(city)) return false;
  if (!projectTypeName) return false;

  const types = city?.typesOfProjects;
  if (!Array.isArray(types)) return true;

  const config = types.find((p) => p?.name === projectTypeName);
  if (!config) return false;

  return config.available !== false;
}

export function hasAnyOpenInscription(
  city: CityWithProjects | null | undefined
): boolean {
  if (!isCityInscriptionOpen(city)) return false;

  const types = city?.typesOfProjects;
  if (!Array.isArray(types) || types.length === 0) return true;

  return types.some((p) => p.available !== false);
}
