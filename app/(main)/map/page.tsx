import TypeCard from "@/app/components/TypeCard";

export default function Map() {
  const typeOfProject = [
    {
      title: "Coletivo sem CNPJ",
      description: "",
      link: "/map/coletivo-sem-cnpj",
      linkString: "Cadastrar",
    },
    {
      title: "Espaço Cultural",
      description: "",
      link: "/map/espaco-cultural",
      linkString: "Cadastrar",
    },
    {
      title: "Agente Cultural",
      description: "",
      link: "/map/agente-cultural",
      linkString: "Cadastrar",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h2 className="mb-20 text-2xl uppercase font-bold">Escolha uma opção</h2>
      <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-16">
        {typeOfProject.map((project) => (
          <TypeCard
            key={project.title}
            title={project.title}
            description={project.description}
            link={project.link}
            linkString={project.linkString}
          />
        ))}
      </div>
    </div>
  );
}
