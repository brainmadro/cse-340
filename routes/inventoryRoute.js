const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// No auth required
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

// Employee or Admin only
router.get("/", utilities.checkAuthorization, utilities.handleErrors(invController.buildManagement));
router.get("/add-inventory", utilities.checkAuthorization, utilities.handleErrors(invController.buildAddInventory));
router.get("/add-classification", utilities.checkAuthorization, utilities.handleErrors(invController.buildAddClassification));
router.get("/edit/:inventory_id", utilities.checkAuthorization, utilities.handleErrors(invController.buildEditInventory));
router.get("/delete/:inventory_id", utilities.checkAuthorization, utilities.handleErrors(invController.buildDeleteInventory));
router.get("/getInventory/:classification_id", utilities.checkAuthorization, utilities.handleErrors(invController.getInventoryJSON));

router.post("/update/",
  utilities.checkAuthorization,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)
router.post("/delete/",
  utilities.checkAuthorization,
  utilities.handleErrors(invController.deleteInventory)
)
router.post(
  "/add-inventory",
  utilities.checkAuthorization,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);
router.post(
  "/add-classification",
  utilities.checkAuthorization,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

module.exports = router;