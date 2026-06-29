import { FunctionFactory } from "survey-core";
import { encodeHtml } from "./function-body/encodeHtml";

FunctionFactory.Instance.register("encodeHtml", encodeHtml);