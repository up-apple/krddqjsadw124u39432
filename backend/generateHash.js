const { hashPassword } = require('./cryptoUtils.js');

async function generateAdminHash() {
  try {
    const hash = await hashPassword('admin');
    console.log(hash);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateAdminHash();
