import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * DEPLOYMENT NOTES:
 *
 * QR codes need to be generated with the correct URL for each environment:
 *
 * LOCAL DEVELOPMENT (testing on same network):
 *   1. Update NEXT_PUBLIC_BASE_URL in .env.local to your local IP (e.g., http://192.168.4.39:3000)
 *   2. Run: npm run generate-qr
 *
 * PRODUCTION DEPLOYMENT:
 *   1. Set NEXT_PUBLIC_BASE_URL in Vercel dashboard under Environment Variables:
 *      - Go to Project Settings > Environment Variables
 *      - Set: NEXT_PUBLIC_BASE_URL=https://yourdomain.com (or https://your-app.vercel.app)
 *   2. Locally, temporarily set the production URL in .env.local
 *   3. Run: npm run generate-qr
 *   4. Commit the regenerated QR code images from public/qr-codes/
 *   5. Push to trigger deployment
 *
 * IMPORTANT: QR codes are static images. If your domain changes, regenerate and redeploy them.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateQRCodes() {
  console.log('🔄 Fetching tables from Supabase...\n');

  // Fetch all tables
  const { data: tables, error } = await supabase
    .from('tables')
    .select('id, table_number')
    .order('table_number');

  if (error) {
    console.error('Error fetching tables:', error);
    process.exit(1);
  }

  if (!tables || tables.length === 0) {
    console.error('No tables found in database');
    process.exit(1);
  }

  console.log(`Found ${tables.length} tables\n`);

  // Create QR codes directory if it doesn't exist
  const qrDir = path.join(process.cwd(), 'public', 'qr-codes');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  // Generate QR code for each table
  for (const table of tables) {
    const url = `${baseUrl}/order?table=${table.id}`;
    const filename = `table-${table.table_number}.png`;
    const filepath = path.join(qrDir, filename);

    // Debug logging
    console.log(`\n📋 Processing Table ${table.table_number}:`);
    console.log(`   Table ID: ${table.id}`);
    console.log(`   Full URL: ${url}`);
    console.log(`   URL length: ${url.length} characters`);

    try {
      // Optimized settings for iPhone/mobile scanning
      // - M (medium) error correction: 15% correction, better balance than H
      // - 512px width: larger size for better scanning reliability
      // - Margin 4: standard quiet zone for proper scanning
      // - Type auto-detection: library chooses optimal QR version
      await QRCode.toFile(filepath, url, {
        errorCorrectionLevel: 'M',  // Medium = 15% correction, optimal for URLs on screens
        type: 'png',
        width: 512,  // Larger size for better mobile scanning
        margin: 4,   // Standard margin (4 modules quiet zone)
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      console.log(`   ✅ QR code generated successfully`);
      console.log(`   📁 File: ${filepath}`);
      console.log(`   ⚙️  Settings: 512px, Error Correction: M (15%), Margin: 4`);
    } catch (err) {
      console.error(`   ❌ Error generating QR code:`, err);
      console.error(`   Failed URL: ${url}`);
    }
  }

  console.log('🎉 QR code generation complete!');
  console.log(`\nQR codes saved to: ${qrDir}`);
}

// Run the script
generateQRCodes().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
