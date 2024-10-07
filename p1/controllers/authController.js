const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserRepository.create({ name, email, password: hashedPassword });

    res.status(201).json({ msg: 'Usuário registrado com sucesso', user: newUser });
  } catch (error) {
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};
