const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
// const cron = require("node-cron");
const schedule = require("node-schedule");

const HTTPError = require("../errorMessage");
const user = require("../routes/users");
const config = require("../config/default.json");
const email = require("../model/email");

const smtpConfig = {
  host: config.aws_ses.host,
  port: config.aws_ses.port,
  auth: {
    user: config.aws_ses.smtp_user,
    pass: config.aws_ses.smtp_password,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);
const sendMail = (mailOptions) => {
  new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      } else {
        console.log("email reminder send");
        return resolve(info);
      }
    });
  });
};

router.route("/").post(async (req, res) => {
  try {
    const reminder_email = req.body.reminder_email;
    const reminder_name = req.body.reminder_name;
    const description = req.body.description;
    const scheduled_time = req.body.scheduled_time;

    if (!reminder_email) throw new HTTPError(400, "Reminder email missing");
    if (!reminder_name) throw new HTTPError(400, "Reminder name missing");
    if (!description) throw new HTTPError(400, "description missing");
    if (!scheduled_time) throw new HTTPError(400, "date missing");

    const newReminder = new email({
      reminder_email,
      reminder_name,
      description,
      scheduled_time,
    });

    newReminder.save(() => {
      res.status(200).json({ status: "ok" });
      const date = new Date(scheduled_time);
      schedule.scheduleJob(date, () => {
        const mailOptions = {
          from: `"${config.aws_ses.from_name}" <${config.aws_ses.from_email}>`,
          to: newReminder.reminder_email,
          subject: newReminder.reminder_name,
          text: description,
        };
        sendMail(mailOptions);
      });
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({ status: "error", message: err.message });
  }
});

router.route("/update-reminder/:id").put(async (req, res) => {
  try {
    const id = req.params.id;
    const rem_object = await email.findOne({ _id: id });

    const reminder_name = req.body.reminder_name;
    const scheduled_time = req.body.scheduled_time;
    const description = req.body.description;
    const reminder_email = req.body.reminder_email;

    if (!rem_object) throw new HTTPError(404, "invlid data");
    else {
      rem_object.reminder_name = reminder_name;
      rem_object.scheduled_time = scheduled_time;
      rem_object.description = description;
      rem_object.reminder_email = reminder_email;

      rem_object.save((err, updateObj) => {
        if (err) {
          console.log(err);
          res.status(500).send();
        } else {
          res.send(updateObj);
        }
      });
    }
  } catch (err) {
    return res.status(err.statusCode || 400).json({ status: "error", message: err.message });
  }
});

router.route("/:id").delete(async (req, res) => {
  const id = req.params.id;
  try {
    const result = await email.findByIdAndDelete(id);
    // res.send(result);
    if (!result) throw new HTTPError(404, "invalid id");
    else {
      return res.status(200).json({ status: "deleted", result });
    }
  } catch (err) {
    return res.status(err.statusCode || 400).json({ status: "error", message: err.message });
  }
});

module.exports = router;
