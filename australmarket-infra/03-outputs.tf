output "dsql_cluster_endpoint" {
  description = "Endpoint del cluster Aurora DSQL, usado para conectarse via psql"
  value       = aws_dsql_cluster.australmarket.identifier
}

output "api_gateway_url" {
  description = "URL base de la API Gateway"
  value       = aws_apigatewayv2_stage.default.invoke_url
}
