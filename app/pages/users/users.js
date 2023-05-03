const token = window.sessionStorage.getItem('token') ?? ''
import { refresh } from '/js/refresh.js'
import { toolbarInit } from '/components/toolbar.js'
import { formInit } from '/components/form.js'

const editPictureFormConfig = {
    padding: 0,
    rows: [
        {
            id: "id",
            type: "input",
            name: "id",
            hidden: true
        },
        {
            id: "picture",
            type: "simpleVault",
            name: "picture",
            label: "Nowe zdjęcie profilowe",
            labelPosition: "top",
            disabled: false,
            required: false,
            errorMessage: "Błąd"
        },
        {
            align: "end",
            cols: [
                {
                    id: "remove-button",
                    type: "button",
                    text: "Usuń zdjęcie",
                    icon: "mdi mdi-delete-forever",
                    color: "danger",
                    circle: true,
                },
                {
                    type: "spacer"
                },
                {
                    id: "apply-button",
                    type: "button",
                    text: "Zapisz zdjęcie",              
                    icon: "mdi mdi-check",
                    circle: true,
                }
            ]
        }
    ]
}
  
const toolbar = toolbarInit({ returnPath: '/', css: "dhx_widget--bordered", title: "Zarządzanie użytkownikami" })

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
                { 
                    minWidth: 100,
                    id: "picture",
                    header: [{ text: "Zdjęcie" }],
                    tooltipTemplate: () => {return 'edytuj zdjęcie'},
                    align: "center",
                    htmlEnable: true,
                    template: (picture, row, col) => {
                        return `<a class="edit-picture">${(picture) ? `<img class="avatar avatar-grid" src="${picture}">` : `brak`}</a>`
                    }
                },
				{ minWidth: 200, id: "name", header: [{ text: "Imię" }] },
				{ minWidth: 200, id: "surname", header: [{ text: "Nazwisko" }] },
                { minWidth: 200, id: "username", header: [{ text: "Nazwa użytkownika" }] },
                { minWidth: 100, id: "admin", header: [{ text: "Admin" }], type: "boolean" },
                { minWidth: 200, id: "date_logged", header: [{ text: "Ostatnie logowanie" }] },
                { minWidth: 200, id: "date_created", header: [{ text: "Data utworzenia konta" }], type: "date", format: "%d/%m/%Y" }
			],
            eventHandlers: {
                onclick: {
                    "edit-picture": (e, data) => {
                        openPictureEditor(data.row.id)
                    }
                }
            },
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
            if(column.id == 'date_logged' || column.id == 'date_created' || column.id == 'picture') return false
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
                    if(data.status == 'userExists') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd",
                            text: "Nie można zapisać danych użytkownika. Użytkownik o tej nazwie już istnieje.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.status == 'accessDenied') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: brak uprawnień!",
                            text: "Posiadane uprawnienia nie są wystarczające do wykonania tej operacji.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.status == 'loggedUserPermRevoke') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: odebranie uprawnień!",
                            text: "Nie można odebrać uprawnień gdy użytkownik jest zalogowany.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.status == 'lastAdmin') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: ostatni administrator!",
                            text: "Nie można zmienić uprawnień ponieważ jest to ostatnie konto z uprawnieniami administracyjnymi.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.status == 'error') {
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
                    if(err == 'Error: 401' || err == 'Error: 403' || String(err).includes('Forbidden')) refresh()
                })
        })

        document.querySelector("#remove").addEventListener("click", () => {
            dhx.confirm({
                header: "Uwaga",
                text: "Potwierdź usunięcie użytkownika.",
                buttons: ["Anuluj", "Potwierdzam"],
                buttonsAlignment: "center",
                escClose: true,
            }).then((confirm) => { 
                if(!confirm) return
                const cell = grid.selection.getCell()
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
                            if(data.response == 'success') grid.data.remove(cell.row.id)
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
                        .catch(err => {
                            if(err == 'Error: 401' || err == 'Error: 403' || String(err).includes('Forbidden')) refresh()
                        })
                }
            })
        })
        document.querySelector("#add").addEventListener("click", () => {
            window.location.href = '/users/add'
        })

        const editPictureWindow = new dhx.Window({
            width: 440,
            height: 550,
            modal: true,
        })
        const windowLayout = new dhx.Layout(null, {
            type: "none",
            rows: [
                {id: "actual-picture", height: "auto"},
                {id: "form"}
            ]
        })
        editPictureWindow.attach(windowLayout)
        
        const editPictureForm = new dhx.Form(null, editPictureFormConfig)
        const openPictureEditor = (id) => {
            editPictureWindow.show()
            editPictureForm.getItem("id").setValue(id)
            if((grid.data.getItem(id).picture)) editPictureForm.getItem("remove-button").show()
            else editPictureForm.getItem("remove-button").hide()
            let html = `<div class="avatar-window-container"><legend class="dhx_label">Aktualne zdjęcie</legend>${(grid.data.getItem(id).picture) ? `<img class="avatar avatar-window" src="${grid.data.getItem(id).picture}">` : `brak`}</div>`
            windowLayout.getCell("actual-picture").attachHTML(html)
        }
        editPictureForm.getItem("remove-button").events.on("click", () => {
            const data = editPictureForm.getValue()
            fetch(`http://localhost:4000/users/${data.id}/picture`, {
                method: 'delete',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(response => {
                if(response.ok) {
                    editPictureWindow.hide()
                    window.location.href = '/users'
                }
                else {
                    dhx.alert({
                        header: "Błąd: usunięto zdjęcia!",
                        text: "Zdjęcie profilowe nie zostało usunięte.",
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    })
                }
            })
            .catch(err => console.log(err))
        })
        editPictureForm.getItem("apply-button").events.on("click", () => {
            const data = editPictureForm.getValue()
            const picture = data.picture
            if(picture.length) {
                let formData = new FormData()
                formData.append('picture', picture[0].file)
                fetch(`http://localhost:4000/users/${data.id}/picture`, {
                    method: 'put',
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                })
                .then(response => {
                    if(response.ok) {
                        editPictureWindow.hide()
                        window.location.href = '/users'
                    }
                    else {
                        dhx.alert({
                            header: "Błąd: nie zapisano zdjęcia!",
                            text: "Zdjęcie profilowe nie zostało zapisane.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    }
                })
                .catch(err => console.log(err))
            }
            else {
                dhx.alert({
                    header: "Błąd: brak zdjęcia!",
                    text: "Nie dokonano wyboru zdjęcia.",
                    buttonsAlignment: "center",
                    buttons: ["ok"],
                })
            }
        })
        windowLayout.getCell('form').attach(editPictureForm)
        formInit(editPictureForm, { url: "http://localhost:4000/users", method: "POST", returnPath: "/users" })
    })
    .catch(err => {
        if(err == 'Error: 401' || err == 'Error: 403' || String(err).includes('Forbidden')) refresh()
    })