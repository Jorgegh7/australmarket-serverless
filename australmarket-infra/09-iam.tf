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

  tags = merge(var.common_tags, {
    Name = "australmarket-lambda-role"
  })
}

# Permiso base: escribir logs en CloudWatch (todas las Lambdas lo necesitan,
# sin importar su logica de negocio especifica)
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ============================================================
# Roles especificos para el CRUD de Artesanos (HU-B3)
# Reemplazan el uso del rol compartido para estas 2 Lambdas —
# cada uno mapea 1 a 1 con un rol de PostgreSQL acotado
# ============================================================

# [artesanos-reader]: Rol de IAM
resource "aws_iam_role" "lambda_artesanos_reader" {
  name               = "lambda-artesanos-reader-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = merge(var.common_tags, {
    Name = "lambda-artesanos-reader"
  })
}

# [artesanos-reader]: Permiso base de logs
resource "aws_iam_role_policy_attachment" "artesanos_reader_logs" {
  role       = aws_iam_role.lambda_artesanos_reader.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# [artesanos-reader]: Permiso de conexion a DSQL (no-admin)
resource "aws_iam_role_policy" "artesanos_reader_dsql" {
  name = "dsql-connect"
  role = aws_iam_role.lambda_artesanos_reader.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dsql:DbConnect"]
      Resource = aws_dsql_cluster.australmarket.arn
    }]
  })
}

# [artesanos-writer]: Rol de IAM
resource "aws_iam_role" "lambda_artesanos_writer" {
  name               = "lambda-artesanos-writer-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = merge(var.common_tags, {
    Name = "lambda-artesanos-writer"
  })
}

# [artesanos-writer]: Permiso base de logs
resource "aws_iam_role_policy_attachment" "artesanos_writer_logs" {
  role       = aws_iam_role.lambda_artesanos_writer.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# [artesanos-writer]: Permiso de conexion a DSQL (no-admin)
resource "aws_iam_role_policy" "artesanos_writer_dsql" {
  name = "dsql-connect"
  role = aws_iam_role.lambda_artesanos_writer.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dsql:DbConnect"]
      Resource = aws_dsql_cluster.australmarket.arn
    }]
  })
}

# ============================================================
# Roles especificos para el CRUD de Productos (HU-B4)
# ============================================================

# [productos-reader]: Rol de IAM
resource "aws_iam_role" "lambda_productos_reader" {
  name               = "lambda-productos-reader-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = merge(var.common_tags, {
    Name = "lambda-productos-reader"
  })
}

# [productos-reader]: Permiso base de logs
resource "aws_iam_role_policy_attachment" "productos_reader_logs" {
  role       = aws_iam_role.lambda_productos_reader.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# [productos-reader]: Permiso de conexion a DSQL (no-admin)
resource "aws_iam_role_policy" "productos_reader_dsql" {
  name = "dsql-connect"
  role = aws_iam_role.lambda_productos_reader.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dsql:DbConnect"]
      Resource = aws_dsql_cluster.australmarket.arn
    }]
  })
}

# [productos-writer]: Rol de IAM
resource "aws_iam_role" "lambda_productos_writer" {
  name               = "lambda-productos-writer-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = merge(var.common_tags, {
    Name = "lambda-productos-writer"
  })
}

# [productos-writer]: Permiso base de logs
resource "aws_iam_role_policy_attachment" "productos_writer_logs" {
  role       = aws_iam_role.lambda_productos_writer.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# [productos-writer]: Permiso de conexion a DSQL (no-admin)
resource "aws_iam_role_policy" "productos_writer_dsql" {
  name = "dsql-connect"
  role = aws_iam_role.lambda_productos_writer.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dsql:DbConnect"]
      Resource = aws_dsql_cluster.australmarket.arn
    }]
  })
}
