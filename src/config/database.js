require('dotenv').config()



module.exports = {
    dialect: 'mysql',
    database: process.env.DB_DATABASEMCK_PROD,
    username: process.env.DB_USERMCK_PROD,
    password: process.env.DB_PASSMCK_PROD,
    host: process.env.DB_HOSTMCK_PROD,
    logging: false,
    warnings: false,
    timezone: "-03:00"
}

