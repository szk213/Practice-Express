# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
 config.vm.box = "bento/centos-7.1"
 config.vm.network "forwarded_port", guest: 27017, host: 27017
 config.vm.provision "shell", inline: <<-SHELL
 sudo tee /etc/yum.repos.d/mongodb-org-3.4.repo <<-'EOF'
[mongodb-org-3.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc
EOF

 sudo yum install -y mongodb-org
 systemctl start mongod
 systemctl enable mongod
 SHELL
end
