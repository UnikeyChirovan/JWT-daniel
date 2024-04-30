const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../redisConnect");

const authController = {
  // Đăng ký người dùng
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      const user = await newUser.save();
      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ error: "Could not register user" });
    }
  },

  // Tạo access token
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "30s" }
    );
  },

  // Tạo refresh token và lưu vào Redis
  generateRefreshToken: (user) => {
    const refreshToken = jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  
    return new Promise((resolve, reject) => {
      redisClient.set(refreshToken, user.id, "EX", 365 * 24 * 60 * 60, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(refreshToken);
        }
      });
    });
  },
  

  // Đăng nhập
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json({ error: "Incorrect username" });
      }
      
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      const accessToken = authController.generateAccessToken(user);
      const refreshToken = await authController.generateRefreshToken(user);
// push
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });

      const { password, ...userData } = user._doc;
      return res.status(200).json({ userData, accessToken}); // muốn hiện refreshToken thì thêm ở đây
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  },

  // Yêu cầu refresh token mới
  requestRefreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "You're not authenticated" });
    }
    
    const userId = await redisClient.get(refreshToken);
    if (!userId) {
      return res.status(403).json({ error: "Refresh token is not valid" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newAccessToken = authController.generateAccessToken(user);
    const newRefreshToken = await authController.generateRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });

    return res.status(200).json({ accessToken: newAccessToken}); // nếu muốn hiện thì đưa refreshToken: newRefreshToken vào
  },

  // Đăng xuất
  logOut: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await redisClient.del(refreshToken); // Xóa refresh token khỏi Redis
    }
    
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  },
};

module.exports = authController;
