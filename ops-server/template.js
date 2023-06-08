module.exports = {
    main: `
        # Configure GCP project
        provider "google" {
            credentials = file("service-account.json")
            project = "_PROJECT_ID_"
        }

        resource "google_cloud_run_service" "default" {
            name     = "_RESOURCENAME_"
            location = "us-east4" 

            template {
                spec {
                    containers {
                        image = "_DOCKERIMAGE_"
                    }
                }
            }

            traffic {
                percent         = 100
                latest_revision = true
            }


            provisioner "local-exec" {
                command = "cURL http://localhost:5556/rsc/_USERID_/_INSTANCEID_?q=_RESOURCEURL_"
                on_failure = continue
            }

        }

        data "google_iam_policy" "noauth" {
            binding {
                role = "roles/run.invoker"
                members = [
                    "allUsers",
                ]
            }
        }

        resource "google_cloud_run_service_iam_policy" "noauth" {
            location    = google_cloud_run_service.default.location
            project     = google_cloud_run_service.default.project
            service     = google_cloud_run_service.default.name

            policy_data = data.google_iam_policy.noauth.policy_data
        }


        # Return service URL
        output "url" {
            value = "_RESOURCEURL_"
        }
    `,
    backend: `
        terraform {
            backend "gcs" {
                bucket  = "_BUCKET_NAME_" 
                prefix  = "_PREFIX_"
                credentials = "service-account.json"
            }
        }
    `
}