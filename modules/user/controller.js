import * as userService from "./service.js";
import { nanoid } from "nanoid";
import { User } from "./model.js";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";
import Joi from "joi";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
dotenv.config();
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
sgMail.setApiKey(process.env.SEND_GRID_PASSWORD);
const secret = process.env.SECRET;
const strategyOptions = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(strategyOptions, (payload, done) => {
    User.findOne({ _id: payload.id })
      .then((user) =>
        !user ? done(new Error("User not existing")) : done(null, user)
      )
      .catch(done);
  })
);
export const auth = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user) => {
    const reqToken = req.headers["authorization"]?.slice(7);
    if (!user || err || user.token !== reqToken || user.verify === false) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    next();
  })(req, res, next);
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });
  const { error } = schema.validate({
    email: email,
    password: password,
  });

  if (error) return res.status(400).json(error.details[0].message);
  try {
    const user = await userService.findUserByEmail(email);
    if (!user || !user.validPassword(password)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Incorrect login or password",
        data: "Bad request",
      });
    }

    const payload = {
      id: user.id,
      useremail: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await userService.saveToken(user.id, token);
    res.json({
      status: "success",
      code: 200,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const signup = async (req, res, next) => {
  const { email, password } = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });
  const { error } = schema.validate({
    email: email,
    password: password,
  });

  if (error) return res.status(400).json(error.details[0].message);

  try {
    const user = await userService.findUserByEmail(email);
    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email is already in use",
        data: "Conflict",
      });
    }
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();
    const newUser = await userService.register(
      email,
      password,
      avatarURL,
      verificationToken
    );
    const {
      email: emailRegistered,
      subscription: subscriptionRegistered,
      avatarURL: avatarURLRegistered,
    } = newUser;
    const msg = {
      to: emailRegistered,
      from: "mateuszfrankowski91@gmail.com",
      subject: "Please Verify Your Account",
      html: `<p>Hello,</p><p>Thank you for signing up! Please click on the following link to verify your account:</p><p><a href="http://localhost:3000/app/users/verify/:${verificationToken}">Verify</a></p><p>Best regards,</p><p>Contacts APP Team</p>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
        return res.json({
          status: "Internal Server Error",
          code: 500,
          ResponseBody: {
            message: "Email sent Error",
          },
        });
      });
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        user: {
          email: emailRegistered,
          subscription: subscriptionRegistered,
          avatarURL: avatarURLRegistered,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
export const logout = async (req, res, next) => {
  const id = req.user;

  try {
    await userService.saveToken(id, null);

    res.json({
      status: "success",
      code: 204,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};
export const current = async (req, res, next) => {
  return res.json({
    status: "success",
    code: 200,
    data: {
      user: {
        email: req.user.email,
        subscription: req.user.subscription,
      },
    },
  });
};
export const verificationToken = async (req, res, next) => {
  const verificationToken = req.params.verificationToken;
  console.log(verificationToken);
  const schema = Joi.object({
    verificationToken: Joi.string().required(),
  });
  const { error } = schema.validate({
    verificationToken: verificationToken,
  });

  if (error) return res.status(400).json(error.details[0].message);

  try {
    const user = await userService.findUserByverificationTokenAndVerify(
      verificationToken
    );
    if (user) {
      return res.json({
        status: "success",
        code: 200,
        ResponseBody: {
          message: "Verification successful",
        },
      });
    }
    return res.status(401).json({
      status: "error",
      code: 401,
      ResponseBody: {
        message: "User not found",
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};
export const verifiy = async (req, res, next) => {
  const { email } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate({
    email: email,
  });

  if (error) return res.status(400).json(error.details[0].message);

  try {
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "no user found",
        data: "Conflict",
      });
    }
    if (user.verify) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Verification has already been passed",
        data: "Conflict",
      });
    }

    const verificationToken = nanoid();
    await userService.findUserByEmailAndRenevToken(email, verificationToken);

    const msg = {
      to: email,
      from: "mateuszfrankowski91@gmail.com",
      subject: "Please Verify Your Account",
      html: `<p>Hello,</p><p>Thank you for signing up! Please click on the following link to verify your account:</p><p><a href="http://localhost:3000/app/users/verify/:${verificationToken}">Verify</a></p><p>Best regards,</p><p>Contacts APP Team</p>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
        return res.json({
          status: "Internal Server Error",
          code: 500,
          ResponseBody: {
            message: "Email sent Error",
          },
        });
      });
    res.status(200).json({
      status: "success",
      code: 200,
      ResponseBody: {
        message: "Verification email sent",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const subscription = async (req, res, next) => {
  const { subscription } = req.body;
  const { token } = req.user;
  const schema = Joi.object({
    subscription: Joi.string().valid("starter", "pro", "business").required(),
  });
  const { error } = schema.validate({
    subscription: subscription,
  });

  if (error) return res.status(400).json(error.details[0].message);

  try {
    const user = await userService.findUserByTokenAndUpdateSubscription(
      token,
      subscription
    );
    if (user) {
      return res.json({
        status: "success",
        code: 200,
        data: {
          user: {
            subscription: user.subscription,
          },
        },
      });
    }
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Unauthorized",
      data: "Unauthorized",
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};
