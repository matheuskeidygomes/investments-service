# Service Investments

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)


# Instalação 

Para executar a aplicação, é recomendado ter instalado o Docker e Docker Compose para evitar possíveis problemas de incompatibilidade da versão Node e dependência de serviços externos. Para iniciar basta executar no diretório raiz da aplicação o seguinte comando:

```bash
## Obs: Antes de executar a aplicação, é necessário garantir que as variáveis de ambientes estejam devidamente configuradas em um arquivo .env na raiz do diretório. No arquivo .env.example há um modelo das variáveis de ambiente necessárias já configuradas para ambiente de desenvolvimento.

# Executando via Docker:

$ docker compose up -d
```

# Testes

Para rodar os testes unitários, execute o seguinte comando no diretório raiz da aplicação:

```bash
$ npm run test
```

# Swagger 

Para acessar o Swagger, uma vez que a aplicação estiver sendo executada, acessar o endpoint "/doc" no host onde a aplicação esteja rodando.

```bash
 Exemplo: http://localhost:3000/doc 
```

# Postman Collection

Clique [aqui](https://drive.google.com/file/d/1LkWqptHpnr9jqbrwSakf88A0kTyLO3Xp/view) para baixar uma collection Postman da aplicação.


# Regras de negócio:

### Usuários

- Não é possível criar 2 usuários com o mesmo e-mail.
- É permitido que o usuário visualize todos os usuários cadastrados.
- É permitido que o usuário atualize/ative/desative somente o seu próprio perfil.
- Caso o usuário se encontre desativado, o mesmo não poderá atualizar os dados do seu perfil.

### Investimentos

- O valor do investimento deve ser no mínimo 50.
- O usuário só poderá visualizar os seus próprios investimentos.
- Caso o usuário se encontre desativado, o mesmo não poderá visualizar/criar investimentos.

### Retiradas

- O usuário só poderá visualizar suas próprias retiradas.
- Não é permitido que o usuário crie uma retirada de um investimento que não o pertence.
- Caso o usuário se encontre desativado, o mesmo não poderá visualizar/criar retiradas.
