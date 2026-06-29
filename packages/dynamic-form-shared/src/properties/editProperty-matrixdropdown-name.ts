import { Serializer } from "survey-core";

Serializer.findProperty("matrixdropdown", "name").maxLength = 50;
Serializer.findProperty("matrixdropdown", "name").isRequired = true;