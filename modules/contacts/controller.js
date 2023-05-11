import * as ContactService from "./service.js";
import Joi from "joi";

export const getAll = async (req, res, next) => {
  const { page, limit, favorite } = req.query;

  try {
    const results = await ContactService.getAll(page, limit, favorite);
    res.json({
      status: "success",
      code: 200,
      data: {
        contacts: results,
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const getById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await ContactService.getById(id);
    if (!result)
      return res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not Found",
      });
    return res.json({
      status: "success",
      code: 200,
      data: { contact: result },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};
export const create = async (req, res, next) => {
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

  try {
    const result = await ContactService.create(name, email, phone);

    if (result) {
      return res.status(201).json({
        status: "created",
        code: 201,
        data: { contact: result },
      });
    }

    return res.json({
      status: "400",
      code: 400,
      data: { contact: result },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
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
  const response = await ContactService.updateFavouriteFieldById(id, favorite);
  try {
    if (updatedContact) return res.json({ updatedContact: response });
    return res.sendStatus(404);
  } catch (e) {
    console.error(e);
  }
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
  try {
    const response = await ContactService.updateById(id, name, email, phone);

    if (updatedContact) return res.json({ updatedContact: response });
    return res.sendStatus(404);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const deleteById = async (req, res) => {
  const id = req.params.id;
  const deletedContact = await ContactService.deleteByID(id);
  try {
    if (!deletedContact) return res.sendStatus(404);
    return res.json(deletedContact);
  } catch (e) {
    console.error(e);
    next(e);
  }
};
