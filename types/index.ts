import {
    parse,
    parseWithoutProcessing,
    ParseOptions,
    AST
} from '@handlebars/parser';

type BuiltinHelperName =
    "helperMissing"|
    "blockHelperMissing"|
    "each"|
    "if"|
    "unless"|
    "with"|
    "log"|
    "lookup";

type KnownHelpers = {
    [name in BuiltinHelperName | string]: boolean;
};

type Template<T = any> = TemplateDelegate<T>|string;

interface CompileOptions {
    data?: boolean;
    compat?: boolean;
    knownHelpers?: KnownHelpers;
    knownHelpersOnly?: boolean;
    noEscape?: boolean;
    strict?: boolean;
    assumeObjects?: boolean;
    preventIndent?: boolean;
    ignoreStandalone?: boolean;
    explicitPartialContext?: boolean;
}

interface PrecompileOptions extends CompileOptions {
    srcName?: string;
    destName?: string;
}

interface RuntimeOptions {
    partial?: boolean;
    depths?: any[];
    helpers?: { [name: string]: Function };
    partials?: { [name: string]: TemplateDelegate };
    decorators?: { [name: string]: Function };
    data?: any;
    blockParams?: any[];
    allowCallsToHelperMissing?: boolean;
    allowedProtoProperties?: { [name: string]: boolean };
    allowedProtoMethods?: { [name: string]: boolean };
    allowProtoPropertiesByDefault?: boolean;
    allowProtoMethodsByDefault?: boolean;
}

interface HandlebarsTemplates {
    [index: string]: string;
}

interface TemplateSpecification {

}

export interface TemplateDelegate<T = any> {
    (context: T, options?: RuntimeOptions): string;
}

interface HelperOptions {
    fn: TemplateDelegate;
    inverse: TemplateDelegate;
    hash: any;
    data?: any;
}

interface HelperDelegate {
    (context?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, options?: HelperOptions): any;
}

interface HelperDeclareSpec {
    [key: string]: HelperDelegate;
}

class TemplateSpecificationInstance implements TemplateSpecification {}

interface SafeString {
    new(str: string): void;
    toString(): string;
    toHTML(): string;
}

class Handlebars {
    public readonly VERSION: string;
    public SafeString: SafeString;
    constructor() {
    }
    compile<T = any>(input: any, options?: CompileOptions): TemplateDelegate {
        return (context) => '';
    }
    precompile(input: any, options?: PrecompileOptions): TemplateSpecification {
        return new TemplateSpecificationInstance();
    }
    parse(input: string, options?: ParseOptions): AST.Program {
        return parse(input, options);
    }
    parseWithoutProcessing(input: string, options?: ParseOptions): AST.Program {
        return parseWithoutProcessing(input, options);
    }
    registerHelper(name: HelperDeclareSpec|string, fn?: HelperDelegate): void {

    }
    unregisterHelper(name: string): void {

    }
    registerPartial(name: string, fn: Template): void;
    registerPartial(spec: { [name: string]: TemplateDelegate }): void;
    registerPartial(name: string|{ [name: string]: TemplateDelegate }, fn?: Template): void {

    }
    unregisterPartial(name: string): void {

    }
}

export default new Handlebars();