// Quick Supabase test script
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabase() {
  console.log('🔍 Testing Supabase connection and schema...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(1);

    if (testError) {
      console.error('❌ Connection failed:', testError);
      return;
    }
    console.log('✅ Connection successful');
    console.log('   Sample project:', testData?.[0]?.name || 'No projects found');

    // Test 2: Check domains table schema
    console.log('\n2️⃣ Testing domains table schema...');
    const { data: domainsSchema, error: schemaError } = await supabase
      .from('domains')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('❌ Domains table error:', schemaError);
      console.log('   Code:', schemaError.code);
      console.log('   Details:', schemaError.details);
      console.log('   Hint:', schemaError.hint);
      return;
    }
    console.log('✅ Domains table accessible');

    // Test 3: Check what columns exist in domains table
    console.log('\n3️⃣ Checking domains table columns...');
    const testDomain = {
      domain: 'test-schema-check.com',
      project_id: 'eeea1aeb-1cb8-4559-976c-a0816f75feca', // Valid UUID
      status: 'pending',
      ssl_enabled: false,
      dns_records: { test: 'data' },
      verification_token: 'test-token'
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('domains')
      .insert(testDomain)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.log('   Code:', insertError.code);
      console.log('   Message:', insertError.message);
      console.log('   Details:', insertError.details);
      console.log('   Hint:', insertError.hint);
      
      // Try to understand what columns are expected
      if (insertError.message?.includes('column')) {
        console.log('\n🔍 This might be a column mismatch issue');
      }
    } else {
      console.log('✅ Insert test successful');
      console.log('   Created domain:', insertTest);
      
      // Clean up test data
      await supabase.from('domains').delete().eq('id', insertTest.id);
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabase();
