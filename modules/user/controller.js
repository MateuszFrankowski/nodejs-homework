import * as userService from "./service.js";
import jwt from "jsonwebtoken";
import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";

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
// export const auth = (req, res, next) => {
//   passport.authenticate("jwt", { session: false }, (err, user) => {
//     console.log(user);
//     if (!user || err) {
//       return res.status(401).json({
//         status: "error",
//         code: 401,
//         message: "Unauthorized",
//         data: "Unauthorized",
//       });
//     }
//     req.user = user;

//     next();
//   })(req, res, next);
// };
export const auth = async (req, res, next) => {
  const token = req.headers["authorization"]?.slice(7);

  try {
    const tokenData = jwt.verify(token, secret, { complete: true });
    const user = await userService.findUserByID(tokenData.payload.id);

    if (!user) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
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
  } catch (e) {
    console.error(e);
    next(e);
  }
  try {
    const newUser = await userService.register(email, password);
    const { email: emailRegistered, subscription: subscriptionRegistered } =
      newUser;
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        user: {
          email: emailRegistered,
          subscription: subscriptionRegistered,
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
  const { token } = req.user;
  const user = await userService.findUserByToken(token);
  if (user) {
    return res.json({
      status: "success",
      code: 200,
      data: {
        user: {
          email: user.email,
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
