# ============================================================
# Observabilidad nivel 1: alarmas de errores y aviso por correo.
# - 1 alarma por Lambda (errores) + 1 alarma de errores 5xx de la API
# - Los avisos llegan por SNS al correo indicado en la variable
#   email_alertas (no se guarda en el repositorio).
# ============================================================

variable "email_alertas" {
  description = "Correo que recibe los avisos de las alarmas (se pasa por TF_VAR_email_alertas)"
  type        = string
}

locals {
  # La Lambda de prueba "hola-mundo" no necesita alarma.
  lambdas_con_alarma = [
    for nombre in local.lambdas_con_logs : nombre
    if nombre != "australmarket-hola-mundo"
  ]
}

resource "aws_sns_topic" "alertas" {
  name = "australmarket-alertas"

  tags = merge(var.common_tags, {
    Name = "australmarket-alertas"
  })
}

resource "aws_sns_topic_subscription" "correo" {
  topic_arn = aws_sns_topic.alertas.arn
  protocol  = "email"
  endpoint  = var.email_alertas
}

# Una alarma por Lambda: salta si hay al menos 1 error en 5 minutos.
resource "aws_cloudwatch_metric_alarm" "lambda_errores" {
  count = length(local.lambdas_con_alarma)

  alarm_name          = "${local.lambdas_con_alarma[count.index]}-errores"
  alarm_description   = "Errores en la Lambda ${local.lambdas_con_alarma[count.index]}"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = local.lambdas_con_alarma[count.index]
  }

  alarm_actions = [aws_sns_topic.alertas.arn]
  ok_actions    = [aws_sns_topic.alertas.arn]

  tags = merge(var.common_tags, {
    Name = "${local.lambdas_con_alarma[count.index]}-errores"
  })
}

# Alarma de la API: salta si hay al menos 1 respuesta 5xx en 5 minutos.
resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "australmarket-api-5xx"
  alarm_description   = "Respuestas 5xx de la API de AustralMarket"
  namespace           = "AWS/ApiGateway"
  metric_name         = "5xx"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiId = aws_apigatewayv2_api.australmarket.id
  }

  alarm_actions = [aws_sns_topic.alertas.arn]
  ok_actions    = [aws_sns_topic.alertas.arn]

  tags = merge(var.common_tags, {
    Name = "australmarket-api-5xx"
  })
}
