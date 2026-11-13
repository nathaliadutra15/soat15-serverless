resource "kubernetes_deployment" "auth-server" {
  metadata {
    name      = "15soat-auth-service"
    namespace = var.namespace
    labels    = { app = "15soat-auth-service" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "15soat-auth-service" }
    }

    template {
      metadata {
        name   = "15soat-auth-service"
        labels = { app = "15soat-auth-service" }
      }

      spec {
        automount_service_account_token = false

        image_pull_secrets {
          name = "ghcr-secrets"
        }

        container {
          name  = "c-15soat-tech-challenge-auth"
          image = var.image

          resources {
            requests = {
              cpu               = "100m"
              memory            = "256Mi"
              ephemeral-storage = "2Gi"
            }
            limits = {
              cpu    = "200m"
              memory = "512Mi"
            }
          }

          port {
            container_port = 3001
          }

          env {
            name = "DB_NAME"
            value = var.postgres_db
          }

          env {
            name = "DB_USER"
            value = var.postgres_user
          }

          env {
            name = "DB_PASSWORD"
            value = var.postgres_password
          }

          env {
            name = "DB_HOST"
            value = var.db_host
          }

          env {
            name = "DB_PORT"
            value = var.db_port
          }
          
          env {
            name  = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "JWT_SECRET"
              }
            }
          }
          
          env {
            name  = "CLIENT_ID"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "CLIENT_ID"
              }
            }
          }
          
          env {
            name  = "CLIENT_SECRET"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "CLIENT_SECRET"
              }
            }
          }
        }
      }
    }
  }
}
