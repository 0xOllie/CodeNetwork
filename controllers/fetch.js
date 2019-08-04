const Puppeteer = require('puppeteer')
const Config = require('../config/config')

function getPage(req, res){
    console.log(req.body)
    res.sendStatus(200)
}

module.exports = {
    getPage (req, res) {
      getPage(req, res)
    }
  }