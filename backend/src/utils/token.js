import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_SECRET,
    { EXPIREiN: process.env.JWT_EXPIRES_IN || "7D" },
  );
};

export default generateToken;
