import * as express from 'express';
import * as bodyParser from "body-parser"

export interface GenericService {
    method: "GET" | "POST" | "PUT" | "DELETE" | "STATIC",
    endpoint: string,
    action?: (req: any, res: any) => any
    path?: string
}

export class Server {

    private apiRoute = "/api";
    private router: any;
    private expressServer: any;
    private port: number;
    private services: GenericService[]

    constructor(port: number, services?: GenericService[]) {
        this.expressServer = express()
        this.router = express.Router();
        this.serverSettings()

        this.port = port;
        if (services) {
            this.services = services;
            this.services.forEach((service) => {
                this.addService(service)
            })
        }
    }

    serverSettings() {
        this.expressServer.use((req: any, res: any, next: any) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.charset = 'utf-8';
            next();
        })
        this.expressServer.use(bodyParser.json()); // for parsing application/json
        this.expressServer.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

        this.expressServer.use(this.apiRoute, this.router)
    }

    addService(service: GenericService) {
        const serviceRoute = this.router.route(service.endpoint)
        switch (service.method) {
            case "GET":
                serviceRoute.get(service.action)
                break;
            case "POST":
                serviceRoute.post(service.action)
                break;
            case "DELETE":
                serviceRoute.delete(service.action)
                break;
            case "PUT":
                serviceRoute.put(service.action)
                break;
            case "STATIC":
                const path = service.path ? service.path : "./"
                this.expressServer.use(express.static(path));
                break;
            default:
                break;
        }

    }

    startServer() {
        this.expressServer.listen(this.port, () => { console.log(`Server listening on port ${this.port}`) })
    }
}