const rande = require('./controller/randAtendiment')
const express = require('express');

const routes = express.Router();


/*ROTA DE COMANDO DA API*/
routes.get('/rande', rande.index)


routes.get('/online', (req, res) => {
    res.status(200).send('<h> WELCOME, IS ONLINE!!! V 0.1  (C) MICKS 2021-2022 </h>')});

module.exports = routes;