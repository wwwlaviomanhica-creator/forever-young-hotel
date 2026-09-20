# 🚀 Como colocar o site do Forever Young na Internet (grátis)

Este guia tem 3 partes: **(1)** colocar o site no ar em ~10 minutos, **(2)** ligar o
botão "Publicar agora" do painel de gestão, **(3)** usar o seu próprio domínio
(www.foreveryoung.com). Tudo pode ser feito de graça; o único custo opcional é o
domínio próprio.

---

## Parte 1 — Colocar o site no ar (Netlify, grátis)

A forma mais fácil é o **Netlify Drop**:

1. Aceda a **https://app.netlify.com/drop** e crie uma conta gratuita (pode usar
   e-mail ou entrar com Google/GitHub).
2. Arraste a pasta **`forever-young-hotel`** inteira para a área indicada
   (ou crie um .zip da pasta e arraste o .zip).
3. Em menos de 1 minuto o Netlify mostra o endereço do site, algo como:
   **https://forever-young-hotel.netlify.app** — pronto, o site está no ar! 🎉

> Alternativas: **GitHub Pages** (se já tiver GitHub) ou **Vercel**. O site é
> estático e funciona em qualquer hospedagem — basta publicar os ficheiros da pasta.

---

## Parte 2 — Editar pelo painel e publicar na Internet

O painel (`admin.html`) edita o conteúdo e guarda no navegador. Para que as
edições cheguem **a todos os visitantes**, o site lê o ficheiro `content.json`
publicado, e o painel atualiza esse ficheiro via **GitHub**. Configuração única,
~10 minutos:

1. **Crie uma conta grátis** em https://github.com (se ainda não tiver).
2. **Crie um repositório**: botão "+" → "New repository" → nome
   `forever-young-hotel` → marque **Public** → "Create repository".
   Na página seguinte, clique em **"uploading an existing file"** e arraste TODOS
   os ficheiros desta pasta (index.html, admin.html, pastas css/js/img,
   content.json, netlify.toml…) → "Commit changes".
3. **Crie o token de publicação**:
   - Aceda a https://github.com/settings/tokens → "Generate new token" →
     **"Generate new token (classic)"**;
   - Nota: `publicar site forever young`; validade: sem data (No expiration) ou a
     que preferir;
   - Marque a opção **`repo`**;
   - Clique "Generate token" e **copie** o código `ghp_…` (mostra só uma vez!).
4. **No painel de gestão**: abra `admin.html` → Configurações →
   **Publicar na Internet** → cole o token e escreva
   `SEUUTILIZADOR/forever-young-hotel` → "Guardar dados de publicação" →
   "Testar ligação" (deve dizer "Ligação OK") → "Publicar agora".
5. **Ligue o Netlify ao GitHub** (para o site atualizar sozinho): no Netlify →
   "Add new site" → "Import an existing project" → GitHub → escolha
   `forever-young-hotel` → "Deploy". A partir daí, cada clique em
   **"Publicar agora"** atualiza o site em 1–2 minutos. ✅

> Se preferir não usar o Netlify: no GitHub, vá a Settings → Pages →
> Branch: `main` → Save. O site fica em
> `https://SEUUTILIZADOR.github.io/forever-young-hotel/`.

### Como funciona
- Visitante abre o site → o site lê `content.json` (o conteúdo publicado).
- Você edita no painel → "Publicar agora" → o painel atualiza o `content.json`
  no GitHub → a hospedagem republica automaticamente.
- O botão "Descarregar content.json" serve para publicar à mão (enviar o ficheiro
  pelo próprio GitHub, opção "Add file → Upload files").

### Reservas e mensagens
- **Reservas**: o formulário do site guarda o pedido e gera uma mensagem pronta
  que o hóspede envia pelo **WhatsApp do hotel** (+258 84 416 0174) — chega
  directamente consigo, sem depender de servidor.
- **Mensagens de contato**: igualmente com envio direto pelo WhatsApp.
- As listas de "Reservas" e "Mensagens" do painel mostram os pedidos feitos
  no **mesmo navegador** em que você testa o site — servem de registo local.

---

## Parte 3 — Usar o domínio próprio (opcional)

Os flyers mostram `www.foreveryoung.com`. Para usar esse endereço:

1. **Compre/garanta o domínio** num registador (GoDaddy, Namecheap, Cloudflare,
   ou um registador .mz local). Domínios .com custam ~10–15 USD/ano; pagam-se com
   cartão de banco pré-pago ou virtual.
2. **No Netlify**: Site configuration → Domain management →
   "Add a domain" → escreva `foreveryoung.com`.
3. O Netlify mostra os registos DNS para criar no seu registador:
   - `A` (raiz) → `75.2.60.5`
   - `CNAME` `www` → `SEU-SITE.netlify.app`
4. Aguarde a propagação (pode levar de minutos a 24 h). O certificado HTTPS é
   emitido automaticamente e de graça.

---

## Segurança — leia com atenção

O painel segue boas práticas internacionais (OWASP/NIST) adaptadas a um site
sem servidor:

- **Senha com PBKDF2-SHA256** (150.000 iterações + sal aleatório de 16 bytes) —
  a senha nunca é guardada em texto; guarda-se apenas a derivação criptográfica.
- **Primeiro acesso seguro**: não existe senha padrão. Ao abrir o painel pela
  primeira vez, é você quem cria as credenciais (mínimo 10 caracteres, 3 tipos
  de caracteres, com medidor de força).
- **Bloqueio anti-força-bruta**: após 3 tentativas erradas o login bloqueia
  30 s, e o tempo dobra a cada nova falha (até 15 minutos).
- **Sessão com expiração**: o painel sai sozinho após 30 minutos de inatividade.
- **Registo de auditoria**: entradas, falhas e alterações de acesso ficam
  registadas (Configurações → Registo de auditoria).
- **Cabeçalhos de segurança OWASP** (CSP, X-Frame-Options, HSTS, etc.) são
  aplicados pela Netlify através do ficheiro `netlify.toml`.
- O **token do GitHub** (o segredo que realmente publica o site) é guardado
  apenas no navegador onde configurou o painel, aparece mascarado e pode ser
  apagado com "Esquecer token" ou revogado em github.com/settings/tokens.

### Limites honestos (importante!)

- Sem servidor, a senha do painel protege **cada navegador separadamente**:
  configure o acesso no PC e, se quiser, repita no telemóvel. Qualquer pessoa que
  abra `admin.html` noutro aparelho verá apenas o ecrã de criação de acesso — e
  isso não afeta o seu navegador nem o site publicado.
- O que realmente protege o **conteúdo publicado** é o token do GitHub, que só
  existe no seu navegador. Trate-o como uma senha.
- Se quiser um dia ter contas múltiplas, recuperação de senha por e-mail e
  auditoria centralizada num servidor, o próximo passo é ligar o painel a um
  serviço como Firebase/Supabase — posso fazer essa adaptação.

### Dica de acesso

- No site, o botão **"Gestão do site"** fica no fim da página; também funciona o
  atalho **Ctrl+Shift+A** em qualquer ponto do site.
- No painel, o botão **"Ver o site ↗"** abre o site público num novo separador.
- Backup: em Configurações → "Exportar backup (.json)" guarde periodicamente uma
  cópia do conteúdo, reservas e mensagens.

---

## Checklist final

- [ ] Site no ar (Netlify Drop ou GitHub Pages) — anote o endereço
- [ ] Acesso do painel criado com senha forte (primeiro acesso) e anotada
- [ ] Token GitHub configurado e "Testar ligação" OK
- [ ] "Publicar agora" testado (editar um preço → Publicar → F5 no site)
- [ ] WhatsApp a receber mensagens de teste
- [ ] (Opcional) Domínio próprio ligado
