const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });
db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='MealMenu'")
  .then(r => console.log(r.rows[0].sql))
  .catch(console.error);
