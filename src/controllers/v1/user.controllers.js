const Users = require("../../models/user.models");
const bcrypt = require("bcryptjs");
const { setUser } = require("../../utils/auth.utils");
const salt = bcrypt.genSaltSync(10);
const cloudinary = require("../../services/cloudinary.service");

async function handleCreateUser(req, res) {
  try {
    const { username, email, password, description } = req.body;
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userImageUrl = await cloudinary.uploader.upload(req.file.path);
    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
      description,
      profilePicture: userImageUrl.secure_url,
    });
    const sessionId = setUser(user);
    return res.status(200).json({ user, sessionId });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleUserToLoginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Wrong Credentials" });
    const passwordMatched = bcrypt.compareSync(password, user.password);
    if (!passwordMatched)
      return res.status(401).json({ msg: "Wrong Credentials" });
    const sessionId = setUser(user);
    return res.status(200).json({ user, sessionId });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGetSpecificUser(req, res) {
  const id = req.params.id;
  try {
    const user = await Users.findOne(
      { _id: id },
      { username: 1, _id: 1, profilePicture: 1 }
    );
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleEditUserDetails(req, res) {
  const id = req.params.id;
  const { username, email, description } = req.body;
  const userImageUrl = await cloudinary.uploader.upload(req.file.path);
  const updateFields = {};
  if (username) updateFields.username = username;
  if (email) updateFields.email = email;
  if (description) updateFields.description = description;
  if (req.file) updateFields.profilePicture = userImageUrl.secure_url;
  try {
    const user = await Users.findOneAndUpdate({ _id: id }, updateFields, {
      new: true,
    });
    const sessionId = setUser(user);
    return res.status(200).json({ user, sessionId });
  } catch (error) {
    console.error("Error finding user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  handleCreateUser,
  handleUserToLoginUser,
  handleGetSpecificUser,
  handleEditUserDetails,
};
