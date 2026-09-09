resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "garmar-aws-cloud-resume-site-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"


}

resource "aws_cloudfront_distribution" "site" {

  origin {

    origin_id                = "garmar-aws-cloud-resume-site"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id

  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "garmar-aws-cloud-resume-site"
    viewer_protocol_policy = "redirect-to-https"

    compress = true

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  price_class = "PriceClass_100"

  tags = {
    Name        = "aws-cloud-resume-cloudfront"
    Project     = "AWS Cloud Resume Challenge"
    ManagedBy   = "Terraform"
    Environment = "prod"
  }

}