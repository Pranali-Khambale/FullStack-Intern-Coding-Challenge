const bcrypt = require("bcrypt"); 

async function generateAdminHash() {
  const passwordToHash = "AdminPass!23"; // The password you want to hash

  try {
    const saltRounds = 10; // Use the same salt rounds as your application (usually 10)
    const hashedPassword = await bcrypt.hash(passwordToHash, saltRounds);

    console.log(`\n------------------------------------------------`);
    console.log(`NEW HASH FOR '${passwordToHash}':`);
    console.log(hashedPassword);
    console.log(`------------------------------------------------\n`);
  } catch (error) {
    console.error("Error generating hash:", error);
  }
}


generateAdminHash();
