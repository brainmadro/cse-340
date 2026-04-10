const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/admin", utilities.checkAdmin, utilities.handleErrors(accountController.buildAdminManagement))
router.get("/create", utilities.checkAdmin, utilities.handleErrors(accountController.buildAdminCreate))
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get("/edit/:account_id", utilities.checkAdmin, utilities.handleErrors(accountController.buildAdminEdit))
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount));
router.get("/logout", accountController.accountLogout);
router.post("/delete", utilities.checkAdmin, utilities.handleErrors(accountController.adminDeleteAccount))
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
router.post(
  "/update/",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)
router.post(
  "/update-password/",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)
router.post(
  "/create",
  utilities.checkAdmin,
  regValidate.adminAccountRules(),
  regValidate.adminPasswordRules(),
  regValidate.checkAdminAccountData,
  utilities.handleErrors(accountController.adminCreateAccount)
)
router.post(
  "/edit",
  utilities.checkAdmin,
  regValidate.adminAccountRules(),
  regValidate.checkAdminAccountData,
  utilities.handleErrors(accountController.adminEditAccount)
)

module.exports = router;