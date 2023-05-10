import { User } from "./model.js";
export const findUserByEmail = (email) => {
  return User.findOne({ email });
};
export const findUserByID = (id) => {
  return User.findOne({ _id: id });
};
export const findUserByToken = (token) => {
  return User.findOne({ token });
};
export const findUserByTokenAndUpdateSubscription = (token, subscription) => {
  return User.findOneAndUpdate(
    { token },
    { subscription },
    {
      new: true,
    }
  );
};
export const saveToken = (id, token) => {
  return User.findOneAndUpdate({ _id: id }, { token: token });
};

export const register = (email, password) => {
  const newUser = new User({ email, password });
  newUser.setPassword(password);
  return newUser.save();
};
