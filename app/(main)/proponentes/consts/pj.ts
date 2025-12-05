export const proponenteJuridicaForm = {
    dadosPJ: [
        {
            name: "razaoSocial", // Or 'legalName'
            label: "Razão social:",
            type: "string",
            required: true,
            placeholder: "Razão social" // Based on image input placeholder
        },
        {
            name: "cnpj",
            label: "CNPJ:",
            type: "string",
            required: true,
            mask: "99.999.999/9999-99", // Assumed mask for CNPJ
            placeholder: "12.345.678/0009-10"
        },
        {
            name: "nomeFantasia", // Or 'tradeName'
            label: "Nome fantasia:",
            type: "string",
            required: false, // No asterisk in the image
            placeholder: "Nome fantasia"
        },
        {
            name: "website",
            label: "Website:",
            type: "url", // Or 'string'
            required: false, // No asterisk in the image
            placeholder: "www.exemplo.com"
        },
        {
            name: "naturezaEmpresa", // Or 'companyNature'
            label: "Qual é a natureza da sua empresa?",
            type: "select", // Since it has a dropdown
            required: true,
            placeholder: "Selecione",
            "options": [
                {
                    "value": "com_fins_lucrativos",
                    "label": "Sou uma empresa com fins lucrativos"
                },
                {
                    "value": "sem_fins_lucrativos",
                    "label": "Sou uma empresa sem fins lucrativos"
                }
            ]
        },
        {
            name: "dataAberturaCNPJ", // Or 'cnpjIssuanceDate'
            label: "Data de abertura do cartão CNPJ:",
            type: "date",
            required: true,
            mask: "99/99/9999", // Assumed date mask
            placeholder: "dd/mm/aaaa"
        },
        {
            name: "mei", // Or 'companyNature'
            label: "Sua empresa é um Microempreendedor Individual (MEI)?",
            type: "select", // Since it has a dropdown
            required: true,
            placeholder: "Selecione",
            "options": [
                {
                    "value": "sim",
                    "label": "Sim"
                },
                {
                    "value": "nao",
                    "label": "Não"
                },
            ]
        },
        {
            name: "possuiSocios", // Or 'companyNature'
            label: "Sua empresa possui sócios cadastrados no contrato social?",
            type: "select", // Since it has a dropdown
            required: true,
            placeholder: "Selecione",
            "options": [
                {
                    "value": "sim",
                    "label": "Sim"
                },
                {
                    "value": "nao",
                    "label": "Não"
                },
            ]
        },
    ],
    contato: [
        {
            name: "email",
            label: "Email:",
            type: "string",
            required: true,
            placeholder: "email@example.com"
        },
        {
            name: "celular",
            label: "Celular com DDD:",
            type: "string",
            required: true,
            placeholder: "(00) 00000-0000"
        },
        {
            name: "fixo",
            label: "Telefone com DDD:",
            type: "string",
            required: false,
            placeholder: "(00) 0000-0000"
        },
        {
            name: "alternativo",
            label: "Telefone alternativo com DDD:",
            type: "string",
            required: false,
            placeholder: "(00) 0000-0000"
        }
    ],
    responsavel: [
        {
            "name": "nomeResponsavelLegal",
            "label": "Nome do responsável legal:",
            "type": "text",
            "placeholder": "Carlos Frinka Neto",
            "required": true
        },
        {
            "name": "cpfResponsavelLegal",
            "label": "CPF:",
            "type": "text",
            "placeholder": "12345678912",
            "required": true
        },
        {
            "name": "rgResponsavelLegal",
            "label": "RG:",
            "type": "text",
            "placeholder": "123456870",
            "required": true
        },
        {
            "name": "nomeSocial",
            "label": "Nome social:",
            "type": "text",
            "placeholder": "Ex.:Amanda da Silva",
            "required": false
        },
        {
            "name": "dataNascimento",
            "label": "Data de nascimento:",
            "type": "date",
            "placeholder": "dd/mm/aaaa",
            "required": true
        },
        {
            "name": "cargoResponsavelLegal",
            "label": "Cargo:",
            "type": "text",
            "placeholder": "Cargo",
            "required": true
        }
    ],
    enderecoResponsavel: [{
        "name": "cep",
        "label": "CEP:",
        "type": "text",
        "placeholder": "12345-678",
        "required": true
    },
    {
        "name": "logradouro",
        "label": "Logradouro:",
        "type": "text",
        "required": true
    },
    {
        "name": "numero",
        "label": "Número:",
        "type": "text",
        "required": true
    },
    {
        "name": "complemento",
        "label": "Complemento:",
        "type": "text",
        "required": false
    },
    {
        "name": "bairro",
        "label": "Bairro:",
        "type": "text",
        "required": true
    },
    {
        "name": "municipio",
        "label": "Município:",
        "type": "text",
        "required": true
    },
    {
        "name": "uf",
        "label": "UF:",
        "type": "text",
        "required": true
    }],
    enderecoPessoaJuridica: [{
        "name": "cep",
        "label": "CEP:",
        "type": "text",
        "placeholder": "12345-678",
        "required": true
    },
    {
        "name": "logradouro",
        "label": "Logradouro:",
        "type": "text",
        "required": true
    },
    {
        "name": "numero",
        "label": "Número:",
        "type": "text",
        "required": true
    },
    {
        "name": "complemento",
        "label": "Complemento:",
        "type": "text",
        "required": false
    },
    {
        "name": "bairro",
        "label": "Bairro:",
        "type": "text",
        "required": true
    },
    {
        "name": "municipio",
        "label": "Município:",
        "type": "text",
        "required": true
    },
    {
        "name": "uf",
        "label": "UF:",
        "type": "text",
        "required": true
    }],
    perfilPessoaJuridica: {
        caracteristicasAreaAtuacao: [{
            "name": "tipoInstituicaoOuColetivo",
            "label": "Tipo de instituição ou coletivo",
            "type": "select",
            "options": [
                {
                    "value": "associacao",
                    "label": "Associação"
                },
                {
                    "value": "fundacao",
                    "label": "Fundação"
                },
                {
                    "value": "coletivo_cultural",
                    "label": "Coletivo Cultural"
                },
                {
                    "value": "cooperativa",
                    "label": "Cooperativa"
                },
                {
                    "value": "outro",
                    "label": "Outro"
                }
            ],
            "required": true
        },
        {
            "name": "cnae",
            "label": "CNAE",
            "type": "text",
            "placeholder": "CNAE",
            "required": true
        }],
        estruturaERecursos: [{
            "name": "numeroMembrosFuncionarios",
            "label": "Número de Membros e/ou Funcionários",
            "type": "select",
            "options": [
                {
                    "value": "menos_de_5",
                    "label": "Menos de 5"
                },
                {
                    "value": "entre_5_e_10",
                    "label": "Entre 5 e 10"
                },
                {
                    "value": "entre_11_e_20",
                    "label": "Entre 11 e 20"
                },
                {
                    "value": "entre_21_e_50",
                    "label": "Entre 21 e 50"
                },
                {
                    "value": "mais_de_50",
                    "label": "Mais de 50"
                }
            ],
            "required": true
        },
        {
            "name": "orcamentoAnual",
            "label": "Orçamento Anual",
            "type": "select",
            "options": [
                {
                    "value": "ate_40000",
                    "label": "Até R$ 40.000;"
                },
                {
                    "value": "ate_80000_mei",
                    "label": "Até R$ 80.000 (Ou limite atual de MEI)"
                },
                {
                    "value": "ate_160000",
                    "label": "Até R$ 160.000;"
                },
                {
                    "value": "ate_360000_microempresa",
                    "label": "Até R$ 360.000 (Limite de microempresa)"
                },
                {
                    "value": "ate_1000000",
                    "label": "Até R$ 1.000.000"
                },
                {
                    "value": "ate_4800000_epp",
                    "label": "Até R$ 4.800.000 (Empresa de pequeno porte)"
                },
                {
                    "value": "acima_4800000",
                    "label": "Acima de R$ 4.800.000"
                }
            ],
            "required": true
        },
        {
            "name": "fontesFinanciamentoAtuais",
            "label": "Fontes de Financiamento Atuais",
            "type": "multiselect",
            "options": [
                {
                    "value": "patrocinio_empresas",
                    "label": "Patrocínio de Empresas"
                },
                {
                    "value": "doacoes",
                    "label": "Doações"
                },
                {
                    "value": "subsidios_governamentais",
                    "label": "Subsídios Governamentais"
                },
                {
                    "value": "venda_ingressos_produtos",
                    "label": "Venda de Ingressos ou Produtos"
                },
                {
                    "value": "outro",
                    "label": "Outro"
                }
            ],
            "required": true
        }],
        experienciasEParcerias: [
            {
                "name": "anosExperienciaOrganizacao",
                "label": "Anos de experiência da organização",
                "type": "select",
                "options": [
                    {
                        "value": "menos_de_2",
                        "label": "Menos de 2 anos"
                    },
                    {
                        "value": "entre_2_e_5",
                        "label": "Entre 2 e 5 anos"
                    },
                    {
                        "value": "entre_6_e_10",
                        "label": "Entre 6 e 10 anos"
                    },
                    {
                        "value": "mais_de_10",
                        "label": "Mais de 10 anos"
                    }
                ],
                "required": true
            },
            {
                "name": "tipoParceriaOrganizacao",
                "label": "Que tipo de parceria sua organização estabelece?",
                "type": "select",
                "options": [
                    {
                        "value": "patrocinio_empresarial",
                        "label": "Patrocínio empresarial (Apoio financeiro direto ou via leis...)"
                    },
                    {
                        "value": "colaboracao_tecnica",
                        "label": "Colaboração técnica (Troca de conhecimentos, capacitaçã...)"
                    },
                    {
                        "value": "parceria_execucao",
                        "label": "Parceria de execução (Correalização de projetos, eventos ...)"
                    }
                ],
                "required": true
            },
            {
                "name": "quantasParceriasAtivas",
                "label": "Quantas parcerias sua organização mantém ativamente?",
                "type": "select",
                "options": [
                    {
                        "value": "nenhuma",
                        "label": "Nenhuma"
                    },
                    {
                        "value": "ate_2",
                        "label": "Até 2"
                    },
                    {
                        "value": "de_3_a_5",
                        "label": "De 3 a 5"
                    },
                    {
                        "value": "mais_de_5",
                        "label": "Mais de 5"
                    }
                ],
                "required": true
            },
            {
                "name": "principalSegmentoAtuacaoCultural",
                "label": "Principal segmento de atuação no campo artístico-cultural:",
                "type": "select",
                "options": [
                    {
                        "value": "arquitetura",
                        "label": "Arquitetura"
                    },
                    {
                        "value": "atividades_artesanais",
                        "label": "Atividades Artesanais"
                    },
                    {
                        "value": "artes_cenicas",
                        "label": "Artes Cênicas"
                    },
                    {
                        "value": "artes_visuais",
                        "label": "Artes Visuais"
                    },
                    {
                        "value": "bibliotecas_literatura",
                        "label": "Bibliotecas e Literatura"
                    },
                    {
                        "value": "cinema_radio_tv",
                        "label": "Cinema, Rádio e TV"
                    },
                    {
                        "value": "musica",
                        "label": "Música"
                    },
                    {
                        "value": "arte_digital_jogos_digitais",
                        "label": "Arte Digital e Jogos Digitais"
                    },
                    {
                        "value": "design",
                        "label": "Design"
                    },
                    {
                        "value": "editorial",
                        "label": "Editorial"
                    },
                    {
                        "value": "moda",
                        "label": "Moda"
                    },
                    {
                        "value": "museus",
                        "label": "Museus"
                    },
                    {
                        "value": "outro",
                        "label": "Outro"
                    }
                ],
                "required": true
            }, {
                "name": "acessouRecursosPublicosAnteriormente",
                "label": "Já acessou recursos públicos do fomento à cultura anteriormente?",
                "type": "select",
                "options": [
                    {
                        "value": "sim",
                        "label": "Sim"
                    },
                    {
                        "value": "nao",
                        "label": "Não"
                    }
                ],
                "required": true
            }
        ],
        impactoSocial: [
            {
                "name": "acoesImpactoSocial",
                "label": "Quais ações sua organização realiza para promover impacto social e inclusão cultural?",
                "type": "multiselect",
                "options": [
                    {
                        "value": "acoes_afirmativas",
                        "label": "Ações afirmativas (Projetos voltados para grupos específicos: PCDs, LGBTQIA+, quilombolas, indígenas etc.)"
                    },
                    {
                        "value": "capacitacao_profissional",
                        "label": "Capacitação profissional (Cursos, oficinas, treinamentos culturais.)"
                    },
                    {
                        "value": "educacao_mediacao",
                        "label": "Educação e mediação cultural (Projetos em escolas, comunidades, espaços públicos.)"
                    },
                    {
                        "value": "acessibilidade_adaptacao",
                        "label": "Acessibilidade e adaptação (Materiais em Libras, audiodescrição, espaços acessíveis etc.)"
                    },
                    {
                        "value": "outro",
                        "label": "Outro"
                    }
                ],
                "required": true
            },
            {
                "name": "objetivosSociais",
                "label": "Objetivos sociais além dos artísticos",
                "type": "multiselect",
                "options": [
                    {
                        "value": "desenvolvimento_comunitario",
                        "label": "Desenvolvimento comunitário (Projetos que contribuem para o desenvolvimento socioeconômico local, gerando empregos...)"
                    },
                    {
                        "value": "desenvolvimento_social_humano",
                        "label": "Desenvolvimento Social e Humano (Iniciativas que utilizam a arte e a cultura como ferramentas terapêuticas para promover...)"
                    },
                    {
                        "value": "empoderamento_participacao_civica",
                        "label": "Empoderamento e participação cívica (Projetos que capacitam os membros da comunidade a se expressarem, participarem...)"
                    },
                    {
                        "value": "preservacao_patrimonio",
                        "label": "Preservação do patrimônio cultural (Ações que visam preservar e valorizar o patrimônio cultural material e imaterial, incluind...)"
                    },
                    {
                        "value": "sustentabilidade_ambiental",
                        "label": "Sustentabilidade ambiental (Iniciativas que promovem a conscientização ambiental e adotam práticas sustentáveis, visando...)"
                    },
                    {
                        "value": "nao_compreendemos_objetivos_sociais",
                        "label": "Não compreendemos objetivos sociais"
                    }
                ],
                "required": true
            }
        ]
    },
    perfilDoResponsavel: {
        informacoesDemograficas: [
            {
                name: "sexo",
                label: "Sexo",
                type: "select",
                options: [
                    { value: "feminino", label: "Feminino" },
                    { value: "masculino", label: "Masculino" },
                    { value: "sem_declaracao", label: "Sem declaração" }
                ],
                required: true
            },
            {
                name: "genero",
                label: "Gênero",
                type: "select",
                required: true,
                options: [
                    { value: "mulher_cis", label: "Mulher Cisgênero (Pessoa designada do sexo feminino ao nascer)" },
                    { value: "homem_cis", label: "Homem Cisgênero (Pessoa designada do sexo masculino ao nascer)" },
                    { value: "mulher_trans", label: "Mulher Transgênero (Pessoa designada do sexo masculino ao nascer)" },
                    { value: "homem_trans", label: "Homem Transgênero (Pessoa designada do sexo feminino ao nascer)" },
                    { value: "nao_binarie", label: "Pessoa Não-Binária (Pessoa cuja identidade de gênero não é exclusivamente feminina ou masculina)" },
                    { value: "outro", label: "Outro" },
                    { value: "sem_declaracao", label: "Sem declaração" }
                ]
            },
            {
                name: "racaCorEtnia",
                label: "Raça, cor ou etnia",
                type: "select",
                required: true,
                options: [
                    { value: "branca", label: "Branca (Pessoa que se autodeclara branca.)" },
                    { value: "preta", label: "Preta (Pessoa que se autodeclara preta.)" },
                    { value: "parda", label: "Parda (Pessoa que se autodeclara parda, incluindo descendentes de combinações variadas de ancestrais europeus, africanos e indígenas.)" },
                    { value: "amarela", label: "Amarela (Pessoa de origem asiática, incluindo descendentes de combinações variadas de japoneses, chineses, coreanos, etc, que se autodecla amarela.)" },
                    { value: "indigena", label: "Indígena (Pessoa que se autodeclara indígena, pertencente a uma das diversas etnias nativas do território brasileiro)" },
                    { value: "sem_declaracao", label: "Sem declaração" }
                ]
            },
            {
                name: "pertencePovoTradicional",
                label: "Você se considera pertencente a algum povo ou comunidade tradicional?",
                type: "select",
                required: true,
                options: [
                    { value: "povosOriginarios", label: "Povos originários" },
                    { value: "quilombolas", label: "Comunidades quilombolas" },
                    { value: "ribeirinhos", label: "Ribeirinhos" },
                    { value: "caicaras", label: "Caiçaras" },
                    { value: "ciganos", label: "Ciganos" },
                    { value: "nao", label: "Não" },
                    { value: "outros", label: "Outros" }
                ]
            },
            {
                name: "estadoCivil",
                label: "Estado civil",
                type: "select",
                options: [
                    { value: "solteiro", label: "Solteiro(a)" },
                    { value: "estavel", label: "União Estável" },
                    { value: "casado", label: "Casado(a)" },
                    { value: "divorciado", label: "Divorciado(a)" },
                    { value: "viuvo", label: "Viúvo(a)" },
                    { value: "outro", label: "Outro" }
                ],
                required: true
            },
            {
                name: "possuiDeficiencia",
                label: "Você possui alguma deficiência?",
                type: "select",
                options: [
                    { value: "nao", label: "Não" },
                    { value: "sim", label: "Sim" },
                    { value: "sem_declaracao", label: "Sem declaração" }
                ],
                required: true
            },
            {
                "name": "rendaFamiliarMensal",
                "label": "Renda familiar mensal",
                "type": "select",
                "options": [
                    {
                        "value": "ate_1500",
                        "label": "Até R$1.500,00 (Baixa renda, de acordo com o recorte do IBGE e critérios do Minha Casa Minha Vida.)"
                    },
                    {
                        "value": "de_1500_a_3000",
                        "label": "De R$1.500,01 a R$3.000,00 (Baixa renda, de acordo com o recorte do IBGE e critérios do Minha Casa Minha Vida.)"
                    },
                    {
                        "value": "de_3000_a_6000",
                        "label": "De R$3.000,01 a R$6.000,00 (Classe média baixa, segundo classificação socioeconômica do IBGE.)"
                    },
                    {
                        "value": "de_6000_a_9000",
                        "label": "De R$6.000,01 a R$9.000,00 (Classe média intermediária.)"
                    },
                    {
                        "value": "de_9000_a_12000",
                        "label": "De R$9.000,01 a R$12.000,00 (Classe média alta.)"
                    },
                    {
                        "value": "de_12000_a_15000",
                        "label": "De R$12.000,01 a R$15.000,00 (Alta renda inicial.)"
                    },
                    {
                        "value": "acima_15000",
                        "label": "Acima de R$15.000,00 (Alta renda consolidada.)"
                    }
                ],
                "required": true
            },
            {
                "name": "nivelEscolaridade",
                "label": "Nível de Escolaridade",
                "type": "select",
                "options": [
                    {
                        "value": "fundamental_incompleto",
                        "label": "Ensino Fundamental Incompleto"
                    },
                    {
                        "value": "fundamental_completo",
                        "label": "Ensino Fundamental Completo"
                    },
                    {
                        "value": "medio_incompleto",
                        "label": "Ensino Médio Incompleto"
                    },
                    {
                        "value": "medio_completo",
                        "label": "Ensino Médio Completo"
                    },
                    {
                        "value": "graduacao_incompleta",
                        "label": "Graduação Incompleta"
                    },
                    {
                        "value": "graduacao_completa",
                        "label": "Graduação Completa"
                    },
                    {
                        "value": "pos_lato_sensu",
                        "label": "Pós-Graduação Lato Sensu"
                    },
                    {
                        "value": "pos_stricto_sensu",
                        "label": "Pós-Graduação Stricto Sensu"
                    }
                ],
                "required": true
            },
            {
                "name": "areaConhecimentoEscolaridade",
                "label": "Área do conhecimento da escolaridade",
                "type": "select",
                "options": [
                    {
                        "value": "ciencias_exatas_terra",
                        "label": "Ciências Exatas e da Terra"
                    },
                    {
                        "value": "ciencias_biologicas",
                        "label": "Ciências Biológicas"
                    },
                    {
                        "value": "engenharias",
                        "label": "Engenharias"
                    },
                    {
                        "value": "ciencias_saude",
                        "label": "Ciências da Saúde"
                    },
                    {
                        "value": "ciencias_agrarias",
                        "label": "Ciências Agrárias"
                    },
                    {
                        "value": "linguistica_letras_artes",
                        "label": "Linguística, Letras e Artes"
                    },
                    {
                        "value": "ciencias_sociais_aplicadas",
                        "label": "Ciências Sociais Aplicadas"
                    },
                    {
                        "value": "ciencias_humanas",
                        "label": "Ciências Humanas"
                    }
                ],
                "required": true
            },
            {
                name: "especialidade",
                label: "Especialidade",
                type: "string",
                required: false
            }
        ],
        experiencia: [{
            "name": "anosExperienciaCultural",
            "label": "Anos de experiência na área cultural",
            "type": "select",
            "options": [
                {
                    "value": "menos_de_2",
                    "label": "Menos de 2 anos"
                },
                {
                    "value": "entre_2_e_5",
                    "label": "Entre 2 e 5 anos"
                },
                {
                    "value": "entre_6_e_10",
                    "label": "Entre 6 e 10 anos"
                },
                {
                    "value": "mais_de_10",
                    "label": "Mais de 10 anos"
                }
            ],
            "required": true
        },
        {
            "name": "acessouRecursosPublicosCultura",
            "label": "Já acessou recursos públicos do fomento à cultura nos últimos 5 anos?",
            "type": "select",
            "options": [
                {
                    "value": "sim",
                    "label": "Sim"
                },
                {
                    "value": "nao",
                    "label": "Não"
                }
            ],
            "required": true
        },
        {
            "name": "desenvolveuAtividadesCulturais",
            "label": "No último ano, desenvolveu atividades culturais de forma autônoma ou como empregado?",
            "type": "select",
            "options": [
                {
                    "value": "autonomo",
                    "label": "Autônomo"
                },
                {
                    "value": "empregado_instituicao_cultural",
                    "label": "Empregado em instituição cultural"
                },
                {
                    "value": "empregado_outro_setor",
                    "label": "Empregado em outro setor"
                },
                {
                    "value": "nao_desenvolve",
                    "label": "Não desenvolvo"
                }
            ],
            "required": true
        },
        {
            "name": "principalAreaAtuacaoCultural",
            "label": "Principal área de atuação cultural:",
            "type": "select",
            "options": [
                {
                    "value": "arquitetura",
                    "label": "Arquitetura"
                },
                {
                    "value": "atividades_artesanais",
                    "label": "Atividades Artesanais"
                },
                {
                    "value": "artes_cenicas",
                    "label": "Artes Cênicas"
                },
                {
                    "value": "artes_visuais",
                    "label": "Artes Visuais"
                },
                {
                    "value": "bibliotecas_literatura",
                    "label": "Bibliotecas e Literatura"
                },
                {
                    "value": "cinema_radio_tv",
                    "label": "Cinema, Rádio e TV"
                },
                {
                    "value": "musica",
                    "label": "Música"
                },
                {
                    "value": "arte_digital_jogos_digitais",
                    "label": "Arte Digital e Jogos Digitais"
                },
                {
                    "value": "design",
                    "label": "Design"
                },
                {
                    "value": "editorial",
                    "label": "Editorial"
                },
                {
                    "value": "moda",
                    "label": "Moda"
                },
                {
                    "value": "museus",
                    "label": "Museus"
                },
                {
                    "value": "outro",
                    "label": "Outro"
                }
            ],
            "required": true
        },
        {
            "name": "demaisAreasAtuacaoCultural",
            "label": "Demais áreas de atuação cultural:",
            "type": "multiselect",
            "options": [
                {
                    "value": "arquitetura",
                    "label": "Arquitetura"
                },
                {
                    "value": "atividades_artesanais",
                    "label": "Atividades Artesanais"
                },
                {
                    "value": "artes_cenicas",
                    "label": "Artes Cênicas"
                },
                {
                    "value": "artes_visuais",
                    "label": "Artes Visuais"
                },
                {
                    "value": "bibliotecas_literatura",
                    "label": "Bibliotecas e Literatura"
                },
                {
                    "value": "cinema_radio_tv",
                    "label": "Cinema, Rádio e TV"
                },
                {
                    "value": "musica",
                    "label": "Música"
                },
                {
                    "value": "arte_digital_jogos_digitais",
                    "label": "Arte Digital e Jogos Digitais"
                },
                {
                    "value": "design",
                    "label": "Design"
                },
                {
                    "value": "editorial",
                    "label": "Editorial"
                },
                {
                    "value": "moda",
                    "label": "Moda"
                },
                {
                    "value": "museus",
                    "label": "Museus"
                },
                {
                    "value": "outro",
                    "label": "Outro"
                }
            ],
            "required": true
        },
        {
            name: "ocupacao",
            label: "Principal ocupação/profissão no campo artístico e cultural",
            type: "string",
            required: false
        }],
        aspectosFinanceiros: [
            {
                "name": "rendaAnualCultural",
                "label": "Renda anual relacionada à atividade cultural",
                "type": "select",
                "options": [
                    {
                        "value": "ate_18000",
                        "label": "Até R$ 18.000,00"
                    },
                    {
                        "value": "entre_18000_36000",
                        "label": "Entre R$ 18.000,01 e R$ 36.000,00"
                    },
                    {
                        "value": "entre_36000_72000",
                        "label": "Entre R$ 36.000,01 e R$ 72.000,00"
                    },
                    {
                        "value": "entre_72000_108000",
                        "label": "Entre R$ 72.000,01 e R$ 108.000,00"
                    },
                    {
                        "value": "mais_de_108000",
                        "label": "Mais de R$ 108.000,00"
                    }
                ],
                "required": true
            },
            {
                "name": "dependenciaFinanceiraCultural",
                "label": "Dependência financeira da atividade cultural",
                "type": "select",
                "options": [
                    {
                        "value": "fomento_essencial",
                        "label": "Trabalho em outras áreas, mas o fomento cultural é essencial para minha renda"
                    },
                    {
                        "value": "complemento_eventual",
                        "label": "A cultura é apenas um complemento eventual da minha renda"
                    },
                    {
                        "value": "voluntario",
                        "label": "Atuo voluntariamente na cultura"
                    }
                ],
                "required": true
            }],
        objetivos: [{
            "name": "principalObjetivo",
            "label": "Principal objetivo ao participar dos programas",
            "type": "select",
            "options": [
                {
                    "value": "desenvolvimento_pessoal_profissional",
                    "label": "Desenvolvimento pessoal e profissional"
                },
                {
                    "value": "contribuicao_comunidade",
                    "label": "Contribuição para a comunidade"
                },
                {
                    "value": "reconhecimento_artistico",
                    "label": "Reconhecimento artístico e institucional"
                },
                {
                    "value": "geracao_renda",
                    "label": "Geração de renda e sustentabilidade financeira"
                }
            ],
            "required": true
        },
        {
            "name": "contribuicaoCultural",
            "label": "Como pretende contribuir para o enriquecimento cultural",
            "type": "select",
            "options": [
                {
                    "value": "promocao_diversidade",
                    "label": "Promoção da diversidade e inclusão cultural"
                },
                {
                    "value": "educacao_formacao",
                    "label": "Educação e formação cultural"
                },
                {
                    "value": "inovacao_experimentacao",
                    "label": "Inovação e experimentação artística"
                },
                {
                    "value": "preservacao_patrimonio",
                    "label": "Preservação do patrimônio cultural e memória"
                },
                {
                    "value": "desenvolvimento_talentos",
                    "label": "Desenvolvimento de novos talentos e redes de colaboração..."
                }
            ],
            "required": true
        },
        {
            "name": "participacaoCultural",
            "label": "Participação em grupos ou movimentos culturais",
            "type": "select",
            "options": [
                {
                    "value": "atuacao_formal",
                    "label": "Atuação formal (participação ativa e lideranças em coletivos...)"
                },
                {
                    "value": "atuacao_informal",
                    "label": "Atuação informal (envolvimento esporádico, sem papel formal...)"
                },
                {
                    "value": "consumo_sem_participacao",
                    "label": "Consumo de cultura sem participação ativa"
                }
            ],
            "required": true
        },
        {
            "name": "participacaoCulturalInfancia",
            "label": "Participou de atividades culturais na infância e adolescência",
            "type": "multiselect",
            "options": [
                {
                    "value": "grupos_escola",
                    "label": "Participou de Grupos de Teatro, Dança ou Música na Escola"
                },
                {
                    "value": "cursos_artes",
                    "label": "Frequentou Cursos de Artes"
                },
                {
                    "value": "eventos_comunidade",
                    "label": "Participou de Eventos Culturais na Comunidade"
                },
                {
                    "value": "fabricas_cultura",
                    "label": "Fábricas de Cultura"
                },
                {
                    "value": "oficinas_culturais",
                    "label": "Oficinas Culturais"
                },
                {
                    "value": "projeto_guri",
                    "label": "Projeto Guri"
                },
                {
                    "value": "nao_teve_participacao_ativa",
                    "label": "Não teve participação ativa"
                },
                {
                    "value": "nao_teve_envolvimento",
                    "label": "Não teve envolvimento com Atividades Culturais"
                }
            ],
            "required": true
        },
        {
            "name": "nomeInstituicoes",
            "label": "Nome das instituições que frequentou",
            "type": "string",
            "placeholder": "Nome das instituições que frequentou",
            "required": false
        }
        ],

    }
};