import { formInit } from '/components/form.js'

const config = {
    width: "400px",
    css: "dhx_widget--bg_white dhx_layout-cell--bordered",
    padding: 40,
    rows: [
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
            required: true
        },
        {
            align: "end",
            cols: [
                {
                    type: "button",
                    text: "Zaloguj",
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

const form = new dhx.Form("form", config)

formInit(form, { url: "http://localhost:4000/auth", method: "POST", returnPath: '/' })