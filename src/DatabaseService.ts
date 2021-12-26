import * as path from 'path';
import * as fs from 'fs-extra';
import { Database } from './Database';
import { WebService } from './Services';

const UUID = require('uuid').v4;

const dbPath = path.resolve("./database");
const database = new Database(dbPath);

export const DatabaseServices: WebService[] = [
    {
        method: "POST",
        endpoint: "/db/synchronize",
        action: (req, res) => {
            const { directory } = req.body.data;
            if (directory && fs.existsSync(directory)) {
                database.synchronize(directory);
                return res.json({ success: true });
            } else {
                const errorMessage = "Directory does not exist";
                console.error(errorMessage);
                return res.json({ success: false, message: errorMessage });
            }
        }
    },
    {
        method: "POST",
        endpoint: "/db/import",
        action: (req, res) => {
            // todo
        }
    },
    {
        method: "POST",
        endpoint: "/db/export",
        action: (req, res) => {
            database.export();
            return res.json({ success: true });
        }
    },
    {
        method: "GET",
        endpoint: "/db",
        action: (req, res) => {
            const { element, index } = req.query;
            const id = element && element.id ? element.id : req.query.id;
            if (index) {
                const requestedElement = database.get(id, index);
                return res.json(requestedElement);
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
            res.json(database.put(element.id, element, index));
        }
    },
    {
        method: "DELETE",
        endpoint: "/db",
        action: (req, res) => {
            const { id, index } = req.body;
            if (index) {
                const success = database.delete(id, index);
                return res.json({ success });
            } else {
                return res.status(404).send({ message: "Index " + index + " does not exist" });
            }
        }
    }
];