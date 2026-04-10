const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
 * Return account data using account_id
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* *****************************
 * Update account firstname, lastname and email
 * ***************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateAccount error: " + error)
  }
}

/* *****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_password, account_id) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const data = await pool.query(sql, [account_password, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("updatePassword error: " + error)
  }
}

/* *****************************
 * Get all accounts
 * ***************************** */
async function getAllAccounts() {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, created_date FROM account ORDER BY account_lastname, account_firstname'
    )
    return result.rows
  } catch (error) {
    console.error("getAllAccounts error: " + error)
  }
}

/* *****************************
 * Admin create account (any type)
 * ***************************** */
async function adminCreateAccount(account_firstname, account_lastname, account_email, account_password, account_type) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5) RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password, account_type])
  } catch (error) {
    console.error("adminCreateAccount error: " + error)
  }
}

/* *****************************
 * Admin update account (all fields including type)
 * ***************************** */
async function adminUpdateAccount(account_firstname, account_lastname, account_email, account_type, account_id) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3, account_type = $4 WHERE account_id = $5 RETURNING *"
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_type, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("adminUpdateAccount error: " + error)
  }
}

/* *****************************
 * Admin delete account
 * ***************************** */
async function adminDeleteAccount(account_id) {
  try {
    const data = await pool.query("DELETE FROM account WHERE account_id = $1 RETURNING *", [account_id])
    return data.rowCount
  } catch (error) {
    console.error("adminDeleteAccount error: " + error)
  }
}

module.exports = { registerAccount, getAccountByEmail, checkExistingEmail, getAccountById, updateAccount, updatePassword, getAllAccounts, adminCreateAccount, adminUpdateAccount, adminDeleteAccount }