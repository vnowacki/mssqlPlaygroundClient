const sidebarInit = (object) => {
    object.events.on("click", (id) => {
        if(id == 'users') window.location.href = '/users'
        if(id == 'products') window.location.href = '/products'
    })
}
export { sidebarInit }