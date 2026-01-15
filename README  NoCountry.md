![Spotify](https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg)

# **Projeto ChurnInsight – Spotify**

## 📌 **Visão Geral do Projeto**

Este projeto foi desenvolvido no contexto do **Hackathon ONE II** com o objetivo de criar uma solução completa de **Data Science aplicada ao negócio**, capaz de **prever a probabilidade de churn (cancelamento)** de clientes em serviços por assinatura.

A solução simula um cenário real de plataformas de streaming, como o Spotify, permitindo que empresas **identifiquem clientes de alto risco antecipadamente**, apoiando estratégias de **retenção, redução de perdas financeiras e tomada de decisão baseada em dados**.


## 🎯 **Problema de Negócio**

Empresas baseadas em modelos de assinatura enfrentam impactos financeiros significativos quando clientes cancelam seus serviços.

Antecipar o churn possibilita:

- Atuar preventivamente com ações de retenção  
- Criar campanhas personalizadas e direcionadas  
- Reduzir custos de aquisição de novos clientes  
- Aumentar o Lifetime Value (LTV)  

Neste contexto, **errar ao não identificar um cliente que irá cancelar (False Negative)** é mais crítico do que abordar um cliente que permaneceria ativo.


## 💡 **Solução Proposta**

Foi desenvolvido um **pipeline completo de Machine Learning**, com foco em **classificação binária**, capaz de estimar a probabilidade de churn de cada cliente.

**A solução contempla:**
- Análise Exploratória de Dados (EDA)  
- Engenharia de Features Avançada
- Tratamento de dados (Metricas de Fricção)
- Treinamento e Benchmarking
- Validação de Estabilidade
- Otimização de Decisão
- Explicabilidade (XAI)
- Serialização e preparação para consumo via backend 

## 📊 **Dataset Utilizado**

- **Fonte:** Kaggle  
- **Nome:** Spotify Dataset for Churn Analysis  
- **Formato:** CSV  
- **Variável alvo:** `is_churned`  (`0` = Cliente ativo  , `1` = Cliente cancelou )

🔗 **Dataset:** [spotify_churn_dataset.csv](https://github.com/aluizr/Hackathon-ONE---Churn-clientes/blob/main/spotify_churn_dataset.csv)

## 🧠 **Modelagem Preditiva e Avaliação**

Foram treinados e avaliados três modelos supervisionados:

- **Regressão Logística (com SMOTE)**  
- **Random Forest**  
- **Gradient Boosting**

## 🎯 Estratégia de Avaliação

A otimização foi conduzida com foco em **Recall**, métrica mais adequada ao problema de churn, pois prioriza a **identificação correta de clientes que realmente irão cancelar**.

Além disso, foi realizado:

- Ajuste de Threshold Estratégico
- Avaliação Multimétrica
- Validação de Estabilidade (K-Fold)

## 🏆 Modelo Final Escolhido: **Regressão Logística com SMOTE**

**Motivos da escolha:**

- Estabilidade Estatística
- Foco em Retenção
- Interpretabilidade e Transparência
- Alinhamento Estratégico 

## 🔍 **Explicabilidade do Modelo (XAI)**

Para garantir **transparência e confiabilidade**, foi incorporada **explicabilidade com SHAP (SHapley Additive Explanations)**.

Com SHAP, foi possível:

- Entender quais variáveis mais influenciam o churn  
- Explicar decisões do modelo em nível individual  
- Analisar clientes de alto risco com justificativas claras  

Esse recurso torna o modelo **auditável, interpretável e pronto para uso em ambiente corporativo**.

## 🛠️ **Stack Tecnológico**

### Linguagens & Ambiente
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Google Colab](https://img.shields.io/badge/Google_Colab-F9AB00?style=flat&logo=googlecolab&logoColor=white)
![Kaggle](https://img.shields.io/badge/Kaggle-20BEFF?style=flat&logo=kaggle&logoColor=white)

### Data Science & Machine Learning
![Pandas](https://img.shields.io/badge/Pandas-Data%20Analysis-150458?logo=pandas)
![NumPy](https://img.shields.io/badge/NumPy-Numerical-013243?logo=numpy)
![Scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?logo=scikit-learn)
![Matplotlib](https://img.shields.io/badge/Matplotlib-Visualization-11557C)
![Seaborn](https://img.shields.io/badge/Seaborn-EDA-4C72B0)
![SHAP](https://img.shields.io/badge/SHAP-XAI-FF0051)
![Joblib](https://img.shields.io/badge/Joblib-Serialization-2A2A2A)
![ONNX](https://img.shields.io/badge/ONNX-ML%20Model-005CED)
![ONNX Runtime](https://img.shields.io/badge/ONNX%20Runtime-Inference-005CED)

### Front-end & Visualização
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-F43F5E?style=flat&logo=lucide&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-222222?style=flat&logo=recharts&logoColor=24B5A8)

### Backend
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring%20Security-Auth-6DB33F)
![JdbcTemplate](https://img.shields.io/badge/JdbcTemplate-DB-6DB33F)
![Spring Actuator](https://img.shields.io/badge/Actuator-Monitoring-6DB33F)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?logo=flyway)
![Lombok](https://img.shields.io/badge/Lombok-Code%20Reduction-BC4521)

### Banco de Dados
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql)

### Testes
![JUnit](https://img.shields.io/badge/JUnit-Testing-25A162?logo=junit5)

### Versionamento
![Git](https://img.shields.io/badge/Git-Version%20Control-F05032?logo=git)
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)

##  ⚠️ Limitações do Estudo
- Dataset sintético
- Ausência de histórico temporal
- Variáveis comportamentais agregadas

## 🚀 **Notebook de Desenvolvimento**

- [Google Colab](https://colab.research.google.com/drive/1p-BuXIIKo6MoKyuUHmpdqaRLwr7Xos24?usp=drive_link)

## 🧩 **Repositórios do Projeto**

- [Data Science](https://github.com/aluizr/Hackathon-ONE---Churn-clientes)
- [Back-End (API REST)](https://github.com/Equipe-14-DataBeats-Hackaton-NoCountry/churninsight-api)
- [Front-End](https://github.com/Equipe-14-DataBeats-Hackaton-NoCountry/Hackathon_ONE_Front-End)
- [Repositório Oficial Unificado](https://github.com/orgs/Equipe-14-DataBeats-Hackaton-NoCountry/repositories)

##  🔌 **Contrato da API**
### Endpoint
 - POST /predict

#### Entrada (JSON)

```json
{
        "gender": "Other",
        "age": 27,
        "country": "US",
        "subscription_type": "Free",
        "listening_time": 284,
        "songs_played_per_day": 57,
        "skip_rate": 0.14,
        "device_type": "Desktop",
        "ads_listened_per_week": 41,
        "offline_listening": 0,
        "songs_per_minute": 0.2,
        "ad_intensity": 0.1025,
        "frustration_index": 5.880000000000001,
        "is_heavy_user": 1,
        "premium_no_offline": 0
    }
```
#### Saída
```
{
        "prediction": "Não Vai Cancelar",
        "probability": 0.2556,
        "decision_threshold": 0.262755,
        "ai_diagnosis": {
            "primary_risk_factor": "Anúncios por Semana",
            "primary_retention_factor": "Uso Offline",
            "suggested_action": "Manter fluxo padrão"
        }
```

##  🔌 **Metadado de Governança (Model Card)**
### Endpoint
 - POST /predict
```
{
    "name": "Spotify Churn Model",
    "version": "1.0",
    "model_type": "Logistic Regression with SMOTE",
    "accuracy": 0.6488,
    "recall": 0.3043,
    "precision": 0.315,
    "f1_score": 0.3096,
    "auc_roc": 0.544,
    "threshold_otimo": 0.262755,
    "numeric_features": [
        "age",
        "listening_time",
        "songs_played_per_day",
        "skip_rate",
        "ads_listened_per_week",
        "offline_listening",
        "songs_per_minute",
        "ad_intensity",
        "frustration_index",
        "is_heavy_user",
        "premium_no_offline"
    ],
    "categorical_features": [
        "gender",
        "country",
        "subscription_type",
        "device_type"
    ],
}
```


## 📦 **BACKEND**

- Integração completa com API REST  
- Endpoint `/predict` consumindo modelo ONNX  
- Persistência de previsões  
- Dashboard de risco de churn    


## 🔄 **Status do Projeto**

### **DATA SCIENCE & ML** 

- **MVP funcional** - Modelo treinado e validado.
- **Modelo explicável** - Implementação de SHAP para transparência.
- **Integração** - Pipeline pronto para consumo de dados.  


### **BACKEND & API** 

- **API REST** - Estrutura completa com autenticação.
- **Segurança** - Endpoints protegidos com *HTTP Basic Auth*.
- **Conectividade** - Pronta para integração com Data Science.
- **Qualidade** - Contrato de API definido e 100% testado.


## 👥 Equipe do Projeto – Hackathon ONE II
**Time Back-End**
- Ezandro Bueno 
- Jorge Filipi Dias 
- Wanderson Souza 
- Wendell Dorta 

**Time Data Science**
- André Ribeiro 
- Kelly Muehlmann 
- Luiz Alves 
- Mariana Fernandes 


## 📂 **Documentação do Desafio**

>- [Desafio do Hackathon](https://www.icloud.com/iclouddrive/047o_p2lktHdbUlYzFH2yxYMQ)
>- [Dataset .csv](https://github.com/aluizr/Hackathon-ONE---Churn-clientes/blob/main/spotify_churn_dataset.csv)
>- [Pitch Mariana](https://docs.google.com/document/d/1o8inoTVSSmdyvmz6oGd0lFNzxK478OdQ/edit?usp=drive_link&ouid=103855940170812890254&rtpof=true&sd=true)
>- [Pitch Kelly](https://docs.google.com/document/d/1PhcgM4e9fYM3pfVr134mwVsmtMFBo0y3/edit)
>- [Pitch Kelly e Wendell](https://docs.google.com/document/d/1J49rCNljW4kdGeT9-awK3D35rKoXotzX/edit)
>- [Pitch Wanderson](https://drive.google.com/drive/folders/1sTAKk_HtIoHnMkVeLfTVeXNwijBdGrEp)
>- [Pitch Ezandro](https://drive.google.com/file/d/1EdTUSOoy459_gHtPULBng892AVCWlhr5/view)
>- [Gamma](https://gamma.app/docs/Hackathon-ONE-II-kqtvg41hk6ldei5?mode=doc)

---
## 👥 **Projeto desenvolvido para o Hackathon ONE II (2026)**
🚀 Evolução contínua durante o Hackathon ONE II.

