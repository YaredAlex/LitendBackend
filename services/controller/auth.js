const validateRegister = (userData) => {
  /* 
  first_name
  last_name
  email
  is_verified
  password
*/ const re =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  let valid = true;
  if (!userData.first_name || userData.first_name?.length < 2) {
    valid = false;
    return { valid, msg: "invalid first name" };
  }

  if (!userData.last_name || userData.last_name?.length < 2) {
    valid = false;
    return { valid, msg: "Invalid last name" };
  }
  if (!String(userData.email).toLowerCase().match(re)) {
    valid = false;
    return { valid, msg: "Invalid email" };
  }
  if (!userData.password || userData.password?.length < 6) {
    valid = false;
    return { valid, msg: "password to short" };
  }
  return { valid, msg: "valid" };
};

export { validateRegister };
