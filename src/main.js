"use strict";
//TODO: MANAGE SEARCHES WITH 0 RESULTS (SUCH AS SHOWING "NO RESULTS FOUND")
//TODO: MAKE NAVBAR WORK EVEN OUT OF INDEX.HTML AKA USE URL PARAMETERS
const formSearch = document.getElementById("search-bar");
if (formSearch) {
    const inQuery = document.getElementById("search-country");
    formSearch.onsubmit = (event) => {
        event.preventDefault();
        getSearchPreview(inQuery.value);
    };
}
const btnHamburger = document.getElementById("btn-burger");
document.addEventListener("DOMContentLoaded", () => {
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
const navNorthAmerica = document.getElementById("nav-northamerica");
navNorthAmerica?.addEventListener("click", () => {
    getContinentPreviews("north america");
});
const navSouthAmerica = document.getElementById("nav-southamerica");
navSouthAmerica?.addEventListener("click", () => {
    getContinentPreviews("south america");
});
const navOceania = document.getElementById("nav-oceania");
navOceania?.addEventListener("click", () => {
    getContinentPreviews("oceania");
});
const navAntarctica = document.getElementById("nav-antarctica");
navAntarctica?.addEventListener("click", () => {
    getContinentPreviews("antarctica");
});
btnHamburger?.addEventListener("click", () => {
    const isOpen = btnHamburger.classList.contains("menu-open") ? true : false;
    if (!isOpen) {
        btnHamburger.classList.replace("menu-closed", "menu-open");
        return;
    }
    btnHamburger.classList.replace("menu-open", "menu-closed");
});
//Function for displaying countries on homepage
const displayPreview = (country) => {
    //Setting parameters through input CountryPreview variable
    let flag = country.flag;
    let commonName = country.commonName;
    let nativeName = country.nativeName;
    let continents = country.continents;
    //Setting references to country display and grid templates.
    const template = document.getElementById("country-template");
    if (!template)
        return;
    let grid = document.getElementById("country-display-area");
    if (!grid)
        return;
    //Cloning the template and filling it with passed data
    let populatedTemplate = template.cloneNode(true);
    populatedTemplate.id = commonName.toLowerCase().replaceAll(" ", "-");
    let previewFlag = populatedTemplate.querySelector(".preview-flag");
    let commonNameSelector = populatedTemplate.querySelector(".preview-common-name");
    let nativeNameSelector = populatedTemplate.querySelector(".preview-native-name");
    let continentSelector = populatedTemplate.querySelector(".preview-continent");
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
//Function for displaying all countries stores in the RESTCountries API.
const displayCountries = async () => {
    const url = "https://restcountries.com/v3.1/all?fields=name,flags,region,continents";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error fetching country data. Status " + response.status);
        }
        const data = await response.json();
        const gatheredData = [];
        //Iterate through each country in the JSON of the fetched API
        for (let country of data) {
            //Traverse the JSON to object containing native names and choose first available option
            //If none available, common name will be displayed as the native name.
            let findNativeName = country.name.common;
            if (country.name.nativeName) {
                const values = Object.values(country.name.nativeName);
                if (values[0]) {
                    findNativeName = values[0].common;
                }
            }
            //Save values to CountryPreview type and push into array
            let preview = {
                flag: country.flags.svg,
                commonName: country.name.common,
                nativeName: findNativeName,
                continents: country.continents,
            };
            gatheredData.push(preview);
        }
        const sortedData = gatheredData.sort((a, b) => a.commonName > b.commonName ? 1 : a.commonName < b.commonName ? -1 : 0);
        for (let sortedCountry of sortedData) {
            displayPreview(sortedCountry);
        }
    }
    catch (error) {
        console.error(error);
    }
};
const displayCountryInfo = async (country) => {
    const countryInfo = await detailedCountryInfo(country);
    if (!countryInfo.success) {
        console.error(countryInfo.message);
        return;
    }
    const data = countryInfo.data;
    const commonName = document.getElementById("country-name-common");
    const nativeName = document.getElementById("country-name-native");
    const flag = document.getElementById("country-flag");
    const coatOfArms = document.getElementById("country-coatofarms");
    const continents = document.getElementById("country-continent");
    const capital = document.getElementById("country-capital");
    const area = document.getElementById("country-area");
    const currencies = document.getElementById("country-currencies");
    const population = document.getElementById("country-population");
    const languages = document.getElementById("country-languages");
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
    //THIS IS JUST A BANDAID FIX FOR NOW, FIX IT LATER
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
    //ALSO BANDAID FIX
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
    //BANDAID FIX HERE TOO
    if (languages && languages.textContent) {
        for (let language of data.languages) {
            languages.textContent += ` ${language},`;
        }
        languages.textContent = languages.textContent.trim().slice(0, -1);
    }
    //MANAGE LANDLOCK, INDEPENDENT, AND UN HERE
};
const detailedCountryInfo = async (country) => {
    const url = `https://restcountries.com/v3.1/name/${country}?fields=coatOfArms,name,continents,capital,area,currencies,population,languages,landlocked,independent,unMember,flags&fullText=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error fetching country details. Status " + response.status);
        }
        const data = await response.json();
        if (!data[0]) {
            throw new Error("Missing country data");
        }
        const countryData = data[0];
        let nativeNameKey = "";
        if (Object.keys(countryData.name.nativeName)[0]) {
            nativeNameKey = Object.keys(countryData.name.nativeName)[0];
        }
        let nativeNameOfficial = countryData.name.official;
        if (nativeNameKey.length > 0) {
            nativeNameOfficial = countryData.name.nativeName[nativeNameKey].official;
        }
        const details = {
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
    }
    catch (error) {
        console.error(error);
        return { success: false, message: error };
    }
};
const getContinentPreviews = (continent) => {
    const displayedCountries = document.getElementById("country-display-area")?.children;
    if (!displayedCountries)
        return;
    for (let country of displayedCountries) {
        const countryContinent = getCountryPreviewContent(country.id, "continent");
        if (!countryContinent.toLowerCase().includes(continent.toLowerCase())) {
            country.classList.replace("flex", "hidden");
            continue;
        }
        country.classList.replace("hidden", "flex");
    }
};
const getSearchPreview = async (query) => {
    const displayedCountries = document.getElementById("country-display-area")?.children;
    if (query.length === 0) {
        displayCountries();
        return;
    }
    const searchResults = await combinedSearch(query);
    if (!displayedCountries)
        return;
    for (let country of displayedCountries) {
        const countryCommonName = getCountryPreviewContent(country.id, "commonName");
        if (!countryCommonName)
            continue;
        if (!searchResults.includes(countryCommonName)) {
            country.classList.replace("flex", "hidden");
        }
        else {
            country.classList.replace("hidden", "flex");
        }
    }
};
const combinedSearch = async (query) => {
    let commonNameSearch = await searchByCommonName(query);
    let foreignNameSearch = await searchByForeignName(query);
    const codeSearch = await searchByCountryCode(query);
    // Prevent country code search results from being diluted by other search results
    if (codeSearch.length > 0) {
        commonNameSearch = [];
        foreignNameSearch = [];
    }
    let combinedResults = new Set(commonNameSearch.concat(foreignNameSearch, codeSearch));
    return Array.from(combinedResults.values());
};
const searchByCommonName = async (query) => {
    query = query.toLowerCase();
    let matchingCountries = [];
    const url = `https://restcountries.com/v3.1/name/${query}?fields=name,altSpellings`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error fetching country data. Status " + response.status);
        }
        const data = await response.json();
        for (let datum of data) {
            const commonNameLower = datum.name.common.toLowerCase();
            const altSpellingsLower = datum.altSpellings.map((spelling) => spelling.toLowerCase());
            let nameMatchesSearch = commonNameLower.includes(query) || altSpellingsLower.includes(query)
                ? true
                : false;
            if (nameMatchesSearch) {
                matchingCountries.push(datum.name.common);
            }
        }
    }
    catch (error) {
        console.warn(error);
        return [];
    }
    return matchingCountries;
};
const searchByForeignName = async (query) => {
    let matchingCountries = [];
    const url = `https://restcountries.com/v3.1/translation/${query}?fields=name,translations`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error fetching country data. Status " + response.status);
        }
        const data = await response.json();
        for (let datum of data) {
            let commonTranslationMatchesSearch = false;
            //Traverse the country's JSON to object containing name translations
            //and check if any match search query
            //If any do, add to list of countries to display
            let translations = Object.values(datum.translations);
            if (translations) {
                for (let translation of translations) {
                    let commonTranslationLower = translation.common.toLowerCase();
                    if (!commonTranslationMatchesSearch) {
                        commonTranslationMatchesSearch = commonTranslationLower.startsWith(query)
                            ? true
                            : false;
                    }
                }
            }
            if (commonTranslationMatchesSearch) {
                matchingCountries.push(datum.name.common);
            }
        }
    }
    catch (error) {
        console.warn(error);
        return [];
    }
    return matchingCountries;
};
const searchByCountryCode = async (query) => {
    let matchingCountries = [];
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
    }
    catch (error) {
        console.warn(error);
        return [];
    }
    return matchingCountries;
};
const getCountryPreviewContent = (countryID, content) => {
    const countryTemplate = document.getElementById(countryID);
    if (!countryTemplate)
        return null;
    const countryInfo = countryTemplate.children[1];
    switch (content) {
        case "commonName":
            const commonNameContainer = countryInfo.children[0];
            const commonNameContent = commonNameContainer.textContent;
            return commonNameContent;
        case "continent":
            const continentContainer = countryInfo.children[2];
            const continentContent = continentContainer.textContent;
            return continentContent;
    }
};
