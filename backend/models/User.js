const mongoose = require("mongoose");

const userSchema = new mongoose.Schema( //Schema dùng để làm bộ khung, nó sẽ đc database tạo thêm nếu không tạo đầy đủ.
  {
    username: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 15,
      unique: true, // username là độc nhất
    },
    email: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 50,
      unique: true, // username là độc nhất
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    admin: {
      type: Boolean, // có phải là admin hay không
      default: false, // ban đầu đăng nhập vào không phải là admin
    },
  },
  { timestamps: true } // user đc tạo và update khi nào
);

module.exports = mongoose.model("User", userSchema);
