const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
const baseDirectory = __dirname + '/app/'
const port = 8080

const server = http.createServer((request, response) => {
    try {
        let requestUrl = url.parse(request.url)
        let file = null
        switch(requestUrl.pathname) {
          case '/users':
               file = './pages/users/users.html'
               break
          case '/login':
               file = './pages/login/login.html'
               break
          default:
               file = (requestUrl.pathname != '/') ? requestUrl.pathname : 'index.html'
               break
        }
        let fsPath = baseDirectory + path.normalize(file)

        let fileStream = fs.createReadStream(fsPath)
        fileStream.pipe(response)
        fileStream.on('open', function() {
             response.writeHead(200)
        })
        fileStream.on('error',function(e) {
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