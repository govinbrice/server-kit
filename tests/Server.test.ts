import * as fs from "fs"
import * as path from "path"
import { Server, Services, WebServices, HTMLFileService, StaticDirectoryService } from "../src/Server";
import { todos, todo, modifyTodos, deleteTodo } from "./ServerServices";
import { request } from "./ServerRequest";

const port = 3000

const webServices: WebServices[] = [
    {
        endpoint: "/todos",
        method: "GET",
        action: todos
    },
    {
        endpoint: "/todo",
        method: "PUT",
        action: todo
    },
    {
        endpoint: "/modifyTodos",
        method: "POST",
        action: modifyTodos
    },
    {
        endpoint: "/deleteTodo",
        method: "DELETE",
        action: deleteTodo
    },
]
const htmlServices: HTMLFileService[] = [
    {
        endpoint: "/",
        method: "HTML",
        pages: ["tests/data/page"]
    }
]

const staticDirs: StaticDirectoryService[] = [
    {
        endpoint: "/",
        path: "./",
        method: "STATIC"
    }
]
const services: Services = [
    ...webServices,
    ...htmlServices,
    ...staticDirs
]
const server = new Server(port, services)
var toBeClosed: any = undefined;

beforeAll(() => {
    toBeClosed = server.startServer()
})

afterAll(() => {
    if (toBeClosed) {
        toBeClosed.close()
    }
})

const serverUrl = 'http://localhost:3000'
const serverApi = 'http://localhost:3000/api'

test('providing get service', () => {
    const todosRequest = serverApi + "/todos"

    expect.assertions(2);
    return request(todosRequest, "GET", { query: {} })
        .then((response: any) => {
            const todos: any[] = response.todos;
            expect(todos.length).toEqual(2)
            expect(todos).toEqual(["todo1", "todo2"])
        })
        .catch((error: any) => {
            console.error(error);
            expect(error).toBeFalsy()
        })
})

test('providing post service', () => {
    const todoRequest = serverApi + "/todo"

    expect.assertions(2);
    return request(todoRequest, "PUT", { body: { todo: "todo3" } })
        .then((response: any) => {
            const todos: any[] = response.todos;
            expect(todos.length).toEqual(3)
            expect(todos).toEqual(["todo1", "todo2", "todo3"])
        })
        .catch((error: any) => {
            console.error(error);
            expect(error).toBeFalsy()
        })
})

test('providing put service', () => {
    const modifyTodosRequest = serverApi + "/modifyTodos"

    expect.assertions(2);
    return request(modifyTodosRequest, "POST", { body: { todos: ["todo3"] } })
        .then((response: any) => {
            const todos: any[] = response.todos;
            expect(todos.length).toEqual(1)
            expect(todos).toEqual(["todo3"])
        })
        .catch((error: any) => {
            console.error(error);
            expect(error).toBeFalsy()
        })
})

test('providing delete service', () => {
    const deleteTodoRequest = serverApi + "/deleteTodo"

    expect.assertions(2);
    return request(deleteTodoRequest, "DELETE", { body: { todo: "todo1" } })
        .then((response: any) => {
            const todos: any[] = response.todos;
            expect(todos.length).toEqual(1)
            expect(todos).toEqual(["todo2"])
        })
        .catch((error: any) => {
            console.error(error);
            expect(error).toBeFalsy()
        })
})

test('providing static files', () => {
    const staticFile = serverUrl + "/tests/data/object.json"
    const expectObjectPath = path.resolve(path.normalize("tests/data/object.json"))
    const expectedObject = JSON.parse(fs.readFileSync(expectObjectPath).toString())

    expect.assertions(1);
    return request(staticFile, "GET", { query: {} })
        .then((response: any) => {
            const object: any[] = response;
            expect(object).toEqual(expectedObject)
        })
        .catch((error: any) => {
            console.error(error);
            expect(error).toBeFalsy()
        })
})

test('providing pages', () => {
    const pagesRequest = serverUrl + "/tests/data/page"
    const expectPagePath = path.resolve(path.normalize("tests/data/page.html"))
    const expectedPage = fs.readFileSync(expectPagePath).toString()

    expect.assertions(1);
    return request(pagesRequest, "GET", {})
        .then((response: any) => {
            const page: any[] = response;
            expect(page).toEqual(expectedPage)
        })
        .catch((error: any) => {
            console.error(error);
            expect(error).toBeFalsy()
        })
})