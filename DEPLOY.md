# Deploy — onboarding.axlemarketingroup.online

App estático (Vite/React) servido por nginx em container, imagem no **GHCR**,
roteado pelo **Traefik** no **Docker Swarm**, na rede overlay `network-axle`
(mesmo padrão do `googleads-dashboard`).

## 1) Deploy inicial (via Portainer)
A imagem é publicada automaticamente em `ghcr.io/axle-marketing/onboarding-axle:latest`
pela Action `.github/workflows/deploy.yml` a cada push na `main`.

No Portainer:
1. **Stacks → Add stack**
2. Nome: `onboarding-axle`
3. Method: **Web editor** → cole o conteúdo de `docker-stack.yml` deste repo
4. **Deploy the stack**

Se der erro de "pull access denied" ao subir: **Registries → Add registry** → Custom →
URL `ghcr.io` → usuário GitHub + um Personal Access Token com escopo `read:packages`
(configuração única, pela própria UI — sem terminal). Provavelmente nem será necessário,
já que o `googleads-dashboard` já puxa do mesmo `ghcr.io/axle-marketing/...` nesse servidor.

## 2) Auto-deploy a cada push (SSH restrito)
Feito ✅ — a cada push na `main`, a Action builda a imagem, publica no GHCR e depois
conecta via SSH no servidor pra rodar:
```bash
docker service update --image ghcr.io/axle-marketing/onboarding-axle:latest --force onboarding-axle_onboarding
```

⚠️ **O `--image` é obrigatório.** Sem ele, `docker service update --force` sozinho só
reinicia os containers com a MESMA imagem que já estava rodando — o Swarm não vai
atrás de uma versão nova da tag `latest` por conta própria.

Configuração (já aplicada):
- No servidor, uma linha dedicada em `~/.ssh/authorized_keys` (do usuário `root`),
  com **forced command** contendo exatamente o comando acima (com `--image`): essa
  chave só consegue rodar esse único comando de redeploy — nada de shell, túnel ou
  qualquer outra coisa, mesmo que o secret vaze.
- No repositório GitHub, 3 secrets (Settings → Secrets and variables → Actions):
  `DEPLOY_HOST`, `DEPLOY_USER` (`root`), `DEPLOY_SSH_KEY` (chave privada dedicada).

Se precisar forçar manualmente (sem esperar um push): no Portainer, abra o serviço
e clique **"Pull and redeploy"**, ou via CLI (sempre com `--image`):
```bash
docker service update --image ghcr.io/axle-marketing/onboarding-axle:latest --force onboarding-axle_onboarding
```

## 3) Verificar
- Portainer → Stacks → `onboarding-axle` → serviço `onboarding` deve mostrar `1/1`.
- `https://onboarding.axlemarketingroup.online/` → tela de "link inválido" (esperado
  sem `?t=`). Com token: `.../?t=<token>` · Área da equipe: `.../#/admin`.

## 4) Ligar o n8n (quando os webhooks estiverem prontos)
Em `src/config.js`: preencha os endpoints e troque `USE_MOCK` para `false`. Um push
na `main` já builda, publica e redeploya sozinho.
