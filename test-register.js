const fetch = require('node-fetch');

async function testRegister() {
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

    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Admin créé avec succès !');
    } else {
      console.log('❌ Erreur:', result);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testRegister();