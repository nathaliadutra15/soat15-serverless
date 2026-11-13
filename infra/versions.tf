terraform {
  backend "local" {
    path = "/opt/terraform/serverless/terraform.tfstate"
  }
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.6"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
  }
}

provider "kind" {}

provider "kubernetes" {
  host                   = var.kind_endpoint
  client_certificate     = var.kind_client_certificate
  client_key             = var.kind_client_key
  cluster_ca_certificate = var.kind_cluster_ca_certificate
}
