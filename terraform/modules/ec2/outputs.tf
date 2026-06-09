output "instance_id" {
  value = aws_instance.main.id
}

output "public_ip" {
  description = "IP publique de l'EC2"
  value       = aws_instance.main.public_ip
}
