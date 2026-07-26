const { createClient } = require('@libsql/client');

const db = createClient({ url: 'file:dev.db' });

async function alter() {
  try {
    await db.execute('ALTER TABLE Student ADD COLUMN parentName2 TEXT');
    console.log('Added parentName2');
  } catch (e) { console.log('parentName2 exists or error', e.message); }
  
  try {
    await db.execute('ALTER TABLE Student ADD COLUMN parentPhone2 TEXT');
    console.log('Added parentPhone2');
  } catch (e) { console.log('parentPhone2 exists or error', e.message); }
}

alter();
