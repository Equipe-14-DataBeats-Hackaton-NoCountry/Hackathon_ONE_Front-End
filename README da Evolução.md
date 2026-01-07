

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" width="250" alt="Spotify Logo">
</p>

<h1 align="center">Arquitetura do Projeto</h1>


### 1. 🧠 Camada de Inteligência e Dados
O coração do projeto, onde reside o conhecimento estatístico.
* **`.onnx` / `.pkl`**: Modelos treinados de Machine Learning. O formato ONNX é utilizado para garantir execução de baixa latência no ambiente de produção.
  
* **`clients.json`**: Base de dados local (mock) simulando a resposta do banco de dados com 8.000 registros.
  
* **`metrics.json`**: Relatório de performance do modelo **Regressão Logística com SMOTE**, servindo de base para os gráficos de confiança da IA.
  
* **`contrato_api.json`**: Documentação técnica que define o formato de troca de dados entre o Frontend e o Backend.

### 2. ⚙️ Lógica de Negócio e Serviços
Camada intermediária que prepara os dados para a interface.
* **`src/data/`**: Contém scripts de serviço ( `clients.js`, `metrics.js`) que filtram, formatam e limpam os dados brutos antes de chegarem à tela.
  
* **`src/hooks/`**: Custom Hooks (`useClients.js`, `useData.js`) que gerenciam o estado global, controle de carregamento (*loading*) e tratamento de erros.

### 3. 🖼️ Interface Visual e Páginas
A experiência do usuário e a visualização dos insights.
* **`src/pages/Dashboard.jsx`**: O orquestrador da visualização, organizando o layout principal e a distribuição das informações.
  
* **`src/components/`**: Peças modulares e reutilizáveis:
    * `Charts.jsx`: Visualização gráfica de tendências de Churn.
    * `MetricCard.jsx`: Indicadores rápidos de alta visibilidade.
    * `ClientExplainability.jsx`: Interface de IA Explicável (XAI), detalhando o "porquê" de cada predição.
* **`App.jsx` & `main.jsx`**: A fundação do React, responsável pela inicialização e rotas do sistema.

### 4. 🎨 Estética e Padronização
Garantia de consistência visual e qualidade de código.
* **`index.css`**: Estilos de base e reset de CSS para garantir consistência entre navegadores.
  
* **`theme.css`**: Definição de variáveis de cores e identidade visual (Design System).
  
* **`App.css`**: Regras de layout e estrutura de grid do container principal
  
* **`eslint.config.js`**: Padronização de código para manter o projeto limpo e legível.

### 5. 🛠️ Infraestrutura e Ambiente
Configurações para desenvolvimento e deploy.
* **`.venv`**: Ambiente virtual isolado para execução dos scripts de IA em Python.
  
* **`.gitignore`**: Proteção do repositório, impedindo o envio de dependências pesadas (`node_modules`. `.venv`, `.vscode`), arquivos de sistema e segredos.
  
* **`dist/`**: Versão final otimizada para publicação (Build).

---

## 🛠️ Tecnologias Utilizadas
- **React 18** + **Vite**
- **Tailwind CSS** (Estilização)
- **Recharts** (Visualização de Dados)
- **ONNX Runtime** (Execução do Modelo de IA)
- **Python** (Backend e Treino do Modelo)

> *Este projeto foi desenvolvido seguindo boas práticas de "Separation of Concerns" (Separação de Responsabilidades), garantindo facilidade na manutenção e escalabilidade técnica.*
> 
## 📁 Estrutura de Pastas
```text
Front-End/
├── .venv/                   # Ambiente virtual Python (isolamento de bibliotecas)
├── .vscode/                 # Configurações personalizadas do editor VS Code
├── dist/                    # Pasta de distribuição (build otimizado para produção)
│   └── assets/              # Arquivos JS e CSS minificados e processados
├── node_modules/            # Dependências instaladas via NPM (gerenciadas pelo package.json)
├── public/                  # Assets estáticos acessíveis via URL direta
│   ├── clients.json         # Dados brutos dos clientes (mock database)
│   ├── metrics.json         # Métricas de performance da IA
│   └── Spotify.png          # Assets de imagem públicos
├── src/                     # Código-fonte principal da aplicação
│   ├── assets/              # Mídias utilizadas internamente nos componentes
│   ├── components/          # Peças reutilizáveis da interface (Charts, Cards, XAI)
│   │   ├── Charts.jsx                    # Gráficos
│   │   ├── ClientExplainability.jsx      # IA, XAI
│   │   └── MetricCard.jsx                # Resumo rápido (Topo página web)
│   ├── data/                # Camada de tratamento e serviços de dados
│   │   ├── clients.js
│   │   └── metrics.js
│   ├── hooks/               # Lógica de estado e conexão com API (Custom Hooks)
│   │   ├── useClients.js
│   │   └── useData.js
│   ├── pages/               # Visualizações e telas completas
│   │   └── Dashboard.jsx    # Organiza onde e quando cada coisa deve aparecer
│   ├── styles/              # Arquivos de estilização centralizados
│   │   └── theme.css        # Cores e identidade visual (Design System)
│   ├── App.css              # Estilos de estrutura e layout principal
│   ├── app.jsx              # Componente raiz da aplicação
│   ├── index.css            # Estilos de base e reset global
│   └── main.jsx             # Ponto de entrada (conector React + DOM)
├── .gitignore               # Regras de exclusão para o controle de versão
├── contrato_api.json        # Definição técnica da comunicação Front/Back
├── eslint.config.js         # Regras de padronização e qualidade de código
├── modelo_churn.pkl         # Modelo de ML original (Python)
├── modelo_hackathon.onnx    # Modelo de ML otimizado para execução
├── package.json             # Manifesto do projeto e lista de dependências
└── vite.config.js           # Configurações do motor de build Vite