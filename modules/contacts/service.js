import { Contact } from "./model.js";
export const getAll = () => Contact.find({});
export const getById = (id) => Contact.findOne({ _id: id });
export const create = (name, email, phone, favorite) => {
  Contact.create({ name, email, phone, favorite });
};
export const updateFavouriteFieldById = (id, favorite) =>
  Contact.findOneAndUpdate({ _id: id }, { favorite: favorite }, { new: true });

export const updateById = (id, name, email, phone, favorite) =>
  Contact.findOneAndUpdate(
    { _id: id },
    { name, email, phone, favorite },
    { new: true }
  );
export const deleteByID = (id) => Contact.findOneAndDelete({ _id: id });
