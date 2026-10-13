# Usa uma imagem oficial do Node.js levinha
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala os pacotes
RUN npm install

# Copia o resto do código
COPY . .

# Expõe a porta do frontend
EXPOSE 5173

# Inicia o Vite e expõe para rede (--host é necessário no Docker para poder acessar no navegador)
CMD ["npm", "run", "dev", "--", "--host"]