const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = process.env.JWT_SECRET;

function hashPassword(plain) { return bcrypt.hashSync(plain, 10); }
function checkPassword(plain, hash) { return bcrypt.compareSync(plain, hash); }
function signToken(user) {
    return jwt.sign({ sub: user.id, email: user.id, role: user.role, displayName: user.displayName }, SECRET, { expiresIn: '7d' });
}
function getUserFromRequest(request) {
    const header = request.headers.get('authorization') || '';
    const match = header.match(/^Bearer (.+)$/i);
    if (!match) return null;
    try { return jwt.verify(match[1], SECRET); } catch { return null; }
}
module.exports = { hashPassword, checkPassword, signToken, getUserFromRequest };