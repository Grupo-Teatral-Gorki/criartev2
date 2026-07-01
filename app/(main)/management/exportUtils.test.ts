import { buildProjectExportSections } from './exportUtils';

describe('buildProjectExportSections', () => {
  it('agrupa por eixo e módulo para Marília', () => {
    const projects = [
      {
        projectType: 'tipo_a',
        generalInfo: { extra_eixo: 'eixo_1', extra_modulo: 'modulo_i' },
      },
      {
        projectType: 'tipo_a',
        generalInfo: { extra_eixo: 'eixo_1', extra_modulo: 'modulo_ii' },
      },
      {
        projectType: 'tipo_a',
        generalInfo: { extra_eixo: 'eixo_2', extra_modulo: 'modulo_i' },
      },
    ] as any;

    const sections = buildProjectExportSections(projects, {
      cityId: '3594',
      projectTypeLabels: { tipo_a: 'Tipo A' },
      axisLabels: { eixo_1: 'Eixo 1 – Demais Áreas', eixo_2: 'Eixo 2 - Áreas Periféricas' },
      moduleLabels: { modulo_i: 'Módulo I', modulo_ii: 'Módulo II' },
    });

    expect(sections).toHaveLength(1);
    expect(sections[0].typeName).toBe('Tipo A');
    expect(sections[0].axisGroups.map((group) => group.axisName)).toEqual(['Eixo 1 – Demais Áreas', 'Eixo 2 - Áreas Periféricas']);
    expect(sections[0].axisGroups[0].moduleGroups.map((group) => group.moduleName)).toEqual(['Módulo I', 'Módulo II']);
  });

  it('agrupa por eixo e módulo para qualquer cidade quando labels estiverem definidos', () => {
    const projects = [
      {
        projectType: 'tipo_a',
        generalInfo: { escolha_o_eixo: 'eixo_1', escolha_o_modulo: 'modulo_i' },
      },
      {
        projectType: 'tipo_a',
        generalInfo: { escolha_o_eixo: 'eixo_1', escolha_o_modulo: 'modulo_ii' },
      },
      {
        projectType: 'tipo_a',
        generalInfo: { escolha_o_eixo: 'eixo_2', escolha_o_modulo: 'modulo_i' },
      },
    ] as any;

    const sections = buildProjectExportSections(projects, {
      cityId: '1234',
      projectTypeLabels: { tipo_a: 'Tipo A' },
      axisLabels: { eixo_1: 'Eixo 1 – Demais Áreas', eixo_2: 'Eixo 2 - Áreas Periféricas' },
      moduleLabels: { modulo_i: 'Módulo I', modulo_ii: 'Módulo II' },
    });

    expect(sections).toHaveLength(1);
    expect(sections[0].typeName).toBe('Tipo A');
    expect(sections[0].axisGroups.map((group) => group.axisName)).toEqual(['Eixo 1 – Demais Áreas', 'Eixo 2 - Áreas Periféricas']);
    expect(sections[0].axisGroups[0].moduleGroups.map((group) => group.moduleName)).toEqual(['Módulo I', 'Módulo II']);
  });
});
