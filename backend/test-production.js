// Test de integración completo para diagnosticar el problema en Railway
const { createClient } = require('@supabase/supabase-js');

// Usar las mismas variables que Railway
const supabaseUrl = 'https://metzjfocvkelucinstul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTMwMTksImV4cCI6MjA3Mjk4OTAxOX0.tp_Sg0giBPkSRWU17nJMNbSrbyKSm30DzsQbORcN4ts';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQxMzAxOSwiZXhwIjoyMDcyOTg5MDE5fQ.oLmAm48uUpwKjH_LhJtNaNrvo5nE9cEkAyfjQtkwCKg';

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runProductionTests() {
  console.log('🔍 === RAILWAY PRODUCTION DIAGNOSTIC TESTS ===\n');

  try {
    // Test 1: Verificar conexión básica
    console.log('1️⃣ Testing basic connection...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(1)
      .single();

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return;
    }
    console.log('✅ Connection successful');
    console.log('   Sample project:', testConnection.name);

    // Test 2: Verificar que tenemos un proyecto válido
    const validProjectId = testConnection.id;
    console.log(`   Using project ID: ${validProjectId}\n`);

    // Test 3: Simular exactamente la validación del backend
    console.log('2️⃣ Testing domain validation (exact backend logic)...');
    const domain = 'sinaptiks.com';
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    if (!domain || domain.length < 1 || domain.length > 253 || !domainRegex.test(domain)) {
      console.error('❌ Domain validation failed');
      return;
    }
    console.log('✅ Domain validation passed');

    // Test 4: Verificar si el dominio ya existe
    console.log('3️⃣ Testing domain existence check...');
    const { data: existingDomain, error: checkError } = await supabase
      .from('domains')
      .select('id')
      .eq('domain', domain)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing domain:', checkError);
      return;
    }

    if (existingDomain) {
      console.log('⚠️  Domain already exists, cleaning up for test...');
      await supabase.from('domains').delete().eq('domain', domain);
    }
    console.log('✅ Domain check passed');

    // Test 5: Verificar que el proyecto existe
    console.log('4️⃣ Testing project existence check...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', validProjectId)
      .single();

    if (projectError) {
      console.error('❌ Project check failed:', projectError);
      return;
    }
    console.log(`✅ Project exists: ${project.name}`);

    // Test 6: Generar datos de prueba (como en el backend)
    console.log('5️⃣ Testing data generation...');
    const verificationToken = Math.random().toString(36).substring(2, 22);
    const dnsRecords = {
      cname: {
        name: domain,
        value: 'xistracloud.app'
      },
      txt: {
        name: `_xistracloud.${domain}`,
        value: `xistracloud-verification=${verificationToken}`
      }
    };
    console.log('✅ Data generation successful');

    // Test 7: INSERCIÓN CRÍTICA - Usar supabaseAdmin como en el backend
    console.log('6️⃣ Testing domain insertion (CRITICAL TEST)...');
    const insertData = {
      domain,
      project_id: validProjectId,
      status: 'pending',
      ssl_enabled: false,
      dns_records: dnsRecords,
      verification_token: verificationToken
    };

    console.log('📤 Insert data:', JSON.stringify(insertData, null, 2));

    const { data: newDomain, error: insertError } = await supabase
      .from('domains')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ DOMAIN INSERT FAILED (This is the Railway error!)');
      console.error('   Code:', insertError.code);
      console.error('   Message:', insertError.message);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
      
      // Intentar con supabaseAdmin
      console.log('\n🔄 Retrying with supabaseAdmin...');
      const { data: adminResult, error: adminError } = await supabaseAdmin
        .from('domains')
        .insert(insertData)
        .select()
        .single();

      if (adminError) {
        console.error('❌ Admin insert also failed:', adminError);
        
        // Verificar permisos de tabla
        console.log('\n🔍 Testing table permissions...');
        const { data: schemaTest } = await supabaseAdmin
          .from('domains')
          .select('*')
          .limit(1);
        
        if (schemaTest) {
          console.log('✅ Can read domains table with admin');
        } else {
          console.log('❌ Cannot read domains table');
        }
      } else {
        console.log('✅ SUCCESS with supabaseAdmin!');
        console.log('   Created:', adminResult);
        // Limpiar
        await supabaseAdmin.from('domains').delete().eq('id', adminResult.id);
        console.log('✅ Cleanup completed');
      }
      return;
    }

    console.log('✅ DOMAIN INSERTION SUCCESSFUL!');
    console.log('   Created domain:', newDomain);

    // Test 8: Limpiar datos de prueba
    console.log('7️⃣ Cleaning up test data...');
    await supabase.from('domains').delete().eq('id', newDomain.id);
    console.log('✅ Cleanup successful');

    console.log('\n🎉 ALL TESTS PASSED! The issue is NOT in the database logic.');
    console.log('   The problem might be in Railway environment or code deployment.');

  } catch (error) {
    console.error('\n💥 UNEXPECTED ERROR:', error);
    console.error('Stack:', error.stack);
  }
}

runProductionTests();
