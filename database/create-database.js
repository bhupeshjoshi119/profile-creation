const readline = require('readline');
const mysql = require('mysql2/promise');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createDatabase() {
  console.log('\n=== MySQL Database Setup ===\n');
  
  try {
    // Get MySQL credentials
    const host = await question('MySQL Host (default: localhost): ') || 'localhost';
    const port = await question('MySQL Port (default: 3306): ') || '3306';
    const user = await question('MySQL User (default: root): ') || 'root';
    const password = await question('MySQL Password: ');
    
    console.log('\nConnecting to MySQL...');
    
    // Create connection without database
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password
    });
    
    console.log('✓ Connected to MySQL\n');
    
    // Create database
    console.log('Creating database auth_db...');
    await connection.query(
      'CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    console.log('✓ Database auth_db created\n');
    
    // Ask about creating dedicated user
    const createUser = await question('Create dedicated MySQL user "auth_user"? (y/N): ');
    
    let dbUser = user;
    let dbPassword = password;
    
    if (createUser.toLowerCase() === 'y') {
      const authPassword = await question('Password for auth_user: ');
      
      await connection.query(
        `CREATE USER IF NOT EXISTS 'auth_user'@'localhost' IDENTIFIED BY '${authPassword}'`
      );
      await connection.query(
        `GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost'`
      );
      await connection.query('FLUSH PRIVILEGES');
      
      console.log('✓ User auth_user created\n');
      
      dbUser = 'auth_user';
      dbPassword = authPassword;
    }
    
    await connection.end();
    
    // Update .env file
    console.log('=== Update your .env file with: ===\n');
    console.log(`DB_HOST=${host}`);
    console.log(`DB_PORT=${port}`);
    console.log(`DB_USER=${dbUser}`);
    console.log(`DB_PASSWORD=${dbPassword}`);
    console.log(`DB_NAME=auth_db\n`);
    
    // Ask about running migrations
    const runMigrations = await question('Run database migrations now? (Y/n): ');
    
    if (runMigrations.toLowerCase() !== 'n') {
      console.log('\nRunning migrations...\n');
      
      // Set environment variables for migration
      process.env.DB_HOST = host;
      process.env.DB_PORT = port;
      process.env.DB_USER = dbUser;
      process.env.DB_PASSWORD = dbPassword;
      process.env.DB_NAME = 'auth_db';
      
      // Run migrations
      const { exec } = require('child_process');
      exec('node database/migrate.js', (error, stdout, stderr) => {
        if (error) {
          console.error('✗ Migration failed:', error.message);
          rl.close();
          process.exit(1);
        }
        console.log(stdout);
        if (stderr) console.error(stderr);
        
        console.log('\n=== Setup Complete! ===\n');
        console.log('Next steps:');
        console.log('1. Update your .env file with the credentials shown above');
        console.log('2. Run: npm run dev');
        console.log('3. Test: ./test-api.sh\n');
        
        rl.close();
      });
    } else {
      console.log('\n=== Setup Complete! ===\n');
      console.log('Next steps:');
      console.log('1. Update your .env file with the credentials shown above');
      console.log('2. Run: node database/migrate.js');
      console.log('3. Run: npm run dev');
      console.log('4. Test: ./test-api.sh\n');
      
      rl.close();
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

createDatabase();
