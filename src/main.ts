//TODO: MANAGE SEARCHES WITH 0 RESULTS
const formSearch = document.getElementById("search-bar");
if (formSearch) {
  const inQuery: HTMLInputElement = document.getElementById(
    "search-country",
  ) as HTMLInputElement;
  formSearch.onsubmit = (event) => {
    event.preventDefault();
    getSearchPreview(inQuery.value);
  };
}

const btnHamburger = document.getElementById("btn-burger") as HTMLButtonElement;

document.addEventListener("DOMContentLoaded", (): void => {
  if (document.location.pathname.endsWith("index.html")) {
    displayCountries();
  }
});

const navAsia = document.getElementById("nav-asia");
navAsia?.addEventListener("click", () => {
  getContinentPreviews("asia");
});
const navAfrica = document.getElementById("nav-africa");
navAfrica?.addEventListener("click", () => {
  getContinentPreviews("africa");
});
const navEurope = document.getElementById("nav-europe");
navEurope?.addEventListener("click", () => {
  getContinentPreviews("europe");
});
const navNorthAmerica = document.getElementById("nav-americas");
navNorthAmerica?.addEventListener("click", () => {
  getContinentPreviews("americas");
});
const navOceania = document.getElementById("nav-oceania");
navOceania?.addEventListener("click", () => {
  getContinentPreviews("oceania");
});
const navAntarctica = document.getElementById("nav-antarctic");
navAntarctica?.addEventListener("click", () => {
  getContinentPreviews("antarctic");
});

btnHamburger?.addEventListener("click", () => {
  const isOpen = btnHamburger.classList.contains("menu-open") ? true : false;
  if (!isOpen) {
    btnHamburger.classList.replace("menu-closed", "menu-open");
    return;
  }
  btnHamburger.classList.replace("menu-open", "menu-closed");
});

type CountryDetails = {
  flag: string;
  flagAlt: string;
  coatofArms: string;
  name: string;
  nativeName: string;
  capital: string;
  area: number;
  currencies: string[];
  population: number;
  languages: string[];
  landlocked: boolean;
  independent: boolean;
  unMember: boolean;
};
//type for displaying countries on homepage
type CountryPreview = {
  flag: string;
  commonName: string;
  nativeName: string;
  continent: string;
};

//Function for displaying countries on homepage
const displayPreview = (country: CountryPreview) => {
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
const displayCountries = async () => {
  const url: string =
    "https://restcountries.com/v3.1/all?fields=name,flags,region";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error fetching country data. Status " + response.status);
    }

    const data = await response.json();
    const gatheredData: CountryPreview[] = [];

    //Iterate through each country in the JSON of the fetched API
    for (let country of data) {
      //Traverse the JSON to object containing native names and choose first available option
      //If none available, common name will be displayed as the native name.
      let findNativeName = country.name.common;
      if (country.name.nativeName) {
        const values: any[] | undefined | null = Object.values(
          country.name.nativeName,
        );
        if (values[0]) {
          findNativeName = values[0].common;
        }
      }
      //Save values to CountryPreview type and push into array
      let preview: CountryPreview = {
        flag: country.flags.svg,
        commonName: country.name.common,
        nativeName: findNativeName,
        continent: country.region,
      };
      gatheredData.push(preview);
    }

    const sortedData: CountryPreview[] = gatheredData.sort((a, b) =>
      a.commonName > b.commonName ? 1 : a.commonName < b.commonName ? -1 : 0,
    );
    for (let sortedCountry of sortedData) {
      displayPreview(sortedCountry);
    }
  } catch (error) {
    console.error(error);
  }
};

const detailedCountryInfo = async (country: string): Promise<void> => {
  const url = `https://restcountries.com/v3.1/name/${country}?fields=coatOfArms,name,capital,area,currencies,population,languages,landlocked,independent,unMember,flags`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Error fetching country details. Status " + response.status,
      );
    }

    console.log("data fetched");
    const data = await response.json();
    const countryData = data[0];

    const nativeNameKey: string = Object.keys(countryData.name.nativeName)[0];
    const nativeNameOfficial =
      countryData.name.nativeName[nativeNameKey].official;

    const details: CountryDetails = {
      flag: countryData.flags.svg,
      flagAlt: countryData.flags.alt,
      coatofArms: countryData.coatOfArms.svg,
      name: countryData.name.common,
      nativeName: nativeNameOfficial,
      capital: countryData.capital,
      area: countryData.area,
      currencies: countryData.currencies,
      population: countryData.population,
      languages: countryData.languages,
      landlocked: countryData.landlocked,
      independent: countryData.independent,
      unMember: countryData.unMember,
    };
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
    const countryContinent: string = getCountryPreviewContent(
      country.id,
      "continent",
    ) as string;
    if (countryContinent.toLowerCase() !== continent.toLowerCase()) {
      country.classList.replace("flex", "hidden");
      continue;
    }
    country.classList.replace("hidden", "flex");
  }
};
const getSearchPreview = async (query: string) => {
  const displayedCountries = document.getElementById(
    "country-display-area",
  )?.children;
  if (query.length === 0) {
    displayCountries();
    return;
  }
  const searchResults = await combinedSearch(query);
  if (!displayedCountries) return;

  for (let country of displayedCountries) {
    const countryCommonName = getCountryPreviewContent(
      country.id,
      "commonName",
    );
    if (!countryCommonName) continue;
    if (!searchResults.includes(countryCommonName)) {
      country.classList.replace("flex", "hidden");
    } else {
      country.classList.replace("hidden", "flex");
    }
  }
};

const combinedSearch = async (query: string): Promise<string[]> => {
  let commonNameSearch = await searchByCommonName(query);
  let foreignNameSearch = await searchByForeignName(query);
  const codeSearch = await searchByCountryCode(query);

  // Prevent country code search results from being diluted by other search results
  if (codeSearch.length > 0) {
    commonNameSearch = [];
    foreignNameSearch = [];
  }

  let combinedResults: Set<string> = new Set(
    commonNameSearch.concat(foreignNameSearch, codeSearch),
  );

  return Array.from(combinedResults.values());
};

const searchByCommonName = async (query: string): Promise<string[]> => {
  query = query.toLowerCase();
  let matchingCountries: string[] = [];
  const url = `https://restcountries.com/v3.1/name/${query}?fields=name,altSpellings`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error fetching country data. Status " + response.status);
    }
    const data = await response.json();
    for (let datum of data) {
      const commonNameLower = datum.name.common.toLowerCase();
      const altSpellingsLower = datum.altSpellings.map((spelling: string) =>
        spelling.toLowerCase(),
      );
      let nameMatchesSearch =
        commonNameLower.includes(query) || altSpellingsLower.includes(query)
          ? true
          : false;
      if (nameMatchesSearch) {
        matchingCountries.push(datum.name.common);
      }
    }
  } catch (error) {
    console.warn(error);
    return [];
  }

  return matchingCountries;
};

const searchByForeignName = async (query: string): Promise<string[]> => {
  let matchingCountries: string[] = [];
  const url = `https://restcountries.com/v3.1/translation/${query}?fields=name,translations`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error fetching country data. Status " + response.status);
    }

    const data = await response.json();

    for (let datum of data) {
      let commonTranslationMatchesSearch: boolean = false;
      //Traverse the country's JSON to object containing name translations
      //and check if any match search query
      //If any do, add to list of countries to display
      let translations: any[] | undefined | null = Object.values(
        datum.translations,
      );
      if (translations) {
        for (let translation of translations) {
          let commonTranslationLower = translation.common.toLowerCase();
          if (!commonTranslationMatchesSearch) {
            commonTranslationMatchesSearch = commonTranslationLower.startsWith(
              query,
            )
              ? true
              : false;
          }
        }
      }
      if (commonTranslationMatchesSearch) {
        matchingCountries.push(datum.name.common);
      }
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
