import * as ContactService from "./service.js";
import Joi from "joi";
export const getAll = async (req, res) => {
  const contacts = await ContactService.getAll();
  return res.json({ contacts });
};
export const getById = async (req, res) => {
  const id = req.params.id;
  const requestedContact = await ContactService.getById(id);
  if (!requestedContact) return res.sendStatus(404);
  return res.json(requestedContact);
};
export const create = async (req, res) => {
  const { name, email, phone } = req.body;
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      .messages({
        "string.pattern.base": `Phone number must have at least 7 digits.`,
      })
      .required(),
  });
  const { error } = schema.validate({
    name: name,
    email: email,
    phone: phone,
  });

  if (error) return res.status(400).json(error.details[0].message);
  const createdContact = await ContactService.create(name, email, phone);
  return res.status(201).json(createdContact);
};
export const updateFavouriteFieldById = async (req, res) => {
  const id = req.params.id;
  const { favorite } = req.body;
  if (favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }
  const schema = Joi.object({
    favorite: Joi.boolean(),
  });
  const { error } = schema.validate({
    favorite: favorite,
  });

  if (error) return res.status(400).json({ message: error.details[0].message });
  const updatedContact = await ContactService.updateFavouriteFieldById(
    id,
    favorite
  );

  if (updatedContact === undefined) return res.sendStatus(404);
  return res.json(updatedContact);
};
export const updateById = async (req, res) => {
  const id = req.params.id;
  const { name, email, phone } = req.body;
  const schema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    phone: Joi.string()
      .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      .messages({
        "string.pattern.base": `Phone number must have at least 7 digits.`,
      }),
  }).or(" name", " email", "phone");
  const { error } = schema.validate({
    name: name,
    email: email,
    phone: phone,
  });

  if (error) return res.status(400).json({ message: error.details[0].message });
  const updatedContact = await ContactService.updateById(
    id,
    name,
    email,
    phone
  );
  if (updatedContact === undefined) return res.sendStatus(404);
  return res.json(updatedContact);
};

export const deleteById = async (req, res) => {
  const id = req.params.id;
  const deletedContact = await ContactService.deleteByID(id);
  if (!deletedContact) return res.sendStatus(404);
  return res.json(deletedContact);
};
