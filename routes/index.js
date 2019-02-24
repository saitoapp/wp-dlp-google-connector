import express from 'express';
import todoController from '../controllers/todos';

const router = express.Router();

// get all todos
router.get('/api/v1/todos', todoController.getAllTodos);

export default router;