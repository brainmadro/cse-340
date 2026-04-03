const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getCarByInventoryId(inventory_id)
  const details = await utilities.buildInvDetails(data)
  let nav = await utilities.getNav()
  res.render("./inventory/detail", {
    title: data[0].inv_make + " " + data[0].inv_model,
    nav,
    details,
  })
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  })
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
  })
}

invCont.addInventory = async function (req, res, next) {
  const body = req.body
  if (!body.inv_image) body.inv_image = "/images/vehicles/no-image.png"
  if (!body.inv_thumbnail) body.inv_thumbnail = "/images/vehicles/no-image-tn.png"
  const result = await invModel.addInventory(body)
  if (result.rowCount) {
    req.flash("notice", `The ${body.inv_year} ${body.inv_make} ${body.inv_model} was successfully added.`)
    let nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the vehicle could not be added.")
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(body.classification_id)
    res.status(501).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      ...body,
    })
  }
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  if (result.rowCount) {
    req.flash("notice", `The "${classification_name}" classification was successfully added.`)
    let nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the classification could not be added.")
    let nav = await utilities.getNav()
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    })
  }
}

invCont.triggerError = async function(req, res, next) {
  const error = new Error("Intentional 500 Error - This is a test of the error handling process.")
  error.status = 500
  next(error)
}

module.exports = invCont