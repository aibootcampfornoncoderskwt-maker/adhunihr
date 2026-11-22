// Creates the CRM_ADMIN_PASSWORD_HASH value for the CRM login. Run locally:
//   node scripts/crm-hash-password.mjs
// Type the password when asked (it is not echoed and never written to disk), then paste the printed value
// into Vercel > Project > Settings > Environment Variables as CRM_ADMIN_PASSWORD_HASH.
import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline';

const N = 16384, r = 8, p = 1;
const hash = password => {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 32, { N, r, p, maxmem: 256 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`;
};

const fromArg = process.argv[2] === '--stdin';
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: !fromArg });
if (!fromArg) {
  const write = rl._writeToOutput?.bind(rl);
  rl._writeToOutput = text => { if (text.includes('Password')) write?.(text); else write?.(''); };
}
rl.question('Password (at least 12 characters): ', password => {
  rl.close();
  if (!fromArg) process.stdout.write('\n');
  if (!password || password.length < 12) { console.error('Use at least 12 characters.'); process.exit(1); }
  console.log(hash(password));
});
