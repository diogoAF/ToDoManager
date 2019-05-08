const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update({ region: 'sa-east-1' });

// O DynamoDB obriga que existam esses dados,
// mesmo que ele não use para nada no ambiente local
AWS.config.update({
    credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
    }
});

// Caso esteja rodando no ambiente de DESENVOLVIMENTO,
// define o endpoint
if(config.env == 'desenv'){
    AWS.config.update({
        endpoint: 'http://localhost:8000'
    });
}

// Atribui a AWS para o módulo
module.exports = AWS;