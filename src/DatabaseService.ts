import * as path from 'path';
import * as fs from 'fs-extra';
import { Database } from './Database';
import { WebService } from './Services';
import { v4 as UUID } from "uuid";
import * as log4js from "log4js";

type DatabaseOptions = {
    apiRoute?: string,
    logger?: {
        path?: string,
        level?: log4js.Levels;
    };
};
type LoggerConfiguration = {
    appenders: Record<string, any>;
    categories: { default: Record<string, any>; } & Record<string, any>;
};
export class DatabaseServices {
    protected database: Database;
    protected logger: log4js.Logger;
    protected apiRoute: string = "/";

    constructor(userDbPath, opts?: DatabaseOptions) {

        if (opts?.apiRoute) {
            this.apiRoute = path.join("/", this.apiRoute);
        }

        this.initializeLogger(opts);

        if (userDbPath && fs.existsSync(userDbPath)) {
            this.database = new Database(userDbPath);
        } else {
            const dbPath = path.resolve("./database");
            this.logger.error("Either your path does not exist or is undefined (path:", userDbPath + ")");
            this.logger.error("Fall to default database path ", dbPath);
            this.database = new Database(dbPath);
        }
    }

    private initializeLogger(opts?: DatabaseOptions) {
        this.logger = log4js.getLogger();
        const loggerConfiguration: LoggerConfiguration = {
            appenders: {
                console: { type: 'console' },
            },
            categories: {
                default: {
                    appenders: ['console'],
                    level: opts?.logger?.level ? opts.logger.level : 'info'
                }
            }
        };
        if (opts?.logger?.path) {
            const ensuredLoggerPath = path.resolve(opts.logger.path);
            const dateAsStringArray = (new Date()).toISOString().split("T");
            const date = dateAsStringArray[0].split("-").reverse().join();
            const time = dateAsStringArray[1].replace(/(.*)\..*/gi, "$1").replace(/:/gi, "");
            if (fs.existsSync(ensuredLoggerPath)) {
                loggerConfiguration.appenders.file = { type: "file", filename: ensuredLoggerPath + 'database-' + date + "-" + time + '.log' };
                loggerConfiguration.categories.default.appenders.push("file");
            }
        }

        log4js.configure(loggerConfiguration);
    }

    services(): WebService[] {
        return [
            {
                method: "POST",
                endpoint: path.join(this.apiRoute, "/db/synchronize"),
                action: (req, res) => {
                    const { directory } = req.body.data;
                    if (directory && fs.existsSync(directory)) {
                        this.database.synchronize(directory);
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
                endpoint: path.join(this.apiRoute, "/db/import"),
                action: (req, res) => {
                    // todo
                }
            },
            {
                method: "POST",
                endpoint: path.join(this.apiRoute, "/db/export"),
                action: (req, res) => {
                    this.database.export();
                    return res.json({ success: true });
                }
            },
            {
                method: "GET",
                endpoint: path.join(this.apiRoute, "/db"),
                action: (req, res) => {
                    const { element, index } = req.query;
                    const id = element && element.id ? element.id : req.query.id;
                    if (index) {
                        const requestedElement = this.database.get(id, index);
                        return res.json(requestedElement);
                    } else {
                        return res.status(404).send({ message: "Index " + index + " does not exist" });
                    }

                }
            },
            {
                method: "PUT",
                endpoint: path.join(this.apiRoute, "/db"),
                action: (req, res) => {
                    const { element, index } = req.body;
                    element.id = element.id ? element.id : UUID();
                    res.json(this.database.put(element.id, element, index));
                }
            },
            {
                method: "DELETE",
                endpoint: path.join(this.apiRoute, "/db"),
                action: (req, res) => {
                    const { id, index } = req.body;
                    if (index) {
                        const success = this.database.delete(id, index);
                        return res.json({ success });
                    } else {
                        return res.status(404).send({ message: "Index " + index + " does not exist" });
                    }
                }
            }
        ];
    }
}

