# Clúster de Aurora DSQL — ver ADR 007 (revertido desde DynamoDB tras
# soporte de FOREIGN KEY, anunciado por AWS el 27 de agosto de 2026)
resource "aws_dsql_cluster" "australmarket" {
  deletion_protection_enabled = false # true en produccion real, evita borrado accidental

  tags = {
    Name = "australmarket-dsql"
  }
}
