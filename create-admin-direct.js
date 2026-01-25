// Script pour créer un admin directement via la base de données
const bcrypt = require('bcrypt');

async function createAdminSQL() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('🔑 Exécute cette requête SQL dans ta base de données PostgreSQL :');
  console.log('');
  console.log(`INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@admin.com', '${hashedPassword}', 'admin');`);
  console.log('');
  console.log('📧 Email: admin@admin.com');
  console.log('🔑 Mot de passe: admin123');
  console.log('👑 Rôle: admin');
}

createAdminSQL();