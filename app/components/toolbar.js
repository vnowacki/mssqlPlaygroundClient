const token = window.sessionStorage.getItem('token') ?? ''
import { refresh } from '/js/refresh.js'

const toolbarInit = (object) => {
    fetch('http://localhost:4000/users/info', 
        {
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if(!response.ok) throw new Error(response.status)
            return response.json()
        })
        .then(response => {
            object.data.update("user", {
                value: `${response.name} ${response.surname}`
            })
            if(response.picture) object.data.update("user", {
                icon: '',
                html: `<img class="avatar logged-avatar" src="${response.picture}"> ${response.name} ${response.surname}`
            })
            object.data.update("lastLogged", {
                value: response.date_logged
            })
            if(!response.name) object.data.remove("user")
        })
        .catch(err => {
            if(err == 'Error: 401' || err == 'Error: 403' || String(err).includes('Forbidden')) refresh()
        })

    object.events.on("click", (id) => {
        if(id == 'logout') {
            fetch('http://localhost:4000/auth', {
                    method: 'delete',
                    headers: {
                        "Content-Type" : "application/json"
                    },
                    body: JSON.stringify({ token: window.sessionStorage.getItem('refreshToken') })
                })
                .then(response => {
                    if(response.status == 204) {
                        window.sessionStorage.clear()
                        window.location.href = '/login'
                    }
                })
                .catch(err => {
                    dhx.alert({
                        header: "Błąd",
                        text: `Wylogowanie nie powiodło się, kod błędu: ${err}`,
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    })
                })
        }
        if(id == 'home') window.location.href = '/'
        if(id == 'users') window.location.href = '/users'
    })
}

export { toolbarInit }