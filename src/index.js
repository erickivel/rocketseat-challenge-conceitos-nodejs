const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAccountExists = users.find(user => user.username === username);

  if (!userAccountExists) {
    return response.status(404).json({ error: 'User account not found' });
  }

  request.userAccount = userAccountExists;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;

  const { todos } = users.find(eachUser => eachUser.username === userAccount.username);

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { userAccount } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  userAccount.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = userAccount.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "Todo not found"})
  }

  const userTodos = userAccount.todos;

  const atualizedTodos = userTodos.map(todo => {
    if (todo.id === id) {
      todo = {
        ...todo,
        title,
        deadline: new Date(deadline)
      }
      return todo;
    } 
    return todo;
  });

  userAccount.todos = atualizedTodos;

  const atualizedTodo = userAccount.todos.find(todo => todo.id === id);

  return response.status(200).json(atualizedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;

  const todo = userAccount.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found"});
  }

  const userTodos = userAccount.todos;

  const atualizedTodos = userTodos.map(todo => {
    if (todo.id === id) {
      todo = {
        ...todo,
        done: true,
      }
      return todo;
    } 
    return todo;
  });

  userAccount.todos = atualizedTodos;

  const atualizedTodo = userAccount.todos.find(todo => todo.id === id);

  return response.status(200).json(atualizedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;

  const todo = userAccount.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found"});
  }

  const userTodos = userAccount.todos;

  const atualizedTodos = userTodos.filter(todo => todo.id !== id);

  userAccount.todos = atualizedTodos;

  return response.status(204).send();
});

module.exports = app;