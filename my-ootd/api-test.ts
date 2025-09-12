// 1️⃣ Load environment variables
import 'dotenv/config'; // must be first

console.log('ENV URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('ENV KEY:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);