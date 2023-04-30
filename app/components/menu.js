const menuInit = (object) => {
    object.events.on("click", (id) => {
        if(id == 'users') window.location.href = '/users'
    })
}
export { menuInit }