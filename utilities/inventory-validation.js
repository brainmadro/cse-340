const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/* **********************************
 *  Add Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ];
};

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    });
    return;
  }
  next();
};

/* **********************************
 *  Add Inventory Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."),

    body("inv_model")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Please provide a valid 4-digit year."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),

    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide valid mileage."),

    body("inv_color")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a color."),
  ];
};

/* ******************************
 * Check data and return errors or continue to add inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { classification_id } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(classification_id);
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors,
      ...req.body,
    });
    return;
  }
  next();
};

module.exports = validate;
