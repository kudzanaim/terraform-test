const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

app.get('/:id', (request, response) => response.send({
    success: true, 
    id: request.params.id, 
    data: request.query
}))

app.listen(5556, () => console.log('Server Running...'))