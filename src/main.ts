//TODO: MANAGE SEARCHES WITH 0 RESULTS (SUCH AS SHOWING "NO RESULTS FOUND")
//TODO: MAKE NAVBAR WORK EVEN OUT OF INDEX.HTML AKA USE URL PARAMETERS

const isHomepage =
  window.location.pathname === "/" || window.location.pathname === "/index.html"
    ? true
    : false;
let originURL = new URL(document.location.origin);

const formSearch = document.getElementById("search-bar");
if (formSearch) {
  const inQuery: HTMLInputElement = document.getElementById(
    "search-country",
  ) as HTMLInputElement;
  formSearch.onsubmit = (event) => {
    event.preventDefault();
    originURL.searchParams.delete("continent");
    originURL.searchParams.set("search", inQuery.value);

    if (isHomepage) {
      getSearchPreview(inQuery.value);
      const currentURL = new URL(window.location.href);
      currentURL.searchParams.set("search", inQuery.value);
      window.history.replaceState(null, "", currentURL);
    } else {
      window.open(originURL, "_self");
    }
  };
}

const btnHamburger = document.getElementById("btn-burger") as HTMLButtonElement;

document.addEventListener("DOMContentLoaded", (): void => {
  if (isHomepage) {
    displayCountries();
  }
});

//Navbar click event handling
const navContinents = [
  { id: "nav-asia", name: "asia" },
  { id: "nav-africa", name: "africa" },
  { id: "nav-europe", name: "europe" },
  { id: "nav-northamerica", name: "north america" },
  { id: "nav-southamerica", name: "south america" },
  { id: "nav-oceania", name: "oceania" },
  { id: "nav-antarctica", name: "antarctica" },
];

for (let navContinent of navContinents) {
  const continentPointer = document.getElementById(navContinent.id);
  if (!continentPointer) continue;
  continentPointer.addEventListener("click", () => {
    handleNavClick(navContinent.name);
  });
}

const handleNavClick = (continent: string): void => {
  originURL.searchParams.delete("search");
  originURL.searchParams.set("continent", continent);
  if (isHomepage) {
    getContinentPreviews(continent);
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.set("continent", continent);
    window.history.replaceState(null, "", currentURL);
  } else {
    window.open(originURL, "_self");
  }
};

btnHamburger?.addEventListener("click", () => {
  const isOpen = btnHamburger.classList.contains("menu-open") ? true : false;
  if (!isOpen) {
    btnHamburger.classList.replace("menu-closed", "menu-open");
    return;
  }
  btnHamburger.classList.replace("menu-open", "menu-closed");
});
//type for displaying countries on homepage
type CountryPreview = {
  flag: string;
  commonName: string;
  nativeName: string;
  continents: string[];
};

type CountryDetails = {
  flag: string;
  flagAlt: string;
  coatOfArms: string;
  name: string;
  nativeName: string;
  continents: string[];
  capital: string;
  area: number;
  currencies: { name: string; symbol: string }[];
  population: number;
  languages: string[];
  landlocked: boolean;
  independent: boolean;
  unMember: boolean;
};

type DetailsResponse = DetailsSuccess | DetailsFail;

type DetailsSuccess = {
  success: true;
  data: CountryDetails;
};

type DetailsFail = {
  success: false;
  message: Error;
};

//Function for displaying all countries stores in the RESTCountries API.
const displayCountries = async () => {
  const url: string =
    "https://restcountries.com/v3.1/all?fields=name,flags,region,continents";

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
        continents: country.continents,
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
  CheckURLParameters(new URL(window.location.href));
};

//Function for displaying countries on homepage
const displayPreview = (country: CountryPreview) => {
  //Setting parameters through input CountryPreview variable
  let flag: string = country.flag;
  let commonName: string = country.commonName;
  let nativeName: string = country.nativeName;
  let continents: string[] = country.continents;

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
    let continentText = "";
    for (let continent of continents) {
      continentText += ` ${continent},`;
    }
    //Trim whitespaces and remove comma.
    continentText = continentText.trimEnd().slice(0, -1);
    continentSelector.textContent = continentText;
  }

  //Appending populated country display into the displayed grid.
  grid.appendChild(populatedTemplate);
  document
    .getElementById(`${populatedTemplate.id}`)
    ?.classList.replace("hidden", "flex");
};

const CheckURLParameters = (url: URL) => {
  const continentParam = url.searchParams.get("continent");
  const userSearchParam = url.searchParams.get("search");
  if (userSearchParam) {
    getSearchPreview(userSearchParam);
    return;
  }
  if (continentParam) {
    getContinentPreviews(continentParam);
    console.log("foo");
  }
};

const displayCountryInfo = async (country: string): Promise<void> => {
  const countryInfo: DetailsResponse = await detailedCountryInfo(country);

  if (!countryInfo.success) {
    console.error(countryInfo.message);
    return;
  }
  const data = countryInfo.data;

  const commonName = document.getElementById(
    "country-name-common",
  ) as HTMLHeadingElement | null;
  const nativeName = document.getElementById(
    "country-name-native",
  ) as HTMLHeadingElement | null;
  const flag = document.getElementById(
    "country-flag",
  ) as HTMLImageElement | null;
  const coatOfArms = document.getElementById(
    "country-coatofarms",
  ) as HTMLImageElement | null;
  const continents = document.getElementById(
    "country-continent",
  ) as HTMLParagraphElement | null;
  const capital = document.getElementById(
    "country-capital",
  ) as HTMLParagraphElement | null;
  const area = document.getElementById(
    "country-area",
  ) as HTMLParagraphElement | null;
  const currencies = document.getElementById(
    "country-currencies",
  ) as HTMLParagraphElement | null;
  const population = document.getElementById(
    "country-population",
  ) as HTMLParagraphElement | null;
  const languages = document.getElementById(
    "country-languages",
  ) as HTMLParagraphElement | null;
  // idk if landlocked, independent, and UN need to be declared here or if I make an svg tag after them
  if (commonName) {
    commonName.textContent = data.name;
  }
  if (nativeName) {
    nativeName.textContent = data.nativeName;
  }
  if (flag) {
    flag.src = data.flag;
    flag.alt = data.flagAlt;
  }
  if (coatOfArms) {
    coatOfArms.src = data.coatOfArms;
  }
  if (continents && continents.textContent) {
    for (let continent of data.continents) {
      continents.textContent += ` ${continent},`;
    }
    continents.textContent = continents.textContent.trimEnd().slice(0, -1);
  }

  if (capital) {
    capital.textContent += ` ${data.capital}`;
  }

  if (area) {
    area.textContent += ` ${data.area.toLocaleString()}km\u00B2`;
  }
  if (currencies && currencies.textContent) {
    for (let currency of data.currencies) {
      const currencyName = currency.name;
      const currencySymbol = currency.symbol;

      currencies.textContent += ` ${currencyName} (${currencySymbol}),`;
    }
    currencies.textContent = currencies.textContent.trim().slice(0, -1);
  }
  if (population) {
    population.textContent += ` ${data.population.toLocaleString()}`;
  }
  if (languages && languages.textContent) {
    for (let language of data.languages) {
      languages.textContent += ` ${language},`;
    }
    languages.textContent = languages.textContent.trim().slice(0, -1);
  }

  //MANAGE LANDLOCK, INDEPENDENT, AND UN HERE
};

const detailedCountryInfo = async (
  country: string,
): Promise<DetailsResponse> => {
  const url = `https://restcountries.com/v3.1/name/${country}?fields=coatOfArms,name,continents,capital,area,currencies,population,languages,landlocked,independent,unMember,flags&fullText=true`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Error fetching country details. Status " + response.status,
      );
    }

    const data = await response.json();
    if (!data[0]) {
      throw new Error("Missing country data");
    }
    const countryData = data[0];

    let nativeNameKey: string = "";
    if (Object.keys(countryData.name.nativeName)[0]) {
      nativeNameKey = Object.keys(countryData.name.nativeName)[0];
    }

    let nativeNameOfficial = countryData.name.official;
    if (nativeNameKey.length > 0) {
      nativeNameOfficial = countryData.name.nativeName[nativeNameKey].official;
    }

    const details: CountryDetails = {
      flag: countryData.flags.svg,
      flagAlt: countryData.flags.alt,
      coatOfArms: countryData.coatOfArms.svg,
      name: countryData.name.common,
      nativeName: nativeNameOfficial,
      continents: countryData.continents,
      capital: countryData.capital,
      area: countryData.area,
      currencies: Object.values(countryData.currencies),
      population: countryData.population,
      languages: Object.values(countryData.languages),
      landlocked: countryData.landlocked,
      independent: countryData.independent,
      unMember: countryData.unMember,
    };
    return { success: true, data: details };
  } catch (error) {
    console.error(error);
    return { success: false, message: error as Error };
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
    if (!countryContinent.toLowerCase().includes(continent.toLowerCase())) {
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
