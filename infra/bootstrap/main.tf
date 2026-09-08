resource "aws_s3_bucket" "state" {
  bucket = "garmar-aws-cloud-resume-tfstate"

  tags = {
    Name      = "terraform-state"
    Project   = "aws-cloud-resume"
    ManagedBy = "Terraform"


  }


}

resource "aws_s3_bucket_versioning" "state" {

  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"

  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {

  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"

    }
  }


}

resource "aws_s3_bucket_public_access_block" "state" {

  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true

}





