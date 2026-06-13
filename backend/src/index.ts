import { pool } from "./config/db";
import app from "./app";



async function start() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("Database Connected");
        console.log(result.rows[0]);

        app.listen(4000, () => {
            console.log(`Server running on port 4000`);
        });
    } catch (err) {
        console.error(err);
    }
}

start();
// Trigger restart
