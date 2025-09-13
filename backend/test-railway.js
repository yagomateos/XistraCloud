// Test para diagnosticar el problema exacto de Railway
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const RAILWAY_SUPABASE_URL = 'https://metzjfocvkelucinstul.supabase.co';
const RAILWAY_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTMwMTksImV4cCI6MjA3Mjk4OTAxOX0.tp_Sg0giBPkSRWU17nJMNbSrbyKSm30DzsQbORcN4ts';
const RAILWAY_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQxMzAxOSwiZXhwIjoyMDcyOTg5MDE5fQ.oLmAm48uUpwKjH_LhJtNaNrvo5nE9cEkAyfjQtkwCKg';

async function testRailwaySimulation() {
  console.log('🚂 === RAILWAY SIMULATION TEST ===\n');

  // Test 1: Verificar configuración exacta de Railway
  console.log('1️⃣ Testing Railway configuration...');
  const supabase = createClient(RAILWAY_SUPABASE_URL, RAILWAY_SERVICE_KEY);
  
  try {
    // Test básico de conexión
    const { data: testConnection, error: connError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(1);

    if (connError) {
      console.error('❌ Connection failed:', connError);
      return;
    }
    console.log('✅ Railway Supabase connection OK');
    console.log('   Sample project:', testConnection[0]?.name);

    // Test 2: Simular exactamente la creación de dominio de Railway
    console.log('\n2️⃣ Simulating exact Railway domain creation...');
    
    const testProjectId = testConnection[0]?.id;
    const testDomain = `railway-test-${Date.now()}.com`;
    
    // Simular la lógica exacta del backend
    console.log('🔍 Validating domain format...');
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    if (!domainRegex.test(testDomain)) {
      console.error('❌ Domain validation failed');
      return;
    }
    console.log('✅ Domain format valid');

    // Check domain exists
    console.log('🔍 Checking if domain already exists...');
    const { data: existingDomain, error: checkError } = await supabase
      .from('domains')
      .select('id')
      .eq('domain', testDomain)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing domain:', checkError);
      return;
    }
    
    if (existingDomain) {
      console.log('❌ Domain already exists');
      return;
    }
    console.log('✅ Domain does not exist');

    // Verify project exists
    console.log('🔍 Verifying project exists...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', testProjectId)
      .single();

    if (projectError) {
      console.error('❌ Error finding project:', projectError);
      return;
    }
    console.log('✅ Project found:', project.name);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 22);
    
    // Create DNS records
    const dnsRecords = {
      cname: { name: testDomain, value: 'xistracloud.app' },
      txt: { name: `_xistracloud.${testDomain}`, value: `xistracloud-verification=${verificationToken}` }
    };

    // INSERT TEST - This is where Railway might be failing
    console.log('🔍 Attempting database insert...');
    console.log('   Domain:', testDomain);
    console.log('   Project ID:', testProjectId);
    console.log('   Token:', verificationToken);
    
    const { data: newDomain, error: insertError } = await supabase
      .from('domains')
      .insert({
        domain: testDomain,
        project_id: testProjectId,
        status: 'pending',
        ssl_enabled: false,
        dns_records: dnsRecords,
        verification_token: verificationToken
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ INSERT FAILED - THIS IS THE RAILWAY PROBLEM!');
      console.error('   Code:', insertError.code);
      console.error('   Message:', insertError.message);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
      
      // Diagnose the specific issue
      if (insertError.code === '22P02') {
        console.error('🔍 UUID FORMAT ERROR - Project ID format issue');
      } else if (insertError.code === '23503') {
        console.error('🔍 FOREIGN KEY ERROR - Project does not exist or wrong reference');
      } else if (insertError.code === '23505') {
        console.error('🔍 UNIQUE CONSTRAINT ERROR - Domain already exists');
      }
      
      return;
    }

    console.log('✅ SUCCESS! Domain created:', newDomain.id);
    console.log('   Full domain object:', JSON.stringify(newDomain, null, 2));
    
    // Cleanup
    await supabase.from('domains').delete().eq('id', newDomain.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 === RAILWAY SIMULATION PASSED ===');
    console.log('The Railway environment should work perfectly!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Test 3: Probar con datos inválidos para confirmar validaciones
async function testErrorCases() {
  console.log('\n3️⃣ Testing error cases...');
  const supabase = createClient(RAILWAY_SUPABASE_URL, RAILWAY_SERVICE_KEY);
  
  // Test con UUID inválido
  try {
    const { data, error } = await supabase
      .from('domains')
      .insert({
        domain: 'error-test.com',
        project_id: 'invalid-uuid-format',
        status: 'pending',
        ssl_enabled: false
      })
      .select()
      .single();
      
    if (error) {
      console.log('✅ Correctly caught invalid UUID:', error.code);
    }
  } catch (e) {
    console.log('✅ Invalid UUID test passed');
  }
}

testRailwaySimulation().then(() => {
  testErrorCases();
});
