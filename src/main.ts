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

  populatedTemplate.id = commonName;

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
  document.getElementById(`${commonName}`)?.classList.replace("hidden", "flex");
};

//Function for displaying all countries stores in the RESTCountries API.
const getCountries = async () => {
  const url: string = "https://restcountries.com/v3.1/all";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error fetching country data. Status " + response.status);
    }

    const data = await response.json();

    //Iterate through each country in the JSON of the fetched API
    for (let country of data) {
      //Traverse the JSON to object containing native names and choose first available option
      let findNativeName = country.name.common;
      if (country.name.nativeName) {
        const values: any[] | undefined | null = Object.values(
          country.name.nativeName,
        );
        if (values) {
          findNativeName = values[0].common;
        }
      }
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

const getContinentPreviews = async (continent?: string) => {};

const getSearchPreviews = async (query?: string) => {};
