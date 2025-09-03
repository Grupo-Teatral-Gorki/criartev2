/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ChangeEvent, use, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { getDownloadURL, uploadBytes, ref } from "firebase/storage";
import { useRouter } from "next/navigation";
import { db, storage } from "@/app/config/firebaseconfig";
import Toast from "@/app/components/Toast";
import { useCity } from "@/app/context/CityConfigContext";

const collectiveContactForm = [
  {
    id: "contatoColetivo",
    name: "contatoColetivo",
    value: "",
    label: "Contato do coletivo",
    type: "text",
  },
  {
    id: "telefoneCelular",
    name: "telefoneCelular",
    value: "",
    label: "Telefone/celular",
    type: "tel",
  },
  {
    id: "emailContato",
    name: "emailContato",
    value: "",
    label: "E-mail para contato",
    type: "email",
  },
  {
    id: "redeSocial",
    name: "redeSocial",
    value: "",
    label: "Rede social",
    type: "text",
  },
  {
    id: "site",
    name: "site",
    value: "",
    label: "Site (opcional)",
    type: "url",
  },
  {
    id: "responsavelColetivo",
    name: "responsavelColetivo",
    value: "",
    label: "Nome Completo do Responsável do coletivo",
    type: "text",
  },
  {
    id: "nomeArtistico",
    name: "nomeArtistico",
    value: "",
    label: "Nome artístico ou nome social (se houver)",
    type: "text",
  },
  { id: "cpf", name: "cpf", value: "", label: "CPF", type: "text" },
  { id: "rg", name: "rg", value: "", label: "RG", type: "text" },
  {
    id: "dataNascimento",
    name: "dataNascimento",
    value: "",
    label: "Data de nascimento",
    type: "date",
  },
  { id: "email", name: "email", value: "", label: "E-mail", type: "email" },
  {
    id: "telefone",
    name: "telefone",
    value: "",
    label: "Telefone",
    type: "tel",
  },
];

const collectiveAddressFormFields = [
  {
    id: "enderecoCompleto",
    name: "enderecoCompleto",
    value: "",
    label: "Endereço completo",
    type: "text",
  },
  { id: "cep", name: "cep", value: "", label: "CEP", type: "text" },
  { id: "cidade", name: "cidade", value: "", label: "Cidade", type: "text" },
  { id: "estado", name: "estado", value: "", label: "Estado", type: "text" },
];
const artisticSegmentOptions = [
  {
    id: "artesVisuais",
    name: "artesVisuais",
    value: "artesVisuais",
    display:
      "Artes Visuais – Pintura, desenho, escultura, fotografia, gráficos digitais, peças expositivas de intervenção, entre outras formas de expressão artística visual.",
  },
  {
    id: "artesanato",
    name: "artesanato",
    value: "artesanato",
    display:
      "Artesanato – Produção resultante da transformação de matérias-primas como cerâmica, tecelagem, joalheria, marcenaria, entre outros.",
  },
  {
    id: "audiovisual",
    name: "audiovisual",
    value: "audiovisual",
    display:
      "Audiovisual – Mídias e produções com elementos visuais e auditivos como filmes (curta-metragem, longa-metragem, websérie, documentários etc), vídeos em geral, produções televisivas, animações, entre outros.",
  },
  {
    id: "culturaPopular",
    name: "culturaPopular",
    value: "culturaPopular",
    display:
      "Cultura Popular – Expressões culturais e tradições compartilhadas e praticadas individualmente ou em conjunto como música, dança, folclore, festivais e outras manifestações.",
  },
  {
    id: "culturaMatrizesAfricanas",
    name: "culturaMatrizesAfricanas",
    value: "culturaMatrizesAfricanas",
    display:
      "Cultura de Matrizes Africanas – Práticas culturais, crenças e tradições que têm origens nas culturas africanas e que foram preservadas e adaptadas no Brasil.",
  },
  {
    id: "culturaLGBTQIAP",
    name: "culturaLGBTQIAP",
    value: "culturaLGBTQIAP",
    display:
      "Cultura LGBTQIAP+ – Cultura associada à comunidade LGBTQIAP+, nas mais diversas expressões artísticas, com integrantes da comunidade ou em expressões dela, como exemplos performance drag, arte queer, entre outros.",
  },
  {
    id: "culturaUrbanaArteRua",
    name: "culturaUrbanaArteRua",
    value: "culturaUrbanaArteRua",
    display:
      "Cultura Urbana e Arte de Rua – Formas de expressão culturais que emergem das áreas urbanas como grafitti, breakdance, batalha de rimas, rap, movimento hip hop, discotecagem, entre outros.",
  },
  {
    id: "moda",
    name: "moda",
    value: "moda",
    display:
      "Moda – Atividades ligadas ao vestuário que expressam linguagens histórica, social e cultural, ligadas à memória e comportamento de grupos culturais, bem como a difusão da arte, estética e produção, por meio de vestimentas.",
  },
  {
    id: "teatro",
    name: "teatro",
    value: "teatro",
    display:
      "Teatro – Arte performática em que artistas representam personagens e situações para uma audiência ao vivo.",
  },
  {
    id: "danca",
    name: "danca",
    value: "danca",
    display:
      "Dança – Arte que envolve movimentos corporais ritmados e expressivos, que podem ser acompanhados de música.",
  },
  {
    id: "circo",
    name: "circo",
    value: "circo",
    display:
      "Circo – Arte e entretenimento a partir de performances como acrobacias, malabarismo, palhaçadas, entre outros.",
  },
  {
    id: "musica",
    name: "musica",
    value: "musica",
    display:
      "Música – Arte que envolve a construção de sons e ritmos, seja por instrumentos, voz ou por elementos tecnológicos.",
  },
  {
    id: "patrimonio",
    name: "patrimonio",
    value: "patrimonio",
    display:
      "Patrimônio – Bens culturais, naturais, materiais e imateriais, que são considerados valiosos para uma comunidade ou sociedade.",
  },
  {
    id: "literatura",
    name: "literatura",
    value: "literatura",
    display:
      "Literatura – Arte que engloba formas de expressão escrita, como romances, contos, poesia, ensaios, entre outros.",
  },
];
const experienceOptions = [
  {
    id: "ate2anos",
    name: "ate2anos",
    value: "ate2anos",
    display: "Até 2 anos",
  },
  {
    id: "maisde2anos",
    name: "maisde2anos",
    value: "maisde2anos",
    display: "Mais de 2 anos",
  },
  {
    id: "ate5anos",
    name: "ate5anos",
    value: "ate5anos",
    display: "Até 5 anos",
  },
  {
    id: "maisde5anos",
    name: "maisde5anos",
    value: "maisde5anos",
    display: "Mais de 5 anos",
  },
  {
    id: "ate10anos",
    name: "ate10anos",
    value: "ate10anos",
    display: "Até 10 anos",
  },
  {
    id: "maisde10anos",
    name: "maisde10anos",
    value: "maisde10anos",
    display: "Mais de 10 anos",
  },
];

const ColetivoSemCNPJ = () => {
  const [collectiveContactFormData, setCollectiveContactFormData] = useState(
    {}
  );
  const [collectiveAddressForm, setCollectiveAddressForm] = useState({});
  const [hasSpace, setHasSpace] = useState(false);
  const [hasDRT, setHasDRT] = useState(false);
  const [drtNumber, setDrtNumber] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [hasGrant, setHasGrant] = useState(false);
  const [grantName, setGrantName] = useState("");
  const [hasSocialActivity, setHasSocialActivity] = useState(false);
  const [socialActivity, setSocialActivity] = useState("");
  const [hasSocialEvent, setHasSocialEvent] = useState(false);
  const [socialEventName, setSocialEventName] = useState("");
  const [hasIncomeSource, setHasIncomeSource] = useState(false);
  const [incomeSource, setIncomeSource] = useState("");
  const [financialDependency, setFinancialDependency] = useState("");
  const [artisticSegment, setArtisticSegment] = useState("");
  const [otherArtisticSegment, setOtherArtisticSegment] = useState("");
  const [experience, setExperience] = useState("");
  const [otherIncentives, setOtherIncentives] = useState(false);
  const [otherIncentiveName, setOtherIncentiveName] = useState("");
  const [objective, setObjective] = useState("");
  const [history, setHistory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const router = useRouter();
  const city = useCity();
  const cityId = city.city.cityId;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCollectiveContactFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCollectiveAddressInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setCollectiveAddressForm((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestBody = {
      ...collectiveContactFormData,
      ...collectiveAddressForm,
      hasDRT,
      drtNumber,
      numberOfPeople,
      hasGrant,
      grantName,
      hasSocialActivity,
      socialActivity,
      hasSocialEvent,
      socialEventName,
      hasIncomeSource,
      incomeSource,
      financialDependency,
      artisticSegment,
      otherArtisticSegment,
      experience,
      otherIncentives,
      otherIncentiveName,
      objective,
      history,
      cityId,
      files: urls ? urls : null,
    };

    const isFileUploaded = await handleUpload();

    if (isFileUploaded) {
      try {
        const docRef = await addDoc(
          collection(db, "coletivoSemCNPJ"),
          requestBody
        );
        setToastMessage(`Coletivo cadastrado com sucesso! ID: ${docRef.id}`);
        setToastType("success");
        setShowToast(true);
        setTimeout(() => {
          router.push("/register-project/sucess");
        }, 2000);
      } catch (error) {
        setToastMessage("Erro ao cadastrar coletivo. Tente novamente.");
        setToastType("error");
        setShowToast(true);
      }
    }
  };
  const handleMaxLines = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const lines = event.target.value.split("\n");
    if (lines.length <= 30) {
      setHistory(event.target.value);
    } else return;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    const uploadedUrls: string[] = [];
    try {
      for (const file of selectedFiles) {
        const fileRef = ref(storage, `coletivoSemCNPJ/${file.name}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        uploadedUrls.push(fileUrl);
      }
      setUrls(uploadedUrls);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="max-w-[60rem] mx-auto mt-4 p-6 border border-gray-300 rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Cadastro</h1>
      <form onSubmit={handleSubmit}>
        {collectiveContactForm.map((input, index) => {
          return (
            <div className="mb-4" key={index}>
              <label className="block mb-1 font-semibold">{input.label}</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type={input.type}
                name={input.name}
                onChange={handleInputChange}
                required
              />
            </div>
          );
        })}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            O Coletivo possui espaço físico/sede?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasSpace"
                value="yes"
                onChange={() => setHasSpace(true)}
                checked={hasSpace === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasSpace"
                value="no"
                onChange={() => setHasSpace(false)}
                checked={hasSpace === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>

          {hasSpace &&
            collectiveAddressFormFields.map((input) => {
              return (
                <div key={input.id}>
                  <label className="block mb-1 font-semibold">
                    {input.label}
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded"
                    type={input.type}
                    name={input.name}
                    onChange={handleCollectiveAddressInput}
                    required
                  />
                </div>
              );
            })}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Possui DRT?</label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasDRT"
                value="yes"
                onChange={() => setHasDRT(true)}
                checked={hasDRT === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasDRT"
                value="no"
                onChange={() => setHasDRT(false)}
                checked={hasDRT === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>

          {hasDRT && (
            <div>
              <label className="block mb-1 font-semibold">
                Qual o número do seu DRT:
              </label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="text"
                value={drtNumber}
                onChange={(e) => setDrtNumber(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Quantas pessoas participam do coletivo?
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="text"
            name="numberOfPeople"
            onChange={(e) => setNumberOfPeople(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            O Coletivo já foi beneficiado por algum programa do município?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasGrant"
                value="yes"
                onChange={() => setHasGrant(true)}
                checked={hasGrant === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasGrant"
                value="no"
                onChange={() => setHasGrant(false)}
                checked={hasGrant === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>

          {hasGrant && (
            <div>
              <label className="block mb-1 font-semibold">Se sim, qual?</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="text"
                value={grantName}
                onChange={(e) => setGrantName(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Coletivo realiza alguma atividade social no município?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasSocialActivity"
                value="yes"
                onChange={() => setHasSocialActivity(true)}
                checked={hasSocialActivity === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasSocialActivity"
                value="no"
                onChange={() => setHasSocialActivity(false)}
                checked={hasSocialActivity === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>

          {hasSocialActivity && (
            <div>
              <label className="block mb-1 font-semibold">Se sim, qual?</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="text"
                value={socialActivity}
                onChange={(e) => setSocialActivity(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Coletivo organiza algum evento cultural no município?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasSocialEvent"
                value="yes"
                onChange={() => setHasSocialEvent(true)}
                checked={hasSocialEvent === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasSocialEvent"
                value="no"
                onChange={() => setHasSocialEvent(false)}
                checked={hasSocialEvent === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>

          {hasSocialEvent && (
            <div>
              <label className="block mb-1 font-semibold">Se sim, qual?</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="text"
                value={socialEventName}
                onChange={(e) => setSocialEventName(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Coletivo possui alguma fonte de renda?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasIncomeSource"
                value="yes"
                onChange={() => setHasIncomeSource(true)}
                checked={hasIncomeSource === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasIncomeSource"
                value="no"
                onChange={() => setHasIncomeSource(false)}
                checked={hasIncomeSource === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>

          {hasIncomeSource && (
            <div>
              <label className="block mb-1 font-semibold">Explique</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="text"
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Os participantes possuem dependência financeira da atividade
            cultural?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="financialDependency"
                value="yes"
                onChange={() => setFinancialDependency("yes")}
                checked={financialDependency === "yes"}
                className="p-2 border border-gray-300 rounded"
                aria-label="Dependência financeira: Sim"
              />
              Sim
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="financialDependency"
                value="no"
                onChange={() => setFinancialDependency("no")}
                checked={financialDependency === "no"}
                className="p-2 border border-gray-300 rounded"
                aria-label="Dependência financeira: Não"
              />
              Não
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="financialDependency"
                value="partially"
                onChange={() => setFinancialDependency("partially")}
                checked={financialDependency === "partially"}
                className="p-2 border border-gray-300 rounded"
                aria-label="Dependência financeira: Parcialmente"
              />
              Parcialmente
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Qual seu segmento artístico:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {artisticSegmentOptions.map((option) => (
              <label
                className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                key={option.id}
              >
                <input
                  type="radio"
                  name="artisticSegment"
                  value={option.value}
                  onChange={() => setArtisticSegment(option.value)}
                  checked={artisticSegment === option.value}
                  className="w-5 h-5 text-blue-600 border-gray-300"
                />
                <span className="text-gray-700 font-medium">
                  {option.display}
                </span>
              </label>
            ))}
          </div>
          <div className="mb-4 mt-4">
            <label className="block mb-1 font-semibold"> Outro</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              name="artisticSegment"
              value={otherArtisticSegment}
              onChange={(e) => setOtherArtisticSegment(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Anos de Experiência na Área Cultural:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {experienceOptions.map((option) => (
              <label
                className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                key={option.id}
              >
                <input
                  type="radio"
                  name="educationLevel"
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
            Já Recebeu Outros Incentivos Culturais ou Bolsas?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="otherIncentives"
                value="yes"
                onChange={() => setOtherIncentives(true)}
                checked={otherIncentives === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="otherIncentives"
                value="no"
                onChange={() => setOtherIncentives(false)}
                checked={otherIncentives === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>

          {otherIncentives && (
            <div>
              <label className="block mb-1 font-semibold">Se sim, qual:</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="text"
                value={otherIncentiveName}
                onChange={(e) => setOtherIncentiveName(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Principal objetivo ao participar dos Programas de Incentivo à
            Cultura?
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="text"
            name="objective"
            onChange={(e) => setObjective(e.target.value)}
            required
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
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Anexe aqui seu portfólio e dos principais integrantes
          </label>
          <input
            type="file"
            className="w-full p-2 border border-gray-300 rounded"
            accept="image/*,.pdf"
            multiple
            onChange={(e) => handleFileChange(e)}
            required
          />
        </div>
        <button
          className="w-full p-2 rounded bg-primary-600 hover:bg-primary-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          type="submit"
        >
          Enviar
        </button>
      </form>
      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ColetivoSemCNPJ;
