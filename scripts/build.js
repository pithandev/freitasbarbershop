const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Build script started...');

// Set placeholder env vars for build
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://placeholder.vercel.app';

console.log('📋 Environment variables set for build');

try {
  console.log('📦 Running next build...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: process.env 
  });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}