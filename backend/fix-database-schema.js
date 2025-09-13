// Fix database schema - Add missing dns_configured column
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://metzjfocvkelucinstul.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQxMzAxOSwiZXhwIjoyMDcyOTg5MDE5fQ.oLmAm48uUpwKjH_LhJtNaNrvo5nE9cEkAyfjQtkwCKg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabaseSchema() {
  try {
    console.log('🔍 Checking domains table structure...');
    
    // Get current table structure
    const { data: domains, error: selectError } = await supabase
      .from('domains')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Error reading domains table:', selectError);
      return;
    }
    
    console.log('✅ Domains table exists');
    console.log('📋 Sample record structure:', domains[0] ? Object.keys(domains[0]) : 'No records found');
    
    // Try to add dns_configured column using raw SQL
    console.log('🛠️  Adding dns_configured column...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE domains ADD COLUMN IF NOT EXISTS dns_configured BOOLEAN DEFAULT false;'
    });
    
    if (error) {
      console.log('⚠️  RPC method not available, using direct approach...');
      
      // Alternative approach: Update an existing record to see current schema
      const { data: updateData, error: updateError } = await supabase
        .from('domains')
        .update({ dns_configured: false })
        .eq('id', 'test-id')
        .select();
        
      if (updateError && updateError.code === 'PGRST204') {
        console.log('❌ Confirmed: dns_configured column is missing');
        console.log('💡 Solution: We need to update our code to not use dns_configured');
      } else {
        console.log('✅ dns_configured column exists or update worked');
      }
    } else {
      console.log('✅ Column added successfully');
    }
    
    // Test creating a domain without dns_configured
    console.log('🧪 Testing domain creation without dns_configured...');
    
    const testDomain = `schema-test-${Date.now()}.com`;
    const { data: newDomain, error: insertError } = await supabase
      .from('domains')
      .insert({
        domain: testDomain,
        project_id: '57b1c0cf-838b-4100-87fb-2c30269267d7',
        status: 'pending',
        ssl_enabled: false,
        dns_records: {
          cname: { name: testDomain, value: 'xistracloud.app' },
          txt: { name: `_xistracloud.${testDomain}`, value: 'test-verification' }
        },
        verification_token: 'test-token-' + Math.random().toString(36).substring(2, 15)
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
    } else {
      console.log('✅ Test domain created successfully:', newDomain.id);
      
      // Clean up test domain
      await supabase.from('domains').delete().eq('id', newDomain.id);
      console.log('🧹 Test domain cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixDatabaseSchema();
