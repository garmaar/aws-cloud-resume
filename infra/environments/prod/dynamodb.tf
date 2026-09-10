resource "aws_dynamodb_table" "visitors" {

  name         = "aws-cloud-resume-visitors"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "aws-cloud-resume-visitors"
    Project     = "AWS Cloud Resume Challenge"
    ManagedBy   = "Terraform"
    Environment = "prod"
  }


}