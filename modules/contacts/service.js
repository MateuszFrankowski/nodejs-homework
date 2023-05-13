import { Contact } from "./model.js";

export const getAll = (pageNr = 1, nPerPage = 0, favorite) => {
  let filter = {};
  if (favorite != undefined) {
    filter = { favorite };
  }

  return Contact.find(filter)
    .skip(nPerPage * (pageNr - 1))
    .limit(nPerPage);
};
export const getById = (id) => {
  return Contact.findOne({ _id: id });
};
export const create = (name, email, phone, favorite) => {
  return Contact.create({ name, email, phone, favorite });
};
export const updateFavouriteFieldById = (id, favorite) => {
  return Contact.findOneAndUpdate(
    { _id: id },
    { favorite: favorite },
    { new: true }
  );
};

export const updateById = (id, name, email, phone, favorite) => {
  return Contact.findOneAndUpdate(
    { _id: id },
    { name, email, phone, favorite },
    { new: true }
  );
};
export const deleteByID = (id) => {
  return Contact.findOneAndDelete({ _id: id });
};
