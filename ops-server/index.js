const express = require('express');
const cors = require('cors'); 
const promisify = require('util').promisify; 
const exec = promisify(require('child_process').exec);
const db = require('./admin')
const bodyParser = require('body-parser');
const template = require('./template')
const app = express();
app.use(cors());
app.use(bodyParser.json());



// Create Cloud Run Instance
app.post('/cloud-run/cr', async(request, response)=>{
    const {code, id, _PROJECT_ID_, _RESOURCENAME_, _DOCKERIMAGE_} = request.body;
    // Create Instant Record
    const instance_id = db.database().ref(`/instances`).push().key;
    const instance = {id: instance_id, created: false, deleted:false, image: _DOCKERIMAGE_, projectid: _PROJECT_ID_, name:_RESOURCENAME_, timestamp:null, createdAt:null, code};
    
    // Write to User & InstanceDB
    db.database().ref(`/users/${id}/cloudRun`).update({[instance_id]: instance});
    db.database().ref(`/instances/${instance_id}`).update(instance);

    // Create Terraform Template
    const fs = require('fs');
    const terra_txt = template.main;
    const terra_backend_txt = template.backend;
    

    const _PREFIX_ = "/" + id;

    // Replace Backend.tf Bucket name variable
    let i = terra_backend_txt.replace('_BUCKET_NAME_', "terraform-kudz");
    let j = i.replace('_PREFIX_', _PREFIX_);

    // Replace Main.tf Variables
    let a = terra_txt.replace('_PROJECT_ID_',_PROJECT_ID_);
    let b = a.replace('_RESOURCENAME_', _RESOURCENAME_);
    let c = b.replace('_DOCKERIMAGE_',_DOCKERIMAGE_);
    let d = c.replace('_USERID_', id);
    let e = d.replace('_INSTANCEID_', instance_id);
    let f = e.replace('_RESOURCEURL_','${google_cloud_run_service.default.status[0].url}');
    let g = f.replace('_RESOURCEURL_','${google_cloud_run_service.default.status[0].url}');

    fs.writeFile('backend.tf', j, err => console.log('backend.tf created'));
    fs.writeFile('terraform.tf', g, err => console.log('terraform.tf created'));

    // Call Terraform Script
    const {stdout, stderr} = await exec('terraform apply -auto-approve');

    console.log({stderr,stdout});
    
    return response.send({success: true, instance_id, id, stderr, stdout})
})


// Delete Cloud Run
app.get('/cloud-run/dlt/:userid/:instance_id', async(request, response)=>{
    const {instance_id, userid} = request.params;
  
    // End Instance in user Record
    db.database().ref(`/users/${userid}/cloudRun/${instance_id}`).update({deleted: true, deletedAt: Date.now()});
    // Delete Instance Record
    db.database().ref(`/instances/${instance_id}`).remove();
    // Get Updated User Instance Record
    const instance = await db.database().ref(`/users/${userid}/cloudRun/${instance_id}`).once('value', x=>x.val());

    // Call Terraform Script
    const {stdout, stderr} = await exec('terraform destroy -auto-approve');

    console.log({stderr,stdout});

    return response.send({success: true, instance})
})


app.get('/rsc/:id/:instance_id', async(request, response)=>{
    const {instance_id, id} = request.params;
    const {q} = request.query;
    
    // Write to User & InstanceDB
    const doneUpdate = {created: true, createdAt:Date.now(), instanceURL:q };
    db.database().ref(`/users/${id}/cloudRun/${instance_id}`).update(doneUpdate);
    db.database().ref(`/instances/${instance_id}`).update(doneUpdate);

    return response.send({instance_id, success: true})

})


app.listen(5556, ()=>console.log('Server Running..'))