
        # Configure GCP project
        provider "google" {
            credentials = file("service-account.json")
            project = "freelance-275013"
        }

        resource "google_cloud_run_service" "default" {
            name     = "terratest005"
            location = "us-east4" 

            template {
                spec {
                    containers {
                        image = "us.gcr.io/freelance-275013/rideapp/rides@sha256:484e60e057365b0335d2b37ba4097b93b1c5777c0e937580b229d21a53beecc2"
                    }
                }
            }

            traffic {
                percent         = 100
                latest_revision = true
            }


            provisioner "local-exec" {
                command = "cURL http://localhost:5556/rsc/user123/-MaXZq-gfbO2Aokp2Z3H?q=${google_cloud_run_service.default.status[0].url}"
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
            value = "${google_cloud_run_service.default.status[0].url}"
        }
    