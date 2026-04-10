require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account update view
 * ************************************ */
async function buildUpdateAccount(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)
  if (updateResult) {
    const accountData = await accountModel.getAccountById(account_id)
    delete accountData.account_password
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    req.flash("notice", "Your account has been successfully updated.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 *  Process password change
 * ************************************ */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
  if (updateResult) {
    req.flash("notice", "Your password has been successfully changed.")
    res.redirect("/account/")
  } else {
    const accountData = await accountModel.getAccountById(account_id)
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
function accountLogout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}

/* ****************************************
 *  Deliver admin account management view
 * ************************************ */
async function buildAdminManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accounts = await accountModel.getAllAccounts()
  res.render("account/admin", { title: "Account Management", nav, accounts, errors: null })
}

/* ****************************************
 *  Deliver admin create account view
 * ************************************ */
async function buildAdminCreate(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/admin-create", { title: "Create Account", nav, errors: null })
}

/* ****************************************
 *  Process admin create account
 * ************************************ */
async function adminCreateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password, account_type } = req.body
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/admin-create", { title: "Create Account", nav, errors: null })
  }
  const result = await accountModel.adminCreateAccount(account_firstname, account_lastname, account_email, hashedPassword, account_type)
  if (result) {
    req.flash("notice", `Account for ${account_firstname} ${account_lastname} was successfully created.`)
    res.redirect("/account/admin")
  } else {
    req.flash("notice", "Sorry, the account could not be created.")
    res.status(501).render("account/admin-create", { title: "Create Account", nav, errors: null, account_firstname, account_lastname, account_email, account_type })
  }
}

/* ****************************************
 *  Deliver admin edit account view
 * ************************************ */
async function buildAdminEdit(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/admin")
  }
  res.render("account/admin-edit", {
    title: "Edit Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type,
  })
}

/* ****************************************
 *  Process admin edit account
 * ************************************ */
async function adminEditAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_type, account_id } = req.body
  const result = await accountModel.adminUpdateAccount(account_firstname, account_lastname, account_email, account_type, account_id)
  if (result) {
    req.flash("notice", `${result.account_firstname} ${result.account_lastname}'s account was successfully updated.`)
    res.redirect("/account/admin")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/admin-edit", { title: "Edit Account", nav, errors: null, account_id, account_firstname, account_lastname, account_email, account_type })
  }
}

/* ****************************************
 *  Process admin delete account
 * ************************************ */
async function adminDeleteAccount(req, res, next) {
  const account_id = parseInt(req.body.account_id)
  const result = await accountModel.adminDeleteAccount(account_id)
  if (result) {
    req.flash("notice", "The account was successfully deleted.")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
  }
  res.redirect("/account/admin")
}

module.exports = { buildAccountManagement, buildLogin, buildRegister, registerAccount, accountLogin, buildUpdateAccount, updateAccount, updatePassword, accountLogout, buildAdminManagement, buildAdminCreate, adminCreateAccount, buildAdminEdit, adminEditAccount, adminDeleteAccount }