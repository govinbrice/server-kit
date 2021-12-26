const level = require('level')
import * as fs from "fs-extra"


const error = (message: string, ...value: any) => {
    return console.error(message, ...value)
}

export class Database {

    private levelDb;

    constructor(dbPath: string) {
        this.levelDb = level(dbPath)
    }

    get(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.levelDb.get(id, function (err, value) {
                if (err) {
                    if (err.notFound) {
                        error("Element not found id:", id)
                    } else {
                        error("Unknown error while getting:", id)
                    }
                    reject({ error: err, id })
                }
                if (value) {
                    resolve(JSON.parse(value))
                }
            })
        })
    }

    put(id: string, element: any, index?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.levelDb.put(id, JSON.stringify(element), (err, value) => {
                if (err) {
                    if (err.notFound) {
                        error("Error on inserting:", element)
                        reject({ error: err, element })
                    } else {
                        error("Unknown error while putting:", id)
                    }
                }
                if (index) {
                    this.get(index)
                        .then((indexInDb) => {
                            indexInDb.push(id);
                            this.put(index, indexInDb);
                        })
                        .catch((error) => {
                            if (error.error && error.error.notFound) {
                                const indexInDb = [id];
                                this.put(index, indexInDb);
                            }
                        })
                }
                resolve(element)
            })
        })
    }

    delete(id: string, index?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.levelDb.del(id, (err, value) => {
                if (err) {
                    if (err.notFound) {
                        error("Error on deleting:", id)
                        reject({ error: err, id })
                    }
                    else {
                        error("Unknown error while deleting:", id)
                    }
                }
                if (index) {
                    this.get(index)
                        .then((indexInDb: any[]) => {
                            const indexOfElement = indexInDb.findIndex((elt) => elt == id);
                            indexInDb.splice(indexOfElement, 1);
                            this.put(index, indexInDb);
                        })
                        .catch((error) => {
                            error("Unknown error while deleting item from index", id, index)
                        })
                }
                resolve(id)
            })
        })
    }

    export(file: string): Promise<boolean> {
        // TODO: il faut définir l'index pour chaque partie de la db ce sera mieux ?
        const dbExportFile = file + Date.now() + ".json";
        const exportedData = {}

        return new Promise((resolve, reject) => {
            this.levelDb.createReadStream()
                .on('data', function (data) {
                    exportedData[data.key] = JSON.parse(data.value);
                })
                .on('error', function (err) {
                    reject(false)
                })
                .on('close', function () {
                    console.log('Stream closed')
                })
                .on('end', function () {
                    fs.writeFileSync(dbExportFile, JSON.stringify(exportedData, undefined, "\t"));
                    console.log('Stream ended')
                    resolve(true)
                })
        })
    }
}