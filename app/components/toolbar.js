const token = window.sessionStorage.getItem('token') ?? ''
import { refresh } from '/js/refresh.js'

const toolbarInit = (options) => {
    const toolbar_config = [
        {
            type: "title",
            value: options.title
        },
        {
            type: "spacer"
        },
        {
            id: "user",
            value: "",
            icon: "mdi mdi-account-circle",
            items: [
                {
                    type: "title",
                    id: "lastLogged",
                    value: "",
                    icon: "mdi mdi-clock",
                },
                {
                    id: "logout",
                    "value": "wyloguj",
                    icon: "mdi mdi-logout",
                }
            ]
        }
    ]

    if(options.returnPath) {
        toolbar_config.unshift({ type: "separator" })
        toolbar_config.unshift({ id: "return", icon: "dxi dxi-arrow-left", value: "" })
    }

    const object = new dhx.Toolbar("toolbar", { data: toolbar_config, css: options.css })
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
        if(id == 'return') window.location.href = options.returnPath
    })
    return object
}

export { toolbarInit }