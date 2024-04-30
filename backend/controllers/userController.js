const User = require("../models/User");

const userController = {
  // GET ALL USER
  getAllUsers: async (req, res) => {
    try {
      // Lấy danh sách người dùng từ cơ sở dữ liệu
      const users = await User.find();

      // Tạo một mảng mới chứa các thông tin người dùng đã được lọc
      const filteredUsers = users.map(user => {
        const { password, ...userData } = user._doc;
        return userData;
      });

      // Trả về danh sách người dùng đã được lọc
      return res.status(200).json(filteredUsers);
    } catch (err) {
      // Xử lý lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình lấy dữ liệu người dùng
      return res.status(500).json(err);
    }
  },

  // DELETE A USER
  deleteUser: async (req, res) => {
    try {
      // Xóa người dùng dựa trên ID được cung cấp trong tham số yêu cầu
      const user = await User.findByIdAndDelete(req.params.id);
      
      // Trả về thông báo cho client rằng người dùng đã được xóa thành công
      return res.status(200).json("User deleted");
    } catch (err) {
      // Xử lý lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình xóa người dùng
      return res.status(500).json(err);
    }
  },
};

module.exports = userController;
