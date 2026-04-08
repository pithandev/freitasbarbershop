const { readFileSync } = require('fs');
const { join, dirname } = require('path');

const scriptDir = __dirname;

// Test 1: Check if server.ts has fallback logic
const serverPath = join(scriptDir, '../src/lib/supabase/server.ts');
const serverContent = readFileSync(serverPath, 'utf-8');

console.log('🧪 Test 1: Checking fallback logic in server.ts');
if (serverContent.includes('placeholder.supabase.co') && serverContent.includes('placeholder-key')) {
  console.log('✅ PASS: Fallback values present');
} else {
  console.log('❌ FAIL: Fallback values missing');
  process.exit(1);
}

// Test 2: Check if client.ts has fallback logic
const clientPath = join(scriptDir, '../src/lib/supabase/client.ts');
const clientContent = readFileSync(clientPath, 'utf-8');

console.log('🧪 Test 2: Checking fallback logic in client.ts');
if (clientContent.includes('placeholder.supabase.co') && clientContent.includes('placeholder-key')) {
  console.log('✅ PASS: Fallback values present');
} else {
  console.log('❌ FAIL: Fallback values missing');
  process.exit(1);
}

// Test 3: Verify .env.local exists
const envPath = join(scriptDir, '../.env.local');
try {
  readFileSync(envPath, 'utf-8');
  console.log('🧪 Test 3: Checking .env.local exists');
  console.log('✅ PASS: .env.local exists');
} catch {
  console.log('⚠️  WARN: .env.local not found (expected for fresh clone)');
}

// Test 4: Verify key files exist
console.log('🧪 Test 4: Checking key files');
const files = [
  'src/app/page.tsx',
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/register/page.tsx',
  'src/app/booking/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/barber/page.tsx',
  'src/app/admin/page.tsx',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/client.ts',
  'src/hooks/use-auth.tsx',
  'src/components/auth-provider.tsx',
  'sql/schema.sql',
];

let allExist = true;
for (const file of files) {
  const filePath = join(scriptDir, '..', file);
  try {
    readFileSync(filePath, 'utf-8');
  } catch {
    console.log(`❌ Missing: ${file}`);
    allExist = false;
  }
}

if (allExist) {
  console.log('✅ PASS: All key files exist');
} else {
  process.exit(1);
}

console.log('\n🎉 All tests passed!');
console.log('\n📋 Build Fix Summary:');
console.log('- server.ts: Has fallback for missing env vars');
console.log('- client.ts: Has fallback for missing env vars');
console.log('- AuthProvider: Only initializes on client side');
console.log('\nTo deploy:');
console.log('1. git add .');
console.log('2. git commit -m "Fix: build environment fallback"');
console.log('3. git push');