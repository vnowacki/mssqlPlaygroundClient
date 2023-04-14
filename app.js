const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
const baseDirectory = __dirname + '/app/'
const router = require('./app/js/router')
const port = 8080

const server = http.createServer((request, response) => {
     try {
          let requestUrl = url.parse(request.url)
          let file = router(requestUrl)
          let fsPath = baseDirectory + path.normalize(file)

          let fileStream = fs.createReadStream(fsPath)
          if(path.extname(fsPath) === '.js') response.setHeader('Content-Type', 'application/javascript')
          fileStream.pipe(response)
          fileStream.on('open', () => {
               response.writeHead(200)
          })
          fileStream.on('error', (e) => {
               response.writeHead(404)
               response.end()
          })
     } catch(e) {
          response.writeHead(500)
          response.end()
          console.log(e.stack)
     }
})
server.listen(port, error => console.log(error))