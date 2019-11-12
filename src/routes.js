const fetch = require('../controllers/fetch')
module.exports = (app) => {
  app.get('/', fetch.getPage),
  app.get('/clean', fetch.cleanup)
}
