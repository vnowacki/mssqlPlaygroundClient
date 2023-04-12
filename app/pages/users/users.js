const token = window.localStorage.getItem('token') ?? ''

fetch('http://localhost:4000/users', 
    {
        method : "GET",
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
        const grid = new dhx.Grid("dataContainer", {
			columns: [
				{ minWidth: 250, id: "name", header: [{ text: "Imię" }] },
				{ minWidth: 250, id: "surname", header: [{ text: "Nazwisko" }] },
                { minWidth: 250, id: "date_created", header: [{ text: "Data utworzenia konta" }], type: "date", format: "%d/%m/%Y" }
			],
			data: dataset,
            autoWidth: true,
            selection: "row",
            adjust: true
		});
    })
    .catch(err => {
        if(err == 'Error: 401' || err == 'Error: 403') window.location.href = '/login'
    })