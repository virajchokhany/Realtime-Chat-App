const jwt = require('jsonwebtoken');

function tokenPayload(req){
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded =  jwt.decode(token);
    return decoded;
}

module.exports = tokenPayload;
