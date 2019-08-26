const fs = require("fs")
const path = require("path")

const packageJson = require("./package.json")

const builtPackageJsonPath = path.resolve(path.normalize("./dist/package.json"))

const newPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    main: packageJson.main,
    license: packageJson.license,
    contributors: packageJson.contributors,
    private: packageJson.private,
    dependencies: packageJson.dependencies
}

fs.writeFileSync(builtPackageJsonPath, JSON.stringify(newPackageJson, undefined, "\t"));