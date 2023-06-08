
        terraform {
            backend "gcs" {
                bucket  = "terraform-kudz" 
                prefix  = "/user123"
                credentials = "service-account.json"
            }
        }
    