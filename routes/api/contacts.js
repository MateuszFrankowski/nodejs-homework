const express = require("express");
const contactsHandler = require("../../models/contacts.js");
const router = express.Router();
const Joi = require("joi");
// const app = express();
// app.use(express.json());
router.get("/", async (req, res, next) => {
  const allContacts = await contactsHandler.listContacts();
  res.json({ allContacts: allContacts });
});

router.get("/:contactId", async (req, res, next) => {
  const contactById = await contactsHandler.getContactById(
    req.params.contactId
  );
  if (!contactById) return res.sendStatus(404);
  res.json({ contactById: contactById });
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
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
  const { newContact, err } = contactsHandler.addContact(req.body);
  if (err) return res.status(500).json(err);
  return res.status(201).json(newContact);
});

router.delete("/:contactId", async (req, res, next) => {
  const removeContactById = await contactsHandler.removeContact(
    req.params.contactId
  );
  if (!removeContactById) return res.sendStatus(404);
  res.status(200).json({ removedContactById: removeContactById });
});

router.put("/:contactId", async (req, res, next) => {
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
  const { contactToUpdate, err } = await contactsHandler.updateContact(
    req.params.contactId,
    req.body
  );

  if (err) return res.sendStatus(500);
  if (!contactToUpdate) return res.sendStatus(404);
  res.status(200).json({ contactUpdated: contactToUpdate });
});

module.exports = router;
