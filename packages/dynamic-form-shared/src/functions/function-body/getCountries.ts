export function getCountries(): any {
    fetch("https://surveyjs.io/api/CountriesExample")
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            throw new Error(error);
        });
}