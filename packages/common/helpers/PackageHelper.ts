import * as ts from "typescript";
import * as path from "path";
import * as fse from "fs-extra/esm";
import * as esbuild from "esbuild";
import manifestPlugin from "esbuild-plugin-manifest";
import { esbuildPluginVersionInjector as verInjPlugin } from "esbuild-plugin-version-injector";
import { exec } from "child_process";

/** @internal */
export class PackageHelper implements AsyncDisposable {
    //#region Definations
    /**
     * Package name
     * @type {string}
    */
    private packageName: string;

    /**
     * Component name, for publishing package to component
     * @type {string}
    */
    private componentName: string;

    /**
     * Package root directory
     * @type {string}
    */
    private rootDir: string;

    /**
     * Package dist directory
     * @type {string}
    */
    private outDir: string;

    /**
     * Config file path
     * @type {string}
    */
    private tsconfigFilePath: string;

    /**
     * Config file json
     * @type {any}
    */
    private tsconfigJson: ts.ParsedCommandLine;

    /**
     * Package file path
     * @type {string}
    */
    private packageFilePath: string;

    /**
     * Package file json
     * @type {any}
    */
    private packageJson: any;

    /**
     * object disposed
     * @type {boolean}
    */
    private isDisposed: boolean = false;
    //#endregion Definations

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Constructor
    public constructor() {
        console.profile("PackageHelper");
        console.info();
        console.info();
        console.info("==================== PackageHelper ==================== ");

        this.rootDir = ".";

        this.loadPackageJson();
        this.loadTsconfigJson();
    }

   public destructor(): void {
        if (!this.isDisposed) {
            this.isDisposed = true;
            console.info();
            console.info();
            console.info("==================== PackageHelper Disposed ==================== ");
            console.info();
            console.info();
            console.profileEnd("PackageHelper");
        }
    }

    public [Symbol.asyncDispose](): PromiseLike<void> {
        this.destructor();
        return Promise.resolve();
    }
    //#endregion Constructor

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Private Methods
    private loadPackageJson(): void {
        const methodName = "loadPackageJson";

        try {
            console.info("");
            console.info("");
            console.group(methodName);
            console.info(`***** PackageHelper => Loading Package.json content`);

            this.packageFilePath = path.resolve(`${this.rootDir}/package.json`);

            this.packageJson = fse.readJsonSync(this.packageFilePath, { encoding: "utf8", throws: true });

            this.packageName = this.packageJson.name;
            this.componentName = this.packageJson.componentName;
            this.outDir = (this.packageJson.files == undefined ? `${this.rootDir}/dist` : this.packageJson.files[0]);

            console.info(`***** ${this.packageName} => Package.json content loaded`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Load Package Json failed, Error details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }

    /**
     * Loads and parses the tsconfig.json file from the package directory.
     * 
     * @remarks
     * This method searches for tsconfig.json in the package directory using TypeScript's
     * file system utilities, reads the configuration file, and parses its content.
     * The parsed configuration is stored in the `tsconfigJson` property and the file
     * path is stored in `tsconfigFilePath`.
     * 
     * @throws {Error} Throws an error if tsconfig.json cannot be found in the package directory.
     * @throws {Error} Throws an error if the configuration file cannot be read or parsed.
     * 
     * @returns {void}
     * 
     */
    private loadTsconfigJson(): void {
        const methodName = "loadTsconfigJson";

        try {
            console.info("");
            console.info("");
            console.group(methodName);
            console.info(`***** ${this.packageName} => Loading tsconfig.json content`);

            const configPath = ts.findConfigFile(this.rootDir, ts.sys.fileExists, "tsconfig.json");
            if (!configPath) {
                throw new Error(`tsconfig.json not found`);
            }

            this.tsconfigFilePath = path.resolve(configPath);

            const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
            this.tsconfigJson = ts.parseJsonConfigFileContent(configFile.config, ts.sys, "./");

            console.info(`***** ${this.packageName} => tsconfig.json content loaded`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Load Tsconfig Json failed, Error details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }

    private generateEsBuildOptions(entryPoints: string[], outDir: string, minify: boolean, format: esbuild.Format): esbuild.BuildOptions {
        const methodName = "generateEsBuildOptions";

        try {
            console.info("");
            console.info("");
            console.group(methodName);

            outDir = path.join(outDir, format.toString());

            const outExtension: string = (format == "esm" ? ".js" : ".js");

            //const outFileName: string = "index"
            //const outFilePath: string = path.join(outDir, outFileName);

            let entryNames = "[dir]/[name]";
            if (minify) {
                entryNames += ".min";
            }

            const buildOptions: esbuild.BuildOptions = {
                entryPoints: entryPoints,
                format: format,
                platform: "browser",
                target: ["es2020"],
                packages: "bundle",
                charset: 'utf8',
                logLevel: (minify ? "error" : "info"),
                legalComments: "inline",
                bundle: true,
                sourcemap: true,
                allowOverwrite: true,
                splitting: false,
                preserveSymlinks: false,
                keepNames: true,
                minify: minify,
                minifyWhitespace: minify,
                minifyIdentifiers: minify,
                minifySyntax: minify,
                metafile: !minify,
                sourcesContent: !minify,
                tsconfig: this.tsconfigFilePath,
                entryNames: entryNames,
                assetNames: "assets/[ext]/[name]",
                chunkNames: 'chunks/[name]-[hash]',
                //globalName: `${this.componentName}.versions["${this.packageJson.version}"]`,
                outdir: outDir,
                //outfile: outFilePath,
                outbase: 'src',
                outExtension: { '.js': outExtension },
                resolveExtensions: [".ts", ".js"],
                drop: ["debugger"],
                loader: {
                    ".js": "js",
                    ".css": "css",
                    ".json": "json"
                },
                plugins: [
                    manifestPlugin({ hash: false, append: true, useEntrypointKeys: true, shortNames: "input" }),
                    verInjPlugin({ packageJsonPath: this.packageFilePath, versionOrCurrentDate: "version", injectTag: "Setak ICT Co" })
                ],
                supported: {
                    "inline-script": false,
                    "inline-style": false
                },
                banner: {
                    js: "// Copyright (c) 2007-2026 Setak ICT Co, Aydin Khollasi.",
                    css: "/* Copyright (c) 2007-2026 Setak ICT Co, Aydin Khollasi. */",
                },
                footer: {
                    js: "// Copyright (c) 2007-2026 Setak ICT Co, Aydin Khollasi.",
                    css: "/* Copyright (c) 2007-2026 Setak ICT Co, Aydin Khollasi. */",
                },
            };

            return buildOptions;
        }
        finally {
            console.groupEnd();
        }
    }

    /**
     * Build Typescript by esbuild plugin
     * @param {string[]} entryFiles
     * @param {esbuild.Format} format
     * @param {boolean} minify
     */
    private async buildWithEsbuildAsync(entryFiles: string[], format: esbuild.Format, minify: boolean): Promise<void> {
        const methodName = "buildWithEsbuildAsync";

        try {
            console.info("");
            console.info("");
            console.group(methodName)

            console.info(`***** ${this.packageName} => Start building package with esbuild`);
            console.info(`      entryFiles: ${entryFiles.join(",")}`);
            console.info(`          format: ${format.toString()}`);
            console.info(`          minify: ${minify}`);

            //**************************************************************************

            const buildOptions: esbuild.BuildOptions = this.generateEsBuildOptions(entryFiles, this.outDir, minify, format);
            //buildOptions.outfile = outfile;

            const buildResult = await esbuild.build(buildOptions);

            //**************************************************************************

            if (buildResult.errors.length > 0) {
                const err = buildResult.errors.join(",");
                throw new Error(err);
            }

            if (buildResult.warnings.length > 0) {
                console.warn();
                console.warn();
                console.warn(`${this.packageName} => Warnings on build ${format} format, details -> `);
                console.warn(buildResult.warnings);
            }

            if (!minify) {
                const metafile = buildResult.metafile;
                if (metafile != undefined) {
                    const metaFilePath = `${this.outDir}/metaFile.json`;
                    await fse.writeJson(metaFilePath, buildResult.metafile);

                    const analyzeResult = await esbuild.analyzeMetafile(metafile, {
                        verbose: true,
                        color: true
                    });

                    console.info("");
                    console.info("");
                    console.info(`${this.packageName} => Metafile analyze result for ${format} format, details -> `);
                    console.info(analyzeResult);
                }
            }

            console.info("");
            console.info(`***** ${this.packageName} => Building package with esbuild complated`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Error on build ${format} format, details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }
    //#endregion Private Methods

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Public Methods
    /**
     * Clean distination
     * Remove out dir
     */
    public async cleanDistinationAsync(): Promise<void> {
        const methodName = "cleanDistinationAsync";

        try {
            console.info("");
            console.info("");
            console.group(methodName);
            console.info(`***** ${this.packageName} => Start cleaning distination`);

            const distPath = path.resolve(this.outDir);
            await fse.remove(distPath);

            console.info(`***** ${this.packageName} => Clean distination completed`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Type check failed, Error details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }

    /**
     * Source Type Check
    */
    public async typeCheckAsync(): Promise<void> {
        const methodName = "typeCheckAsync";

        try {
            console.info("");
            console.info("");
            console.group(methodName);
            console.info(`***** ${this.packageName} => Start source type checking`);

            await exec("tsc -p tsconfig.json --noEmit", { encoding: "utf-8" });

            console.info(`***** ${this.packageName} => Type check completed`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Type check failed, Error details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }

    /**
     * Source Lint
    */
    public async sourceLintAsync(): Promise<void> {
        const methodName = "sourceLintAsync";

        try {
            console.info("");
            console.info("");
            console.group(methodName);
            console.info(`***** ${this.packageName} => Start source lint package`);

            await exec("npx eslint src", { encoding: "utf-8" });

            console.info(`***** ${this.packageName} => Source lint package completed`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Source lint failed, Error details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }

    /**
     * Generate type declarations (.d.ts files)
     */
    public async generateDeclarationsAsync(): Promise<void> {
        const methodName = "generateDeclarationsAsync";

        try {
            console.info("");
            console.info("");
            console.group(methodName);
            console.info(`***** ${this.packageName} => Start generate type declarations`);

            await exec("tsc -p tsconfig.json --declaration", { encoding: "utf-8" });

            // Override options for declaration only
            // const parsed = this.tsconfigJson;
            // parsed.options.declaration = true;
            // parsed.options.emitDeclarationOnly = true;
            // parsed.options.noEmitHelpers = false;

            // const program = ts.createProgram(parsed.fileNames, parsed.options);
            // const emitResult = program.emit();

            // const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
            // allDiagnostics.forEach(diagnostic => {
            //     if (diagnostic.file) {
            //         const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
            //         const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            //         console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            //     } else {
            //         console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
            //     }
            // });

            // if (emitResult.emitSkipped) throw new Error("Type Declarations generation failed.");

            console.info(`***** ${this.packageName} => Generate type declarations completed`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Generate type declarations failed, Error details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }

    /**
     * Build typescript source files with esbuild
     *      - Generate Javascript bundle
     *      - Format cjs: commonJS, ES2020
     *      - Format esm: module, ES2020
    */
    public async buildPackageAsync(): Promise<void> {
        const methodName = "buildPackageAsync";

        try {
            console.info("");
            console.info("");
            console.group(methodName);
            console.info(`***** ${this.packageName} => Start building Package`);
            console.info(`      Type: ${this.packageJson.type}`);

            const entryFiles: string[] = [`${this.rootDir}/src/index.ts`];

            //await this.buildWithEsbuildAsync(entryFiles, "esm", false);

             if (this.packageJson.type == "commonjs") {
                 await this.buildWithEsbuildAsync(entryFiles, "cjs", true);
                 await this.buildWithEsbuildAsync(entryFiles, "cjs", false);
             }
             if (this.packageJson.type == "module") {
                 if (this.packageJson.main != undefined && this.packageJson.main != "") {
                     if (this.packageJson.module != undefined && this.packageJson.module != "") {
                         await this.buildWithEsbuildAsync(entryFiles, "cjs", true);
                         await this.buildWithEsbuildAsync(entryFiles, "cjs", false);
                         await this.buildWithEsbuildAsync(entryFiles, "esm", true);
                         await this.buildWithEsbuildAsync(entryFiles, "esm", false);
                     } else {
                         await this.buildWithEsbuildAsync(entryFiles, "esm", true);
                         await this.buildWithEsbuildAsync(entryFiles, "esm", false);
                     }
                 }
             }

            console.info(`***** ${this.packageName} => Build Package completed`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Build failed, Error details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }

    /**
     * Publish package as component
     *  - Create folder with componnent name in wwwroot/components on project root
     *  - Copy dist folder content to wwwroot/components/{component-name} folder
    */
    public async publishAsComponentAsync(): Promise<void> {
        const methodName = "publishAsComponentAsync";

        try {
            console.info("");
            console.info("");
            console.group(methodName);
            console.info(`***** ${this.packageName} => Start publishing package as component '${this.componentName}'`);

            const source = path.resolve(this.outDir);
            const target = path.resolve(`../../../../wwwroot/components/${this.componentName}`);

            await fse.ensureDir(target,);
            await fse.emptyDir(target);
            await fse.copy(source, target);

            console.info(`***** ${this.packageName} => Package published`);
        }
        catch (err) {
            console.error("");
            console.error("");
            console.error(`${this.packageName} => Publish failed, Error details -> `);
            console.error(err);
            process.exit(1);
        }
        finally {
            console.groupEnd();
        }
    }

    public dispose() {
        this.destructor();
    }
    //#endregion Public Methods
};

/** @internal */
/**
 * Build package
 *  - Clean distination
 *  - Type check
 *  - Source lint
 *  - Generate type declarations
 *  - Build package
 */
export async function cleanAndBuildPackageAsync(): Promise<void> {
    const packageHelper = new PackageHelper();

    await packageHelper.cleanDistinationAsync();
    await packageHelper.typeCheckAsync();
    await packageHelper.sourceLintAsync();
    await packageHelper.generateDeclarationsAsync();
    await packageHelper.buildPackageAsync();

    packageHelper.destructor();
}

/** @internal */
/**
 *  1. Build package
 *      - Clean distination
 *      - Type check
 *      - Source lint
 *      - Generate type declarations
 *      - Build package
 *  2. Publish package as component
 *      - Create folder with componnent name in wwwroot/components on project root
 *      - Copy dist folder content to componnent folder
 */
export async function buildAndPublishAsync(): Promise<void> {
    const packageHelper = new PackageHelper();

    await packageHelper.cleanDistinationAsync();
    await packageHelper.typeCheckAsync();
    await packageHelper.sourceLintAsync();
    await packageHelper.generateDeclarationsAsync();
    await packageHelper.buildPackageAsync();
    await packageHelper.publishAsComponentAsync();

    packageHelper.destructor();
}