output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.site.domain_name


}

output "api_endpoint" {
  value = aws_apigatewayv2_api.visitor_counter.api_endpoint
}
