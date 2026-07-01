export type ExportSection = {
  typeName: string;
  axisGroups: Array<{
    axisName: string;
    moduleGroups: Array<{
      moduleName: string;
      projects: any[];
    }>;
  }>;
};

const DEFAULT_AXIS_NAME = 'Sem eixo';
const DEFAULT_MODULE_NAME = 'Sem módulo';

const normalizeValue = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
};

const resolveLabel = (
  value: unknown,
  labels: Record<string, string>,
  fallback: string,
  fallbackValue?: string
): string => {
  const normalizedValue = normalizeValue(value);
  if (normalizedValue && labels[normalizedValue]) {
    return labels[normalizedValue];
  }

  if (normalizedValue && fallbackValue && normalizedValue === fallbackValue) {
    return fallback;
  }

  return normalizedValue || fallback;
};

export const buildProjectExportSections = (
  projects: any[],
  options: {
    cityId?: string | number | null;
    projectTypeLabels?: Record<string, string>;
    axisLabels?: Record<string, string>;
    moduleLabels?: Record<string, string>;
  } = {}
): ExportSection[] => {
  const { cityId, projectTypeLabels = {}, axisLabels = {}, moduleLabels = {} } = options;

  const normalizedProjects = Array.isArray(projects) ? projects : [];
  const groupedByType: Record<string, any[]> = {};

  normalizedProjects.forEach((project) => {
    const type = project.projectType || 'Sem tipo';
    const displayType = projectTypeLabels[type] || type;
    if (!groupedByType[displayType]) groupedByType[displayType] = [];
    groupedByType[displayType].push(project);
  });

  return Object.entries(groupedByType)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([typeName, typeProjects]) => {
      const axisGroups: ExportSection['axisGroups'] = [];
      const byAxis: Record<string, any[]> = {};

      typeProjects.forEach((project) => {
        const axisValue =
          project.generalInfo?.extra_eixo ||
          project.generalInfo?.escolha_o_eixo ||
          project.generalInfo?.eixo ||
          project.generalInfo?.axis ||
          '';
        const axisName = resolveLabel(axisValue, axisLabels, DEFAULT_AXIS_NAME);
        if (!byAxis[axisName]) byAxis[axisName] = [];
        byAxis[axisName].push(project);
      });

      Object.entries(byAxis)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([axisName, axisProjects]) => {
          const moduleGroups: ExportSection['axisGroups'][number]['moduleGroups'] = [];
          const byModule: Record<string, any[]> = {};

          axisProjects.forEach((project) => {
            const moduleValue =
              project.generalInfo?.extra_modulo ||
              project.generalInfo?.escolha_o_modulo ||
              project.generalInfo?.modulo ||
              project.generalInfo?.module ||
              '';
            const moduleName = resolveLabel(moduleValue, moduleLabels, DEFAULT_MODULE_NAME);
            if (!byModule[moduleName]) byModule[moduleName] = [];
            byModule[moduleName].push(project);
          });

          Object.entries(byModule)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([moduleName, projects]) => {
              moduleGroups.push({ moduleName, projects });
            });

          axisGroups.push({ axisName, moduleGroups });
        });

      return { typeName, axisGroups };
    });
};
