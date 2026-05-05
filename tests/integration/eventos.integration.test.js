/**
 * Tests de integración para la API de eventos
 * Valida el funcionamiento end-to-end de los endpoints principales del MVP
 */

const request = require('supertest');
const { app } = require('../../src/server');
const databaseConfig = require('../../src/config/database');

describe('API de Eventos - Integración', () => {
  let aplicacionId;
  let usuarioId;
  let sesionId;
  let eventoId;

  beforeAll(async () => {
    // Datos de prueba para usar en todos los tests
    aplicacionId = 'test-app-001';
    usuarioId = 'test-user-001';
    sesionId = 'test-session-001';
  });

  beforeEach(async () => {
    // Crear aplicación de prueba
    await request(app)
      .post('/api/applications')
      .send({
        aplicacion_id: aplicacionId,
        nombre: 'Aplicación de Prueba',
        descripcion: 'App para testing',
        version: '1.0.0',
        plataforma: 'web'
      });

    // Crear usuario de prueba
    await request(app)
      .post('/api/users')
      .send({
        usuario_id: usuarioId,
        nombre: 'Usuario de Prueba',
        email: 'test@example.com'
      });
  });

  describe('POST /api/events', () => {
    test('Debe crear un evento exitosamente', async () => {
      const eventoData = {
        usuario_id: usuarioId,
        sesion_id: sesionId,
        aplicacion_id: aplicacionId,
        tipo_evento: 'click_button',
        metadata: {
          button_id: 'btn-submit',
          page: '/home'
        },
        ip_usuario: '192.168.1.1',
        user_agent: 'Mozilla/5.0 Test',
        url_origen: 'https://example.com/home'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registrado exitosamente');
      expect(response.body.data).toHaveProperty('evento_id');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data.tipo_evento).toBe(eventoData.tipo_evento);

      // Guardar el ID del evento para otros tests
      eventoId = response.body.data.evento_id;
    });

    test('Debe fallar con datos inválidos', async () => {
      const eventoInvalido = {
        usuario_id: '', // Vacío - debe fallar
        sesion_id: sesionId,
        aplicacion_id: aplicacionId,
        tipo_evento: 'click_button'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventoInvalido)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validación');
    });

    test('Debe fallar con aplicación inexistente', async () => {
      const eventoData = {
        usuario_id: usuarioId,
        sesion_id: sesionId,
        aplicacion_id: 'app-inexistente',
        tipo_evento: 'click_button'
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no existe');
    });
  });

  describe('GET /api/events', () => {
    beforeEach(async () => {
      // Crear algunos eventos de prueba
      const eventosData = [
        {
          usuario_id: usuarioId,
          sesion_id: sesionId,
          aplicacion_id: aplicacionId,
          tipo_evento: 'click_button',
          metadata: { button_id: 'btn-1' }
        },
        {
          usuario_id: usuarioId,
          sesion_id: sesionId,
          aplicacion_id: aplicacionId,
          tipo_evento: 'page_view',
          metadata: { page: '/home' }
        },
        {
          usuario_id: 'otro-usuario',
          sesion_id: 'otra-sesion',
          aplicacion_id: aplicacionId,
          tipo_evento: 'click_button',
          metadata: { button_id: 'btn-2' }
        }
      ];

      // Crear usuario adicional
      await request(app)
        .post('/api/users')
        .send({
          usuario_id: 'otro-usuario',
          nombre: 'Otro Usuario',
          email: 'otro@example.com'
        });

      // Crear eventos
      for (const evento of eventosData) {
        await request(app)
          .post('/api/events')
          .send(evento);
      }
    });

    test('Debe listar todos los eventos', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventos).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data).toHaveProperty('paginacion');
    });

    test('Debe filtrar eventos por usuario', async () => {
      const response = await request(app)
        .get(`/api/events?usuarioId=${usuarioId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventos).toHaveLength(2);
      expect(response.body.data.eventos.every(e => e.usuario_id === usuarioId)).toBe(true);
    });

    test('Debe filtrar eventos por tipo', async () => {
      const response = await request(app)
        .get('/api/events?tipoEvento=click_button')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventos).toHaveLength(2);
      expect(response.body.data.eventos.every(e => e.tipo_evento === 'click_button')).toBe(true);
    });

    test('Debe aplicar paginación', async () => {
      const response = await request(app)
        .get('/api/events?limite=2&offset=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventos).toHaveLength(2);
      expect(response.body.data.paginacion.limite).toBe(2);
      expect(response.body.data.paginacion.offset).toBe(1);
    });
  });

  describe('GET /api/events/user/:usuarioId', () => {
    beforeEach(async () => {
      // Crear eventos para el usuario de prueba
      await request(app)
        .post('/api/events')
        .send({
          usuario_id: usuarioId,
          sesion_id: sesionId,
          aplicacion_id: aplicacionId,
          tipo_evento: 'click_button'
        });

      await request(app)
        .post('/api/events')
        .send({
          usuario_id: usuarioId,
          sesion_id: sesionId,
          aplicacion_id: aplicacionId,
          tipo_evento: 'page_view'
        });
    });

    test('Debe obtener eventos por usuario', async () => {
      const response = await request(app)
        .get(`/api/events/user/${usuarioId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventos).toHaveLength(2);
      expect(response.body.data.usuario_id).toBe(usuarioId);
      expect(response.body.data.total).toBe(2);
    });

    test('Debe fallar con usuario inexistente', async () => {
      const response = await request(app)
        .get('/api/events/user/usuario-inexistente')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrado');
    });
  });

  describe('GET /api/events/date/:fecha', () => {
    test('Debe obtener eventos por fecha', async () => {
      // Crear un evento
      await request(app)
        .post('/api/events')
        .send({
          usuario_id: usuarioId,
          sesion_id: sesionId,
          aplicacion_id: aplicacionId,
          tipo_evento: 'click_button'
        });

      const fechaHoy = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/events/date/${fechaHoy}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventos.length).toBeGreaterThan(0);
      expect(response.body.data.fecha_consulta).toBe(fechaHoy);
    });
  });

  describe('GET /api/events/type/:tipoEvento', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/events')
        .send({
          usuario_id: usuarioId,
          sesion_id: sesionId,
          aplicacion_id: aplicacionId,
          tipo_evento: 'click_button'
        });
    });

    test('Debe obtener eventos por tipo', async () => {
      const response = await request(app)
        .get('/api/events/type/click_button')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventos).toHaveLength(1);
      expect(response.body.data.tipo_evento).toBe('click_button');
    });
  });

  describe('GET /api/events/metrics/basic', () => {
    beforeEach(async () => {
      // Crear algunos eventos para las métricas
      const eventos = [
        { tipo_evento: 'click_button' },
        { tipo_evento: 'click_button' },
        { tipo_evento: 'page_view' }
      ];

      for (const evento of eventos) {
        await request(app)
          .post('/api/events')
          .send({
            usuario_id: usuarioId,
            sesion_id: sesionId,
            aplicacion_id: aplicacionId,
            ...evento
          });
      }
    });

    test('Debe obtener métricas básicas', async () => {
      const response = await request(app)
        .get('/api/events/metrics/basic')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resumen');
      expect(response.body.data).toHaveProperty('eventos_por_tipo');
      expect(response.body.data.resumen.totalEventos).toBe(3);
      expect(response.body.data.resumen.usuariosUnicos).toBe(1);
      expect(response.body.data.eventos_por_tipo).toHaveLength(2);
    });
  });
});

describe('Health Check', () => {
  test('Debe responder correctamente al health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data).toHaveProperty('database');
    expect(response.body.data).toHaveProperty('uptime');
  });

  test('Debe responder a la ruta raíz', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('API REST');
    expect(response.body.data).toHaveProperty('endpoints');
  });
});
