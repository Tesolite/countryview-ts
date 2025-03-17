"use strict";
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
    populatedTemplate.id = commonName;
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
    document.getElementById(`${commonName}`)?.classList.replace("hidden", "flex");
};
//Function for displaying all countries stores in the RESTCountries API.
const getCountries = async () => {
    const url = "https://restcountries.com/v3.1/all";
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
                const values = Object.values(country.name.nativeName);
                if (values) {
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
const getContinentPreviews = async (continent) => { };
const getSearchPreviews = async (query) => { };
