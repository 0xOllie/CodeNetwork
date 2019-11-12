const fs = require('fs')
const Puppeteer = require('puppeteer')
const Config = require('../config/config')
const aws = require('aws-sdk')
const path = require('path')
const cryptoRandomString = require('crypto-random-string');
// setup our AWS IAM user - it should have the s3 full access permissions
const s3 = new aws.S3({
  credentials: {
    accessKeyId: Config.aws.accessKeyId,
    secretAccessKey: Config.aws.secretAccessKey,
  }
})

// empties the images directory
async function cleanup(req, res){
  const directory = 'images'
  fs.readdir(directory, (err, files) => {
    if (err) throw err
    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err
      })
    }
  })
  res.status(200).send('Local storage cleaned!')
}

async function getPage(req, res) {
  // create browser object and give it some arguments
  const browser = await Puppeteer.launch({
    headless: true,
    slowMo: 30,
    args: [`--incognito`]
  })
  try {
    var filePath = 'images/screenshot_'+Date.now().toString()+'.png'
    const pages = await browser.pages()
    const page = await pages[0]
    await page.setViewport({ width: 1920, height: 1080 })
    
    // open the browser and navigate to the URL in the request body
    await page.goto(req.query.url)
    await page.waitFor(500)
    
    // take a screenshot of the page then close the browser
    await page.screenshot({ path: filePath, fullPage: true })
    await browser.close()
    
    // if query upload is true push to s3
    if(req.query.upload === true){
        // read the screenshot into the variable data
        fs.readFile(filePath, (err, data) => {
          // setup AWS S3 paramaters
          const params = {
              Bucket: Config.aws.bucket,
              Key: Date.now().toString() + '.png',
              Body: data,
              ACL: 'public-read',
              ContentType: 'image/png'
          }
          // upload the image to S3 and return the link to the requestor
          s3.upload(params, function(s3Err, data) {
              if (s3Err) throw s3Err
              console.log(`File uploaded successfully at ${data.Location}`)
              res.status(200).send('File URL: ' + data.Location)
          })
      })
    } else{
      res.status(200).send('Success! Dumping dummy payload: ' + cryptoRandomString({length: 10000}))
    }
  } catch (e) {
    await browser.close()
    res.status(500).send('An error occured processing the provided URL')
  }
}

module.exports = {
  getPage(req, res) {
    getPage(req, res)
  },
  cleanup(req, res) {
    cleanup(req, res)
  }
}