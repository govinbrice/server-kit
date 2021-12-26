import * as path from 'path';
import * as fs from 'fs-extra';
import { Database } from '../Database';
import { WebService } from '../Services';

const UUID = require('uuid').v4

const dbPath = path.resolve("./database");
const database = new Database(dbPath);

const ensureDbIndex = (index: string) => {
    return database;
}

export const DatabaseServices: WebService[] = [
    {
        method: "POST",
        endpoint: "/db/import",
        action: (req, res) => {
            const { files } = req.body.data;
            if (files) {
                files.forEach(file => {
                    // TODO: il faut lire tous les fichiers en amont par le browser ? en upload?
                    file
                });
            }
        }
    },
    {
        method: "POST",
        endpoint: "/db/export",
        action: (req, res) => {
            const { directory } = req.body;
            const directoryPath = path.resolve(path.join("./data", directory));
            if (!fs.existsSync(directoryPath)) {
                fs.mkdir(directoryPath);
            }
            let result = true;
            database.export(path.join(directoryPath, "database"));
            const status = result ? "success" : "failure"
            return res.json({ status })
        }
    },
    {
        method: "GET",
        endpoint: "/db",
        action: (req, res) => {
            const { element, index } = req.query;
            const id = element && element.id ? element.id : req.query.id;
            if (index) {
                return ensureDbIndex(index).get(id)
                    .then((element) => {
                        return res.json(element)
                    })
                    .catch((err) => {
                        return res.status(404).send(err);
                    })
            } else {
                return res.status(404).send({ message: "Index " + index + " does not exist" });
            }

        }
    },
    {
        method: "PUT",
        endpoint: "/db",
        action: (req, res) => {
            const { element, index } = req.body;
            element.id = element.id ? element.id : UUID();

            database.put(element.id, element, index)
                .then((element) => {
                    return res.json(element)
                })
                .catch((err) => {
                    return res.status(500).send(err);
                })
        }
    },
    {
        method: "DELETE",
        endpoint: "/db",
        action: (req, res) => {
            const { id, index } = req.body;
            if (index) {
                return ensureDbIndex(index).delete(id)
                    .then((element) => {
                        return res.json(element)
                    })
                    .catch((err) => {
                        return res.status(500).send(err);
                    })
            } else {
                return res.status(404).send({ message: "Index " + index + " does not exist" });
            }
        }
    }
]