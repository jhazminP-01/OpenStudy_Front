import { supabase } from './lib/supabase.js';

console.log('Probando conexión con Supabase...');
console.log('URL:', supabase.supabaseUrl);

// Probar conexión simple
supabase.from('_test_connection').select('*').limit(1)
  .then(response => {
    console.log('Respuesta:', response);
  })
  .catch(error => {
    console.log('Error:', error);
  });
