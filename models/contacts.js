const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");
const contactsPath = path.join("./models", "contacts.json");

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, { encoding: "utf8" });
    return JSON.parse(data);
  } catch (err) {
    console.err(err);
  }
};

const getContactById = async (contactId) => {
  const data = await listContacts();
  return data.find((contact) => contactId === contact.id);
};

const removeContact = async (contactId) => {
  const data = await listContacts();
  const contactToDelete = data.find((contact) => contactId === contact.id);
  const newData = data.filter((contact) => contactId !== contact.id);
  try {
    await fs.writeFile(contactsPath, JSON.stringify(newData));
  } catch (err) {
    console.err(err);
  }
  return contactToDelete;
};

const addContact = async (body) => {
  const newContact = { id: nanoid(), ...body };
  const data = await listContacts();
  const newData = [...data, newContact];
  let err;
  try {
    await fs.writeFile(contactsPath, JSON.stringify(newData));
  } catch (err) {
    console.error(err);
  }
  return { newContact, err };
};
const updateContact = async (contactId, body) => {
  const { name, email, phone } = body;

  const data = await listContacts();

  const contactToUpdate = data.find((contact) => contact.id === contactId);
  if (!contactToUpdate) return;
  if (email) {
    contactToUpdate.email = email;
  }
  if (name) {
    contactToUpdate.name = name;
  }
  if (phone) {
    contactToUpdate.phone = phone;
  }

  const updatedData = data.map((contact) =>
    contact.id === contactId ? { ...contact, ...contactToUpdate } : contact
  );

  let err;
  try {
    await fs.writeFile(contactsPath, JSON.stringify(updatedData));
  } catch (err) {
    console.error(err);
  }

  return { contactToUpdate, err };
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
