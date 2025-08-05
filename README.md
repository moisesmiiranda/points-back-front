# PointsBack - Sistema de Fidelidade e "cashback de pontos"

Este é um sistema de "points back" (cashback em pontos) que permite o cadastro e gerenciamento de clientes. O projeto é dividido em um backend construído com Java (API REST) e um frontend moderno e reativo construído com React e TypeScript.

## Funcionalidades

- **Cadastro de Clientes**: Formulário para registrar novos clientes com nome, email, telefone e CPF.
- **Listagem de Clientes**: Exibe todos os clientes cadastrados em uma grade.
- **Otimização de Rotas**: Calcula e exibe a rota otimizada para visitar todos os clientes cadastrados, partindo da sede da empresa (coordenada 0,0).

## Tecnologias Utilizadas

### Frontend
- **React**: Biblioteca para construção da interface de usuário.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Vite**: Ferramenta de build e desenvolvimento frontend extremamente rápida.
- **Tailwind CSS**: Framework CSS utility-first para estilização rápida e customizável.
- **Lucide-React**: Biblioteca de ícones SVG, leve e customizável.


## Estrutura do Projeto

```
PointsBackApi/

Frontend/
    └── pointsback-front/  # Contém a aplicação em React
```

## Pré-requisitos

Antes de começar, você precisará ter as seguintes ferramentas instaladas em sua máquina:

- [Node.js (v18 ou superior)](https://nodejs.org/)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

## Como Executar o Projeto

Siga os passos abaixo para executar a aplicação localmente.

Com o backend rodando, inicie a aplicação React em um novo terminal.

```bash
# Navegue até a pasta do frontend
cd Frontend/pointsback-front

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação frontend estará acessível em `http://localhost:5173` (ou outra porta indicada no terminal).

## Endpoints da API

A API expõe os seguintes endpoints principais:

- `POST /clients`: Registra um novo cliente.
  - **Body**: `{ "name": "string", "email": "string", "phone": "string", "cpf": "string" }`
- `GET /clients`: Retorna uma lista de todos os clientes cadastrados.
- `GET /clients/calculate-route`: Retorna uma lista de clientes na ordem otimizada para visita.

---
