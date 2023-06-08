# Description
This App is a client-side app that allows users to provision a new Cloud Run service given an image ID, and upon submit,
a TERRAFORM file is dynamically created and sets up all hosting for the given image & returns a public URL. 
The cloud run service will be a serveless container and can be created or deleted through the UI.

#Technology Used
- Google Cloud Run
- Terraform
- Node.js & Express.js
- Firebase
- Docker
- HTML & CSS

Execution is as follows:
1. Image ID & GCP Project ID is submited through a fomr in Client Side 
2. Backend receives data and A terraform file is dynamically created & executed dynamically
3. Terraform will find the docker image, build it, and host it on Google Cloud Run
4. A public HTTPS url is return allowing that image to accessible on web 

How to run: 
- Run `git clone https://github.com/kudzanaim/terraform-test.git`
- CD into done-server and run `npm i` and then `node index.js`
- CD into ops-server and run `npm i` and then `node index.js`
- Go to the client/public and launch the index.html and app will start running
- You will be able to create & delete new image files
  - but you will need to have an existing `GCP Project & its ID` and an image in `cloud build or from docker-hub `