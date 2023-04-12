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
                alert('nieprawidłowy login lub hasło')
            } else {
                window.localStorage.setItem('token', data.accessToken)
                window.localStorage.setItem('refreshToken', data.refreshToken)
            }
        })
        .catch(err => console.log(err))
    }
})