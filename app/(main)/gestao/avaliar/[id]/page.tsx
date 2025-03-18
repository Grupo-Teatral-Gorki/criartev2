/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Button from "@/app/components/Button";
import Tabs from "@/app/components/Tabs";
import { TextAreaInput } from "@/app/components/TextAreaInput";
import { TextInput } from "@/app/components/TextInput";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EvaluationTable from "@/app/components/EvaluationTable";
import { useState } from "react";

const AvaliarProjeto = () => {
  const router = useRouter();

  const projeto = {
    id_projeto: "2379",
    nome_projeto: "Desenvolvimento de Plataforma de Educação Online",
    id_proponente: "1",
    id_area: "3",
    data_prevista_inicio: "2024-05-01T00:00:00.000Z",
    data_prevista_fim: "2025-05-01T00:00:00.000Z",
    resumo_projeto:
      "Plataforma digital para cursos de qualificação profissional voltada para jovens em situação de vulnerabilidade.",
    descricao:
      "O projeto tem como objetivo criar uma plataforma online com cursos gratuitos de qualificação profissional, visando à inclusão digital e ao aumento de empregabilidade para jovens em situação de vulnerabilidade social. A plataforma contará com aulas interativas, testes de conhecimento e acompanhamento de progressão.",
    objetivos:
      "Desenvolver uma plataforma de cursos online com módulos interativos e avaliações. Capacitar 5.000 jovens nos próximos dois anos.",
    justificativa_projeto:
      "A falta de acesso a cursos de qualificação profissional é um obstáculo para a empregabilidade de jovens em áreas periféricas. A plataforma tem o objetivo de preencher essa lacuna e proporcionar oportunidades de desenvolvimento profissional.",
    contrapartida_projeto:
      "A plataforma se comprometerá a disponibilizar cursos gratuitos a comunidades carentes e a realizar workshops e palestras de capacitação para educadores locais.",
    plano_democratizacao:
      "O projeto buscará parcerias com ONGs e instituições educacionais para ampliar o acesso à plataforma e garantir a inclusão digital de jovens e adultos em áreas de difícil acesso.",
    outras_informacoes:
      "O projeto será executado em colaboração com escolas públicas e centros de treinamento profissional, visando ao alcance de um maior número de beneficiários.",
    ingresso: true,
    valor_ingresso: "150.00", // Valor de ingresso para cursos pagos
    id_edital: "3", // Representando o edital específico que o projeto se inscreveu
    id_modalidade: "2", // Modalidade "Educação e Capacitação"
    status: "em andamento", // O status do projeto, por exemplo, "pendente", "em andamento", "concluído"
    id_usuario: "456", // ID do usuário responsável pelo projeto
    relevancia_pertinencia:
      "O projeto contribui para a redução das desigualdades sociais por meio da educação e da inclusão digital.",
    perfil_publico:
      "Jovens entre 16 e 30 anos em situação de vulnerabilidade social, com baixa escolaridade e desempregados.",
    classificacao_indicativa: "Livre", // Indicando que o conteúdo é adequado para qualquer público
    qtd_publico: "5000", // Número estimado de participantes no projeto
    proposta_contrapartida:
      "A contrapartida será a criação de vagas de estágio para os melhores alunos dos cursos, permitindo que eles ganhem experiência prática no mercado de trabalho.",
    plano_divulgacao:
      "A divulgação será feita por meio de redes sociais, parcerias com influenciadores digitais e campanhas em rádios comunitárias locais.",
    nome_modalidade: "Educação e Capacitação", // Nome da modalidade de edital
    is_cotista: true, // Indica que o projeto oferece vagas para cotistas (alunos de baixa renda ou em situação de vulnerabilidade)
  };

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center px-36 gap-8">
      {/* Header */}
      <div className="w-full flex justify-between bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/home")}
          size="medium"
        />
        <h2 className="text-2xl font-bold">Avaliar Projeto</h2>
        <Button label={"Enviar Avaliação"} size="medium" />
      </div>
      <div className="bg-slate-100 w-full flex flex-col items-center justify-center px-8">
        <p className="text-2xl p-4 mt-6 dark:text-bgDark">
          Você está avaliando o projeto {projeto.nome_projeto} com ID:{" "}
          {projeto.id_projeto}
        </p>
        <Tabs
          tabs={[
            {
              label: "Projeto",
              content: <RenderProjeto projeto={projeto} />,
            },
            {
              label: "Documentos",
              content: <RenderDocumentos />,
            },
            {
              label: "Ficha Avaliativa",
              content: <RenderFichaAvaliativa />,
            },
          ]}
        />
      </div>

      {/* Add more functionality to evaluate the project here */}
    </div>
  );
};

export default AvaliarProjeto;

const RenderProjeto = (projeto: any) => {
  console.log("projeto", projeto);
  return (
    <>
      <div className="w-full grid grid-cols-4 gap-8 mt-5">
        <TextInput
          value={projeto.projeto.id_edital}
          label="ID Edital"
          disabled
        />
        <TextInput value={projeto.projeto.id_area} label="ID Area" disabled />
        <TextInput
          value={projeto.projeto.ingresso ? "Sim" : "Não"}
          label="Ingresso"
          disabled
        />
        <TextInput
          value={projeto.projeto.classificacao_indicativa}
          label="Classificação Indicativa"
          disabled
        />
        <TextInput
          value={projeto.projeto.nome_modalidade}
          label="Nome Modalidade"
          disabled
        />
        <TextInput
          value={projeto.projeto.is_cotista ? "Sim" : "Não"}
          label="Cotista"
          disabled
        />
        <TextInput
          value={projeto.projeto.qtd_publico}
          label="Qtde Público"
          disabled
        />
      </div>
      <div className="w-full grid grid-cols-2 gap-5 mt-8">
        <TextAreaInput
          className="h-[200px]"
          value={projeto.projeto.resumo_projeto}
          label="Resumo do Projeto"
          disabled
        />

        <TextAreaInput
          value={projeto.projeto.descricao}
          label="Descrição"
          disabled
          className="h-[200px]"
        />

        <TextAreaInput
          value={projeto.projeto.objetivos}
          label="Objetivos"
          disabled
          className="h-[200px]"
        />

        <TextAreaInput
          value={projeto.projeto.justificativa_projeto}
          className="h-[200px]"
          label="Justificativa do Projeto"
          disabled
        />

        <TextAreaInput
          value={projeto.projeto.contrapartida_projeto}
          className="h-[200px]"
          label="Contrapartida do Projeto"
          disabled
        />

        <TextAreaInput
          value={projeto.projeto.plano_democratizacao}
          className="h-[200px]"
          label="Plano de Democratização"
          disabled
        />

        <TextAreaInput
          value={projeto.projeto.outras_informacoes}
          className="h-[200px]"
          label="Outras Informações"
          disabled
        />

        <TextAreaInput
          value={projeto.projeto.relevancia_pertinencia}
          className="h-[200px]"
          label="Relevância e Pertinência"
          disabled
        />

        <TextAreaInput
          value={projeto.projeto.perfil_publico}
          className="h-[200px]"
          label="Perfil do Público"
          disabled
        />

        <TextAreaInput
          value={projeto.projeto.proposta_contrapartida}
          className="h-[200px]"
          label="Proposta de Contrapartida"
          disabled
        />

        <TextAreaInput
          value={projeto.projeto.plano_divulgacao}
          className="h-[200px]"
          label="Plano de Divulgação"
          disabled
        />
      </div>
    </>
  );
};

const RenderDocumentos = () => {
  return (
    <div className="mt-5 grid grid-cols-2 gap-8">
      <iframe
        src="https://styxx-public.s3.sa-east-1.amazonaws.com/editalPontal.pdf"
        width="100%"
        height="600px"
      />
      <Image
        src="https://styxx-public.s3.sa-east-1.amazonaws.com/governo-federal-logo.png"
        alt="S3 Image"
        width={500}
        height={300}
      />

      <Image
        src="https://styxx-public.s3.sa-east-1.amazonaws.com/governo-federal-logo.png"
        alt="S3 Image"
        width={500}
        height={300}
      />
      <iframe
        src="https://styxx-public.s3.sa-east-1.amazonaws.com/editalPontal.pdf"
        width="100%"
        height="600px"
      />
    </div>
  );
};

const RenderFichaAvaliativa = () => {
  const [average, setAverage] = useState<number>(0);

  const calculateAverage = (scores: any[]) => {
    const totalScores = scores.reduce(
      (sum, row) =>
        sum +
        (typeof row[row.length - 1] === "number" ? row[row.length - 1] : 0),
      0
    );
    const average = totalScores / scores.length;
    return average;
  };

  const handleScoresUpdate = (updatedScores: any[]) => {
    // Calculate the average of the updated scores
    const calculation = calculateAverage(updatedScores);
    setAverage(calculation);
  };

  const HEADERS = ["Critério", "Descrição do Critério", "Pontuação"];

  const ROWS = [
    ["A", "Interesse público do projeto", ""],
    [
      "B",
      "Relevância, atendimento à diversidade cultural e criatividade do projeto",
      "",
    ],
    ["C", "Acessibilidade e inclusão", ""],
    ["D", "Viabilidade de realização do projeto", ""],
    [
      "E",
      "Comprovação da experiência do proponente e dos integrantes envolvidos no projeto",
      "",
    ],
  ];

  return (
    <div>
      <EvaluationTable
        headers={HEADERS}
        rows={ROWS}
        onScoresUpdate={handleScoresUpdate}
      />
      <div className="w-full flex items-center justify-end p-4">
        <h2 className="text-2xl mr-4">
          Avaliação Final: {average ? average : ""}
        </h2>
      </div>
    </div>
  );
};
