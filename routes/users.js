var express = require("express");
var router = express.Router();

const Users = require("../model/user");

router.route("/signup").post(async (req, res) => {
  try {
    if (!req.body) throw new HTTPError(400, "Post data invalid");

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    if (!email) throw new HTTPError(400, "Email not found");

    const re = /^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const validEmail = re.test(email);
    if (!validEmail) throw new HTTPError(400, "Email Invalid");

    if (!password) throw new HTTPError(400, "Password not found");
    if (password.length < 6 || password.length > 32) throw new HTTPError(400, "Password invalid");

    if (!name) throw new HTTPError(400, "Name is required while sign up");

    const generateRandomNumber = (length) => {
      const arr = [];
      while (arr.length < length) {
        const randomNumber = Math.floor(Math.random() * 9) + 1;
        if (arr.indexOf(randomNumber) > -1) continue;
        arr[arr.length] = randomNumber;
      }
      return arr.join("");
    };

    const email_verification_code = generateRandomNumber(6);

    const newUser = new Users({
      email,
      name,
      password,
      is_logged_in: false,
      email_confirmed: false,
      email_verification_code,
    });

    const existingUser = await Users.findOne({ email });
    if (existingUser) throw new HTTPError(400, "Email already in use");
    else {
      newUser.save(() => {
        res.status(200).json({ status: "ok" });
      });
    }
  } catch (err) {
    return res.status(err.statusCode || 400).json({ status: "error", message: err.message });
  }
});

module.exports = router;
