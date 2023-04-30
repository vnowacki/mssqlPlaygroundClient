const getBlobData = (file) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            resolve(reader.result ?? null)
        }
        reader.onerror = reject
    })
}

export { getBlobData }