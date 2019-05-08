// Configurações do Express.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const taskDAO = require('./taskDAO');
const jwt = require('jsonwebtoken');
const SECRET = '65b0f591d098fbdf436a5ba1d41dc79a';

//Configurações da biblioteca body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Preparações do Token de Segurança
function getTokenJWT (request, response, next) {
    if (request.url == '/login'){
        next();
    }

    var token = request.headers['x-access-token'];
    try {
        jwt.verify(token, SECRET);
        next();
    } catch (error) {
        response.status(500).send({ message: 'Token inválido'});
    }
};

// Valida o Token em todas as chamadas
app.use(getTokenJWT);

// Método GET
app.get('/', (req, resp) => resp.send('To Do Manager is running!'));

// Método POST
app.post('/tasks', (request, response) => {
    const {body} = request;
    var task = {
        title: body.title,
        description: body.description,
        isDone: body.isDone,
        isPriority: body.isPriority 
    };
    // Salvando na tabela Tasks
    taskDAO.insert(task, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(201).send(data);
        }
    });
});

// Método GET no /tasks
app.get('/tasks', (request, response) => {
    taskDAO.listAll((err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(201).send(data);
        }
    });
});

// Método GET com parametros
app.get('/tasks/:taskID', (request, response) => {
    taskDAO.findTaskById(request.params.taskID, (err, task) => {
        if(task){
            response.status(200);
            response.send(task);
        } else if (err) {
            response.status(500);
            response.send(err);
        } else {
            response.status(404);
            response.send('Task Not Found.');
        }
    });
});

// Método PUT
app.put('/tasks/:taskID', (request, response) => {
    const { body } = request;
    const task = {
        id: request.params.taskID,
        title: body.title,
        description: body.description,
        isDone: body.isDone,
        isPriority: body.isPriority
    };
    // Passa os dados para o DAO inserir
    taskDAO.insert(task, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(201).send(task);
        }
    });
});

// Método DELETE
app.delete('/tasks/:taskID', (request, response) => {
    taskDAO.remove(request.params.taskID, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).send(data);
        }
    });
})

// Método de Login
app.post('/login', (request, response) => {
    var body = request.body;
    if(body.username == 'admin' && body.password == 'admin123'){
        var token = jwt.sign({ username: 'admin', role: 'admin'}, SECRET);
        response.send({ auth: true, token});
    } else {
        response.status(403).send({ auth: false, message: 'Usuário inválido'});
    }
});


// Inicia o DynamoDB e abre a porta 3000
taskDAO.init((err, data) => {
    if (err) {
        console.log('Servidor nao iniciado por erro no DynamoDB', err);
    } else {
        // Abrindo a porta 3000
        app.listen(3000, () => {
            console.log('Servidor iniciado');
        });
    }
});