# === CONFIGURATION DE BASE ===
variable "aws_region" {
  description = "Région AWS"
  type        = string
  default     = "eu-west-3" # Paris
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "quiz-multijoueur"
}

variable "ami_id" {
  description = "ID de l'AMI Ubuntu 22.04"
  type        = string
  default     = "ami-05b5a865c3579bbc4" # Ubuntu 22.04 LTS eu-west-3
}


# === RÉSEAU ===
variable "vpc_cidr" {
  description = "CIDR du VPC principal"
  type        = string
  default     = "10.0.0.0/16" # 65,536 IPs disponibles
}

variable "public_subnet_cidr" {
  description = "CIDR du subnet public (web)"
  type        = string
  default     = "10.0.1.0/24" # 256 IPs disponibles
}

variable "private_subnet_cidr" {
  description = "CIDR du subnet privé (api)"
  type        = string
  default     = "10.0.2.0/24" # 256 IPs disponibles
}

# === INSTANCES ===
variable "instance_type" {
  description = "Type d'instance EC2"
  type        = string
  default     = "t2.micro" # Tier gratuit AWS
}

variable "key_pair_name" {
  description = "Nom de la paire de clés SSH"
  type        = string
  default     = "quiz-app-key"
}
