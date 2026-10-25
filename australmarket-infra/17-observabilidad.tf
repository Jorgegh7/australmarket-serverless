# ============================================================
# Observabilidad nivel 1: retencion de logs de las Lambdas.
# AWS crea estos grupos por su cuenta al primer uso, con retencion
# infinita. Aqui se importan a Terraform y se limita a 30 dias para
# no acumular almacenamiento (y costo) indefinidamente.
# ============================================================

locals {
  lambdas_con_logs = [
    "australmarket-catalogo-artesanos",
    "australmarket-catalogo-producto-detalle",
    "australmarket-catalogo-productos",
    "australmarket-generar-url-subida",
    "australmarket-gestionar-artesano",
    "australmarket-gestionar-producto",
    "australmarket-hola-mundo",
    "australmarket-listar-artesanos",
    "australmarket-listar-productos",
  ]
}

resource "aws_cloudwatch_log_group" "lambdas" {
  count = length(local.lambdas_con_logs)

  name              = "/aws/lambda/${local.lambdas_con_logs[count.index]}"
  retention_in_days = 30

  tags = merge(var.common_tags, {
    Name = local.lambdas_con_logs[count.index]
  })
}

# Los grupos ya existen en AWS: se importan al estado de Terraform.
# Tras el primer apply estos bloques pueden quedarse o borrarse.
import {
  to = aws_cloudwatch_log_group.lambdas[0]
  id = "/aws/lambda/australmarket-catalogo-artesanos"
}

import {
  to = aws_cloudwatch_log_group.lambdas[1]
  id = "/aws/lambda/australmarket-catalogo-producto-detalle"
}

import {
  to = aws_cloudwatch_log_group.lambdas[2]
  id = "/aws/lambda/australmarket-catalogo-productos"
}

import {
  to = aws_cloudwatch_log_group.lambdas[3]
  id = "/aws/lambda/australmarket-generar-url-subida"
}

import {
  to = aws_cloudwatch_log_group.lambdas[4]
  id = "/aws/lambda/australmarket-gestionar-artesano"
}

import {
  to = aws_cloudwatch_log_group.lambdas[5]
  id = "/aws/lambda/australmarket-gestionar-producto"
}

import {
  to = aws_cloudwatch_log_group.lambdas[6]
  id = "/aws/lambda/australmarket-hola-mundo"
}

import {
  to = aws_cloudwatch_log_group.lambdas[7]
  id = "/aws/lambda/australmarket-listar-artesanos"
}

import {
  to = aws_cloudwatch_log_group.lambdas[8]
  id = "/aws/lambda/australmarket-listar-productos"
}
