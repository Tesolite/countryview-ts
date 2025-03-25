//type for displaying countries on homepage
type CountryPreview = {
  flag: string;
  commonName: string;
  nativeName: string;
  continent: string;
};

//Function for displaying countries on homepage
const displayCountryPreview = (country: CountryPreview) => {
  //Setting parameters through input CountryPreview variable
  let flag: string = country.flag;
  let commonName: string = country.commonName;
  let nativeName: string = country.nativeName;
  let continent: string = country.continent;

  //Setting references to country display and grid templates.
  const template = document.getElementById("country-template");
  if (!template) return;

  let grid: HTMLElement | null = document.getElementById(
    "country-display-area",
  );
  if (!grid) return;

  //Cloning the template and filling it with passed data
  let populatedTemplate = template.cloneNode(true) as HTMLDivElement;

  populatedTemplate.id = commonName.toLowerCase().replaceAll(" ", "-");

  let previewFlag: HTMLImageElement | null =
    populatedTemplate.querySelector(".preview-flag");
  let commonNameSelector: HTMLHeadingElement | null =
    populatedTemplate.querySelector(".preview-common-name");
  let nativeNameSelector: HTMLHeadingElement | null =
    populatedTemplate.querySelector(".preview-native-name");
  let continentSelector: HTMLHeadingElement | null =
    populatedTemplate.querySelector(".preview-continent");

  if (previewFlag) {
    previewFlag.src = flag;
  }
  if (commonNameSelector) {
    commonNameSelector.textContent = commonName;
  }
  if (nativeNameSelector) {
    nativeNameSelector.textContent = nativeName;
  }
  if (continentSelector) {
    continentSelector.textContent = continent;
  }

  //Appending populated country display into the displayed grid.
  grid.appendChild(populatedTemplate);
  document
    .getElementById(`${populatedTemplate.id}`)
    ?.classList.replace("hidden", "flex");
};

//Function for displaying all countries stores in the RESTCountries API.
const getCountries = async () => {
  const url: string =
    "https://restcountries.com/v3.1/all?fields=name,flags,region";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error fetching country data. Status " + response.status);
    }

    const data = await response.json();

    //Iterate through each country in the JSON of the fetched API
    for (let country of data) {
      //Traverse the JSON to object containing native names and choose first available option
      //If none available, common name will be displayed as the native name.
      let findNativeName = country.name.common;
      console.log(country);
      if (country.name.nativeName) {
        const values: any[] | undefined | null = Object.values(
          country.name.nativeName,
        );
        if (values[0]) {
          findNativeName = values[0].common;
        }
      }
      console.log(findNativeName);
      //Save values to CountryPreview type and call display function
      let preview: CountryPreview = {
        flag: country.flags.svg,
        commonName: country.name.common,
        nativeName: findNativeName,
        continent: country.region,
      };

      displayCountryPreview(preview);
    }
  } catch (error) {
    console.error(error);
  }
};

const getContinentPreviews = (continent: string) => {
  const displayedCountries = document.getElementById(
    "country-display-area",
  )?.children;
  if (!displayedCountries) return;

  for (let country of displayedCountries) {
    const countryContinent = getCountryPreviewContent(country.id, "continent");
    if (countryContinent !== continent) {
      country.classList.replace("flex", "hidden");
    } else {
      country.classList.replace("hidden", "flex");
    }
  }
};

const combinedSearch = async (query: string): Promise<string[]> => {
  const commonNameSearch = await searchByCommonName(query);
  const foreignNameSearch = await searchByForeignName(query);
  const codeSearch = await searchByCountryCode(query);

  let combinedResults: Set<string> = new Set(
    commonNameSearch.concat(foreignNameSearch, codeSearch),
  );

  return Array.from(combinedResults.values());
};

const searchByCommonName = async (query: string): Promise<string[]> => {
  let matchingCountries: string[] = [];
  const url = `https://restcountries.com/v3.1/name/${query}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error fetching country data. Status " + response.status);
    }
    const data = await response.json();
    for (let datum of data) {
      matchingCountries.push(datum.name.common);
    }
  } catch (error) {
    console.warn(error);
    return [];
  }

  return matchingCountries;
};

const searchByForeignName = async (query: string): Promise<string[]> => {
  let matchingCountries: string[] = [];
  const url = `https://restcountries.com/v3.1/translation/${query}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error fetching country data. Status " + response.status);
    }

    const data = await response.json();

    for (let datum of data) {
      matchingCountries.push(datum.name.common);
    }
  } catch (error) {
    console.warn(error);
    return [];
  }

  return matchingCountries;
};

const searchByCountryCode = async (query: string): Promise<string[]> => {
  let matchingCountries: string[] = [];
  const url = `https://restcountries.com/v3.1/alpha/${query}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error fetching search data. Status " + response.status);
    }

    const data = await response.json();

    for (let datum of data) {
      matchingCountries.push(datum.name.common);
    }
  } catch (error) {
    console.warn(error);
    return [];
  }

  return matchingCountries;
};

const getCountryPreviewContent = (
  countryID: string,
  content: "commonName" | "continent",
): string | null => {
  const countryTemplate = document.getElementById(countryID);
  if (!countryTemplate) return null;
  const countryInfo = countryTemplate.children[1] as HTMLDivElement;

  switch (content) {
    case "commonName":
      const commonNameContainer = countryInfo.children[0];
      const commonNameContent = commonNameContainer.textContent as string;
      return commonNameContent;

    case "continent":
      const continentContainer = countryInfo.children[2] as HTMLHeadingElement;
      const continentContent = continentContainer.textContent as string;
      return continentContent;
  }
};
