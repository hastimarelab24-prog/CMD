
const readline = require("readline");
const bcrypt = require("bcryptjs");
const AuthUser = require("./models/AuthUser");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function resetPassword() {
  try {
    await AuthUser.db.asPromise();

    console.log("Connected database:", AuthUser.db.name);

    if (AuthUser.db.name !== "crm_auth_db") {
      throw new Error(
        "Wrong database. Expected crm_auth_db. No changes made."
      );
    }

    const email = (await ask("Admin email: "))
      .trim()
      .toLowerCase();

    const password = await ask("Enter new password (8+ characters): ");

    if (!email || password.length < 8) {
      throw new Error("Enter a valid email and a password of at least 8 characters.");
    }

    const user = await AuthUser.findOne({ email });

    if (!user) {
      throw new Error("User not found in crm_auth_db.");
    }

    if (user.role !== "administrator") {
      throw new Error(
        "This account is not an administrator. Password was not changed."
      );
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    console.log("Password reset successful.");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await AuthUser.db.close();
  }
}

resetPassword();
