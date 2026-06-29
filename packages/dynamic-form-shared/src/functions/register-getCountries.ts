import { FunctionFactory } from "survey-core";
import { getCountries } from "./function-body/getCountries";

FunctionFactory.Instance.register("getCountries", getCountries);