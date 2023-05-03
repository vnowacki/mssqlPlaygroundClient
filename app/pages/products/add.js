const token = window.sessionStorage.getItem('token') ?? ''
import { toolbarInit } from '/components/toolbar.js'
import { formInit } from '/components/form.js'

const form_config = {
    width: "500px",
    css: "dhx_widget--bg_white dhx_layout-cell--bordered",
    padding: 40,
    rows: [
        {
            type: "input",
            label: "Nazwa produktu",
            name: "name",
            maxlength: "100",
            value: "",
            required: true,
            errorMessage: "Podanie nazwy jest obowiązkowe"
        },
        {
            type: "textarea",
            label: "Opis produktu",
            name: "description",
            maxlength: "400",
            value: "",
            required: true,
            errorMessage: "Opis musi być uzupełniony"
        },
        {
            type: "input",
            label: "Ilość [szt.]",
            name: "quantity",
            helpMessage: "Ilość dostępnych przedmiotów",
            value: "0",
            required: true,
            validation: (value) => {
                return value && !isNaN(value) && value > 0
            },
            errorMessage: "To musi być liczba większa od zera",
            successMessage: "Prawidłowa wartość",
            preMessage: "Wprowadź wartość liczbową"
        },
        {
            type: "input",
            label: "Cena jednostkowa [PLN]",
            name: "price",
            value: "0",
            required: true,
            validation: (value) => {
                return value && !isNaN(value) && value > 0
            },
            errorMessage: "To musi być liczba większa od zera",
            successMessage: "Prawidłowa wartość",
            preMessage: "Wprowadź wartość liczbową"
        },
        {
            type: "input",
            label: "Waga z opakowaniem [g]",
            name: "weight",
            value: "0",
            required: true,
            validation: (value) => {
                return value && !isNaN(value) && value > 0
            },
            errorMessage: "To musi być liczba większa od zera",
            successMessage: "Prawidłowa wartość",
            preMessage: "Wprowadź wartość liczbową"
        },
        {
            name: "sellStartDate",
            type: "datepicker",
            label: "Data wprowadzenia do sprzedaży",
            placeholder: "dzisiaj",
            helpMessage: "Nie wybieraj daty jeżeli produkt ma być dostępny od dzisiaj",
            required: false,
            labelPosition: "top"
        },
        {
            align: "end",
            cols: [
                {
                    type: "button",
                    text: "Anuluj",
                    submit: false,
                    size: "medium",
                    view: "flat",
                    color: "secondary",
                    name: "cancel",
                    padding: "0px 20px",
                },
                {
                    type: "button",
                    text: "Zapisz",
                    submit: true,
                    size: "medium",
                    view: "flat",
                    color: "primary",
                    name: "send"
                }
            ]
        },
    ]
}

const toolbar = toolbarInit({ returnPath: '/products', css: "dhx_widget--bordered", title: "Dodawanie nowego produktu" })

const loadForm = async () => {
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
            return data.map(item => {return { value: item.id, content: item.name }})
        })
    form_config.rows.unshift(
        {
            name: "category",
            type: "select",
            label: "Kategoria",
            labelPosition: "top",
            required: true,
            errorMessage: "Musisz wybrać kategorię",
            options: categories
        }
    )
    const form = new dhx.Form("form", form_config)
    formInit(form, { url: "http://localhost:4000/products", method: "POST", returnPath: "/products" })
}
loadForm()