# Service Investments

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

# Instalação 

Para executar a aplicação, é recomendado ter instalado o Docker e Docker Compose para evitar possíveis problemas de incompatibilidade da versão Node e dependência de serviços externos. Para iniciar basta executar no diretório raiz da aplicação o seguinte comando:

```bash
## Obs: Antes de executar a aplicação, é necessário garantir que as variáveis de ambientes estejam devidamente configuradas em um arquivo .env na raiz do diretório

# Executando via Docker:

$ docker compose up -d
```

# Testes

Para rodar os testes unitários, execute o seguinte comando no diretório raiz da aplicação:

```bash
$ npm run test
```

# Swagger 

Para acessar o Swagger, uma vez que a aplicação estiver sendo executada, acessar o endpoint "/doc".
