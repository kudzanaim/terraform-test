const express = require('express')
const cors = require('cors') 
const promisify = require('util').promisify 
const exec = promisify(require('child_process').exec)
const db = require('./admin')
const bodyParser = require('body-parser')
const template = require('./template')
const app = express()
app.use(cors())
app.use(bodyParser.json())

// Create Cloud Run Instance
app.post('/cloud-run/cr', async(request, response) => {
    const {code, id, _PROJECT_ID_, _RESOURCENAME_, _DOCKERIMAGE_} = request.body
    const instance_id = db.database().ref(`/instances`).push().key
    const instance = {
        id: instance_id, created: false, 
        deleted:false, image: _DOCKERIMAGE_, projectid: _PROJECT_ID_, 
        name:_RESOURCENAME_, timestamp:null, createdAt:null, code
    }
    
    // Write to User & DB
    db.database().ref(`/users/${id}/cloudRun`).update({[instance_id]: instance})
    db.database().ref(`/instances/${instance_id}`).update(instance)

    // Create Terraform Template
    const fs = require('fs')
    const terra_txt = template.main
    const terra_backend_txt = template.backend
    const _PREFIX_ = "/" + id

    // Replace Backend.tf Bucket name
    const backendTFfile = terra_backend_txt
        .replace('_BUCKET_NAME_', "terraform-kudz")
        .replace('_PREFIX_', _PREFIX_)

    // Update Main.tf Variables
    terra_txt.replace('_PROJECT_ID_',_PROJECT_ID_)
        .replace('_RESOURCENAME_', _RESOURCENAME_)
        .replace('_DOCKERIMAGE_',_DOCKERIMAGE_)
        .replace('_USERID_', id)
        .replace('_INSTANCEID_', instance_id)
        .replace('_RESOURCEURL_','${google_cloud_run_service.default.status[0].url}')

    const terraformTFfile = terra_txt
        .replace('_RESOURCEURL_','${google_cloud_run_service.default.status[0].url}')

    fs.writeFile('backend.tf', backendTFfile, err => console.log('backend.tf created'))
    fs.writeFile('terraform.tf', terraformTFfile, err => console.log('terraform.tf created'))

    // Call Terraform Script
    const {stdout, stderr} = await exec('terraform apply -auto-approve')
    
    return response.send({
        success: true, 
        instance_id, 
        id, 
        stderr, 
        stdout
    })
})

// Delete Cloud Run
app.get('/cloud-run/dlt/:userid/:instance_id', async(request, response) => {
    const {instance_id, userid} = request.params
    // End Instance in user Record
    db.database().ref(`/users/${userid}/cloudRun/${instance_id}`).update({deleted: true, deletedAt: Date.now()});
    // Delete Instance Record
    db.database().ref(`/instances/${instance_id}`).remove()
    // Get Updated User Instance Record
    const instance = await db.database()
        .ref(`/users/${userid}/cloudRun/${instance_id}`)
        .once('value', x=>x.val())
    // Call Terraform Script
    const {stdout, stderr} = await exec('terraform destroy -auto-approve')
    return response.send({success: true, instance})
})

// Fetch instance
app.get('/rsc/:id/:instance_id', async(request, response) => {
    const {instance_id, id} = request.params
    const {q} = request.query
    // Write to User & InstanceDB
    const doneUpdate = {created: true, createdAt:Date.now(), instanceURL:q }
    db.database().ref(`/users/${id}/cloudRun/${instance_id}`).update(doneUpdate)
    db.database().ref(`/instances/${instance_id}`).update(doneUpdate)
    return response.send({
        instance_id, 
        success: instance_id ? true : false
    })
})

app.listen(5556, () => console.log('Server Running...'))