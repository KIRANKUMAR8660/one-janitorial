import mongoose from 'mongoose';
import { encrypt, decrypt } from './src/utils/crypto.js';
import Integration from './src/models/Integration.js';
import Secret from './src/models/Secret.js';
import IntegrationAudit from './src/models/IntegrationAudit.js';

async function runTests() {
  console.log("=========================================");
  console.log("   ONE JANITORIAL FINAL INTEGRATION TEST");
  console.log("=========================================\n");

  try {
    // 1. Connect DB
    console.log("1. Connecting to MongoDB database...");
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/one_janitorial');
    console.log("   ✓ Database connection successful.");

    // 2. Encryption test
    console.log("\n2. Testing AES-256-CBC Cryptographic Vault encryption/decryption...");
    const sampleApiKey = "na2-d5c6-fe34-4f1e-bf06-98afe0d3ccfb";
    const encrypted = encrypt(sampleApiKey);
    
    if (!encrypted.value || !encrypted.iv) {
      throw new Error("Encryption failed: encrypted value or IV is empty.");
    }
    console.log(`   ✓ Encryption successful. IV: ${encrypted.iv}`);
    
    const decrypted = decrypt(encrypted.value, encrypted.iv);
    if (decrypted !== sampleApiKey) {
      throw new Error(`Decryption failed: expected '${sampleApiKey}', but got '${decrypted}'`);
    }
    console.log("   ✓ Decryption successful. Plaintext credential matches perfectly.");

    // 3. Models check
    console.log("\n3. Testing model registrations and query capabilities...");
    
    // Check Integrations count
    const integrationsCount = await Integration.countDocuments();
    console.log(`   ✓ Integrations in MongoDB: ${integrationsCount} records found.`);
    
    // Check Vault Secrets count
    const secretsCount = await Secret.countDocuments();
    console.log(`   ✓ Encrypted Secrets in Vault: ${secretsCount} records found.`);

    // Check Audits
    const auditsCount = await IntegrationAudit.countDocuments();
    console.log(`   ✓ Integration Audit entries: ${auditsCount} records found.`);

    // 4. Test environment variable sync check
    console.log("\n4. Testing Vault to environment variable in-memory synchronization...");
    const testSecretKey = "TEST_SERVICE_KEY";
    const testSecretVal = "secure_token_abc123";
    
    const secretEnc = encrypt(testSecretVal);
    let secretDoc = await Secret.findOne({ key: testSecretKey });
    if (!secretDoc) {
      secretDoc = new Secret({
        key: testSecretKey,
        value: secretEnc.value,
        iv: secretEnc.iv,
        category: 'AI Providers'
      });
      await secretDoc.save();
    }
    
    // Load and sync
    const secrets = await Secret.find({});
    let syncSuccess = false;
    secrets.forEach(sec => {
      const dec = decrypt(sec.value, sec.iv);
      process.env[sec.key] = dec;
      if (sec.key === testSecretKey && dec === testSecretVal) {
        syncSuccess = true;
      }
    });

    if (!syncSuccess || process.env[testSecretKey] !== testSecretVal) {
      throw new Error("Vault in-memory synchronization failed.");
    }
    console.log("   ✓ Vault synchronization successful. Environment variable updated in memory.");

    // Cleanup test secret
    await Secret.deleteOne({ key: testSecretKey });
    console.log("   ✓ Cleaned up test vault variables.");

    console.log("\n=========================================");
    console.log("      ALL TESTS PASSED SUCCESSFULLY!     ");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST FAILURE:", error.message);
    process.exit(1);
  }
}

runTests();
