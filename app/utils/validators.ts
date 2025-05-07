/* eslint-disable @typescript-eslint/no-explicit-any */
import cities from "@/data/cities.json";
export const findCityLabel = (value: string): string => {
  const city = cities.find((city) => city.id === Number(value)); // Convert value to string
  return city ? `${city.nome} -  ${city?.uf}` : "cidade não encontrada";
};

export function separateByType(infoList: any) {
  const textFields: any = [];
  const selectFields: any = [];

  infoList.forEach((item: any) => {
    if (item.type === "text") {
      textFields.push(item);
    } else if (item.type === "select") {
      selectFields.push(item);
    }
  });

  return { textFields, selectFields };
}
