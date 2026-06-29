import { Serializer } from "survey-core";

Serializer.findProperty("question", "title").maxLength = 20;
Serializer.findProperty("question", "title").isRequired = true;
