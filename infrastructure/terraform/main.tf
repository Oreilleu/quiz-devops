# === CONFIGURATION TERRAFORM ===
# Dit à Terraform quelle version utiliser et quels "plugins" (providers) installer
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# === PROVIDER AWS ===
# Configure la connexion à AWS (comme se connecter à votre compte)
# Utilise vos clés AWS (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
provider "aws" {
  region = var.aws_region # eu-west-3 = Paris (défini dans variables.tf)
}

# Permet de pas avoir deux ressource sur le même endroit
data "aws_availability_zones" "available" {
  state = "available"
}

# === RÉSEAU ===

# VPC = Virtual Private Cloud = Votre "réseau privé" dans AWS
# Comme créer votre propre "internet privé" isolé du reste d'AWS
# CIDR 10.0.0.0/16 = 65,536 adresses IP disponibles (de 10.0.0.0 à 10.0.255.255)
# CIDR : Classless Inter-Domain Routing = Méthode pour définir des plages d'adresses IP.
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr # "10.0.0.0/16"
  enable_dns_hostnames = true         # Permet d'avoir des noms comme "server.local"
  enable_dns_support   = true         # Permet la résolution DNS (www.google.com → IP)

  tags = { Name = "${var.project_name}-vpc" }
}

# Internet Gateway = "Porte d'entrée" vers Internet
# Comme le "routeur" de votre box internet à la maison
# OBLIGATOIRE pour que vos serveurs puissent être accessibles depuis Internet
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

# Subnet Public = "Sous-réseau" accessible depuis Internet
# CIDR 10.0.1.0/24 = 256 adresses IP (de 10.0.1.0 à 10.0.1.255)
# Les serveurs ici peuvent être contactés directement depuis Internet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr # "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true # IMPORTANT: Donne automatiquement une IP publique aux instances

  tags = { Name = "${var.project_name}-public-subnet" }
}

# Subnet Privé = "Sous-réseau" NON accessible depuis Internet
# CIDR 10.0.2.0/24 = 256 adresses IP (de 10.0.2.0 à 10.0.2.255)
# Les serveurs ici sont protégés, pas d'accès direct depuis Internet
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr # "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = { Name = "${var.project_name}-private-subnet" }
}

# Route Table Public = "GPS" qui dit où envoyer le trafic depuis le subnet public
# Route 0.0.0.0/0 = "tout le trafic Internet" → envoyer vers Internet Gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.project_name}-public-rt" }
}

# Association = "Connecter" la route table au subnet public
# Dit au subnet public: "utilise cette route table pour savoir où envoyer le trafic"
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}


# Route Table Privée = "GPS" pour le subnet privé
# Route 0.0.0.0/0 = "tout le trafic Internet" → envoyer vers NAT Gateway
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.project_name}-private-rt" }
}

# Association route table privée ↔ subnet privé
resource "aws_route_table_association" "private" {
  subnet_id      = aws_subnet.private.id
  route_table_id = aws_route_table.private.id
}

# === SÉCURITÉ ===

# Security Group = "Pare-feu logiciel" au niveau de l'instance
# Comme le pare-feu Windows/Mac, mais géré par AWS
# Règles: QUI peut accéder à QUOI et sur QUEL PORT
resource "aws_security_group" "web" {
  name_prefix = "${var.project_name}-web-"
  vpc_id      = aws_vpc.main.id
  description = "Securite serveur web"

  # Port 80 = HTTP (sites web non-sécurisés)
  # 0.0.0.0/0 = "tout Internet" peut accéder
  ingress {
    from_port   = 80            # Port de début
    to_port     = 80            # Port de fin (même port = 80 seulement)
    protocol    = "tcp"         # TCP = protocole fiable pour HTTP
    cidr_blocks = ["0.0.0.0/0"] # Tout Internet autorisé
  }

  # Port 443 = HTTPS (sites web sécurisés avec SSL)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Tout Internet autorisé
  }

  # Port 22 = SSH (connexion ligne de commande)
  # ATTENTION: 0.0.0.0/0 = risque sécurité (tout le monde peut essayer de se connecter)
  # En production: restreindre à votre IP
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # À restreindre en production !
  }

  # EGRESS = Trafic SORTANT (où votre serveur peut se connecter)
  # -1 = "tous les protocoles", 0 = "tous les ports"
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"          # Tous les protocoles
    cidr_blocks = ["0.0.0.0/0"] # Peut se connecter partout sur Internet
  }

  tags = { Name = "${var.project_name}-web-sg" }
}

# Security Group pour le serveur API (backend)
resource "aws_security_group" "api" {
  name_prefix = "${var.project_name}-api-"
  vpc_id      = aws_vpc.main.id
  description = "Securite serveur API"

  # Port 3001 = Notre API Node.js + Socket.IO
  # 0.0.0.0/0 = simplifié pour le projet (tout Internet peut accéder)
  # Alternative plus sécurisée: security_groups = [aws_security_group.web.id]
  # (seulement le serveur web peut accéder à l'API)
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Simplifié pour le projet
  }

  # SSH pour administration
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Sortie libre
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-api-sg" }
}

# === NACL (Network Access Control List) ===
# NACL = "Pare-feu réseau" au niveau du SUBNET (plus bas niveau que Security Group)
# Différence avec Security Group:
# - Security Group = au niveau INSTANCE (serveur)
# - NACL = au niveau SUBNET (réseau)
# - NACL = STATELESS (doit autoriser aller ET retour)
# - Security Group = STATEFUL (retour automatique si aller autorisé)

resource "aws_network_acl" "public" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = [aws_subnet.public.id] # Appliqué au subnet public

  # === RÈGLES ENTRANTES (INGRESS) ===

  # Règle 100: Autoriser HTTP depuis Internet
  # rule_no = numéro de priorité (plus petit = plus prioritaire)
  ingress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"     # "allow" ou "deny"
    cidr_block = "0.0.0.0/0" # Depuis tout Internet
    from_port  = 80
    to_port    = 80
  }

  # Règle 110: Autoriser HTTPS depuis Internet
  ingress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }

  # Règle 120: Autoriser SSH depuis Internet
  ingress {
    rule_no    = 120
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 22
    to_port    = 22
  }

  # Règle 130: IMPORTANT - Ports éphémères
  # Quand votre serveur fait une requête HTTP vers Internet,
  # la réponse revient sur un port aléatoire entre 1024-65535
  # OBLIGATOIRE car NACL est STATELESS (doit autoriser le retour manuellement)
  ingress {
    rule_no    = 130
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024  # Port éphémère minimum
    to_port    = 65535 # Port éphémère maximum
  }

  ingress {
    rule_no    = 140
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 3001
    to_port    = 3001
  }

  # === RÈGLES SORTANTES (EGRESS) ===

  # Autoriser TOUT le trafic sortant
  # -1 = tous les protocoles (TCP, UDP, ICMP, etc.)
  egress {
    rule_no    = 100
    protocol   = "-1" # Tous les protocoles
    action     = "allow"
    cidr_block = "0.0.0.0/0" # Vers tout Internet
    from_port  = 0           # Tous les ports
    to_port    = 0
  }

  tags = { Name = "${var.project_name}-public-nacl" }
}

# === INSTANCES EC2 ===

# Instance EC2 = "Serveur virtuel" dans AWS
# Comme louer un serveur dédié, mais virtuel et à la demande

# Instance pour le serveur web (frontend)
resource "aws_instance" "web" {
  ami                    = var.ami_id                  # Image Ubuntu récupérée plus haut
  instance_type          = var.instance_type           # "t2.micro" (1 vCPU, 1GB RAM)
  key_name               = var.key_pair_name           # Clé SSH pour se connecter
  subnet_id              = aws_subnet.public.id        # Placée dans le subnet PUBLIC
  vpc_security_group_ids = [aws_security_group.web.id] # Utilise le pare-feu "web"

  tags = {
    Name = "${var.project_name}-web-server"
    Type = "Frontend" # Tag pour identifier le rôle
  }
}

# Instance pour le serveur API (backend)
resource "aws_instance" "api" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public.id        # PUBLIC pour simplifier (pourrait être private)
  vpc_security_group_ids = [aws_security_group.api.id] # Utilise le pare-feu "api"

  tags = {
    Name = "${var.project_name}-api-server"
    Type = "Backend"
  }
}

# === RÉSUMÉ DE L'ARCHITECTURE ===
# 
# Internet → Internet Gateway → Subnet Public → Instance Web (port 80/443)
#                            ↓
#                         NAT Gateway
#                            ↓  
#         Subnet Privé → Instance API (port 3001) → (optionnel, ici en public)
#
# Sécurité à 2 niveaux:
# 1. NACL = Pare-feu au niveau subnet (réseau)
# 2. Security Group = Pare-feu au niveau instance (serveur)
#
# Utilisateurs → Frontend → Backend → Base SQLite locale
# Elastic IP = IP publique fixe pour la NAT Gateway
# Comme avoir une "adresse postale fixe" sur Internet
# # domain = "vpc" indique que c'est pour une ressource dans un VPC
# resource "aws_eip" "nat" {
#   domain     = "vpc"
#   depends_on = [aws_internet_gateway.main] # Créer APRÈS l'Internet Gateway
#   tags       = { Name = "${var.project_name}-nat-eip" }
# }

# NAT Gateway = "Portier" pour le subnet privé
# Permet au subnet privé d'accéder à Internet (pour télécharger des mises à jour)
# MAIS empêche Internet d'accéder directement au subnet privé
# Comme un "proxy" unidirectionnel (sortant seulement)
# resource "aws_nat_gateway" "main" {
#   allocation_id = aws_eip.nat.id       # Utilise l'IP fixe créée au-dessus
#   subnet_id     = aws_subnet.public.id # Placée dans le subnet PUBLIC (obligatoire)
#   depends_on    = [aws_internet_gateway.main]

#   tags = { Name = "${var.project_name}-nat-gw" }
# }
