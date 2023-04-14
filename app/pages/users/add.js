const token = window.sessionStorage.getItem('token') ?? ''
import { refresh } from '/js/refresh.js'

const config = {
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

const form = new dhx.Form("form", config);

form.events.on("click", function (id) {
    if(id == 'send' && form.validate()) {
        fetch('http://localhost:4000/users', {
            method: 'post',
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(form.getValue())
        })
        .then(response => response.json())
        .then(data => {
            if(data.response == 'error') {
                dhx.alert({
                    header: "Błąd",
                    text: "Nie udało się zapisać danych",
                    buttonsAlignment: "center",
                    buttons: ["ok"],
                });
            } else if(data.response == 'userExists') {
                dhx.alert({
                    header: "Błąd",
                    text: "Istnieje już użytkownik o podanej nazwie",
                    buttonsAlignment: "center",
                    buttons: ["ok"],
                });
            } else if(data.response == 'userAdded') {
                window.location.href = '/users'
            }
        })
        .catch(err => {
            console.log(err)
            refresh()
        })
    }
    if(id == 'cancel') window.location.href = '/users'
})