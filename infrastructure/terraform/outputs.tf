# === IPs DES SERVEURS ===
output "web_server_ip" {
  description = "IP publique du serveur web"
  value       = aws_instance.web.public_ip
}

output "api_server_ip" {
  description = "IP publique du serveur API"
  value       = aws_instance.api.public_ip
}

# === URLS DE L'APPLICATION ===
output "frontend_url" {
  description = "URL du frontend"
  value       = "http://${aws_instance.web.public_ip}"
}

output "api_health_url" {
  description = "URL du health check API"
  value       = "http://${aws_instance.api.public_ip}:3001/api/health"
}

# === COMMANDES SSH ===
output "ssh_web" {
  description = "Commande SSH pour le serveur web"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_instance.web.public_ip}"
}

output "ssh_api" {
  description = "Commande SSH pour le serveur API"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_instance.api.public_ip}"
}

# === INFORMATIONS RÉSEAU ===
output "vpc_id" {
  description = "ID du VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID du subnet public"
  value       = aws_subnet.public.id
}

output "private_subnet_id" {
  description = "ID du subnet privé"
  value       = aws_subnet.private.id
}
