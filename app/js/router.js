const router = (requestUrl) => {
     let file = null
     switch(requestUrl.pathname) {
          case '/users':
               file = './pages/users/users.html'
               break
          case '/users/add':
               file = './pages/users/add.html'
               break
          case '/products':
               file = './pages/products/products.html'
               break
          case '/products/add':
               file = './pages/products/add.html'
               break
          case '/login':
               file = './pages/login/login.html'
               break
          default:
               file = (requestUrl.pathname != '/') ? requestUrl.pathname : 'index.html'
               break
     }     
     return file
}

module.exports = router