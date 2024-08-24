import CryptoJS from "crypto-js";

const encrypt = (plainPassword) => {
  let encLayer1 = CryptoJS.AES.encrypt(
    plainPassword,
    process.env.TOKEN_SECRET
  ).toString();
  return encLayer1;
};

const decrypt = (encryptedPassword) => {
  let decLayer3 = CryptoJS.AES.decrypt(
    encryptedPassword,
    process.env.TOKEN_SECRET
  );
  let finalDecPassword = decLayer3.toString(CryptoJS.enc.Utf8);
  return finalDecPassword;
};

const enc = {
  encrypt,
  decrypt,
};

export default enc;
