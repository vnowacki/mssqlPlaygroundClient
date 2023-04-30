const sidebarInit = (object) => {
    object.events.on("click", (id) => {
        if(id == 'users') window.location.href = '/users'
    })
}
export { sidebarInit }