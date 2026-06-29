import { Serializer } from "survey-core";

Serializer.findProperty("survey", "name").maxLength = 50;
Serializer.findProperty("survey", "name").isRequired = true;
