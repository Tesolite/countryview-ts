"use strict";
//TODO: CONVERT EUROPE FILTER TO LOWERCASE
const formSearch = document.getElementById("search-bar");
if (formSearch) {
    const inQuery = document.getElementById("search-country");
    formSearch.onsubmit = (event) => {
        event.preventDefault();
        getSearchPreview(inQuery.value);
    };
}
//Function for displaying countries on homepage
const displayCountryPreview = (country) => {
    //Setting parameters through input CountryPreview variable
    let flag = country.flag;
    let commonName = country.commonName;
    let nativeName = country.nativeName;
    let continent = country.continent;
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
    const url = "https://restcountries.com/v3.1/all?fields=name,flags,region";
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
            if (country.name.nativeName) {
                const values = Object.values(country.name.nativeName);
                if (values[0]) {
                    findNativeName = values[0].common;
                }
            }
            //Save values to CountryPreview type and call display function
            let preview = {
                flag: country.flags.svg,
                commonName: country.name.common,
                nativeName: findNativeName,
                continent: country.region,
            };
            displayCountryPreview(preview);
        }
    }
    catch (error) {
        console.error(error);
    }
};
const getContinentPreviews = (continent) => {
    const displayedCountries = document.getElementById("country-display-area")?.children;
    if (!displayedCountries)
        return;
    for (let country of displayedCountries) {
        const countryContinent = getCountryPreviewContent(country.id, "continent");
        if (countryContinent.toLowerCase() !== continent.toLowerCase()) {
            country.classList.replace("flex", "hidden");
            continue;
        }
        country.classList.replace("hidden", "flex");
    }
};
const getSearchPreview = async (query) => {
    const displayedCountries = document.getElementById("country-display-area")?.children;
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
