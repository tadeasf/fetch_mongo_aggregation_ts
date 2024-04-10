import { MongoClient } from "mongodb";
import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function main() {
  try {
    const uri = await askQuestion("Enter MongoDB URI: ");
    const client = new MongoClient(uri);
    await client.connect();

    const dbName = await askQuestion("Enter the database name: ");
    const db = client.db(dbName);

    const collectionName = await askQuestion("Enter the collection name: ");

    const pipelinePath = await askQuestion("Enter the path to the aggregation pipeline JSON file: ");
    const pipeline = JSON.parse(fs.readFileSync(pipelinePath, 'utf8'));

    const results = await db.collection(collectionName).aggregate(pipeline).toArray();
    
    const outputPath = path.join(__dirname, `/data/output_${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`Aggregation results written to ${outputPath}`);

    client.close();
    rl.close();
  } catch (error) {
    console.error("Error occurred:", error);
    rl.close();
    process.exit(1);
  }
}

main();
