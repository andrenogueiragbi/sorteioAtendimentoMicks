const Sequilize = require("sequelize")
const config = require('../config/database')


const connectionDB = new Sequilize(config)


module.exports = {connectionDB}