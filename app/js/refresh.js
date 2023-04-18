const refresh = () => {
    const refreshToken = window.sessionStorage.getItem('refreshToken')
    fetch('http://localhost:4000/auth/token', {
            method: 'post',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({ token: refreshToken })
        })
        .then(response => {
            if(!response.ok) throw new Error(response.status)
            return response.json()
        })
        .then(data => {
            window.sessionStorage.setItem('token', data.accessToken)
            location.reload()
        })
        .catch(() => {
            window.location.href = '/login'
        })
}

export { refresh }