import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgresql://postgres:rajkumar1213@localhost:5432/postgres' });

async function initBots() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bots (
        id SERIAL PRIMARY KEY,
        pos VARCHAR(255),
        rating INTEGER,
        des TEXT,
        avatar TEXT
      );
    `);
    console.log("Table created!");

    await pool.query(`
      INSERT INTO bots (pos, rating, des, avatar) VALUES 
      ('Easy', 1200, 'A simple AI opponent that makes basic algorithmic choices. Perfect for warmups.', ''), 
      ('Medium', 1500, 'A balanced AI that understands intermediate data structures and edge cases.', ''), 
      ('Hard', 1800, 'An elite competitive coding AI designed to test your optimization limits.', '');
    `);
    console.log("Bots seeded!");
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

initBots();
