const express = require("express");
const router = express.Router();

const {
  getIndexPage,
  getToolsPage,
  getAuthorGitaPage,
  getAuthorJuliePage,
  getEventsPage,
  getInfoPage,
  getTOSPage,
  getPolicyPage,
  getSubscription,
  getCalendarPage,
  requestEvent,
} = require("../controllers/homeController");

const {
  subscriptionInputValidator,
  eventInputValidator,
} = require("../middlewares/inputValidators");

router.route("/").get(getIndexPage);

router.route("/author/gita_pattison").get(getAuthorGitaPage);
router.route("/author/julie_mandal").get(getAuthorJuliePage);

router.route("/tools").get(getToolsPage);

router
  .route("/events")
  .get(getEventsPage)
  .post(eventInputValidator, requestEvent);

router.route("/calendar").get(getCalendarPage);

router.route("/TOS").get(getTOSPage);

router.route("/policy").get(getPolicyPage);

router.route("/subscribe").post(subscriptionInputValidator, getSubscription);

router.route("/book-info").get(getInfoPage);

module.exports = router;
