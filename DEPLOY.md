# 🚀 Deploy no Vercel - Guia Completo

## Preparação (JÁ FEITO ✅)
- ✅ Build testado e funcionando
- ✅ index.html criado
- ✅ src/main.tsx criado
- ✅ vercel.json configurado

## Opção 1: Deploy via GitHub (RECOMENDADO)

### 1. Subir projeto para GitHub:
```bash
# Inicializar git (se não tiver)
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "v3.0 - React Router System"

# Criar repositório no GitHub: https://github.com/new
# Depois conectar:
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main
```

### 2. Conectar no Vercel:
1. Acesse: https://vercel.com/new
2. Faça login (pode usar conta do GitHub)
3. Click "Import Git Repository"
4. Selecione seu repositório
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build` ou `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: deixe vazio (auto-detect)

6. Click "Deploy"

### 3. Configurar Variáveis de Ambiente:
Após deploy, vá em **Settings → Environment Variables** e adicione:
- `VITE_SUPABASE_URL`: (sua URL do Supabase)
- `VITE_SUPABASE_ANON_KEY`: (sua chave pública)

## Opção 2: Deploy via CLI

### 1. Instalar Vercel CLI:
```bash
npm i -g vercel
```

### 2. Login:
```bash
vercel login
```

### 3. Deploy:
```bash
vercel
```

Siga os prompts:
- Set up and deploy? **Y**
- Which scope? (escolha sua conta)
- Link to existing project? **N**
- Project name? (pode deixar sugerido ou mudar)
- In which directory is your code located? **.**
- Override settings? **N**

### 4. Deploy para produção:
```bash
vercel --prod
```

## Opção 3: Deploy Manual (Arrastar e Soltar)

1. Fazer build local:
```bash
pnpm build
```

2. Acessar: https://vercel.com/new
3. Arrastar pasta `dist/` para o Vercel
4. Aguardar deploy

## ⚙️ Configurações Importantes

### vercel.json (já configurado):
```json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🔗 Após Deploy

Você receberá URLs:
- **Preview**: `https://seu-projeto-hash.vercel.app`
- **Production**: `https://seu-projeto.vercel.app`

Para domínio customizado:
1. Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

## 🐛 Troubleshooting

### Build falha:
- Verifique Node version: `node -v` (precisa ser 18+)
- Limpe cache: `pnpm store prune`

### Rotas não funcionam (404):
- Verifique se `rewrites` está no vercel.json
- React Router precisa do fallback para index.html

### Supabase não conecta:
- Adicione variáveis de ambiente no Vercel
- Redeploy após adicionar variáveis

## 📞 Suporte

- Vercel Docs: https://vercel.com/docs
- Troubleshooting: https://vercel.com/guides
