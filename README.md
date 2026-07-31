# Currículo Direto

## Descrição

Site pra criar currículos com layouts prontos pra passar por sistemas de ATS. A pessoa preenche
suas informações, escolhe um modelo, personaliza cor e ordem das seções, e baixa o currículo em
PDF. Login com conta Google, com o currículo salvo automaticamente na nuvem.

## Objetivo

Projeto pessoal pra colocar em prática o que venho aprendendo no curso de Análise e
Desenvolvimento de Sistemas, construindo uma aplicação completa do zero — front-end, autenticação
e banco de dados. Também nasceu de um problema real: currículos barrados pelos filtros automáticos
das empresas antes mesmo de chegar a um recrutador. Por isso o site é gratuito pra qualquer pessoa
usar.

## Tecnologias utilizadas

- React
- Vite
- Tailwind CSS
- Firebase (Authentication + Firestore)
- Lucide Icons
- Vercel

## Funcionalidades

- Login com conta Google
- Currículo salvo automaticamente na nuvem, vinculado à conta de cada usuário
- 6 modelos de currículo (Clássico, Moderno, Compacto, Perfil, Executivo, Criativo)
- Cor de destaque personalizável
- Upload de foto (nos modelos que suportam)
- Reordenar seções do currículo arrastando
- Pré-visualização de exemplo, mostrada até a pessoa começar a preencher
- Campo de CNH opcional, com categoria
- Nome do arquivo PDF personalizável
- Download em PDF direto do navegador
- Layout 100% responsivo (desktop e celular)

## Estrutura do projeto

```
curriculo-direto/
│
├── index.html
├── package.json
├── src/
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── components/
│       ├── Home.jsx
│       ├── Login.jsx
│       └── ResumeBuilder.jsx
├── public/
│   └── foto-criador.jpg
└── firestore.rules
```

## Autor

Moisés Assunção Coêlho Júnior

## Links

- Repositório: https://github.com/Moises-Assuncao/curriculo-direto
- Site: https://curriculo-direto.vercel.app