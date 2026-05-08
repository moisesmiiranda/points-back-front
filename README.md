# Points Manager — Frontend

Frontend React + TypeScript para o sistema de gerenciamento de pontos **api-points-back** (Spring Boot).

## Stack

- **Vite** + **React 19** + **TypeScript**
- **React Router v7** — rotas SPA
- **Axios** — chamadas HTTP
- **Recharts** — gráfico de barras no Dashboard
- **CSS** — tema dark premium com glassmorphism

## Pré-requisitos

- **Node.js** ≥ 18
- **Backend** rodando em `http://localhost:8080`

## Instalação e execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Build de produção
npm run build

# Testes
npm test
```

## CORS / Proxy

O Vite está configurado com proxy reverso:

```
/api/* → http://localhost:8080/*
```

Todas as chamadas do frontend usam `/api` como base URL. O proxy remove o prefixo `/api` antes de encaminhar ao backend, evitando problemas de CORS.

Se preferir rodar **sem** proxy, altere `src/services/api.ts`:

```ts
const api = axios.create({
  baseURL: 'http://localhost:8080',
});
```

E ajuste o CORS no backend para aceitar a origem do frontend (ex: `http://localhost:5173`).

## Estrutura de pastas

```
src/
├── components/       # Sidebar, Pagination, Toast, LoadingSpinner
├── pages/
│   ├── clients/      # ClientCreate, ClientList, ClientEdit
│   ├── establishments/ # EstablishmentCreate, EstablishmentList, EstablishmentEdit
│   ├── purchases/    # PurchaseCreate, PurchaseList, PurchaseEdit
│   └── Dashboard.tsx
├── services/         # api.ts, clientService, establishmentService, purchaseService
├── types/            # interfaces DTO
├── App.tsx           # rotas e layout
└── index.css         # design system global
```

## Observações importantes

- **DELETE**: O backend não expõe endpoints DELETE. As telas de "Apagar" exibem aviso sobre isso.
- **Pontos**: Ao registrar uma compra, o backend incrementa pontos automaticamente. O frontend também permite adicionar pontos manualmente via `PUT /clients/{id}/points?points=N`.
- **Atualização parcial**: O formulário de edição envia apenas os campos que foram alterados (o backend aceita null-checks).
