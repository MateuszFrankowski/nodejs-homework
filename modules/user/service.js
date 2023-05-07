import { User } from "./model.js";
export const findUser = (email) => {
  return User.findOne({ email });
};
export const saveToken = (id, token) => {
  return User.findOneAndUpdate({ _id: id }, { token });
};
export const register = (email, password) => {
  const newUser = new User({ email, password });
  newUser.setPassword(password);
  return newUser.save();
};
