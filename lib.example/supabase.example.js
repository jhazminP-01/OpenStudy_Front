import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// Reemplaza estos valores con tus credenciales de Supabase
const supabaseUrl = 'https://TU_PROJECT_ID.supabase.co'
const supabaseAnonKey = 'TU_PUBLISHABLE_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// INSTRUCCIONES:
// 1. Copia este archivo a lib/supabase.js
// 2. Ve a tu dashboard de Supabase
// 3. Settings -> API -> copia Project URL y anon public key
// 4. Reemplaza los valores arriba
// 5. No subas el archivo lib/supabase.js a git
