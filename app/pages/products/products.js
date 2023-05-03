const token = window.sessionStorage.getItem('token') ?? ''
import { refresh } from '/js/refresh.js'
import { toolbarInit } from '/components/toolbar.js'

const editDescriptionConfig = {
    padding: 0,
    rows: [
        {
            id: "id",
            type: "input",
            name: "id",
            hidden: true
        },
        {
            type: "textarea",
            name: "description",
            height: 200,
            maxlength: 400,
            label: "Edytuj opis produktu"
        },
        {
            align: "end",
            cols: [
                {
                    id: "apply-button",
                    type: "button",
                    text: "Zapisz",              
                    icon: "mdi mdi-check",
                    circle: true,
                }
            ]
        }
    ]
}

const grid_config = {
    columns: [
        { 
            id: "category",
            minWidth: 150, 
            maxWidth: 150, 
            header: [{ text: "Kategoria" }], 
            editorType: "combobox"
        },
        { 
            id: "name",
            minWidth: 250, 
            maxWidth: 250,
            header: [{ text: "Nazwa produktu" }] 
        },
        { 
            id: "price",
            minWidth: 150, 
            maxWidth: 150, 
            header: [{ text: "Cena" }], 
            type: "number", 
            format: "# #.00", 
            template: i => `PLN ${i}` 
        },
        { 
            id: "quantity",
            minWidth: 100, 
            maxWidth: 100,  
            header: [{ text: "Ilość" }], 
            mark: (cell) => { return cell < 1 ? "no-product" : cell < 10 ? "veryLow-product" : cell < 50 ? "low-product" : cell < 200 ? "moderate-product" : "high-product" } 
        },
        { 
            id: "weight",
            minWidth: 100, 
            maxWidth: 100, 
            header: [{ text: "Waga" }], 
            type: "number", 
            format: "# #", 
            template: i => `${i} g` 
        },
        { 
            id: "sell_start",
            minWidth: 200, 
            maxWidth: 200, 
            header: [{ text: "Wprowadzenie do sprzedaży", align: "left" }], 
            type: "date", 
            format: "%d/%m/%Y", 
            align: "left" 
        },
        { 
            id: "sell_end", 
            minWidth: 200, 
            maxWidth: 200, 
            header: [{ text: "Wycofanie produktu", align: "left" }], 
            type: "date", 
            format: "%d/%m/%Y", 
            align: "left", 
            htmlEnable: true,
            template: (text) => {return (text) ? text : "nigdy"} 
        },
        {
            id: "action",
            minWidth: 80, 
            maxWidth: 80,
            header: [{ text: "Opis", align: "center" }],
            htmlEnable: true, 
            align: "center",
            template: () => {
                return `<span class="action-buttons"><a class="edit-button"><span class="mdi mdi-lead-pencil"></span></a></span>`
            }
        }
    ],
    autoWidth: true,
    selection: "row",
    adjust: true,
    resizable: true,
    editable: true
}

const toolbar = toolbarInit({ returnPath: '/', css: "dhx_widget--bordered", title: "Zarządzanie produktami" })

fetch('http://localhost:4000/products', 
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
    .then(async dataset => {
        let categories = await fetch('http://localhost:4000/products/categories',
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
        .then(data => {
            return data.map(item => {return item.name}).flat()
        })

        grid_config.eventHandlers = {
            onclick: {
                "edit-button": (e, data) => {
                    openDescriptionEditor(data.row.id)
                }
            }
        }

        const grid = new dhx.Grid("dataContainer", grid_config)
        grid.data.parse(dataset)
        grid.getColumn('category').options = categories
        grid.selection.setCell(grid.data.getId(0))

        document.querySelector("#remove").addEventListener("click", () => {
            dhx.confirm({
                header: "Uwaga",
                text: "Potwierdź usunięcie produktu.",
                buttons: ["Anuluj", "Potwierdzam"],
                buttonsAlignment: "center",
                escClose: true,
            }).then((confirm) => { 
                if(!confirm) return
                const cell = grid.selection.getCell()
                if (cell.row) {
                    fetch(`http://localhost:4000/products/${cell.row.id}`, 
                        {
                            method : "DELETE",
                            headers: {
                                "Content-Type" : "application/json",
                                "Authorization": `Bearer ${token}`
                            }
                        })
                        .then(response => response.json())
                        .then(data => {
                            if(data.status == 'success') grid.data.remove(cell.row.id)
                            else if(data.status == 'accessDenied') {
                                dhx.alert({
                                    header: "Błąd: brak uprawnień!",
                                    text: "Posiadane uprawnienia nie są wystarczające do wykonania tej operacji.",
                                    buttonsAlignment: "center",
                                    buttons: ["ok"],
                                })
                            }
                            else {
                                dhx.alert({
                                    header: "Błąd",
                                    text: "Nie udało się usunąć produktu.",
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
            window.location.href = '/products/add'
        })

        let oldValue = ''
        grid.events.on("beforeEditEnd", (value, row, column) => {
            oldValue = row[column.id]
        })
        grid.events.on("beforeEditStart", (row, column, editorType) => {
            return column.id != 'sell_start' && column.id != 'action'
        })
        grid.events.on("afterEditEnd", (value, row, column) => {
            fetch(`http://localhost:4000/products/${row.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(row)
                })
                .then(response => response.json())
                .then(data => {
                    if(data.status == 'accessDenied') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: brak uprawnień!",
                            text: "Posiadane uprawnienia nie są wystarczające do wykonania tej operacji.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.status == 'noCategoryFound') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: nieprawidłowa kategoria!",
                            text: "Nie można odnaleźć kategorii o podanej nazwie.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    } else if(data.status == 'updateError') {
                        grid.data.update(row.id,{[column.id]:[oldValue]})
                        dhx.alert({
                            header: "Błąd: zapis nie powiódł się!",
                            text: "Nie można dokonać zapisu informacji.",
                            buttonsAlignment: "center",
                            buttons: ["ok"],
                        })
                    }
                })
        })

        const editDescriptionWindow = new dhx.Window({
            width: 440,
            height: 350,
            modal: true,
        })

        const editDescriptionForm = new dhx.Form(null, editDescriptionConfig)
        editDescriptionWindow.attach(editDescriptionForm)
        
        const openDescriptionEditor = (id) => {
            editDescriptionWindow.show()
            const item = grid.data.getItem(id)
            if (item) {
                editDescriptionForm.setValue(item)
            }
        }
        const closeDescriptionEditor = () => {
            editDescriptionForm.clear()
            editDescriptionWindow.hide()
        }
        
        editDescriptionForm.getItem("apply-button").events.on("click", () => {
            const newData = editDescriptionForm.getValue()
            if (newData.id) grid.data.update(newData.id, { ...newData })
            const args = [ null, grid.data.getItem(newData.id), grid.getColumn("action") ]
            grid.events.fire("afterEditEnd", args)
            closeDescriptionEditor()
        })

    })
    .catch(err => {
        if(err == 'Error: 401' || err == 'Error: 403' || String(err).includes('Forbidden')) refresh()
    })