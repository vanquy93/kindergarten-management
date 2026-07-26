const http = require('http');

const endpoints = [
  '/api/students',
  '/api/classes',
  '/api/teachers',
  '/api/attendance',
  '/api/pickups',
  '/api/invoices',
  '/api/messages',
  '/api/meals'
];

async function checkEndpoints() {
  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:3000${ep}`);
      const text = await res.text();
      let ok = res.ok;
      if (text.includes('error')) ok = false;
      console.log(`${ep}: ${ok ? 'OK' : 'ERROR'} - ${res.status} - ${text.substring(0, 100)}`);
    } catch(e) {
      console.log(`${ep}: FAILED TO CONNECT - ${e.message}`);
    }
  }
}
checkEndpoints();
