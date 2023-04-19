const token = window.sessionStorage.getItem('token') ?? ''
import { refresh } from '/js/refresh.js'

const data = [
    {
        id: "home",
        icon: "dxi dxi-arrow-left",
        value: ""
    },
    {
        type: "separator"
    },
    {
        type: "title",
        value: "Zarządzanie użytkownikami"
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
  
const toolbar = new dhx.Toolbar("toolbar", {
    css:"dhx_widget--bordered"
})
toolbar.data.parse(data)

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
        toolbar.data.update("user", {
            value: `${response.name} ${response.surname}`
        })
        toolbar.data.update("lastLogged", {
            value: response.date_logged
        })
    })
    .catch(err => console.log(err))

toolbar.events.on("click", (id) => {
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
})

fetch('http://localhost:4000/users', 
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
    .then(dataset => {
        const grid = new dhx.Grid("dataContainer", {
			columns: [
				{ minWidth: 200, id: "name", header: [{ text: "Imię" }] },
				{ minWidth: 200, id: "surname", header: [{ text: "Nazwisko" }] },
                { minWidth: 200, id: "username", header: [{ text: "Nazwa użytkownika" }] },
                { minWidth: 100, id: "admin", header: [{ text: "Admin" }], type: "boolean" },
                { minWidth: 200, id: "date_logged", header: [{ text: "Ostatnie logowanie" }] },
                { minWidth: 200, id: "date_created", header: [{ text: "Data utworzenia konta" }], type: "date", format: "%d/%m/%Y" }
			],
			data: dataset,
            autoWidth: true,
            selection: "row",
            adjust: true,
            resizable: true,
            editable: true
		})
        grid.selection.setCell(grid.data.getId(0))

        let oldValue = ''
        grid.events.on("beforeEditEnd", (value, row, column) => {
            oldValue = row[column.id]
        })
        grid.events.on("beforeEditStart", (row, column, editorType) => {
            if(column.id == 'date_logged' || column.id == 'date_created') return false
        })
        grid.events.on("afterEditEnd", (value, row, column) => {
            row.permLevel = (row.admin) ? 'admin' : 'read'
            fetch(`http://localhost:4000/users/${row.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(row)
                })
                .then(response => response.json())
                .then(data => {
                    if(data.response == 'userExists') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd",
                            text: "Nie można zapisać danych użytkownika. Użytkownik o tej nazwie już istnieje.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.response == 'accessDenied') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: brak uprawnień!",
                            text: "Posiadane uprawnienia nie są wystarczające do wykonania tej operacji.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.response == 'loggedUserPermRevoke') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: odebranie uprawnień!",
                            text: "Nie można odebrać uprawnień gdy użytkownik jest zalogowany.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.response == 'lastAdmin') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: ostatni administrator!",
                            text: "Nie można zmienić uprawnień ponieważ jest to ostatnie konto z uprawnieniami administracyjnymi.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.response == 'error') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: brak modyfikacji!",
                            text: "Zmiany nie zostały zapisane.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    }
                })
                .catch(err => {                    
                    grid.data.update(row.id,{[column.id]:[oldValue]})
                    throw new Error(err)
                })
        })

        document.querySelector("#remove").addEventListener("click", function () {
            dhx.confirm({
                header: "Uwaga",
                text: "Potwierdź usunięcie użytkownika.",
                buttons: ["Anuluj", "Potwierdzam"],
                buttonsAlignment: "center",
                escClose: true,
            }).then((confirm) => { 
                if(!confirm) return
                const cell = grid.selection.getCell();
                if (cell.row) {
                    fetch(`http://localhost:4000/users/${cell.row.id}`, 
                        {
                            method : "DELETE",
                            headers: {
                                "Content-Type" : "application/json",
                                "Authorization": `Bearer ${token}`
                            }
                        })
                        .then(response => response.json())
                        .then(data => {
                            if(data.response == 'success') grid.data.remove(cell.row.id);
                            else if(data.response == 'accessDenied') {
                                dhx.alert({
                                    header: "Błąd: brak uprawnień!",
                                    text: "Posiadane uprawnienia nie są wystarczające do wykonania tej operacji.",
                                    buttonsAlignment: "center",
                                    buttons: ["ok"],
                                })
                            }
                            else if(data.response == 'loggedUserDeletion') {
                                dhx.alert({
                                    header: "Błąd: użytkownik zalogowany!",
                                    text: "Nie można usunąć konta aktualnie zalogowanego użytkownika.",
                                    buttonsAlignment: "center",
                                    buttons: ["ok"],
                                })
                            }
                            else if(data.response == 'lastAdmin') {
                                dhx.alert({
                                    header: "Błąd: ostatni administrator!",
                                    text: "Nie można usunąć ponieważ jest to ostatnie konto z uprawnieniami administracyjnymi.",
                                    buttonsAlignment: "center",
                                    buttons: ["ok"],
                                })
                            }
                            else {
                                dhx.alert({
                                    header: "Błąd",
                                    text: "Nie udało się usunąć konta użytkownika.",
                                    buttonsAlignment: "center",
                                    buttons: ["ok"],
                                })
                            }
                        })
                        .catch(err => {throw new Error(err)})
                }
            })
        })
        document.querySelector("#add").addEventListener("click", function () {
            window.location.href = '/users/add'
        })
    })
    .catch(err => {
        if(err == 'Error: 401' || err == 'Error: 403' || String(err).includes('Forbidden')) refresh()
    })