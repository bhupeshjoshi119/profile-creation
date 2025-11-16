For Node.js v22.19.0, you'll use one of these packages:

npm install mysql2
# or
npm install @mysql/xdevapi
The npm install @mysql/xdevapi command is used to install the official MySQL Connector/Node.js package, which provides an API for interacting with MySQL databases using the X DevAPI and X Protocol.

The mysql2 package supports:

MySQL 5.5+
MySQL 8.0+
MariaDB 10.x
My Recommendation
Install MySQL 8.0.35+ or MySQL 8.4.x - these are the sweet spot for:

Modern features
Performance optimization
Long-term support
Full compatibility with Node.js v22.19.0
No issues with the mysql2 driver
Your Angular 17 frontend will communicate with your Node.js backend via REST APIs, so the MySQL version won't affect it directly.