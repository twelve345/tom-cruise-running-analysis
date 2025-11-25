const fs = require('fs');
const path = require('path');
const { printSchema } = require('graphql');
const schema = require('../graphql/schema');

const outputPath = path.join(__dirname, '../../frontend/schema.graphql');

try {
  const schemaString = printSchema(schema);
  fs.writeFileSync(outputPath, schemaString);
  console.log('✅ Schema exported to frontend/schema.graphql');
} catch (error) {
  console.error('❌ Error exporting schema:', error.message);
  process.exit(1);
}
