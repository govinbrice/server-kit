const fs = require('fs');
const path = require('path');

const buildDirectoryPath = "./dist";
const packageJsonPath = "./package.json"
const outputPackageJson = "./dist/package.json"

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
const currentDependencies = Object.assign({}, packageJson.dependencies, packageJson.devDependencies);
const distPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    author: packageJson.author,
    license: packageJson.license,
    dependencies: {}
};

const jsFiles = fs.readdirSync(buildDirectoryPath).filter((file) => { return file.endsWith(".js") });
const requireMatcher = /.*require\(("|').*("|')\).*/g;
const dependencies = jsFiles.reduce((currentDependencies, jsFile) => {
    const jsFileLines = fs.readFileSync(path.resolve(buildDirectoryPath, jsFile)).toString().split("\n");
    const requires = jsFileLines.filter((line) => { return line.match(requireMatcher) })
        .map((requireLine) => {
            const limitedRequire = requireLine.split("require").slice(-1)[0];
            const quoteRegex = /("|')/g;
            return limitedRequire.split(quoteRegex)[2]
        });
    return [...currentDependencies, ...requires];
}, [])

dependencies.forEach(dependency => {
    distPackageJson.dependencies[dependency] = currentDependencies[dependency]
});

const keepOnlyDistScript = ""


fs.writeFileSync(path.resolve(outputPackageJson), JSON.stringify(distPackageJson, undefined, "\t"));