import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { pathToFileURL } from 'url';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/one_janitorial';

async function runBackup() {
  console.log("=========================================");
  console.log("    ONE JANITORIAL SECURE DB BACKUP");
  console.log("=========================================\n");

  try {
    // Connect to database
    console.log(`Connecting to MongoDB at: ${MONGO_URI.replace(/:([^:@]+)@/, ':****@')}...`);
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connection successful.\n");

    // Generate folder
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const runDir = path.join(BACKUP_DIR, `backup_${timestamp}`);
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
    fs.mkdirSync(runDir);

    console.log(`Created backup container: ${runDir}`);

    // Retrieve active collections/models registered on mongoose
    const modelsList = mongoose.modelNames();
    console.log(`Discovered ${modelsList.length} database collections to back up.\n`);

    for (const name of modelsList) {
      const Model = mongoose.model(name);
      console.log(`Processing collection: ${name}...`);

      const docs = await Model.find({}).lean();
      const filePath = path.join(runDir, `${name}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
      console.log(`   ✓ Exported ${docs.length} documents to: ${name}.json`);
    }

    console.log("\n=========================================");
    console.log("   DATABASE BACKUP COMPLETED SUCCESSFULLY");
    console.log(`   Destination: ${runDir}`);
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Backup operation crashed:", error.message);
    process.exit(1);
  }
}

// Make sure mongoose knows all the models before dump
async function registerAllModelsAndBackup() {
  // Read models directory to register them
  const modelsDir = path.join(process.cwd(), 'src', 'models');
  if (fs.existsSync(modelsDir)) {
    const files = fs.readdirSync(modelsDir);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const fullPath = path.join(modelsDir, file);
        await import(pathToFileURL(fullPath).href);
      }
    }
  }
  await runBackup();
}

registerAllModelsAndBackup();
