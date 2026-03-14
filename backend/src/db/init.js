import { db } from './database.js';
import bcrypt from 'bcrypt';

export async function initializeDatabase() {
    try {
        console.log('Synchronisation de la base de données...');

        // Assure que la base de données supporte l'UTF-8
        await db.query(`ALTER DATABASE cinezone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);

        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        avatar VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      );
    `);

        await db.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        director VARCHAR(100) NOT NULL,
        release_year INT NOT NULL,
        rating DECIMAL(3,1) DEFAULT 0,
        category_id INT DEFAULT NULL,
        image VARCHAR(255) DEFAULT '/posters/default.jpg',
        synopsis TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

        await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        movie_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_movie (user_id, movie_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
      );
    `);

        await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        movie_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_movie_review (user_id, movie_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
      );
    `);

        // Graine : Utilisateur Admin
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        await db.query(`
      INSERT IGNORE INTO users (firstname, lastname, email, password_hash, is_admin)
      VALUES ('Super', 'Admin', 'admin@cinezone.com', ?, TRUE)
    `, [adminPasswordHash]);

        // Graine : Catégories
        const categories = ['Action', 'Comédie', 'Drame', 'Science-Fiction', 'Horreur'];
        for (const cat of categories) {
            await db.query(`INSERT IGNORE INTO categories (name) VALUES (?)`, [cat]);
        }

        console.log('✅ Structure de la base de données synchronisée');
    } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', err);
        throw err;
    }
}
