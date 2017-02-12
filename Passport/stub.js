"use strict";

const cluster = require('cluster');
const express = require('express');
const numCPUs = require('os').cpus().length;
const fs = require('fs');
const uuid = require('uuid/v1');
const log4js = require('log4js');
// const collection = require( './mongo' );

const bodyParser = require('body-parser');

if (cluster.isMaster) {
    log4js.configure('log4jsConf/master.json');
    for (var i = 0; i < numCPUs; i++) {
        // Create a worker
        cluster.fork();
    }
} else {
    log4js.configure('log4jsConf/worker.json');
    const logger = log4js.getLogger('request');
    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.get('/', function (req, res) {
        fs.readFile('./responses/test.json', 'utf8', function (err, text) {
            const response = JSON.parse(text);
            logger.info('=====');
            logger.info('[REQ] header:' + JSON.stringify(req.header) + ' body:' + JSON.stringify(req.body));
            logger.info('[RES] body:' + JSON.stringify(response.body));
            res.status(response.status).send(response.body);
        });
    });

    app.post('/documents', function (req, res) {
        fs.readFile('./responses/documents.json', 'utf8', function (err, text) {
            const response = JSON.parse(text);
            logger.info('=====');
            logger.info('[REQ] header:' + JSON.stringify(req.header) + ' body:' + JSON.stringify(req.body));
            logger.info('[RES] body:' + JSON.stringify(response.body));
            res.status(response.status).send(response.body);
        });
    });

    app.put('/documents/:documentId', function (req, res) {
        fs.readFile('./responses/documents/documentId.json', 'utf8', function (err, text) {
            const response = JSON.parse(text);
            logger.info('=====');
            logger.info('Resource: /documents/' + req.params.documentId);
            logger.info('[REQ] header:' + JSON.stringify(req.header) + ' body:' + JSON.stringify(req.body));
            logger.info('[RES] body:' + JSON.stringify(response.body));
            res.status(response.status).send(response.body);
        });
    });

  app.get('/login', function (req, res) {
    fs.readFile('./responses/test.json', 'utf8', function (err, text) {
      const response = JSON.parse(text);
      logger.info('=====');
      logger.info('[REQ] header:' + JSON.stringify(req.header) + ' body:' + JSON.stringify(req.body));
      logger.info('[RES] body:' + JSON.stringify(response.body));
      res.status(200).send(response.body);
    });
  });

    // All workers use this port
    app.listen(8080);
}