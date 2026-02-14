import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';

const password = crypto.randomBytes(8).toString('hex');
const hash = bcrypt.hashSync(password, 10);
const defaultHash = bcrypt.hashSync('password123', 10); // Standard bcrypt hash

const output = `Random Password: ${password}\nRandom Hash: ${hash}\nDefault Hash (password123): ${defaultHash}`;

fs.writeFileSync('password.txt', output);
console.log('Password generated in password.txt');
