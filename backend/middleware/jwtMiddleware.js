const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized Access'});
  }

  try {
    const decoded =  jwt.decode(token);
    const aud = decoded.aud;
    const iss = decoded.iss;
    const exp = decoded.exp;
    const iat = decoded.iat;
    if(aud!== process.env.aud || iss!== process.env.iss || (Date.now()<iat*1000 || Date.now()>exp*1000)){
        return res.status(400).json({ message: 'Invalid token.'});
    }
    next(); 
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.'});
  }
};

module.exports = validateJWT;
