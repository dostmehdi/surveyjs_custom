import { PackageHelper, cleanAndBuildPackageAsync, buildAndPublishAsync } from "./PackageHelper.ts";



let commands = process.argv[2];
if (commands == undefined || commands == null || commands.trim() == "") {
    console.error(`Invalid command: ${commands}`);
    process.exit(1);
}

commands = commands.replaceAll(";", ",");

const _commands = commands.split(",");
const packageHelper = new PackageHelper();
runCommand();

async function runCommand() {
    if (_commands.length > 0) {
        const command = _commands.shift();
        await execCommand(command);
        runCommand();
    } else {
        packageHelper.dispose();
    }
}

async function execCommand(command) {
    switch (command) {
        case "clean":
            await packageHelper.cleanDistinationAsync();
            break;
        case "check":
            await packageHelper.typeCheckAsync();
            break;
        case "lint":
            await packageHelper.sourceLintAsync();
            break;
        case "declaration":
        case "declarations":
            await packageHelper.generateDeclarationsAsync();
            break;
        case "build":
            await packageHelper.buildPackageAsync();
            break;
        case "publish":
            await packageHelper.publishAsComponentAsync();
            break;
        default:
            console.error(`Invalid command: ${command}`);
            process.exit(1);
    }
}