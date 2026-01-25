const http = require('http');

const postData = JSON.stringify({
  name: 'FinalAdmin',
  email: 'final@admin.com',
  password: 'admin',
  role: 'admin'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ FinalAdmin créé avec succès !');
      console.log('📧 Email: final@admin.com');
      console.log('🔑 Mot de passe: admin');
      console.log('👑 Rôle: admin');
    } else {
      console.log('❌ Erreur lors de la création');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Erreur: ${e.message}`);
});

req.write(postData);
req.end();