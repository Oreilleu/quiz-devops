# directories
TERRAFORM_DIR=infrastructure/terraform
ANSIBLE_DIR=infrastructure/ansible
KEY_PATH=~/.ssh/quiz-app-key.pem

# default command
.PHONY: help
help:
	@echo "Commandes disponibles :"
	@echo "  make init         → terraform init dans l'environnement"
	@echo "  make plan         → terraform plan"
	@echo "  make apply        → terraform apply"
	@echo "  make destroy      → terraform destroy"
	@echo "  make ping         → init hosts.ini + teste la connexion avec Ansible"
	@echo "  make deploy       → déploie frontend + backend avec Ansible"

# Terraform init
init:
	cd $(TERRAFORM_DIR) && terraform init

# Terraform plan
plan:
	cd $(TERRAFORM_DIR) && terraform plan

# Terraform apply
apply:
	cd $(TERRAFORM_DIR) && terraform apply -auto-approve

# Terraform destroy
destroy:
	cd $(TERRAFORM_DIR) && terraform destroy -auto-approve

# inventory
SHELL := /bin/bash
hosts:
	@mkdir -p $(ANSIBLE_DIR)/inventory
	@echo "[web_servers]" > $(ANSIBLE_DIR)/inventory/hosts.ini
	@WEB_IP=$$(cd $(TERRAFORM_DIR) && terraform output -raw web_server_ip 2>/dev/null || echo ""); \
	if [ -n "$$WEB_IP" ]; then \
		echo "$$WEB_IP ansible_user=ubuntu ansible_ssh_private_key_file=$(KEY_PATH)" >> $(ANSIBLE_DIR)/inventory/hosts.ini; \
	else \
		echo "# No web server IP available" >> $(ANSIBLE_DIR)/inventory/hosts.ini; \
	fi
	@echo "[api_servers]" >> $(ANSIBLE_DIR)/inventory/hosts.ini
	@API_IP=$$(cd $(TERRAFORM_DIR) && terraform output -raw api_server_ip 2>/dev/null || echo ""); \
	WEB_IP=$$(cd $(TERRAFORM_DIR) && terraform output -raw web_server_ip 2>/dev/null || echo ""); \
	if [ -n "$$API_IP" ] && [ -n "$$WEB_IP" ]; then \
		echo "$$API_IP ansible_user=ubuntu ansible_ssh_private_key_file=$(KEY_PATH) ansible_ssh_common_args='-o ProxyCommand=\"ssh -W %h:%p -i $(KEY_PATH) ubuntu@$$WEB_IP\"'" >> $(ANSIBLE_DIR)/inventory/hosts.ini; \
	else \
		echo "# No API server IP available" >> $(ANSIBLE_DIR)/inventory/hosts.ini; \
	fi
	@echo "✅ Fichier $(ANSIBLE_DIR)/inventory/hosts.ini généré"
# testing ansible (through ping )
ping: hosts
	SSH_AUTH_SOCK="" ansible -i $(ANSIBLE_DIR)/inventory/hosts.ini all -m ping --ssh-extra-args='-o StrictHostKeyChecking=no -o IdentitiesOnly=yes'

# I got to deploy the whole package ( frontend and backend )
deploy: hosts
	SSH_AUTH_SOCK="" ansible-playbook -i $(ANSIBLE_DIR)/inventory/hosts.ini $(ANSIBLE_DIR)/playbook.yml
