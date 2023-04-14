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
};

const form = new dhx.Form("form", config);

form.events.on("click", function (id) {
    if(id == 'send' && form.validate()) {
        fetch('http://localhost:4000/auth', {
            method: 'post',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(form.getValue())
        })
        .then(response => response.json())
        .then(data => {
            if(data.response == 'error') {
                dhx.alert({
                    header: "Błąd",
                    text: "Nieprawidłowy login lub hasło",
                    buttonsAlignment: "center",
                    buttons: ["ok"],
                });
            } else {
                window.sessionStorage.setItem('token', data.accessToken)
                window.sessionStorage.setItem('refreshToken', data.refreshToken)
                window.location.href = '/'
            }
        })
        .catch(err => {
            dhx.alert({
                header: "Błąd",
                text: `Kod błędu: ${err}`,
                buttonsAlignment: "center",
                buttons: ["ok"],
            });
        })
    }
})