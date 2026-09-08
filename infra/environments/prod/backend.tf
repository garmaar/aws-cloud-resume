terraform {
  backend "s3" {
    bucket       = "garmar-aws-cloud-resume-tfstate"
    key          = "prod/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }



}