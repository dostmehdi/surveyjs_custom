
interface IDynamicFormError extends Error {
}

interface IDynamicFormErrorConstructor extends ErrorConstructor {
    new(message?: string, descEn?: string, descFa?: string): IDynamicFormError;
    new(message?: string, internal?: IDynamicFormError): IDynamicFormError;
    (message?: string): IDynamicFormError;
    (descEn?: string): IDynamicFormError;
    (descFa?: string): IDynamicFormError;
    readonly prototype: IDynamicFormError;
}

export type { IDynamicFormError, IDynamicFormErrorConstructor }