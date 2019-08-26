

const todosList = ["todo1", "todo2"]
export function todos(req: any, res: any) {
    return res.json({ todos: todosList, type: "success" })
}

export function todo(req: any, res: any) {
    const todo = req.body.todo;
    const list = [...todosList, todo]
    return res.json({ todos: list, type: "success" })
}

export function modifyTodos(req: any, res: any) {
    const todos = req.body.todos;
    return res.json({ todos, type: "success" })
}

export function deleteTodo(req: any, res: any) {
    const todo = req.body.todo;
    const list = todosList.filter((t) => { return t !== todo })
    return res.json({ todos: list, type: "success" })
}
