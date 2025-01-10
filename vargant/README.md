### SETUP K8S

Cài đặt môi trường 1 master, các node

### Enable IPv4 packet forwarding

# sysctl params required by setup, params persist across reboots

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.ipv4.ip_forward = 1
EOF

# Apply sysctl params without reboot

sudo sysctl --system

# Verify that net.ipv4.ip_forward is set to 1 with:

sysctl net.ipv4.ip_forward

# Install package need

sudo apt update
sudo apt install -y tree fish

# K9s

wget https://github.com/derailed/k9s/releases/download/v0.32.7/k9s_linux_amd64.deb && apt install ./k9s_linux_amd64.deb && rm k9s_linux_amd64.deb

### Cài đặt containered

# Add Docker's official GPG key:

sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:

echo \
 "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
 $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
 sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install containerd.io

### Config CGroup

containerd config default > /etc/containerd/config.toml

### Edit file config

nano /etc/containerd/config.toml

# Edit: SystemdCgroup = true

### Restart containerd

sudo systemctl restart containerd

### Installing kubeadm, kubelet and kubect

# 1

sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

# 2

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.32/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# 3

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.32/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

# 4

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# 5

sudo systemctl enable --now kubelet

### Disable swap

sudo swapoff -a

# Init config or create file config

# Init config

sudo kubeadm init --apiserver-advertise-address=192.168.56.11 --control-plane-endpoint=master --pod-network-cidr=192.168.0.0/16 --service-cidr=10.96.0.0/12

## Without admin

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

### With Admin

export KUBECONFIG=/etc/kubernetes/admin.conf

### Beacause of use NAT so need config

nano /etc/hosts

# Add new ip - domain
