const config = require('../config/config')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

require('./routes')(app)

app.listen(config.port, () => console.log('\n Hello Arkose Labs, server ready on port: ' + config.port + '\n'))
