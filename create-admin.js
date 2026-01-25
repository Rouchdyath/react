// Script pour créer un utilisateur admin
const fetch = require('node-fetch');

async function createAdmin() {
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin123',
        role: 'admin'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Utilisateur admin créé avec succès !');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Mot de passe: admin123');
      console.log('👑 Rôle: admin');
    } else {
      console.log('❌ Erreur:', result);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

createAdmin();