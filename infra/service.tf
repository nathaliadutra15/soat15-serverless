resource "kubernetes_service" "auth-app" {
  metadata {
    name      = "svc-15soat-auth-service"
    namespace = var.namespace
  }

  spec {
    selector = { app = "15soat-auth-service" }

    port {
      port        = 3001
      target_port = 3001
      node_port   = 30001
    }

    type = "NodePort"
  }
}
