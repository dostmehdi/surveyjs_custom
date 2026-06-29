import { Serializer, surveyLocalization } from "survey-core";

Serializer.addProperty("selectbase", {
  name: "preDefinedItems",
  type: "dropdown",
  choices: (obj, choicesCallback) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://surveyjs.io/api/CountriesExample");
    xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.response);

        const result = [];

        // Make the property nullable
        result.push({ value: "", text: "از داده فرم" });

        // Web service returns objects that are converted to the `{ value, text }` format
        // If your web service returns an array of strings, pass this array to `choicesCallback`
        response.forEach(item => {
          result.push({ value: item.cioc, text: item.name });
        });

        choicesCallback(result);
      }
    };
    xhr.send();
  },
  default: "",
  category: "choices",
  visibleIndex: 0
});

surveyLocalization.getLocaleStrings("en")["showInReport"] = "Load data from";
//surveyLocalization.getLocaleStrings("fa")["showInReport"] = "بارگذاری داده ها از";