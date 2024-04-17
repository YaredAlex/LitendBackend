import Randomstring from "randomstring";

const generateOTP = (len = 5) => {
  const otp = Randomstring.generate({
    length: len,
    charset: "numeric",
  });

  return otp;
};

export { generateOTP };
