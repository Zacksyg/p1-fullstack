const express = require('express');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Salas
 *   description: Gerenciamento de salas para videoconferências
 */

/**
 * @swagger
 * /api/rooms/create:
 *   post:
 *     summary: Cria uma nova sala
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da sala
 *     responses:
 *       201:
 *         description: Sala criada com sucesso
 *       400:
 *         description: Erro na criação da sala
 */
router.post('/create', authMiddleware, roomController.createRoom);

/**
 * @swagger
 * /api/rooms/list:
 *   get:
 *     summary: Lista todas as salas disponíveis
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de salas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   uuid:
 *                     type: string
 *                     description: Identificador único da sala
 *                   name:
 *                     type: string
 *                     description: Nome da sala
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: IDs dos participantes
 *       401:
 *         description: Não autorizado
 */
router.get('/list', authMiddleware, roomController.listRooms);

/**
 * @swagger
 * /api/rooms/join/{uuid}:
 *   post:
 *     summary: Entrar em uma sala específica
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID da sala
 *     responses:
 *       200:
 *         description: Usuário entrou na sala com sucesso
 *       404:
 *         description: Sala não encontrada
 *       401:
 *         description: Não autorizado
 */
router.post('/join/:uuid', authMiddleware, (req, res) => roomController.joinRoom(req.app.get('io'))(req, res));

/**
 * @swagger
 * /api/rooms/leave/{uuid}:
 *   post:
 *     summary: Sair de uma sala específica
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID da sala
 *     responses:
 *       200:
 *         description: Usuário saiu da sala com sucesso
 *       404:
 *         description: Sala não encontrada
 *       401:
 *         description: Não autorizado
 */
router.post('/leave/:uuid', authMiddleware, (req, res) => roomController.leaveRoom(req.app.get('io'))(req, res));

module.exports = router;
