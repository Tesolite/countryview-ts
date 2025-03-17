"use strict";
const getCountries = async () => {
    const url = "https://restcountries.com/v3.1/all";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error fetching country data. Status " + response.status);
        }
        const data = await response.json();
        for (let country of data) {
            let findNativeName = country.name.common;
            if (country.name.nativeName) {
                const values = Object.values(country.name.nativeName);
                if (values) {
                    console.log(values[0].official);
                    findNativeName = values[0].common;
                }
            }
            let preview = {
                flag: country.flags.svg,
                commonName: country.name.common,
                nativeName: findNativeName,
                continent: country.region,
            };
            displayCountryPreview(preview);
            console.log("IN COUNTRY OF PARSED DATA");
        }
    }
    catch (error) {
        console.error(error);
    }
};
const getSearchPreviews = async (query) => { };
const getContinentPreviews = async (continent) => { };
const displayCountryPreview = (country) => {
    let flag = country.flag;
    let commonName = country.commonName;
    let nativeName = country.nativeName;
    let continent = country.continent;
    const template = document.getElementById("country-template");
    if (!template)
        return;
    let grid = document.getElementById("country-display-area");
    if (!grid)
        return;
    let populatedTemplate = template.cloneNode(true);
    populatedTemplate.removeAttribute("id");
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
    grid.appendChild(populatedTemplate);
};
