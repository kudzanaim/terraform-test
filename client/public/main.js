// Create Resource
const createResource = async () => {   
    // Create Resource
    const request = await axios.post("http://localhost:5556/cloud-run/cr", {
        id: "user123", 
        code: 'undefined',
        _PROJECT_ID_: document.querySelector(".projectid").value,
        _RESOURCENAME_: document.querySelector(".resourcename").value,
        _DOCKERIMAGE_: document.querySelector(".imageurl").value
    }).then(x => x.data)

    // If Resource created log instance
    if(request.instance_id && request.id === data.id) await firebase.database()
        .ref(`instance/${request.instance_id}`)
        .once('value').then(x=>x.val())
}

// Delete Resource
const destroyResource = async (instance_id) => {
    const confirmDeletion = confirm("Confirm Instance destroy Request");
    if(confirmDeletion){
        const userid = "user123"; 
        const request = await axios.get(`http://localhost:5556/cloud-run/dlt/${userid}/${instance_id}`).then(x=>x.data);
        
        if(request.success){
            const active_instances = await firebase.database().ref(`users/cloudRun`).once("value").then(x=>x.val());
            if(active_instances) renderInstances(Object.values(active_instances));
        }
    }
}

// Render Instances
const renderInstances = (instance_array=[]) => {
    instance_array.map(instance=>document.querySelector(".instances").innerHTML+=`
        <div class="instance">
            <div class="instance-inn">
                <div class="instance-content">
                <div class="instance-content-inn">
                    <div class="instance-type">Cloud Run</div>
                    <div class="instancemeta">
                    <div class="instancemetainn">
                        <label class="instance-lbl">Instance name</label>
                        <div class="instance-name">${instance.name}</div>
                        <label class="instance-lbl">Id</label>
                        <div class="instance-id">${instance.id}</div>
                        <label class="instance-lbl">Public URL</label>
                        <div class="instance-url">${instance.instanceURL}</div>
                    </div>
                    </div>
                </div>
                </div>
                <div class="instance-btns">
                <div class="instance-btns-hold">
                    <button class="instance-btn" onclick="destroyResource('${instance.id}')">Destroy Instance</button>
                </div>
                </div>
            </div>
        </div>
    `)
}

// SignIn and render active Instances
const userSignIn = async () => {
    const user = {id: 'user123'}
    const instances = await firebase.database()
        .ref(`users/${user.id}/cloudRun`)
        .once("value").then(x => x.val())
    if (instances) renderInstances(Object.values(instances))
}