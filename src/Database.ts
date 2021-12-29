
import { Low, JSONFile } from 'lowdb';


const error = (message: string, ...value: any) => {
    return console.error(message, ...value);
};
type DatabaseObject = Record<string, any>;
export class Database {

    private db;

    constructor(dbPath: string) {
        this.synchronize(dbPath);
    }

    synchronize(directory) {
        const adapter = new JSONFile(directory);
        this.db = new Low(adapter);
        this.db.read();
        this.db.data ||= {};
    }

    get(id: string, index?: string): DatabaseObject {
        let object;
        if (index) {
            const indexedDb = this.db.data[index];
            if (indexedDb) {
                object = indexedDb[id];
            } else {
                error("Index does not exist", index);
            }
        } else {
            const indicesDb = Object.values(this.db);
            if (indicesDb.length > 0) {
                let currentDbIndex: any = indicesDb[0];
                while (currentDbIndex && !object) {
                    object = currentDbIndex[id];
                }
            } else {
                error("No existing index");
            }
        }
        return object;

    }

    getAll(): any[] {
        return Object.values(Object.values(this.db.data).flat());
    }


    put(id: string, element: DatabaseObject, index: string): DatabaseObject {
        if (!this.db.data[index]) {
            this.db.data[index] = {};
        }
        this.db.data[index][id] = element;
        this.db.write();
        return element;
    }

    putAll(elements: DatabaseObject[], index: string): void {
        if (!this.db.data[index]) {
            this.db.data[index] = {};
        }
        elements.forEach((element) => {
            this.db.data[index][element.id] = element;
        });
        this.db.write();
    }

    delete(id: string, index?: string): boolean {
        let success = false;
        if (index) {
            if (this.db.data[index]) {
                delete this.db.data[index][id];
                success = true;
            } else {
                error("Index does not exist", index);
            }
        } else {
            const indicesDb = Object.values(this.db);
            if (indicesDb.length > 0) {
                let currentDbIndex: any = indicesDb[0];
                while (currentDbIndex && !success) {
                    if (currentDbIndex[id]) {
                        delete currentDbIndex[id];
                        success = true;
                    }
                }

            } else {
                error("No existing index");
            }
        }
        return success;
    }

    export() {
        this.db.write();
    }
}