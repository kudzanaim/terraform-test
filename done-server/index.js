const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());




app.get('/:id', (request, response)=>{
    const id = request.params.id;
    const q = request.query;
    console.log({id, data: q});

    return response.send({success: true, id, data: q})
})




app.listen(5556, ()=>console.log('Server Running..'))