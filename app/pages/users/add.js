const token = window.sessionStorage.getItem('token') ?? ''
import { toolbarInit } from '/components/toolbar.js'
import { formInit } from '/components/form.js'

const toolbar_config = [
    {
        id: "users",
        icon: "dxi dxi-arrow-left",
        value: ""
    },
    {
        type: "separator"
    },
    {
        type: "title",
        value: "Dodawanie nowego użytkownika"
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
            validation: function(value) {
                return value && value.length >= 8;
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
            validation: function(value) {
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
};

const toolbar = new dhx.Toolbar("toolbar", {
    css:"dhx_widget--bordered", data: toolbar_config
})
const form = new dhx.Form("form", form_config)

toolbarInit(toolbar)
formInit(form)