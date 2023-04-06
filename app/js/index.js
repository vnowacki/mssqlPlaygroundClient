fetch('http://localhost:4000/users')
    .then(response => response.json())
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
    .catch(err => console.log(err))