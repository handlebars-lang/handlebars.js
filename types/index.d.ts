import { ParseOptions, AST } from '@handlebars/parser';
declare type BuiltinHelperName = "helperMissing" | "blockHelperMissing" | "each" | "if" | "unless" | "with" | "log" | "lookup";
declare type KnownHelpers = {
    [name in BuiltinHelperName | string]: boolean;
};
declare type Template<T = any> = TemplateDelegate<T> | string;
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
    helpers?: {
        [name: string]: Function;
    };
    partials?: {
        [name: string]: TemplateDelegate;
    };
    decorators?: {
        [name: string]: Function;
    };
    data?: any;
    blockParams?: any[];
    allowCallsToHelperMissing?: boolean;
    allowedProtoProperties?: {
        [name: string]: boolean;
    };
    allowedProtoMethods?: {
        [name: string]: boolean;
    };
    allowProtoPropertiesByDefault?: boolean;
    allowProtoMethodsByDefault?: boolean;
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
interface SafeString {
    new (str: string): void;
    toString(): string;
    toHTML(): string;
}
declare class Handlebars {
    readonly VERSION: string;
    SafeString: SafeString;
    constructor();
    compile<T = any>(input: any, options?: CompileOptions): TemplateDelegate;
    precompile(input: any, options?: PrecompileOptions): TemplateSpecification;
    parse(input: string, options?: ParseOptions): AST.Program;
    parseWithoutProcessing(input: string, options?: ParseOptions): AST.Program;
    registerHelper(name: HelperDeclareSpec | string, fn?: HelperDelegate): void;
    unregisterHelper(name: string): void;
    registerPartial(name: string, fn: Template): void;
    registerPartial(spec: {
        [name: string]: TemplateDelegate;
    }): void;
    unregisterPartial(name: string): void;
}
declare const _default: Handlebars;
export default _default;
