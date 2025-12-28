terraform {
  required_version = ">= 1.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

# Namespace
resource "kubernetes_namespace" "markethub" {
  metadata {
    name = "markethub"
    labels = {
      name = "markethub"
      env  = var.environment
    }
  }
}

# PostgreSQL
resource "helm_release" "postgresql" {
  name       = "postgresql"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  namespace  = kubernetes_namespace.markethub.metadata[0].name
  
  set {
    name  = "auth.username"
    value = "markethub"
  }
  
  set {
    name  = "auth.password"
    value = var.postgres_password
  }
  
  set {
    name  = "auth.database"
    value = "markethub"
  }
}

# Redis
resource "helm_release" "redis" {
  name       = "redis"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"
  namespace  = kubernetes_namespace.markethub.metadata[0].name
  
  set {
    name  = "auth.password"
    value = var.redis_password
  }
}

# MongoDB
resource "helm_release" "mongodb" {
  name       = "mongodb"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "mongodb"
  namespace  = kubernetes_namespace.markethub.metadata[0].name
  
  set {
    name  = "auth.rootPassword"
    value = var.mongodb_password
  }
}

# RabbitMQ
resource "helm_release" "rabbitmq" {
  name       = "rabbitmq"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "rabbitmq"
  namespace  = kubernetes_namespace.markethub.metadata[0].name
  
  set {
    name  = "auth.username"
    value = "markethub"
  }
  
  set {
    name  = "auth.password"
    value = var.rabbitmq_password
  }
}

variable "environment" {
  default = "production"
}

variable "postgres_password" {
  sensitive = true
}

variable "redis_password" {
  sensitive = true
}

variable "mongodb_password" {
  sensitive = true
}

variable "rabbitmq_password" {
  sensitive = true
}

output "namespace" {
  value = kubernetes_namespace.markethub.metadata[0].name
}
