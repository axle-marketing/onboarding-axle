# Deploy — onboarding.axlemarketingroup.online

App estático (Vite/React) servido por nginx em container, imagem no **GHCR**,
roteado pelo **Traefik** no **Docker Swarm**, na rede overlay `network-axle`
(mesmo padrão do `googleads-dashboard`).

## 1) Publicar a imagem no GHCR
**Automático (recomendado):** a Action `.github/workflows/deploy.yml` builda e publica
`ghcr.io/axle-marketing/onboarding-axle:latest` a cada push na `main`.

**Manual (alternativa, via SSH):**
```bash
cd /opt && git clone https://github.com/axle-marketing/onboarding-axle.git
cd onboarding-axle
docker build -t ghcr.io/axle-marketing/onboarding-axle:latest .
docker push ghcr.io/axle-marketing/onboarding-axle:latest   # exige docker login ghcr.io
```
> Se o pacote GHCR for privado, garanta que o servidor consegue puxar a imagem
> (mesma auth usada para o googleads-dashboard).

## 2) Deploy do stack
**CLI:** `docker stack deploy -c docker-stack.yml onboarding`
**Portainer:** Stacks → Add stack → cole o `docker-stack.yml` → Deploy.

Atualizar depois de um novo push/imagem:
```bash
docker service update --force onboarding_onboarding
```

## 3) Verificar
- `docker service ls | grep onboarding` → `1/1`.
- `https://onboarding.axlemarketingroup.online/` → tela de "link inválido" (esperado sem `?t=`).
  Com token: `.../?t=<token>` · Área da equipe: `.../#/admin`.

## 4) Ligar o n8n (quando os webhooks estiverem prontos)
Em `src/config.js`: preencha os endpoints e troque `USE_MOCK` para `false`. Faça um novo
push (a Action rebuilda) e rode `docker service update --force onboarding_onboarding`.
