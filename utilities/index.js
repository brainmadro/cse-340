const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.buildInvDetails = async function (data) {
  const v = data[0];
  const priceAmount = new Intl.NumberFormat("en-US").format(v.inv_price);
  const miles = new Intl.NumberFormat("en-US").format(v.inv_miles);
  let details = '<div class="vehicle-detail">';

  details += '<div class="vehicle-detail-image">';
  details +=
    '<img src="' +
    v.inv_image +
    '" alt="' +
    v.inv_year +
    " " +
    v.inv_make +
    " " +
    v.inv_model +
    '">';
  details += "</div>";

  details += '<div class="vehicle-detail-info">';
  details += '<div class="detail-header">';
  details +=
    '<h1 class="detail-title">' +
    v.inv_year +
    " " +
    v.inv_make +
    " " +
    v.inv_model +
    "</h1>";
  details +=
    '<span class="detail-price">$' +
    priceAmount +
    '<sup class="price-cents">.00</sup></span>';
  details += "</div>";
  details += '<ul class="detail-specs">';
  details +=
    '<li><span class="detail-label">Make</span><span class="detail-value">' +
    v.inv_make +
    "</span></li>";
  details +=
    '<li><span class="detail-label">Model</span><span class="detail-value">' +
    v.inv_model +
    "</span></li>";
  details +=
    '<li><span class="detail-label">Year</span><span class="detail-value">' +
    v.inv_year +
    "</span></li>";
  details +=
    '<li><span class="detail-label">Color</span><span class="detail-value">' +
    v.inv_color +
    "</span></li>";
  details +=
    '<li><span class="detail-label">Mileage</span><span class="detail-value">' +
    miles +
    " mi</span></li>";
  details += "</ul>";
  if (v.inv_description) {
    details += '<p class="detail-description">' + v.inv_description + "</p>";
  }
  details += '<button class="own-today-btn">Own Today</button>';
  details += "</div>";

  details += "</div>";
  return details;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
