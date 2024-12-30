apt-get update

## Git autocomplete
echo "source /usr/share/bash-completion/completions/git" >> ~/.bashrc

## Install dependencies
npm ci --ignore-scripts
