# Usa a imagem oficial do Node.js como base
FROM node:20-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos package.json e package-lock.json (se existir)
# para instalar as dependências antes de copiar todo o código
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código da aplicação para o diretório de trabalho
COPY . .

# Expõe a porta em que a aplicação Node.js estará ouvindo
# Certifique-se de que esta porta corresponde à porta definida no seu server.js (ex: 3000)
EXPOSE 3000

# Define o comando que será executado quando o container for iniciado
# O ambiente de produção usará o script 'start' definido no package.json
CMD [ "npm", "start" ]
