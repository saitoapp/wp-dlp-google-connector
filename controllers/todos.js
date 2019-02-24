class TodosController {
    getAllTodos(req, res) {
        return res.status(200).send({
            success: 'true',
            message: 'todos retrieved successfully',
        });
    }
}

const todoController = new TodosController();
export default todoController;