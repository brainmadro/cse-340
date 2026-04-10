const utilities = require(".");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists =
          await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),

    body("account_password_confirm")
      .custom((value, { req }) => {
        if (value !== req.body.account_password) {
          throw new Error("Passwords do not match.")
        }
        return true
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* **********************************
 *  Account Update Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const existingAccount = await accountModel.getAccountByEmail(account_email)
        if (existingAccount && existingAccount.account_id != account_id) {
          throw new Error("Email already in use. Please use a different email.")
        }
      }),
  ];
};

/* ******************************
 * Check account update data and return errors or continue
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* **********************************
 *  Password Update Validation Rules
 * ********************************* */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),

    body("account_password_confirm")
      .custom((value, { req }) => {
        if (value !== req.body.account_password) {
          throw new Error("Passwords do not match.")
        }
        return true
      }),
  ];
};

/* ******************************
 * Check password update data and return errors or continue
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
    return;
  }
  next();
};

/* **********************************
 *  Admin Account Create/Edit Validation Rules
 * ********************************* */
validate.adminAccountRules = () => {
  return [
    body("account_firstname")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim().escape().notEmpty().isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim().isEmail().normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const existingAccount = await accountModel.getAccountByEmail(account_email)
        if (existingAccount && existingAccount.account_id != account_id) {
          throw new Error("Email already in use.")
        }
      }),

    body("account_type")
      .isIn(["Client", "Employee", "Admin"])
      .withMessage("Please select a valid account type."),
  ];
};

/* **********************************
 *  Admin Create Account Password Rules
 * ********************************* */
validate.adminPasswordRules = () => {
  return [
    body("account_password")
      .trim().notEmpty()
      .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
      .withMessage("Password does not meet requirements."),

    body("account_password_confirm")
      .custom((value, { req }) => {
        if (value !== req.body.account_password) throw new Error("Passwords do not match.")
        return true
      }),
  ];
};

/* ******************************
 * Check admin account data
 * ***************************** */
validate.checkAdminAccountData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_type, account_id } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const view = account_id ? "account/admin-edit" : "account/admin-create"
    const title = account_id ? "Edit Account" : "Create Account"
    res.render(view, { title, nav, errors, account_id, account_firstname, account_lastname, account_email, account_type });
    return;
  }
  next();
};

module.exports = validate;
