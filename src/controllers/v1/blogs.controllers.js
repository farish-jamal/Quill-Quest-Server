const { getReadTime } = require("../../helper/getReadTime");
const Blogs = require("../../models/blogs.models");
const Users = require("../../models/user.models");
const cloudinary = require("../../services/cloudinary.service");

async function handleCreateBlogs(req, res) {
  const { title, description, category, author } = req.body;
  const userImageUrl = await cloudinary.uploader.upload(req.file.path);
  const readTime = getReadTime(description);
  try {
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.content = description;
    if (category) updateFields.category = category;
    if (req.file) updateFields.bannerImage = userImageUrl.secure_url;
    updateFields.author = author;
    updateFields.readTime = readTime;
    const blog = await Blogs.create(updateFields);
    return res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGetAllBlogs(req, res) {
  try {
    const result = await Blogs.countDocuments();
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getSpecificBlog(req, res) {
  const id = req.params.id;
  try {
    const result = await Blogs.findOneAndUpdate(
      { _id: id },
      { $inc: { totalViews: 1 / 2 } },
      { new: true }
    );
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error while finding blog", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getSpecificUserBlog(req, res) {
  const id = req.params.id;
  try {
    const result = await Blogs.find({ author: id });
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error while finding blog", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleUpdateBlog(req, res) {
  const id = req.params.id;
  const { title, content, category } = req.body;
  const userImageUrl = await cloudinary.uploader.upload(req.file.path);
  try {
    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (category) updateFields.category = category;
    if (req.file) updateFields.bannerImage = userImageUrl.secure_url;
    const result = await Blogs.findOneAndUpdate({ _id: id }, updateFields, {
      new: true,
    });
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error while finding blog", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleDeleteBlog(req, res) {
  const id = req.params.id;
  try {
    const result = await Blogs.findOneAndDelete({ _id: id });
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error while finding blog", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleLikesOfSpecificPost(req, res) {
  const id = req.params.id;
  const userId = req.query.userId;
  try {
    const user = await Users.findById({ _id: userId });
    if (!user) return res.status(404).json({ message: "User Not Found" });
    const likedPostIds = user.likedPost.map((postId) => postId.toString());
    if (!likedPostIds.includes(id)) {
      await Users.findByIdAndUpdate(userId, { $push: { likedPost: id } });
      const result = await Blogs.findOneAndUpdate(
        { _id: id },
        { $inc: { likes: 1 } },
        { new: true }
      );
      return res.status(200).json({ result });
    } else {
      return res.status(200).json({ message: "Alreday Disliked" });
    }
  } catch (error) {
    console.error("Error while finding blog", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleDisLikesOfSpecificPost(req, res) {
  const id = req.params.id;
  const userId = req.query.userId;
  try {
    const user = await Users.findById({ _id: userId });
    if (!user) return res.status(404).json({ message: "User Not Found" });
    const likedPostIds = user.likedPost.map((postId) => postId.toString());
    if (!likedPostIds.includes(id)) {
      await Users.findByIdAndUpdate(userId, { $push: { likedPost: id } });
      const result = await Blogs.findOneAndUpdate(
        { _id: id },
        { $inc: { dislikes: 1 } },
        { new: true }
      );
      return res.status(200).json({ result });
    } else {
      return res.status(200).json({ message: "Alreday Liked" });
    }
  } catch (error) {
    console.error("Error while finding blog", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handlepagination(req, res) {
  const page = req.query.page || 1;
  const limit = 6;
  const skip = (page - 1) * limit;
  try {
    const result = await Blogs.find({}).skip(skip).limit(limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error while finding blog", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  handleCreateBlogs,
  handleGetAllBlogs,
  getSpecificBlog,
  getSpecificUserBlog,
  handleUpdateBlog,
  handleDeleteBlog,
  handleLikesOfSpecificPost,
  handleDisLikesOfSpecificPost,
  handlepagination,
};
