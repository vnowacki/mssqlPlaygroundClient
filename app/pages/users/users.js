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
        id: "logout",
        type: "button",
        value: "wyloguj",
        tooltip: "",
        icon: "mdi mdi-logout",
        view: "flat",
        size: "small",
        color: "primary",
        full: false,
        circle: false,
        loading: false
    }
]
  
const toolbar = new dhx.Toolbar("toolbar", {
    css:"dhx_widget--bordered"
});
toolbar.data.parse(data);

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
                    }
                })
                .catch(err => {                    
                    grid.data.update(row.id,{[column.id]:[oldValue]})
                    if(err == 'Error: 401' || err == 'Error: 403' || err.includes('Forbidden')) refresh()
                    dhx.alert({
                        header: "Błąd",
                        text: `Wystąpił błąd. Kod: ${err}.`,
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    })
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
                        .then(response => {
                            if(response.deleted == 1) grid.data.remove(cell.row.id);
                            else if(response.error == 'loggedUserDeletion') {
                                dhx.alert({
                                    header: "Błąd",
                                    text: "Nie można usunąć aktualnie zalogowanego użytkownika.",
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
                }
            })
        })
        document.querySelector("#add").addEventListener("click", function () {
            window.location.href = '/users/add'
        })
    })
    .catch(err => {
        if(err == 'Error: 401' || err == 'Error: 403') refresh()
    })