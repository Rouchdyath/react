# 🚀 Guide de Déploiement - Système de Tickets

## 📋 Prérequis
- Compte GitHub
- Compte Vercel (gratuit)
- Compte Railway (gratuit)
- Compte Supabase (gratuit)

## 1. 📊 Base de Données - Supabase

### Étapes :
1. Va sur https://supabase.com
2. Crée un compte gratuit
3. Clique sur "New Project"
4. Choisis :
   - **Name** : ticket-system-db
   - **Password** : (génère un mot de passe fort)
   - **Region** : Europe (West)
5. Attends la création (2-3 minutes)
6. Va dans **Settings > Database**
7. Note la **Connection String** :
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

### Configuration des Tables :
1. Va dans **SQL Editor**
2. Exécute ce script pour créer les tables :

```sql
-- Création des tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client'
);

CREATE TABLE priorities (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#000000'
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    "userId" INTEGER REFERENCES users(id),
    "priorityId" INTEGER REFERENCES priorities(id),
    "assignedToId" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT FALSE,
    "ticketId" INTEGER REFERENCES tickets(id),
    "userId" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "userId" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Insertion des priorités par défaut
INSERT INTO priorities (label, color) VALUES 
('Basse', '#28a745'),
('Moyenne', '#ffc107'),
('Haute', '#fd7e14'),
('Critique', '#dc3545');
```

## 2. 🔧 Backend - Railway

### Étapes :
1. Va sur https://railway.app
2. Connecte-toi avec GitHub
3. Clique sur "New Project"
4. Sélectionne "Deploy from GitHub repo"
5. Choisis ton repository
6. Sélectionne le dossier racine (pas ticket-frontend)
7. Railway détecte automatiquement NestJS

### Variables d'environnement :
Dans Railway, va dans **Variables** et ajoute :
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=ton-secret-jwt-super-securise-123456789
NODE_ENV=production
PORT=3000
```

### Configuration du build :
Crée un fichier `railway.json` :
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 3. 🌐 Frontend - Vercel

### Préparation :
1. Dans `ticket-frontend`, crée `.env.production` :
```
REACT_APP_API_URL=https://ton-backend-railway.up.railway.app
```

2. Modifie `ticket-frontend/src/api/axios.js` :
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

### Déploiement :
1. Va sur https://vercel.com
2. Connecte-toi avec GitHub
3. Clique sur "New Project"
4. Sélectionne ton repository
5. Configure :
   - **Framework Preset** : Create React App
   - **Root Directory** : ticket-frontend
   - **Build Command** : npm run build
   - **Output Directory** : build
6. Ajoute les variables d'environnement :
   - `REACT_APP_API_URL` = URL de ton backend Railway

## 4. 🔧 Configuration CORS

Modifie `src/main.ts` pour accepter ton domaine Vercel :
```typescript
app.enableCors({
  origin: [
    'http://localhost:3002', 
    'https://ton-app.vercel.app'  // Remplace par ton URL Vercel
  ],
  credentials: true,
});
```

## 5. ✅ Test Final

1. **Backend** : https://ton-backend.up.railway.app
2. **Frontend** : https://ton-app.vercel.app
3. **Test de connexion** avec : `final@admin.com` / `admin`

## 🎉 Félicitations !

Ton application est maintenant déployée et accessible au monde entier !

## 📝 URLs à retenir :
- **Application** : https://ton-app.vercel.app
- **API** : https://ton-backend.up.railway.app
- **Base de données** : Dashboard Supabase

## 🔧 Maintenance :
- **Logs Backend** : Dashboard Railway
- **Analytics Frontend** : Dashboard Vercel
- **Base de données** : Dashboard Supabase