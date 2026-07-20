# Currículo Direto

Site para criar currículos com layouts prontos para ATS, com login com conta Google e salvamento automático na nuvem (cada pessoa só vê o próprio currículo).

## O que você vai precisar

- Uma conta Google (para criar o projeto no Firebase — é gratuito no plano usado aqui)
- Node.js instalado no computador (versão 18 ou mais recente) — [nodejs.org](https://nodejs.org)
- Uma conta no [GitHub](https://github.com) (para publicar o site, se for usar o passo de deploy)

---

## Passo 1 — Criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e clique em **Adicionar projeto**.
2. Dê um nome (ex: `curriculo-direto`) e siga o assistente (pode desativar o Google Analytics, não é necessário).
3. Dentro do projeto, clique no ícone **`</>`** (Web) para registrar um novo app web. Dê um apelido e clique em **Registrar app**.
4. O Firebase vai mostrar um bloco `firebaseConfig` com várias chaves (`apiKey`, `authDomain`, etc). Guarde essa tela aberta — você vai usar esses valores no Passo 3.

## Passo 2 — Ativar login com Google e o banco de dados

1. No menu lateral, vá em **Build > Authentication** → aba **Sign-in method** → clique em **Google** → habilite → salve.
2. Ainda no menu lateral, vá em **Build > Firestore Database** → **Criar banco de dados** → escolha o modo **produção** → escolha a localização mais próxima (ex: `southamerica-east1` para o Brasil) → concluir.
3. Dentro do Firestore, vá na aba **Regras** e cole o conteúdo do arquivo `firestore.rules` deste projeto, substituindo o que já estiver lá. Isso garante que cada pessoa só acesse o próprio currículo. Clique em **Publicar**.

## Passo 3 — Configurar o projeto no seu computador

1. Extraia esta pasta e abra um terminal dentro dela.
2. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Abra o `.env` e preencha cada linha com os valores que o Firebase te mostrou no Passo 1 (`apiKey` → `VITE_FIREBASE_API_KEY`, e assim por diante).
4. Instale as dependências:
   ```bash
   npm install
   ```
5. Rode o site localmente:
   ```bash
   npm run dev
   ```
6. Abra o endereço que aparecer no terminal (geralmente `http://localhost:5173`). O login com Google já deve funcionar em `localhost`.

## Passo 4 — Publicar o site (deploy)

A forma mais simples é usar a [Vercel](https://vercel.com) (gratuita para esse uso):

1. Suba esta pasta para um repositório novo no GitHub.
2. Crie uma conta na Vercel e clique em **Add New > Project**, escolhendo esse repositório.
3. Em **Environment Variables**, adicione as mesmas variáveis que estão no seu `.env` (uma por uma).
4. Clique em **Deploy**. Em cerca de um minuto você recebe uma URL pública (ex: `curriculo-direto.vercel.app`).

### Último passo importante: autorizar o domínio no Firebase

1. Volte ao Firebase Console → **Authentication** → aba **Settings** → **Authorized domains**.
2. Clique em **Add domain** e cole o domínio que a Vercel te deu (ex: `curriculo-direto.vercel.app`).
3. Sem esse passo, o botão "Entrar com Google" não vai funcionar no site publicado.

---

## Como os dados são salvos

Cada usuário logado tem um único documento no Firestore, em `curriculos/{seu-uid}`, contendo os dados do currículo e o layout escolhido. As regras de segurança (`firestore.rules`) garantem que ninguém além do próprio usuário consiga ler ou escrever nesse documento.

## Estrutura do projeto

```
curriculo-direto/
├── src/
│   ├── firebase.js           # configuração do Firebase + funções de login/salvar/carregar
│   ├── App.jsx                # decide entre tela de login e o construtor
│   ├── components/
│   │   ├── Login.jsx          # tela de "Entrar com Google"
│   │   └── ResumeBuilder.jsx  # formulário + preview + templates do currículo
│   └── index.css
├── firestore.rules            # regras de segurança do banco de dados
├── .env.example                # modelo das variáveis de ambiente
└── package.json
```

## Personalizando

- **Cores e tipografia**: procure pelas classes com `#1F6F5C` (verde) em `ResumeBuilder.jsx` e `Login.jsx` para trocar a cor de destaque.
- **Novos campos/seções do currículo**: em `ResumeBuilder.jsx`, siga o padrão das seções existentes (`Section`, `RemovableCard`, `addItem`/`removeItem`) para adicionar uma nova, como "Publicações" ou "Prêmios".
- **Novos layouts de currículo**: dentro do componente `Resume`, adicione uma nova chave no objeto `styles` e inclua-a no array `TEMPLATES`.
