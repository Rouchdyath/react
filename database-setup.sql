-- Script de création des tables pour Supabase
-- Copie et colle ce script dans SQL Editor de Supabase

-- Création des tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE priorities (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#000000',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "priorityId" INTEGER REFERENCES priorities(id),
    "assignedToId" INTEGER REFERENCES users(id),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    "isInternal" BOOLEAN DEFAULT FALSE,
    "ticketId" INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Insertion des priorités par défaut
INSERT INTO priorities (label, color) VALUES 
('Basse', '#28a745'),
('Moyenne', '#ffc107'),
('Haute', '#fd7e14'),
('Critique', '#dc3545');

-- Création d'un utilisateur admin par défaut
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@system.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Index pour améliorer les performances
CREATE INDEX idx_tickets_user ON tickets("userId");
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets("priorityId");
CREATE INDEX idx_comments_ticket ON comments("ticketId");
CREATE INDEX idx_notifications_user ON notifications("userId");