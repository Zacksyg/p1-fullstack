const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'Acesso negado, token ausente' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        console.log('Usuário autenticado:', req.user); // Log do usuário autenticado
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token inválido' });
    }
};
