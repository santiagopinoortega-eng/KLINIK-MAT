# 🔐 GUÍA DE ROTACIÓN DE API KEYS

**Fecha:** 28 de diciembre de 2025  
**Crítico:** Seguir INMEDIATAMENTE antes de deployment

---

## ⚠️ PROBLEMA IDENTIFICADO

Tu API key de Gemini está expuesta en archivos de código:
- `.env.local` (línea 35)
- `.env.production` (línea 35)
- Potencialmente en commits de Git

**Impacto:** Cualquiera con acceso al repositorio puede usar tu cuota de IA sin autorización.

---

## 🔧 PASOS DE CORRECCIÓN

### 1. Verificar Estado de .gitignore ✅

```bash
# Verificar que .env.* está ignorado
cat .gitignore | grep ".env"
```

**Estado actual:** ✅ `.env*.local` y `.env.production` están en .gitignore

### 2. Generar Nueva API Key

1. Ir a https://aistudio.google.com/apikey
2. Click en "Create API Key"
3. Seleccionar proyecto o crear nuevo
4. Copiar la nueva key (formato: `AIzaSy...`)
5. **IMPORTANTE:** Guardar en gestor de contraseñas (1Password, Bitwarden, etc.)

### 3. Actualizar Variables de Entorno

#### Desarrollo Local (`.env.local`)
```bash
# .env.local
GEMINI_API_KEY=AIzaSy_NUEVA_KEY_AQUI
```

#### Producción (Vercel)
```bash
# NO agregues la key directamente al archivo .env.production
# En su lugar, usa el dashboard de Vercel:

1. Ir a https://vercel.com/tu-proyecto/settings/environment-variables
2. Agregar variable:
   - Name: GEMINI_API_KEY
   - Value: AIzaSy_NUEVA_KEY_AQUI
   - Environment: Production, Preview
3. Click "Save"
4. Redeploy: vercel --prod
```

### 4. Revocar API Key Antigua

1. Ir a https://console.cloud.google.com/apis/credentials
2. Buscar key antigua: `AIzaSyBhgOllp5SR_vdYCdiGVkB_ntnNCTLWyIE`
3. Click en menú (⋮) → "Delete"
4. Confirmar eliminación

**⚠️ Hacer DESPUÉS de deployment con nueva key**

### 5. Limpiar Historial de Git (Opcional pero RECOMENDADO)

Si tu repositorio es **privado**, puedes saltarte este paso.

Si es **público** o planeas hacerlo público:

```bash
# Instalar BFG Repo-Cleaner
brew install bfg  # macOS
# o descargar de: https://rtyley.github.io/bfg-repo-cleaner/

# Hacer backup
git clone --mirror git@github.com:tu-usuario/KLINIK-MAT.git backup-repo

# Remover keys del historial
bfg --replace-text passwords.txt KLINIK-MAT.git

# passwords.txt contenido:
# AIzaSyBhgOllp5SR_vdYCdiGVkB_ntnNCTLWyIE===>***REMOVED***

# Limpiar y push
cd KLINIK-MAT.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Alternativa:** Usar GitHub Secret Scanning alerts y seguir su guía de remediación.

---

## ✅ VERIFICACIÓN POST-ROTACIÓN

### Test Local
```bash
# 1. Verificar nueva key cargada
cd /home/shago22/proyectos/KLINIK-MAT
source .env.local
echo $GEMINI_API_KEY  # Debe mostrar la NUEVA key

# 2. Ejecutar test
npm run dev

# 3. En otra terminal:
export GEMINI_API_KEY="tu_nueva_key"
npx ts-node scripts/test-gemini.ts

# Debe responder: ✅ Conexión exitosa (no 401/403)
```

### Test Producción
```bash
# 1. Deploy con nueva key
vercel --prod

# 2. Verificar en logs de Vercel que no hay errores de API key

# 3. Probar endpoint de estadísticas
curl https://tu-dominio.com/api/ai/estadisticas \
  -H "Authorization: Bearer tu_clerk_token"

# Debe responder 200 (no 401 GEMINI_API_KEY_MISSING)
```

---

## 📋 CHECKLIST FINAL

Antes de marcar como completado, verificar:

- [ ] Nueva API key generada en AI Studio
- [ ] `.env.local` actualizado con nueva key
- [ ] Variable de entorno configurada en Vercel Dashboard
- [ ] Aplicación deployada (`vercel --prod`)
- [ ] Test local ejecutado exitosamente
- [ ] Test producción funcional
- [ ] API key antigua revocada en Google Cloud Console
- [ ] (Opcional) Historial de Git limpiado con BFG
- [ ] Nueva key guardada en gestor de contraseñas

---

## 🚨 PLAN DE CONTINGENCIA

Si algo sale mal después de rotar:

### Problema: App no funciona en producción
```bash
# 1. Verificar variable en Vercel
vercel env ls

# 2. Si no aparece GEMINI_API_KEY:
vercel env add GEMINI_API_KEY production
# Pegar nueva key

# 3. Redeploy
vercel --prod --force
```

### Problema: "API key inválida"
```bash
# Verificar formato de la key:
# ✅ Correcto: AIzaSyABC123...
# ❌ Incorrecto: AIzaSyABC123...\n (salto de línea)
# ❌ Incorrecto: "AIzaSyABC123..." (comillas)

# Corregir:
echo -n "AIzaSyABC123..." | vercel env add GEMINI_API_KEY production
```

### Problema: Cuota agotada inmediatamente
```bash
# Activar billing en Google Cloud:
1. Ir a https://console.cloud.google.com/billing
2. Vincular proyecto con cuenta de billing
3. Configurar budget alert ($50/mes)
4. Volver a generar API key (las gratis no funcionarán)
```

---

## 📊 MONITOREO POST-ROTACIÓN

### Configurar Alertas (Recomendado)

```javascript
// lib/gemini.ts - Agregar logging de errores
import * as Sentry from '@sentry/nextjs';

try {
  const result = await model.generateContent(prompt);
  // ...
} catch (error) {
  if (error.message.includes('API_KEY')) {
    Sentry.captureException(error, {
      tags: { component: 'gemini', issue: 'api_key' }
    });
  }
  throw error;
}
```

### Dashboard de Uso

Revisar cada semana:
- Google AI Studio: https://aistudio.google.com/app/apikey (usage stats)
- Vercel Logs: https://vercel.com/tu-proyecto/logs
- Sentry: https://sentry.io (error rate)

---

## 🎓 LECCIONES APRENDIDAS

**NO hacer en el futuro:**
- ❌ Commitear archivos `.env.local` o `.env.production`
- ❌ Hardcodear API keys en código fuente
- ❌ Compartir keys en Slack/Discord/Email
- ❌ Usar la misma key para dev y prod

**SÍ hacer:**
- ✅ Usar variables de entorno (Vercel, Railway, etc.)
- ✅ Rotar keys cada 3-6 meses
- ✅ Usar diferentes keys por ambiente (dev/prod)
- ✅ Configurar budget alerts ($50/mes)
- ✅ Revisar GitHub Secret Scanning alerts

---

**Última actualización:** 28 dic 2025  
**Próxima revisión:** Después de primera rotación exitosa
