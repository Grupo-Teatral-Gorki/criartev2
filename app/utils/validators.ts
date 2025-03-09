import { InfoGeraisProps } from "../(main)/criar/secoes/InfoGerais";
import { citiesConstant } from "./constants";

export const findCityLabel = (value: string): string => {
  const city = citiesConstant.find((city) => city.value === String(value)); // Convert value to string
  return city ? city.label : "cidade não encontrada";
};

export function separateByType(infoList: InfoGeraisProps[]) {
  const textFields: InfoGeraisProps[] = [];
  const selectFields: InfoGeraisProps[] = [];

  infoList.forEach((item) => {
    if (item.type === "text") {
      textFields.push(item);
    } else if (item.type === "select") {
      selectFields.push(item);
    }
  });

  return { textFields, selectFields };
}
