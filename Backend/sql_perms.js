import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  const res = await client.query(`SELECT permissions FROM roles WHERE name = 'SCHOOL_ADMIN'`);
  console.log("SCHOOL_ADMIN permissions:", res.rows[0].permissions);
  const permissions = res.rows[0].permissions;
  
  if (!permissions.includes('CREATE_STAFF')) {
     console.log('Adding STAFF permissions...');
     permissions.push('GET_STAFF', 'CREATE_STAFF', 'EDIT_STAFF', 'DELETE_STAFF');
     await client.query(`UPDATE roles SET permissions = $1 WHERE name = 'SCHOOL_ADMIN'`, [permissions]);
     console.log('Staff permissions added to SCHOOL_ADMIN');
  } else {
     console.log('SCHOOL_ADMIN already has STAFF permissions.');
  }

  const superAdminRes = await client.query(`SELECT permissions FROM roles WHERE name = 'SUPER_ADMIN'`);
  const superAdminPerms = superAdminRes.rows[0].permissions;
  if (!superAdminPerms.includes('CREATE_STAFF')) {
    superAdminPerms.push('GET_STAFF', 'CREATE_STAFF', 'EDIT_STAFF', 'DELETE_STAFF');
    await client.query(`UPDATE roles SET permissions = $1 WHERE name = 'SUPER_ADMIN'`, [superAdminPerms]);
    console.log('Staff permissions added to SUPER_ADMIN');
  }

  await client.end();
}
main().catch(console.error);
