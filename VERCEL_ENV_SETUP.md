# GUÍA RÁPIDA: CONFIGURAR CREDENCIALES EN VERCEL

## Opción 1: Dashboard Web (Recomendado)

### Paso 1: Ir al Dashboard
```
https://vercel.com/[tu-usuario]/klinik-mat/settings/environment-variables
```

### Paso 2: Agregar estas 5 variables

**Variable 1:**
```
Name: MERCADOPAGO_ACCESS_TOKEN
Value: APP_USR-700392096917113-121814-f9c02c93c78ba4302556770f582a733c-3029563243
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

**Variable 2:**
```
Name: NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
Value: APP_USR-e56c19b0-e4e1-4796-ad30-9229b0678902
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

**Variable 3:**
```
Name: MERCADOPAGO_CLIENT_ID
Value: 700392096917113
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

**Variable 4:**
```
Name: MERCADOPAGO_CLIENT_SECRET
Value: IgiWDiu8QvBtx9Y5ttK2cKtbklHO3XPy
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

**Variable 5:**
```
Name: MERCADOPAGO_WEBHOOK_SECRET
Value: 1e9342dd5493fa0788116231e18a4cc11d1522ba32009207dd0da85c8863534d
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

### Paso 3: Redeploy
```bash
vercel --prod
```

---

## Opción 2: CLI de Vercel (Más Rápido)

```bash
# 1. Instalar CLI si no lo tienes
npm i -g vercel

# 2. Login
vercel login

# 3. Ir a tu proyecto
cd /home/shago22/proyectos/KLINIK-MAT

# 4. Agregar variables una por una
vercel env add MERCADOPAGO_ACCESS_TOKEN production
# Pegar: APP_USR-700392096917113-121814-f9c02c93c78ba4302556770f582a733c-3029563243

vercel env add NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY production
# Pegar: APP_USR-e56c19b0-e4e1-4796-ad30-9229b0678902

vercel env add MERCADOPAGO_CLIENT_ID production
# Pegar: 700392096917113

vercel env add MERCADOPAGO_CLIENT_SECRET production
# Pegar: IgiWDiu8QvBtx9Y5ttK2cKtbklHO3XPy

vercel env add MERCADOPAGO_WEBHOOK_SECRET production
# Pegar: 1e9342dd5493fa0788116231e18a4cc11d1522ba32009207dd0da85c8863534d

# 5. Redeploy
vercel --prod
```

---

## Opción 3: Archivo .env para Vercel (Automatizado)

```bash
# Crear archivo temporal con las variables
cat > vercel-env-import.txt << 'EOF'
MERCADOPAGO_ACCESS_TOKEN="APP_USR-700392096917113-121814-f9c02c93c78ba4302556770f582a733c-3029563243"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-e56c19b0-e4e1-4796-ad30-9229b0678902"
MERCADOPAGO_CLIENT_ID="700392096917113"
MERCADOPAGO_CLIENT_SECRET="IgiWDiu8QvBtx9Y5ttK2cKtbklHO3XPy"
MERCADOPAGO_WEBHOOK_SECRET="1e9342dd5493fa0788116231e18a4cc11d1522ba32009207dd0da85c8863534d"
EOF

# Importar a Vercel
vercel env pull .env.production
```

---

## Verificar Variables en Vercel

```bash
# Listar variables actuales
vercel env ls

# Verificar una específica
vercel env get MERCADOPAGO_ACCESS_TOKEN production
```

---

## Después de Configurar

### 1. Hacer Deploy
```bash
git add .
git commit -m "feat: credenciales de producción Mercado Pago"
git push origin main

# O forzar redeploy
vercel --prod --force
```

### 2. Verificar en Producción
```bash
# Debe retornar las credenciales APP_USR-*
curl https://klinikmat.cl/api/health
```

### 3. Configurar Webhook en Mercado Pago
```
URL: https://klinikmat.cl/api/webhooks/mercadopago

Eventos:
☑️ payment
☑️ subscription_preapproval  
☑️ subscription_authorized_payment
```

---

## Troubleshooting

### Variables no se cargan
```bash
# 1. Verificar que existan
vercel env ls

# 2. Hacer redeploy forzado
vercel --prod --force

# 3. Verificar en logs
vercel logs [deployment-url]
```

### Error "Invalid credentials"
```bash
# Verificar que sean APP_USR-* (PRODUCCIÓN) no TEST-*
vercel env get MERCADOPAGO_ACCESS_TOKEN production
```

---

## ✅ Checklist Final

- [ ] 5 variables agregadas en Vercel
- [ ] Todas en Production, Preview, Development
- [ ] Deploy ejecutado
- [ ] API responde correctamente
- [ ] Webhook configurado en MP
- [ ] Flujo de pago probado en /pricing
