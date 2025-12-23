import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres@localhost:5433/uno_game'
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const res = await client.query('SELECT NOW()');
    console.log('✅ Query result:', res.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();