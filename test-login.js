const http = require('http');

const postData = JSON.stringify({
  email: 'final@admin.com',
  password: 'admin'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/login',
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
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Login réussi !');
      try {
        const parsed = JSON.parse(data);
        console.log('🔑 Token:', parsed.access_token ? 'Présent' : 'Absent');
        console.log('👤 User:', parsed.user ? parsed.user : 'Absent');
      } catch (e) {
        console.log('❌ Erreur parsing JSON');
      }
    } else {
      console.log('❌ Erreur de connexion');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Erreur: ${e.message}`);
});

req.write(postData);
req.end();