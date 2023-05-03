const token = window.sessionStorage.getItem('token') ?? ''
import { refresh } from '/js/refresh.js'

const formInit = async (object, options) => {
    object.events.on("click", id => {
        if(id == 'send' && object.validate()) {
            let data = object.getValue()
            const picture = data.picture
            if(picture) delete data.picture
            fetch(options.url, {
                method: options.method,
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if(data.status == 'error') {
                    dhx.alert({
                        header: "Błąd",
                        text: "Nie udało się zapisać danych.",
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    })
                } else if(data.status == 'userExists') {
                    dhx.alert({
                        header: "Błąd: nazwa jest zajęta!",
                        text: "Istnieje już użytkownik o podanej nazwie.",
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    })
                } else if(data.status == 'accessDenied') {
                    dhx.alert({
                        header: "Błąd: brak uprawnień!",
                        text: "Posiadane uprawnienia nie są wystarczające do wykonania tej operacji.",
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    })
                } else if(data.status == 'userAdded') {
                    if(picture.length) {
                        let formData = new FormData()
                        formData.append('picture', picture[0].file)
                        fetch(`http://localhost:4000/users/${data.uuid}/picture`, {
                            method: 'put',
                            headers: {
                                "Authorization": `Bearer ${token}`
                            },
                            body: formData
                        })
                        .then(response => {
                            if(response.ok) window.location.href = options.returnPath
                            else {
                                dhx.alert({
                                    header: "Błąd: nie zapisano zdjęcia!",
                                    text: "Zdjęcie profilowe nie zostało zapisane.",
                                    buttonsAlignment: "center",
                                    buttons: ["ok"],
                                }).then(() => {
                                    window.location.href = options.returnPath
                                })
                            }
                        })
                        .catch(err => console.log(err))
                    }
                    else window.location.href = '/users'
                } else if(data.status == 'noCategoryFound') {
                    dhx.alert({
                        header: "Błąd: nieprawidłowa kategoria!",
                        text: "Nie można odnaleźć kategorii o podanej nazwie.",
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    })
                } else if(data.status == 'productExists') {
                    dhx.alert({
                        header: "Błąd: produkt istnieje!",
                        text: "W wybranej kategorii istnieje już produkt o podanej nazwie.",
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    })
                } else if(data.status == 'productAdded') {
                    window.location.href = options.returnPath
                } else if(data.status == 'loginIncorrect') {
                    dhx.alert({
                        header: "Błąd",
                        text: "Nieprawidłowy login lub hasło",
                        buttonsAlignment: "center",
                        buttons: ["ok"],
                    });
                } else if(data.status == 'loginSuccessfull') {
                    window.sessionStorage.setItem('token', data.accessToken)
                    window.sessionStorage.setItem('refreshToken', data.refreshToken)
                    window.location.href = options.returnPath
                }
            })
            .catch(err => {
                if(err == 'Error: 401' || err == 'Error: 403' || String(err).includes('Forbidden')) refresh()
            })
        }
        if(id == 'cancel') window.location.href = options.returnPath
    })
    if(object.getItem("picture"))
        object.getItem("picture").data.events.on("BeforeAdd", (file) => {
            if(object.getItem("picture").data.getLength() == 0 && (file.file.type == "image/jpeg" || file.file.type == "image/png")) return true
            if(object.getItem("picture").data.getLength() > 0) {
                dhx.alert({
                    header: "Błąd: nie można dodać pliku!",
                    text: "Można wybrać tylko jedno zdjęcie.",
                    buttonsAlignment: "center",
                    buttons: ["ok"],
                })
                return false
            } else {
                dhx.alert({
                    header: "Błąd: nieobsługiwany format!",
                    text: "Zdjęcie profilowe może być tylko plikiem graficznym w formacie jpg lub png.",
                    buttonsAlignment: "center",
                    buttons: ["ok"],
                })
                return false
            }
            
        })
}

export { formInit }