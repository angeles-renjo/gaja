import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

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

    try {
      await QRCode.toFile(filepath, url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      console.log(`✅ Generated QR code for Table ${table.table_number}`);
      console.log(`   URL: ${url}`);
      console.log(`   File: ${filepath}\n`);
    } catch (err) {
      console.error(`❌ Error generating QR for Table ${table.table_number}:`, err);
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
