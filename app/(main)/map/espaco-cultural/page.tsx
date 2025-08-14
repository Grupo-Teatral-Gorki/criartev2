/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ChangeEvent, Suspense, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { getDownloadURL, uploadBytes, ref } from "firebase/storage";
import { useRouter } from "next/navigation";
import { db, storage } from "@/app/config/firebaseconfig";
import { useCity } from "@/app/context/CityConfigContext";

const inputFields = [
  {
    name: "nomeEntidadeCultural",
    type: "text",
    placeholder: "Nome da Entidade Cultural",
    label: "Nome da Entidade Cultural",
    required: true,
  },
  {
    name: "cnpj",
    type: "text",
    placeholder: "CNPJ",
    label: "CNPJ",
    required: true,
  },
  {
    name: "endereco",
    type: "text",
    placeholder: "Endereço",
    label: "Endereço",
    required: true,
  },
  {
    name: "numero",
    type: "text",
    placeholder: "Número",
    label: "Número",
    required: true,
  },
  {
    name: "bairro",
    type: "text",
    placeholder: "Bairro",
    label: "Bairro",
    required: true,
  },
  {
    name: "cidade",
    type: "text",
    placeholder: "Cidade",
    label: "Cidade",
    required: true,
  },
  {
    name: "complemento",
    type: "text",
    placeholder: "Complemento",
    label: "Complemento",
    required: false,
  },
  {
    name: "cep",
    type: "text",
    placeholder: "CEP",
    label: "CEP",
    required: true,
  },
  {
    name: "dddTelefone",
    type: "text",
    placeholder: "DDD/Telefone",
    label: "DDD/Telefone",
    required: true,
  },
  {
    name: "emailEntidadeCultural",
    type: "email",
    placeholder: "E-mail da Entidade Cultural",
    label: "E-mail da Entidade Cultural",
    required: true,
  },
  {
    name: "siteRedesSociais",
    type: "text",
    placeholder: "Site ou Redes Sociais",
    label: "Site ou Redes Sociais",
    required: false,
  },
];

const personInfoFields = [
  {
    id: "nomeSocial",
    name: "nomeSocial",
    value: "nomeSocial",
    display: "Nome/Nome Social",
    type: "text",
    placeholder: "Nome/Nome Social",
    required: true,
  },
  {
    id: "apelido",
    name: "apelido",
    value: "apelido",
    display: "Apelido/Nome Artístico",
    type: "text",
    placeholder: "Apelido/Nome Artístico",
    required: false,
  },
  {
    id: "cargo",
    name: "cargo",
    value: "cargo",
    display: "Cargo",
    type: "text",
    placeholder: "Cargo",
    required: true,
  },
];

const certificationOptions = [
  {
    id: "pontoCultura",
    name: "tipoCertificacao",
    value: "pontoCultura",
    display: "Sim, como Ponto de Cultura",
  },
  {
    id: "pontaoCultura",
    name: "tipoCertificacao",
    value: "pontaoCultura",
    display: "Sim, como Pontão de Cultura",
  },
  {
    id: "pretendeCertificacao",
    name: "tipoCertificacao",
    value: "pretendeCertificacao",
    display:
      "Não, a entidade pretende ser certificada como Ponto de Cultura por meio deste cadastro",
  },
];

const genderOptions = [
  {
    id: "mulhercisgenero",
    name: "mulhercisgenero",
    value: "mulhercisgenero",
    display: "Mulher cisgênero",
  },
  {
    id: "homemcisgenero",
    name: "homemcisgenero",
    value: "homemcisgenero",
    display: "Homem cisgênero",
  },
  {
    id: "mulhertransgenero",
    name: "mulhertransgenero",
    value: "mulhertransgenero",
    display: "Mulher Transgênero",
  },
  {
    id: "homemtransgenero",
    name: "homemtransgenero",
    value: "homemtransgenero",
    display: "Homem Transgênero",
  },
  {
    id: "pessoanaobinaria",
    name: "pessoanaobinaria",
    value: "pessoanaobinaria",
    display: "Pessoa Não Binária",
  },
  {
    id: "travesti",
    name: "travesti",
    value: "travesti",
    display: "Travesti",
  },
  {
    id: "naoinformar",
    name: "naoinformar",
    value: "naoinformar",
    display: "Não informar",
  },
  {
    id: "outra",
    name: "outra",
    value: "outra",
    display: "Outra",
  },
];

const sexualOrientationOptions = [
  {
    id: "lesbica",
    name: "orientacaoSexual",
    value: "lesbica",
    display: "Lésbica",
  },
  {
    id: "gay",
    name: "orientacaoSexual",
    value: "gay",
    display: "Gay",
  },
  {
    id: "bissexual",
    name: "orientacaoSexual",
    value: "bissexual",
    display: "Bissexual",
  },
  {
    id: "assexual",
    name: "orientacaoSexual",
    value: "assexual",
    display: "Assexual",
  },
  {
    id: "pansexual",
    name: "orientacaoSexual",
    value: "pansexual",
    display: "Pansexual",
  },
  {
    id: "heterosexual",
    name: "orientacaoSexual",
    value: "heterosexual",
    display: "Heterosexual",
  },
  {
    id: "naoInformar",
    name: "orientacaoSexual",
    value: "naoInformar",
    display: "Não desejo informar",
  },
  {
    id: "outra",
    name: "outra",
    value: "outra",
    display: "Outra",
  },
];

const disabilityOptions = [
  {
    id: "auditiva",
    name: "tipoDeficiencia",
    value: "auditiva",
    display: "Auditiva",
  },
  {
    id: "fisica",
    name: "tipoDeficiencia",
    value: "fisica",
    display: "Física",
  },
  {
    id: "intelectual",
    name: "tipoDeficiencia",
    value: "intelectual",
    display: "Intelectual",
  },
  {
    id: "multipla",
    name: "tipoDeficiencia",
    value: "multipla",
    display: "Múltipla",
  },
  {
    id: "visual",
    name: "tipoDeficiencia",
    value: "visual",
    display: "Visual",
  },
];

const personalInfoForm = [
  {
    id: "endereco",
    name: "endereco",
    type: "text",
    placeholder: "Endereço",
    label: "Endereço",
    required: true,
  },
  {
    id: "cidade",
    name: "cidade",
    type: "text",
    placeholder: "Cidade",
    label: "Cidade",
    required: true,
  },
  {
    id: "uf",
    name: "uf",
    type: "text",
    placeholder: "UF",
    label: "UF",
    required: true,
  },
  {
    id: "bairro",
    name: "bairro",
    type: "text",
    placeholder: "Bairro",
    label: "Bairro",
    required: true,
  },
  {
    id: "numero",
    name: "numero",
    type: "text",
    placeholder: "Número",
    label: "Número",
    required: true,
  },
  {
    id: "complemento",
    name: "complemento",
    type: "text",
    placeholder: "Complemento",
    label: "Complemento",
    required: false,
  },
  {
    id: "cep",
    name: "cep",
    type: "text",
    placeholder: "CEP",
    label: "CEP",
    required: true,
  },
  {
    id: "dddTelefone",
    name: "dddTelefone",
    type: "text",
    placeholder: "DDD / Telefone",
    label: "DDD / Telefone",
    required: true,
  },
  {
    id: "dataNascimento",
    name: "dataNascimento",
    type: "date",
    placeholder: "Data de Nascimento",
    label: "Data de Nascimento",
    required: true,
  },
  {
    id: "rg",
    name: "rg",
    type: "text",
    placeholder: "RG",
    label: "RG",
    required: true,
  },
  {
    id: "cpf",
    name: "cpf",
    type: "text",
    placeholder: "CPF",
    label: "CPF",
    required: true,
  },
  {
    id: "email",
    name: "email",
    type: "email",
    placeholder: "E-mail",
    label: "E-mail",
    required: true,
  },
  {
    name: "siteRedesSociais",
    type: "text",
    placeholder: "Site ou Redes Sociais",
    label: "Site ou Redes Sociais",
    required: false,
  },
];

const experienceOptions = [
  {
    id: "ate2anos",
    name: "tempoExperiencia",
    value: "ate2anos",
    display: "Até 2 anos",
  },
  {
    id: "de2a5anos",
    name: "tempoExperiencia",
    value: "de2a5anos",
    display: "De 2 a 5 anos",
  },
  {
    id: "de5a10anos",
    name: "tempoExperiencia",
    value: "de5a10anos",
    display: "De 5 a 10 anos",
  },
  {
    id: "maisDe10anos",
    name: "tempoExperiencia",
    value: "maisDe10anos",
    display: "Mais de 10 anos",
  },
];

const entityExperienceOptions = [
  {
    id: "menosDe3Anos",
    name: "intervaloAnos",
    value: "menosDe3Anos",
    display: "Menos de 3 anos",
  },
  {
    id: "de3a5Anos",
    name: "intervaloAnos",
    value: "de3a5Anos",
    display: "De 3 a 5 anos",
  },
  {
    id: "de6a10Anos",
    name: "intervaloAnos",
    value: "de6a10Anos",
    display: "De 6 a 10 anos",
  },
  {
    id: "de10a15Anos",
    name: "intervaloAnos",
    value: "de10a15Anos",
    display: "De 10 a 15 anos",
  },
  {
    id: "maisDe15Anos",
    name: "intervaloAnos",
    value: "maisDe15Anos",
    display: "Mais de 15 anos",
  },
];

const challengeOptions = [
  {
    id: "administrativos",
    name: "categoria",
    value: "administrativos",
    display: "Administrativos",
  },
  {
    id: "estruturais",
    name: "categoria",
    value: "estruturais",
    display: "Estruturais",
  },
  {
    id: "geograficos",
    name: "categoria",
    value: "geograficos",
    display: "Geográficos / de localização",
  },
  {
    id: "economicos",
    name: "categoria",
    value: "economicos",
    display: "Econômicos",
  },
  {
    id: "politicos",
    name: "categoria",
    value: "politicos",
    display: "Políticos",
  },
  {
    id: "sociais",
    name: "categoria",
    value: "sociais",
    display: "Sociais",
  },
  {
    id: "saude",
    name: "categoria",
    value: "saude",
    display: "Saúde",
  },
  {
    id: "parcerias",
    name: "categoria",
    value: "parcerias",
    display: "Parcerias",
  },
  {
    id: "formacao",
    name: "categoria",
    value: "formacao",
    display: "Formação",
  },
  {
    id: "desinteressePublico",
    name: "categoria",
    value: "desinteressePublico",
    display: "Desinteresse do público",
  },
];

const territoryOptions = [
  {
    id: "zonaUrbanaCentral",
    name: "territorio",
    value: "zonaUrbanaCentral",
    display: "Zona urbana central",
  },
  {
    id: "areasAtingidasPorBarragem",
    name: "territorio",
    value: "areasAtingidasPorBarragem",
    display: "Áreas atingidas por barragem",
  },
  {
    id: "zonaUrbanaPeriferica",
    name: "territorio",
    value: "zonaUrbanaPeriferica",
    display: "Zona urbana periférica",
  },
  {
    id: "territoriosIndigenas",
    name: "territorio",
    value: "territoriosIndigenas",
    display: "Territórios indígenas (demarcados ou em processo de demarcação)",
  },
  {
    id: "zonaRural",
    name: "territorio",
    value: "zonaRural",
    display: "Zona rural",
  },
  {
    id: "comunidadesQuilombolas",
    name: "territorio",
    value: "comunidadesQuilombolas",
    display:
      "Comunidades quilombolas (terra titulada ou em processo de titulação, com registro na Fundação Cultural Palmares)",
  },
  {
    id: "regioesDeFronteira",
    name: "territorio",
    value: "regioesDeFronteira",
    display: "Regiões de fronteira",
  },
  {
    id: "territorioDePovosTradicionais",
    name: "territorio",
    value: "territorioDePovosTradicionais",
    display:
      "Território de povos e comunidades tradicionais (ribeirinhos, louceiros, cipozeiros, pequizeiros, vazanteiros, povos do mar etc)",
  },
  {
    id: "areaDeVulnerabilidadeSocial",
    name: "territorio",
    value: "areaDeVulnerabilidadeSocial",
    display: "Área de vulnerabilidade social",
  },
  {
    id: "regioesComBaixoIDH",
    name: "territorio",
    value: "regioesComBaixoIDH",
    display: "Regiões com baixo Índice de Desenvolvimento Humano - IDH",
  },
  {
    id: "unidadesHabitacionais",
    name: "territorio",
    value: "unidadesHabitacionais",
    display: "Unidades habitacionais",
  },
  {
    id: "regioesDeAltoIndiceDeViolencia",
    name: "territorio",
    value: "regioesDeAltoIndiceDeViolencia",
    display: "Regiões de alto índice de violência",
  },
];

const culturalAreaOptions = [
  {
    id: "livroLeituraLiteratura",
    name: "areaCultural",
    value: "livroLeituraLiteratura",
    display: "Livro, leitura e literatura",
  },
  {
    id: "culturaComunicacaoMidiaLivre",
    name: "areaCultural",
    value: "culturaComunicacaoMidiaLivre",
    display: "Cultura, comunicação e mídia livre",
  },
  {
    id: "memoriaPatrimonioCultural",
    name: "areaCultural",
    value: "memoriaPatrimonioCultural",
    display: "Memória e patrimônio cultural",
  },
  {
    id: "culturaEducacao",
    name: "areaCultural",
    value: "culturaEducacao",
    display: "Cultura e educação",
  },
  {
    id: "culturaMeioAmbiente",
    name: "areaCultural",
    value: "culturaMeioAmbiente",
    display: "Cultura e meio ambiente",
  },
  {
    id: "culturaSaude",
    name: "areaCultural",
    value: "culturaSaude",
    display: "Cultura e saúde",
  },
  {
    id: "culturaJuventude",
    name: "areaCultural",
    value: "culturaJuventude",
    display: "Cultura e juventude",
  },
  {
    id: "conhecimentosTradicionais",
    name: "areaCultural",
    value: "conhecimentosTradicionais",
    display: "Conhecimentos tradicionais",
  },
  {
    id: "culturaInfanciaAdolescencia",
    name: "areaCultural",
    value: "culturaInfanciaAdolescencia",
    display: "Cultura, infância e adolescência",
  },
  {
    id: "culturaDigital",
    name: "areaCultural",
    value: "culturaDigital",
    display: "Cultura digital",
  },
  {
    id: "agenteCulturaViva",
    name: "areaCultural",
    value: "agenteCulturaViva",
    display: "Agente cultura viva",
  },
  {
    id: "culturaDireitosHumanos",
    name: "areaCultural",
    value: "culturaDireitosHumanos",
    display: "Cultura e direitos humanos",
  },
  {
    id: "culturaCircense",
    name: "areaCultural",
    value: "culturaCircense",
    display: "Cultura circense",
  },
  {
    id: "economiaCriativaSolidaria",
    name: "areaCultural",
    value: "economiaCriativaSolidaria",
    display: "Economia criativa e solidária",
  },
];

const culturalFieldsOptions = [
  {
    id: "antropologia",
    name: "campoCultural",
    value: "antropologia",
    display: "Antropologia",
  },
  {
    id: "culturaPopular",
    name: "campoCultural",
    value: "culturaPopular",
    display: "Cultura Popular",
  },
  {
    id: "meioAmbiente",
    name: "campoCultural",
    value: "meioAmbiente",
    display: "Meio Ambiente",
  },
  {
    id: "arqueologia",
    name: "campoCultural",
    value: "arqueologia",
    display: "Arqueologia",
  },
  {
    id: "danca",
    name: "campoCultural",
    value: "danca",
    display: "Dança",
  },
  {
    id: "midiasSociais",
    name: "campoCultural",
    value: "midiasSociais",
    display: "Mídias Sociais",
  },
  {
    id: "arquiteturaUrbanismo",
    name: "campoCultural",
    value: "arquiteturaUrbanismo",
    display: "Arquitetura-Urbanismo",
  },
  {
    id: "design",
    name: "campoCultural",
    value: "design",
    display: "Design",
  },
  {
    id: "moda",
    name: "campoCultural",
    value: "moda",
    display: "Moda",
  },
  {
    id: "arquivo",
    name: "campoCultural",
    value: "arquivo",
    display: "Arquivo",
  },
  {
    id: "direitoAutoral",
    name: "campoCultural",
    value: "direitoAutoral",
    display: "Direito Autoral",
  },
  {
    id: "museu",
    name: "campoCultural",
    value: "museu",
    display: "Museu",
  },
  {
    id: "arteDeRua",
    name: "campoCultural",
    value: "arteDeRua",
    display: "Arte de Rua",
  },
  {
    id: "economiaCriativa",
    name: "campoCultural",
    value: "economiaCriativa",
    display: "Economia Criativa",
  },
  {
    id: "musica",
    name: "campoCultural",
    value: "musica",
    display: "Música",
  },
  {
    id: "arteDigital",
    name: "campoCultural",
    value: "arteDigital",
    display: "Arte Digital",
  },
  {
    id: "educacao",
    name: "campoCultural",
    value: "educacao",
    display: "Educação",
  },
  {
    id: "novasMidias",
    name: "campoCultural",
    value: "novasMidias",
    display: "Novas Mídias",
  },
  {
    id: "artesVisuais",
    name: "campoCultural",
    value: "artesVisuais",
    display: "Artes Visuais",
  },
  {
    id: "esporte",
    name: "campoCultural",
    value: "esporte",
    display: "Esporte",
  },
  {
    id: "patrimonioImaterial",
    name: "campoCultural",
    value: "patrimonioImaterial",
    display: "Patrimônio Imaterial",
  },
  {
    id: "artesanato",
    name: "campoCultural",
    value: "artesanato",
    display: "Artesanato",
  },
  {
    id: "filosofia",
    name: "campoCultural",
    value: "filosofia",
    display: "Filosofia",
  },
  {
    id: "patrimonioMaterial",
    name: "campoCultural",
    value: "patrimonioMaterial",
    display: "Patrimônio Material",
  },
  {
    id: "audiovisual",
    name: "campoCultural",
    value: "audiovisual",
    display: "Audiovisual",
  },
  {
    id: "fotografia",
    name: "campoCultural",
    value: "fotografia",
    display: "Fotografia",
  },
  {
    id: "pesquisa",
    name: "campoCultural",
    value: "pesquisa",
    display: "Pesquisa",
  },
  {
    id: "cinema",
    name: "campoCultural",
    value: "cinema",
    display: "Cinema",
  },
  {
    id: "gastronomia",
    name: "campoCultural",
    value: "gastronomia",
    display: "Gastronomia",
  },
  {
    id: "producaoCultural",
    name: "campoCultural",
    value: "producaoCultural",
    display: "Produção Cultural",
  },
  {
    id: "circo",
    name: "campoCultural",
    value: "circo",
    display: "Circo",
  },
  {
    id: "gestaoCultural",
    name: "campoCultural",
    value: "gestaoCultural",
    display: "Gestão Cultural",
  },
  {
    id: "radio",
    name: "campoCultural",
    value: "radio",
    display: "Rádio",
  },
  {
    id: "comunicacao",
    name: "campoCultural",
    value: "comunicacao",
    display: "Comunicação",
  },
  {
    id: "historia",
    name: "campoCultural",
    value: "historia",
    display: "História",
  },
  {
    id: "saude",
    name: "campoCultural",
    value: "saude",
    display: "Saúde",
  },
  {
    id: "culturaCigana",
    name: "campoCultural",
    value: "culturaCigana",
    display: "Cultura Cigana",
  },
  {
    id: "jogosEletronicos",
    name: "campoCultural",
    value: "jogosEletronicos",
    display: "Jogos Eletrônicos",
  },
  {
    id: "sociologia",
    name: "campoCultural",
    value: "sociologia",
    display: "Sociologia",
  },
  {
    id: "culturaDigital",
    name: "campoCultural",
    value: "culturaDigital",
    display: "Cultura Digital",
  },
  {
    id: "jornalismo",
    name: "campoCultural",
    value: "jornalismo",
    display: "Jornalismo",
  },
  {
    id: "teatro",
    name: "campoCultural",
    value: "teatro",
    display: "Teatro",
  },
  {
    id: "culturaEstrangeira",
    name: "campoCultural",
    value: "culturaEstrangeira",
    display: "Cultura Estrangeira (imigrantes)",
  },
  {
    id: "leitura",
    name: "campoCultural",
    value: "leitura",
    display: "Leitura",
  },
  {
    id: "televisao",
    name: "campoCultural",
    value: "televisao",
    display: "Televisão",
  },
  {
    id: "culturaIndigena",
    name: "campoCultural",
    value: "culturaIndigena",
    display: "Cultura Indígena",
  },
  {
    id: "literatura",
    name: "campoCultural",
    value: "literatura",
    display: "Literatura",
  },
  {
    id: "turismo",
    name: "campoCultural",
    value: "turismo",
    display: "Turismo",
  },
  {
    id: "culturaLGBT",
    name: "campoCultural",
    value: "culturaLGBT",
    display: "Cultura LGBT",
  },
  {
    id: "livro",
    name: "campoCultural",
    value: "livro",
    display: "Livro",
  },
  {
    id: "culturaNegra",
    name: "campoCultural",
    value: "culturaNegra",
    display: "Cultura Negra",
  },
];

const populationGroupOptions = [
  {
    id: "afroBrasileiros",
    name: "grupoPopulacional",
    value: "afroBrasileiros",
    display: "Afro-Brasileiros",
  },
  {
    id: "mulheres",
    name: "grupoPopulacional",
    value: "mulheres",
    display: "Mulheres",
  },
  {
    id: "populacaoBaixaRenda",
    name: "grupoPopulacional",
    value: "populacaoBaixaRenda",
    display: "População de Baixa Renda",
  },
  {
    id: "ciganos",
    name: "grupoPopulacional",
    value: "ciganos",
    display: "Ciganos",
  },
  {
    id: "pescadores",
    name: "grupoPopulacional",
    value: "pescadores",
    display: "Pescadores",
  },
  {
    id: "gruposAssentadosReformaAgraria",
    name: "grupoPopulacional",
    value: "gruposAssentadosReformaAgraria",
    display: "Grupos assentados de reforma agrária",
  },
  {
    id: "estudantes",
    name: "grupoPopulacional",
    value: "estudantes",
    display: "Estudantes",
  },
  {
    id: "pessoasComDeficiencia",
    name: "grupoPopulacional",
    value: "pessoasComDeficiencia",
    display: "Pessoas com deficiência",
  },
  {
    id: "mestresPracticosBrincantes",
    name: "grupoPopulacional",
    value: "mestresPracticosBrincantes",
    display:
      "Mestres, praticantes, brincantes e grupos culturais populares, urbanos e rurais",
  },
  {
    id: "agentesCulturaisIndependentes",
    name: "grupoPopulacional",
    value: "agentesCulturaisIndependentes",
    display:
      "Agentes culturais, artistas e grupos artísticos e culturais independentes",
  },
  {
    id: "pessoasSofrimentoPsiquico",
    name: "grupoPopulacional",
    value: "pessoasSofrimentoPsiquico",
    display: "Pessoas em situação de sofrimento psíquico",
  },
  {
    id: "pessoasVitimasViolencia",
    name: "grupoPopulacional",
    value: "pessoasVitimasViolencia",
    display: "Pessoas ou grupos vítimas de violência",
  },
  {
    id: "idosos",
    name: "grupoPopulacional",
    value: "idosos",
    display: "Idosos",
  },
  {
    id: "populacaoRua",
    name: "grupoPopulacional",
    value: "populacaoRua",
    display: "População de Rua",
  },
  {
    id: "populacaoSemTeto",
    name: "grupoPopulacional",
    value: "populacaoSemTeto",
    display: "População sem teto",
  },
  {
    id: "imigrantes",
    name: "grupoPopulacional",
    value: "imigrantes",
    display: "Imigrantes",
  },
  {
    id: "populacaoRegimePrisao",
    name: "grupoPopulacional",
    value: "populacaoRegimePrisao",
    display: "População em regime prisional, em privação de liberdade",
  },
  {
    id: "populacoesAtingidasBarragens",
    name: "grupoPopulacional",
    value: "populacoesAtingidasBarragens",
    display: "Populações atingidas por barragens",
  },
  {
    id: "indigenas",
    name: "grupoPopulacional",
    value: "indigenas",
    display: "Indígenas",
  },
  {
    id: "povosComunidadesTradicionaisAfricanaTerreiro",
    name: "grupoPopulacional",
    value: "povosComunidadesTradicionaisAfricanaTerreiro",
    display:
      "Povos e Comunidades Tradicionais de Matriz Africana e de Terreiro",
  },
  {
    id: "populacoesFronteira",
    name: "grupoPopulacional",
    value: "populacoesFronteira",
    display: "Populações de regiões fronteiriças",
  },
  {
    id: "criancasAdolescentes",
    name: "grupoPopulacional",
    value: "criancasAdolescentes",
    display: "Crianças e Adolescentes",
  },
  {
    id: "quilombolas",
    name: "grupoPopulacional",
    value: "quilombolas",
    display: "Quilombolas",
  },
  {
    id: "populacoesVulnerabilidadeSocial",
    name: "grupoPopulacional",
    value: "populacoesVulnerabilidadeSocial",
    display: "Populações em áreas de vulnerabilidade social",
  },
  {
    id: "juventude",
    name: "grupoPopulacional",
    value: "juventude",
    display: "Juventude",
  },
  {
    id: "ribeirinhos",
    name: "grupoPopulacional",
    value: "ribeirinhos",
    display: "Ribeirinhos",
  },
  {
    id: "lgbtqiaPlus",
    name: "grupoPopulacional",
    value: "lgbtqiaPlus",
    display: "LGBTQIA+",
  },
  {
    id: "populacaoRural",
    name: "grupoPopulacional",
    value: "populacaoRural",
    display: "População Rural",
  },
];

const ageGroupOptions = [
  {
    id: "primeiraInfancia",
    name: "faixaEtaria",
    value: "primeiraInfancia",
    display: "Primeira Infância: 0 a 6 anos",
  },
  {
    id: "criancas",
    name: "faixaEtaria",
    value: "criancas",
    display: "Crianças: 7 a 11 anos",
  },
  {
    id: "adolescentesJovens",
    name: "faixaEtaria",
    value: "adolescentesJovens",
    display: "Adolescentes e Jovens: 12 a 29 anos",
  },
  {
    id: "adultos",
    name: "faixaEtaria",
    value: "adultos",
    display: "Adultos: 30 a 59 anos",
  },
  {
    id: "idosos",
    name: "faixaEtaria",
    value: "idosos",
    display: "Idosos: maior de 60 anos",
  },
];

const peopleCountOptions = [
  {
    id: "ate50Pessoas",
    name: "numeroPessoas",
    value: "ate50Pessoas",
    display: "Até 50 pessoas",
  },
  {
    id: "51a100Pessoas",
    name: "numeroPessoas",
    value: "51a100Pessoas",
    display: "De 51 a 100 pessoas",
  },
  {
    id: "101a200Pessoas",
    name: "numeroPessoas",
    value: "101a200Pessoas",
    display: "De 101 a 200 pessoas",
  },
  {
    id: "201a400Pessoas",
    name: "numeroPessoas",
    value: "201a400Pessoas",
    display: "De 201 a 400 pessoas",
  },
  {
    id: "401a600Pessoas",
    name: "numeroPessoas",
    value: "401a600Pessoas",
    display: "De 401 a 600 pessoas",
  },
  {
    id: "maisDe601Pessoas",
    name: "numeroPessoas",
    value: "maisDe601Pessoas",
    display: "Mais de 601 pessoas",
  },
];

const RegisterProject = () => {
  const [culturalEntityFormData, setCulturalEntityFormData] = useState<{
    [key: string]: string;
  }>({});
  const [personalInfoFields, setPersonalInfoFields] = useState<{
    [key: string]: string;
  }>({});
  const [personInfo, setPersonInfo] = useState<{
    [key: string]: string;
  }>({});
  const [hasCertificaton, setHasCertificaton] = useState("");
  const [certificationLink, setCertificationLink] = useState("");
  const [certificationFile, setCertificationFile] = useState<File[]>();
  const [certificationURL, setCertificationURL] = useState<string>();
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioURL, setPortfolioURL] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [otherGender, setOtherGender] = useState("");
  const [sexualOrientation, setSexualOrientation] = useState("");
  const [otherSexualOrientation, setOtherSexualOrientation] = useState("");
  const [isBlackPerson, setIsBlackPerson] = useState(false);
  const [isIndigenous, setIsIndigenous] = useState(false);
  const [isPCD, setIsPCD] = useState(false);
  const [pcdType, setPcdType] = useState("");
  const [isMainSourceOfIncome, setIsMainSourceOfIncome] = useState(false);
  const [occupation, setOccupation] = useState("");
  const [experience, setExperience] = useState("");
  const [entityExperience, setEntityExperience] = useState("");
  const [hasEnoughResources, setHasEnoughResources] = useState(false);
  const [challenge, setChallenge] = useState<string[]>([]);
  const [otherChallenge, setOtherChallenge] = useState("");
  const [territory, setTerritory] = useState<string[]>([]);
  const [culturalFields, setCulturalFields] = useState<string[]>([]);
  const [populationGroups, setPopulationGroups] = useState<string[]>([]);
  const [otherCulturalField, setOtherCulturalField] = useState("");
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [selectedCulturalAreas, setSelectedCulturalAreas] = useState<string[]>(
    []
  );
  const [peopleCount, setPeopleCount] = useState("");
  const [hasBenefit, setHasBenefit] = useState(false);
  const [benefit, setBenefit] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [history, setHistory] = useState("");

  const router = useRouter();
  const city = useCity();
  const cityId = city.city.cityId;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCulturalEntityFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePersonInfoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setPersonInfo((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePersonalInfoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setPersonalInfoFields((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCertificationUpload = async () => {
    const uploadedUrls: string[] = [];
    if (certificationFile) {
      for (const file of certificationFile) {
        try {
          const fileRef = ref(
            storage,
            `espacoCultural/certification/${file.name}`
          );
          await uploadBytes(fileRef, file);
          const fileUrl = await getDownloadURL(fileRef);
          uploadedUrls.push(fileUrl);

          setCertificationURL(uploadedUrls[0]);
          return true;
        } catch (error) {
          console.log("Error uploading, try again");
          return false;
        }
      }
    }

    if (uploadedUrls) {
      return true;
    } else return false;
  };

  const handlePortfolioUpload = async () => {
    const uploadedUrls: string[] = [];
    if (portfolioFiles) {
      for (const file of portfolioFiles) {
        try {
          const fileRef = ref(
            storage,
            `espacoCultural/portfolios/${file.name}`
          );
          await uploadBytes(fileRef, file);
          const fileUrl = await getDownloadURL(fileRef);
          uploadedUrls.push(fileUrl);

          setPortfolioURL(uploadedUrls);
          return true;
        } catch (error) {
          console.log("Error uploading, try again");
          return false;
        }
      }
    }

    if (uploadedUrls) {
      return true;
    } else return false;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestBody = {
      entidadeCultural: {
        ...culturalEntityFormData,
        hasCertificaton,
        certificationLink,
      },
      representacao: {
        ...personInfo,
        gender,
        otherGender,
        sexualOrientation,
        otherSexualOrientation,
        isBlackPerson,
        isIndigenous,
        ...personalInfoFields,
        isMainSourceOfIncome,
        occupation,
        experience,
        entityExperience,
        hasEnoughResources,
        challenge,
        otherChallenge,
        territory,
        culturalFields,
        otherCulturalField,
        selectedCulturalAreas,
        populationGroups,
        ageGroups,
        peopleCount,
        hasBenefit,
        benefit,
        mainGoal,
        history,
      },
      cityId,
    };

    /* const uploadedCertification = await handleCertificationUpload();
    const uploadedPortfolio = await handlePortfolioUpload(); */
    try {
      const docRef = await addDoc(
        collection(db, "espacoCultural"),
        requestBody
      );
      alert(`Entidade Cadastrada com ID:  ${docRef.id}`);
      router.push("/register-project/sucess");
    } catch (error) {
      console.error(error);
    }
  };

  const handleMaxLines = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const lines = event.target.value.split("\n");
    if (lines.length <= 30) {
      setHistory(event.target.value);
    } else return;
  };

  const handleCulturalAreaChange = (value: string) => {
    setSelectedCulturalAreas(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((item) => item !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };

  const handleCulturalFieldChange = (value: string) => {
    setCulturalFields(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((item) => item !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };

  const handlePopulationGroupChange = (value: string) => {
    setPopulationGroups(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((item) => item !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };

  const handleAgeGroupChange = (value: string) => {
    setAgeGroups(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((item) => item !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };

  const handleTerritoryChange = (value: string) => {
    setTerritory(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((item) => item !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };

  const handleChallengeChange = (value: string) => {
    setChallenge(
      (prevSelected) =>
        prevSelected.includes(value)
          ? prevSelected.filter((item) => item !== value) // Remove if already selected
          : [...prevSelected, value] // Add if not selected
    );
  };

  const handleCertificationFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCertificationFile(Array.from(files));
    }
  };

  const handlePortfolioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      setPortfolioFiles(Array.from(files));
    }
  };

  return (
    <div className="max-w-[60rem] mx-auto mt-4 p-6 border border-gray-300 rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Cadastro</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-4 text-left">
            Entidade Cultural
          </h3>
          {inputFields.map((input, index) => {
            return (
              <div className="mb-4" key={index}>
                <label className="block mb-1 font-semibold">
                  {input.label}
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type={input.type}
                  placeholder={input.placeholder}
                  name={input.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            );
          })}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              A entidade já é certificada pelo Ministério da Cultura, estando
              inscrita no Cadastro Nacional de Pontos e Pontões de Cultura?
              (consultar em www.gov.br/culturaviva )
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {certificationOptions.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="radio"
                    name="hasCertificaton"
                    value={option.value}
                    onChange={() => setHasCertificaton(option.value)}
                    checked={hasCertificaton !== ""}
                    className="w-5 h-5 text-blue-600 border-gray-300 "
                  />
                  <span className="text-gray-700 font-medium">
                    {option.display}
                  </span>
                </label>
              ))}
            </div>
            <label className="block mt-4 font-semibold">
              Link da certificação:
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-2 mb-2"
              onChange={(e) => setCertificationLink(e.target.value)}
            />

            <input
              type="file"
              className="w-full p-2 border border-gray-300 rounded"
              accept="image/*,.pdf"
              onChange={(e) => handleCertificationFileChange(e)}
              required
            />
          </div>
          <div className="mb-4">
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-4 text-left">
                INFORMAÇÕES BÁSICAS DA REPRESENTAÇÃO DA ENTIDADE CULTURAL
              </h3>
              {personInfoFields.map((input, index) => {
                return (
                  <div className="mb-4" key={index}>
                    <label className="block mb-1 font-semibold">
                      {input.display}
                    </label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded"
                      type={input.type}
                      placeholder={input.placeholder}
                      name={input.name}
                      onChange={handlePersonInfoChange}
                      required
                    />
                  </div>
                );
              })}
              <label className="block mb-1 font-semibold">
                Identidade de Gênero
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {genderOptions.map((option) => (
                  <label
                    className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                    key={option.id}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      onChange={() => setGender(option.value)}
                      checked={gender === option.value}
                      className="w-5 h-5 text-blue-600 border-gray-300 "
                    />
                    <span className="text-gray-700 font-medium">
                      {option.display}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mb-4 mt-4">
                <label className="block mb-1 font-semibold">Outra</label>
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type="text"
                  name="otherGender"
                  onChange={(e) => setOtherGender(e.target.value)}
                />
              </div>
              <label className="block mb-1 font-semibold">
                Orientação Sexual
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sexualOrientationOptions.map((option) => (
                  <label
                    className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                    key={option.id}
                  >
                    <input
                      type="radio"
                      name="sexualOrientation"
                      value={option.value}
                      onChange={() => setSexualOrientation(option.value)}
                      checked={sexualOrientation === option.value}
                      className="w-5 h-5 text-blue-600 border-gray-300 "
                    />
                    <span className="text-gray-700 font-medium">
                      {option.display}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mb-4 mt-4">
                <label className="block mb-1 font-semibold">Outra</label>
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type="text"
                  name="otherSexualOrientation"
                  onChange={(e) => setOtherSexualOrientation(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  Trata-se de pessoa negra ou de matriz africana ou de terreiro?
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="isDependent"
                      value="yes"
                      onChange={() => setIsBlackPerson(true)}
                      checked={isBlackPerson === true}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="isDependent"
                      value="no"
                      onChange={() => setIsBlackPerson(false)}
                      checked={isBlackPerson === false}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Não
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  Trata-se de pessoa indígena ou de povos e comunidades
                  tradicionais?
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="isIndigenous"
                      value="yes"
                      onChange={() => setIsIndigenous(true)}
                      checked={isIndigenous === true}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="isIndigenous"
                      value="no"
                      onChange={() => setIsIndigenous(false)}
                      checked={isIndigenous === false}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Não
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  Trata-se de pessoa com deficiência?
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="isPCD"
                      value="yes"
                      onChange={() => setIsPCD(true)}
                      checked={isPCD === true}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="isPCD"
                      value="no"
                      onChange={() => setIsPCD(false)}
                      checked={isPCD === false}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Não
                  </label>
                </div>

                {isPCD && (
                  <div>
                    <label className="block mb-1 font-semibold">
                      Caso tenha marcado sim, indique o tipo de deficiência:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {disabilityOptions.map((option) => (
                        <label
                          className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                          key={option.id}
                        >
                          <input
                            type="radio"
                            name="pcdType"
                            value={option.value}
                            onChange={() => setPcdType(option.value)}
                            checked={pcdType === option.value}
                            className="w-5 h-5 text-blue-600 border-gray-300 "
                          />
                          <span className="text-gray-700 font-medium">
                            {option.display}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-4">
                {personalInfoForm.map((input) => {
                  return (
                    <div className="mb-4" key={input.id}>
                      <label className="block mb-1 font-semibold">
                        {input.label}
                      </label>
                      <input
                        className="w-full p-2 border border-gray-300 rounded"
                        type={input.type}
                        placeholder={input.placeholder}
                        name={input.name}
                        onChange={handlePersonalInfoChange}
                        required
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  Sua principal fonte de renda é por meio de atividade cultural?
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="isMainSourceOfIncome"
                      value="yes"
                      onChange={() => setIsMainSourceOfIncome(true)}
                      checked={isMainSourceOfIncome === true}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="isMainSourceOfIncome"
                      value="no"
                      onChange={() => setIsMainSourceOfIncome(false)}
                      checked={isMainSourceOfIncome === false}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Não
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  Qual sua ocupação dentro da cultura?
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type="text"
                  name="occupation"
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  Há quanto tempo você trabalha neste setor cultural?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {experienceOptions.map((option) => (
                    <label
                      className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                      key={option.id}
                    >
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        onChange={() => setExperience(option.value)}
                        checked={experience === option.value}
                        className="w-5 h-5 text-blue-600 border-gray-300 "
                      />
                      <span className="text-gray-700 font-medium">
                        {option.display}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  Anexe aqui seu portfólio/currículo
                </label>
                <input
                  type="file"
                  className="w-full p-2 border border-gray-300 rounded"
                  accept="image/*,.pdf"
                  onChange={(e) => handlePortfolioFileChange(e)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-4 text-left">
                EXPERIÊNCIAS DA ENTIDADE CULTURAL
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {entityExperienceOptions.map((option) => (
                  <label
                    className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                    key={option.id}
                  >
                    <input
                      type="radio"
                      name="entityExperience"
                      value={option.value}
                      onChange={() => setEntityExperience(option.value)}
                      checked={entityExperience === option.value}
                      className="w-5 h-5 text-blue-600 border-gray-300 "
                    />
                    <span className="text-gray-700 font-medium">
                      {option.display}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mb-4 mt-4">
                <label className="block mb-1 font-semibold">
                  Os espaços, os ambientes e os recursos disponíveis são
                  suficientes para a manutenção das atividades da iniciativa
                  cultural?
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="hasEnoughResources"
                      value="yes"
                      onChange={() => setHasEnoughResources(true)}
                      checked={hasEnoughResources === true}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="hasEnoughResources"
                      value="no"
                      onChange={() => setHasEnoughResources(false)}
                      checked={hasEnoughResources === false}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    Não
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              Quais são os principais desafios/dificuldades que a entidade
              cultural enfrenta na atuação dentro do seu setor cultural e para
              manter as atividades?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {challengeOptions.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="checkbox"
                    name="challenge"
                    value={option.value}
                    onChange={() => handleChallengeChange(option.value)}
                    checked={challenge.includes(option.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 "
                  />
                  <span className="text-gray-700 font-medium">
                    {option.display}
                  </span>
                </label>
              ))}
            </div>
            <div className="mb-4 mt-4">
              <label className="block mb-1 font-semibold">Outra</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="text"
                name="otherChallenge"
                onChange={(e) => setOtherChallenge(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              As atividades culturais realizadas pela candidatura acontecem em
              quais dessas áreas?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {territoryOptions.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="checkbox"
                    name="territory"
                    value={option.value}
                    onChange={() => handleTerritoryChange(option.value)}
                    checked={territory.includes(option.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 "
                  />
                  <span className="text-gray-700 font-medium">
                    {option.display}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              A candidatura atua com quais ações estruturantes da Cultura Viva?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {culturalAreaOptions.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="checkbox"
                    name="culturalArea"
                    value={option.value}
                    onChange={() => handleCulturalAreaChange(option.value)}
                    checked={selectedCulturalAreas.includes(option.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 "
                  />
                  <span className="text-gray-700 font-medium">
                    {option.display}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              A candidatura atua com quais áreas e temas de conhecimento que
              podem ser compartilhados?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {culturalFieldsOptions.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="checkbox"
                    name="culturalArea"
                    value={option.value}
                    onChange={() => handleCulturalFieldChange(option.value)}
                    checked={culturalFields.includes(option.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 "
                  />
                  <span className="text-gray-700 font-medium">
                    {option.display}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4 mt-4">
            <label className="block mb-1 font-semibold">Outra</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              name="otherCulturalField"
              onChange={(e) => setOtherCulturalField(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              A candidatura atua diretamente com qual público?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {populationGroupOptions.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="checkbox"
                    name="culturalArea"
                    value={option.value}
                    onChange={() => handlePopulationGroupChange(option.value)}
                    checked={populationGroups.includes(option.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 "
                  />
                  <span className="text-gray-700 font-medium">
                    {option.display}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              Indique a faixa etária do público atendido diretamente:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ageGroupOptions.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="checkbox"
                    name="culturalArea"
                    value={option.value}
                    onChange={() => handleAgeGroupChange(option.value)}
                    checked={ageGroups.includes(option.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 "
                  />
                  <span className="text-gray-700 font-medium">
                    {option.display}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              Qual é a quantidade aproximada de público atendida diretamente?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {peopleCountOptions.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="radio"
                    name="peopleCount"
                    value={option.value}
                    onChange={() => setPeopleCount(option.value)}
                    checked={peopleCount === option.value}
                    className="w-5 h-5 text-blue-600 border-gray-300 "
                  />
                  <span className="text-gray-700 font-medium">
                    {option.display}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              Já Recebeu Outros Incentivos Culturais ou Bolsas?
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-4">
                <input
                  type="radio"
                  name="hasBenefit"
                  value="yes"
                  onChange={() => setHasBenefit(true)}
                  checked={hasBenefit === true}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                Sim
              </label>
              <label className="flex items-center gap-4">
                <input
                  type="radio"
                  name="hasBenefit"
                  value="no"
                  onChange={() => setHasBenefit(false)}
                  checked={hasBenefit === false}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                Não
              </label>
            </div>

            {hasBenefit && (
              <div>
                <label className="block mb-1 font-semibold">
                  Se sim, qual:
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded"
                  type="text"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="mb-4 mt-4">
            <label className="block mb-1 font-semibold">
              Principal Objetivo ao Participar dos Programas de Incentivo à
              Cultura?
            </label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              name="mainGoal"
              onChange={(e) => setMainGoal(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              Escreva em no máximo 30 linhas sobre sua trajetória e sua formação
              na área artística
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              value={history}
              rows={30}
              onChange={(e) => handleMaxLines(e)}
            />
          </div>
        </div>

        <button
          className="w-full p-2 bg-buttonBg text-white rounded hover:bg-buttonHover"
          type="submit"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

const RegisterProjectWithSuspense = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterProject />
    </Suspense>
  );
};

export default RegisterProjectWithSuspense;
