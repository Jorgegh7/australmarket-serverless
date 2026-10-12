# ============================================================
# Bloques "moved" — registran la migracion de recursos sueltos
# hacia el modulo lambda-api, sin destruir/recrear la funcion
# Lambda en si (solo ruta y permiso se recrean, son livianos).
# Una vez confirmada la migracion completa de todas las Lambdas,
# este archivo puede eliminarse con seguridad.
# ============================================================

# --- listar-artesanos (migrado) ---
moved {
  from = aws_apigatewayv2_integration.listar_artesanos
  to   = module.listar_artesanos.aws_apigatewayv2_integration.this
}

moved {
  from = aws_lambda_function.listar_artesanos
  to   = module.listar_artesanos.aws_lambda_function.this
}

# --- gestionar-artesano (migrado manualmente via state rm, no uso moved) ---
# El recurso original se perdio antes de escribir el bloque moved.
# Se recreo completo dentro del modulo; no requiere bloque aqui.

# --- listar-productos (migrado) ---
moved {
  from = aws_lambda_function.listar_productos
  to   = module.listar_productos.aws_lambda_function.this
}

moved {
  from = aws_apigatewayv2_integration.listar_productos
  to   = module.listar_productos.aws_apigatewayv2_integration.this
}

# --- gestionar-producto (migrado) ---
moved {
  from = aws_lambda_function.gestionar_producto
  to   = module.gestionar_producto.aws_lambda_function.this
}

moved {
  from = aws_apigatewayv2_integration.gestionar_producto
  to   = module.gestionar_producto.aws_apigatewayv2_integration.this
}

# --- hola-mundo (migrado) ---
moved {
  from = aws_lambda_function.hola_mundo
  to   = module.hola_mundo.aws_lambda_function.this
}

moved {
  from = aws_apigatewayv2_integration.hola_mundo
  to   = module.hola_mundo.aws_apigatewayv2_integration.this
}

# --- catalogo-artesanos (migrado) ---
moved {
  from = aws_lambda_function.catalogo_artesanos
  to   = module.catalogo_artesanos.aws_lambda_function.this
}

moved {
  from = aws_apigatewayv2_integration.catalogo_artesanos
  to   = module.catalogo_artesanos.aws_apigatewayv2_integration.this
}

# --- catalogo-productos (migrado) ---
moved {
  from = aws_lambda_function.catalogo_productos
  to   = module.catalogo_productos.aws_lambda_function.this
}

moved {
  from = aws_apigatewayv2_integration.catalogo_productos
  to   = module.catalogo_productos.aws_apigatewayv2_integration.this
}
