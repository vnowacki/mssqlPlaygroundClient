const token = window.sessionStorage.getItem('token') ?? ''
import { refresh } from '/js/refresh.js'

const listTemplate = ({ name, surname, admin, picture }) => {
    let avatar = (picture) ? `<img class="avatar" src="${picture}" alt="avatar">` : `<span class="mdi mdi-account-circle mdi-avatar"></span>`
    let template = 
        `<div class='list_item'>
            ${avatar}
            <div>
                <div class='item_name'>${name} ${surname}</div>
                <div class='item_auth'>rola: ${admin ? 'Administrator' : 'Użytkownik'}</div>
            </div>
        </div>`
    return template
};

const listInit = (object) => {
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
        object.data.parse(dataset);
    })
    .catch(err => {
        if(err == 'Error: 401' || err == 'Error: 403' || String(err).includes('Forbidden')) refresh()
    })
}

export { listInit, listTemplate }