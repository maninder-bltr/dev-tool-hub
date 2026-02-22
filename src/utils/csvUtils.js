import Papa from 'papaparse';

export const csvToJson = (csvString) => {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });
  if (result.errors.length) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};

export const jsonToCsv = (jsonArray) => {
  return Papa.unparse(jsonArray);
};