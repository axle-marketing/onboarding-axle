# Login da área admin — configuração no n8n

Este workflow (`admin-login.workflow.json`) é o "cofre" que confere e-mail/senha
da equipe. Ele nunca guarda a senha em texto no repositório — quem guarda a
senha real é o **próprio n8n**, via variáveis de ambiente do container.

⚠️ **Este arquivo é público (vai pro GitHub). Nunca escreva a senha real aqui.**
As variáveis abaixo são só os *nomes* que o workflow espera — os *valores*
ficam só no Portainer, no serviço do n8n.

## 1) Importar o workflow
No n8n: **Workflows → Import from File** → selecione `admin-login.workflow.json`.
Ele chega com 4 blocos prontos: recebe o login (Webhook) → confere e-mail/senha
(Code) → decide (If) → responde certo (200) ou errado (401).

## 2) Configurar as variáveis de ambiente do n8n
No Portainer, edite o **stack do n8n** (a mesma onde ele já roda hoje) e
adicione estas 3 variáveis de ambiente ao serviço (valores combinados à parte,
nunca neste arquivo):

| Variável | O que é |
|---|---|
| `ADMIN_EMAIL` | o e-mail de login da equipe |
| `ADMIN_PASSWORD` | a senha de login da equipe |
| `ADMIN_TOKEN` | uma string aleatória longa — é o "crachá" que o n8n devolve quando o login está certo (pode gerar uma nova a qualquer momento, ex.: `openssl rand -hex 32`) |

Depois de adicionar as variáveis, reinicie o serviço do n8n pra elas valerem
(`docker service update --force <stack>_n8n` ou "Update the stack" no Portainer).

## 3) Ativar o workflow e pegar a URL
Ative o workflow (toggle "Active"). O n8n vai mostrar a URL de produção do
webhook, algo como:
```
https://SEU-N8N/webhook/admin/login
```

## 4) Ligar no app
Em `src/config.js` do `onboarding-axle`:
```js
ADMIN_LOGIN_ENDPOINT: 'https://SEU-N8N/webhook/admin/login',
USE_MOCK: false,
```
Os outros endpoints (`SAVE_ENDPOINT`, `ADMIN_CLIENTS_ENDPOINT`, etc.) podem
continuar vazios por enquanto — cada chamada cai no mock automaticamente
quando o endpoint dela não está preenchido, então dá pra ligar o login de
verdade sem esperar o resto ficar pronto.

Depois disso, um push na `main` já builda, publica e reinstala sozinho
(ver `DEPLOY.md`) — e a tela de login em `/#/admin` passa a validar com o
e-mail e a senha reais, guardados só no n8n.
