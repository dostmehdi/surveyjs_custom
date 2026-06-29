import { Serializer } from "survey-core";

Serializer.findProperty("question", "name").maxLength = 20;
Serializer.findProperty("question", "name").isRequired = true;
