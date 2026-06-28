import { DynamicFormType } from "dynamic-form-shared/types";
import { ThemeType } from "dynamic-form-shared/types/theme-type";
export interface DynamicFormCreatorOptions {
    formType: DynamicFormType;
    dynamicFormId?: bigint;
    dotnetReference?: any;
    apiBaseUrl?: string;
    initialTheme?: ThemeType;
}
