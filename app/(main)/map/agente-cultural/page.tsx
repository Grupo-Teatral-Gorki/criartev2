/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChangeEvent, Suspense, useEffect, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import {
  inputFields,
  livingAreaOptions,
  communities,
  genderOptions,
  ethnicityOptions,
  disabilityOptions,
  educationLevelOptions,
  incomeOptions,
  socialProgramOptions,
  experienceOptions,
  artisticSegmentOptions,
} from "./agenteConsts";
import { getDownloadURL, uploadBytes, ref } from "firebase/storage";
import { useRouter } from "next/navigation";
import { db, storage } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import Toast from "@/app/components/Toast";

const RegisterProject = () => {
  const [culturalAgentFormData, setCulturalAgentFormData] = useState<{
    [key: string]: string;
  }>({});
  const [hasDRT, setHasDRT] = useState(false);
  const [drtNumber, setDrtNumber] = useState("");
  const [hasMEI, setHasMEI] = useState(false);
  const [livingArea, setLivingArea] = useState("");
  const [community, setCommunity] = useState("");
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [isPCD, setIsPCD] = useState(false);
  const [disability, setDisability] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [income, setIncome] = useState("");
  const [socialProgram, setSocialProgram] = useState("");
  const [dependency, setDependency] = useState(false);
  const [artisticSegment, setArtisticSegment] = useState("");
  const [otherArtisticSegment, setOtherArtisticSegment] = useState("");
  const [experience, setExperience] = useState("");
  const [otherIncentives, setOtherIncentives] = useState(false);
  const [otherIncentiveName, setOtherIncentiveName] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [objective, setObjective] = useState("");
  const [partOfAGroup, setPartOfAGroup] = useState(false);
  const [whichGroup, setWhichGroup] = useState("");
  const [history, setHistory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cityId, setCityId] = useState("");
  const router = useRouter();
  const { dbUser } = useAuth();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCulturalAgentFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const requestBody = {
      ...culturalAgentFormData,
      hasDRT,
      hasMEI,
      drtNumber,
      livingArea,
      community,
      gender,
      ethnicity,
      isPCD,
      disability,
      educationLevel,
      income,
      socialProgram,
      dependency,
      artisticSegment,
      otherArtisticSegment,
      experience,
      otherIncentives,
      otherIncentiveName,
      employmentType,
      objective,
      partOfAGroup,
      whichGroup,
      history,
      cityId,
    };

    const uploaded = await handleUpload();

    if (uploaded) {
      try {
        const docRef = await addDoc(collection(db, "agentes"), requestBody);
        setToastMessage(`Agente Cultural cadastrado com sucesso! ID: ${docRef.id}`);
        setToastType("success");
        setShowToast(true);
        setTimeout(() => {
          router.push("/register-project/sucess");
        }, 2000);
      } catch (error) {
        console.error(error);
        setToastMessage("Erro ao cadastrar agente cultural. Tente novamente.");
        setToastType("error");
        setShowToast(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleMaxLines = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const lines = event.target.value.split("\n");
    if (lines.length <= 30) {
      setHistory(event.target.value);
    } else return;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUpload = async () => {
    const uploadedUrls: string[] = [];
    try {
      for (const file of selectedFiles!) {
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
        {inputFields.map((input, index) => {
          return (
            <div className="mb-4" key={index}>
              <label className="block mb-1 font-semibold">{input.label}</label>
              <input
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-300"
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-300"
                type="text"
                value={drtNumber}
                onChange={(e) => setDrtNumber(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Você possui MEI?</label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasMEI"
                value="yes"
                onChange={() => setHasMEI(true)}
                checked={hasMEI === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="hasMEI"
                value="no"
                onChange={() => setHasMEI(false)}
                checked={hasMEI === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Você é uma Pessoa com Deficiência - PCD?
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
                {'Caso tenha marcado "sim", qual tipo de deficiência?'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {disabilityOptions.map((option) => {
                  return (
                    <label
                      className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                      key={option.id}
                    >
                      <input
                        type="radio"
                        name={option.name}
                        value={option.value}
                        onChange={() => setDisability(option.value)}
                        checked={disability === option.value}
                        className="w-5 h-5 text-blue-600 border-gray-300 "
                      />
                      {option.display}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Você reside em qual dessas áreas?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {livingAreaOptions.map((option) => (
              <label
                className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                key={option.id}
              >
                <input
                  type="radio"
                  name="livingArea"
                  value={option.value}
                  onChange={() => setLivingArea(option.value)}
                  checked={livingArea === option.value}
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
              Pertence a alguma comunidade tradicional?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {communities.map((option) => (
                <label
                  className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                  key={option.id}
                >
                  <input
                    type="radio"
                    name="community"
                    value={option.value}
                    onChange={() => setCommunity(option.value)}
                    checked={community === option.value}
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
            <label className="block mb-1 font-semibold">Gênero</label>
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
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Qual o seu grau de escolaridade?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {educationLevelOptions.map((option) => (
              <label
                className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                key={option.id}
              >
                <input
                  type="radio"
                  name="educationLevel"
                  value={option.value}
                  onChange={() => setEducationLevel(option.value)}
                  checked={educationLevel === option.value}
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
            Qual a sua renda mensal fixa individual (média mensal bruta
            aproximada) nos últimos 3 meses?
            <p className="text-sm text-gray-500">
              (Calcule fazendo uma média das suas remunerações nos últimos 3
              meses. Em 2023, o salário mínimo foi fixado em R$ 1.320,00.)
            </p>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {incomeOptions.map((option) => (
              <label
                className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                key={option.id}
              >
                <input
                  type="radio"
                  name="income"
                  value={option.value}
                  onChange={() => setIncome(option.value)}
                  checked={income === option.value}
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
            Você é beneficiário de algum programa social?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {socialProgramOptions.map((option) => (
              <label
                className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                key={option.id}
              >
                <input
                  type="radio"
                  name="socialProgram"
                  value={option.value}
                  onChange={() => setSocialProgram(option.value)}
                  checked={socialProgram === option.value}
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
            Dependência Financeira da Atividade Cultural ?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="isDependent"
                value="yes"
                onChange={() => setDependency(true)}
                checked={dependency === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="isDependent"
                value="no"
                onChange={() => setDependency(false)}
                checked={dependency === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
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
            Qual seu segmento artístico:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {artisticSegmentOptions.map((option) => (
              <label
                className="flex items-center p-4 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                key={option.id}
              >
                <input
                  type="radio"
                  name="artisticSegment"
                  value={option.value}
                  onChange={() => setArtisticSegment(option.value)}
                  checked={artisticSegment === option.value}
                  className="w-5 h-5 text-blue-600 border-gray-300 "
                />
                <span className="text-gray-700 font-medium">
                  {option.display}
                </span>
              </label>
            ))}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold"> Outro</label>
            <input
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-300"
              type="text"
              name="artisticSegment"
              value={otherArtisticSegment}
              onChange={(e) => setOtherArtisticSegment(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Qual grupo etnico você pertence?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ethnicityOptions.map((option) => (
              <label
                className="flex items-center p-8 gap-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
                key={option.id}
              >
                <input
                  type="radio"
                  name="ethnicity"
                  value={option.value}
                  onChange={() => setEthnicity(option.value)}
                  checked={ethnicity === option.value}
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-300"
                type="text"
                value={otherIncentiveName}
                onChange={(e) => setOtherIncentiveName(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            No último ano desenvolveu Atividades Culturais de Forma Autônoma ou
            como Empregado?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="employmentType"
                value="autônomo"
                onChange={() => setEmploymentType("autonomo")}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Autônomo
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="employmentType"
                value="empregado"
                onChange={() => setEmploymentType("empregado")}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Empregado
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Principal Objetivo ao Participar dos Programas de Incentivo a
            cultura?
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-300"
            type="text"
            name="objective"
            onChange={(e) => setObjective(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Participa de algum grupo ou coletivo de sua cidade?
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="partOfAGroup"
                value="yes"
                onChange={() => setPartOfAGroup(true)}
                checked={partOfAGroup === true}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Sim
            </label>
            <label className="flex items-center gap-4">
              <input
                type="radio"
                name="partOfAGroup"
                value="no"
                onChange={() => setPartOfAGroup(false)}
                checked={partOfAGroup === false}
                className="w-full p-2 border border-gray-300 rounded"
              />
              Não
            </label>
          </div>

          {partOfAGroup && (
            <div>
              <label className="block mb-1 font-semibold">Se sim, qual?</label>
              <input
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-300"
                type="text"
                value={whichGroup}
                onChange={(e) => setWhichGroup(e.target.value)}
              />
            </div>
          )}
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
            Anexe aqui seu portfólio
          </label>
          <input
            type="file"
            name="porfolio"
            className="w-full p-2 border border-gray-300 rounded"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e)}
            required
          />
        </div>

        <button
          className="w-full p-2 rounded bg-primary-600 hover:bg-primary-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
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

const RegisterProjectWithSuspense = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterProject />
    </Suspense>
  );
};

export default RegisterProjectWithSuspense;
