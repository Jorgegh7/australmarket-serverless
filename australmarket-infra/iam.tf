# Execution role base para Lambda — permisos minimos definidos junto con
# la especificacion de cada Lambda (no despues de su codigo, ver
# seguridad-australmarket.md). Este rol se refina por funcion a medida
# que se crea cada Lambda real (HU-B3, HU-B4, etc.)

# Trust policy: le dice a AWS "el servicio Lambda puede asumir este rol"
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_execution" {
  name               = "australmarket-lambda-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = {
    Name = "australmarket-lambda-role"
  }
}

# Permiso base: escribir logs en CloudWatch (todas las Lambdas lo necesitan,
# sin importar su logica de negocio especifica)
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# NOTA: permisos especificos (leer/escribir DynamoDB, leer/escribir S3)
# se agregan como policies adicionales, una vez que exista cada Lambda
# real y se sepa exactamente que necesita (ver seguridad-australmarket.md)
