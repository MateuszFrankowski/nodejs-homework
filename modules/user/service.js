import { User } from "./model.js";
export const findUser = (email) => {
  return User.findOne({ email });
};
export const register = (username, email, password) => {
  const newUser = new User({ username, email, password });
  newUser.setPassword(password);
  return newUser.save();
  //return newUser.create({ email, password });
};
