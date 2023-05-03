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
            label: "Imię",
            name: "name",
            value: "",
            required: true
        },
        {
            type: "input",
            label: "Nazwisko",
            name: "surname",
            value: "",
            required: true
        },
        {
            type: "input",
            label: "Nazwa użytkownika",
            name: "username",
            value: "",
            required: true
        },
        {
            type: "input",
            inputType: "password",
            label: "Hasło",
            name: "password",
            value: "",
            required: true,
            validation: (value) => {
                return value && value.length >= 8
            },
            errorMessage: "Za krótkie",
            successMessage: "Poprawne",
            preMessage: "Co najmniej 8 znaków"
        },
        {
            type: "input",
            inputType: "password",
            label: "Powtórz hasło",
            name: "passwordR",
            value: "",
            required: true,
            validation: (value) => {
                return value && value === form.getItem("password").getValue()
            },
            errorMessage: "Hasła nie są takie same",
            successMessage: "Poprawne",
        },
        {
            type: "simpleVault",
            name: "picture",
            label: "Zdjęcie profilowe",
            labelPosition: "top",
            disabled: false,
            required: false,
            errorMessage: "Błąd"
        },
        {
            name: "permLevel",
            type: "checkbox",
            text: "Administrator",
            label: "Uprawnienia",
            labelWidth: 140,
            labelPosition: "top",
            helpMessage: "Uprawnienia administratora pozwalają na zarządzanie kontami użytkowników.",
            value: "admin"
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

const toolbar = toolbarInit({ returnPath: '/users', css: "dhx_widget--bordered", title: "Dodawanie nowego użytkownika" })

const form = new dhx.Form("form", form_config)
formInit(form, { url: "http://localhost:4000/users", method: "POST", returnPath: "/users" })