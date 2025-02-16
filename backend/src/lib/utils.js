import jwt from "jsonwebtoken";

export const generateToken = (userid, res) => {
  const payload = {
    userid,
  };
  const options = {
    expiresIn: "7d",
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  res.cookie("token", token, {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return token;
};
