/**
 * Tests unitarios para el modelo de eventos
 * Valida la lógica de negocio del modelo principal del MVP
 */

const EventoModel = require('../../src/models/evento.model');
const databaseConfig = require('../../src/config/database');

describe('EventoModel - Tests Unitarios', () => {
  let testEventoId;
  const testData = {
    usuario_id: 'test-user-123',
    sesion_id: 'test-session-123',
    aplicacion_id: 'test-app-123',
    tipo_evento: 'click_button',
    metadata: {
      button_id: 'btn-submit',
      page: '/test-page'
    },
    ip_usuario: '192.168.1.100',
    user_agent: 'Test User Agent',
    url_origen: 'https://test.com'
  };

  describe('crear()', () => {
    test('Debe crear un evento con todos los campos', async () => {
      const evento = await EventoModel.crear(testData);

      expect(evento).toHaveProperty('evento_id');
      expect(evento).toHaveProperty('_id');
      expect(evento.usuario_id).toBe(testData.usuario_id);
      expect(evento.sesion_id).toBe(testData.sesion_id);
      expect(evento.aplicacion_id).toBe(testData.aplicacion_id);
      expect(evento.tipo_evento).toBe(testData.tipo_evento);
      expect(evento.metadata).toEqual(testData.metadata);
      expect(evento.ip_usuario).toBe(testData.ip_usuario);
      expect(evento.user_agent).toBe(testData.user_agent);
      expect(evento.url_origen).toBe(testData.url_origen);
      expect(evento).toHaveProperty('timestamp');
      expect(evento).toHaveProperty('created_at');
      expect(evento).toHaveProperty('updated_at');

      testEventoId = evento.evento_id;
    });

    test('Debe crear evento con metadata vacía por defecto', async () => {
      const datosMinimos = {
        usuario_id: 'user-min',
        sesion_id: 'session-min',
        aplicacion_id: 'app-min',
        tipo_evento: 'test_event'
      };

      const evento = await EventoModel.crear(datosMinimos);

      expect(evento.metadata).toEqual({});
      expect(evento).toHaveProperty('evento_id');
    });

    test('Debe generar timestamp automático', async () => {
      const antes = new Date();
      const evento = await EventoModel.crear(testData);
      const despues = new Date();

      expect(evento.timestamp).toBeInstanceOf(Date);
      expect(evento.timestamp.getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(evento.timestamp.getTime()).toBeLessThanOrEqual(despues.getTime());
    });
  });

  describe('obtenerPorId()', () => {
    beforeEach(async () => {
      const evento = await EventoModel.crear(testData);
      testEventoId = evento.evento_id;
    });

    test('Debe obtener evento existente por ID', async () => {
      const evento = await EventoModel.obtenerPorId(testEventoId);

      expect(evento).toBeTruthy();
      expect(evento.evento_id).toBe(testEventoId);
      expect(evento.usuario_id).toBe(testData.usuario_id);
      expect(evento.tipo_evento).toBe(testData.tipo_evento);
    });

    test('Debe retornar null para ID inexistente', async () => {
      const evento = await EventoModel.obtenerPorId('id-inexistente');
      expect(evento).toBeNull();
    });
  });

  describe('obtenerPorUsuario()', () => {
    beforeEach(async () => {
      // Crear múltiples eventos para diferentes usuarios
      await EventoModel.crear({
        ...testData,
        usuario_id: 'usuario-1',
        tipo_evento: 'click'
      });

      await EventoModel.crear({
        ...testData,
        usuario_id: 'usuario-1',
        tipo_evento: 'view'
      });

      await EventoModel.crear({
        ...testData,
        usuario_id: 'usuario-2',
        tipo_evento: 'click'
      });
    });

    test('Debe obtener eventos solo del usuario especificado', async () => {
      const eventos = await EventoModel.obtenerPorUsuario('usuario-1');

      expect(eventos).toHaveLength(2);
      expect(eventos.every(e => e.usuario_id === 'usuario-1')).toBe(true);
    });

    test('Debe aplicar filtro por tipo de evento', async () => {
      const eventos = await EventoModel.obtenerPorUsuario('usuario-1', {
        tipoEvento: 'click'
      });

      expect(eventos).toHaveLength(1);
      expect(eventos[0].tipo_evento).toBe('click');
    });

    test('Debe aplicar límite de resultados', async () => {
      const eventos = await EventoModel.obtenerPorUsuario('usuario-1', {
        limite: 1
      });

      expect(eventos).toHaveLength(1);
    });

    test('Debe ordenar por timestamp descendente', async () => {
      const eventos = await EventoModel.obtenerPorUsuario('usuario-1');

      expect(eventos).toHaveLength(2);
      if (eventos.length > 1) {
        expect(eventos[0].timestamp.getTime()).toBeGreaterThanOrEqual(
          eventos[1].timestamp.getTime()
        );
      }
    });

    test('Debe retornar array vacío para usuario sin eventos', async () => {
      const eventos = await EventoModel.obtenerPorUsuario('usuario-inexistente');
      expect(eventos).toEqual([]);
    });
  });

  describe('obtenerPorFecha()', () => {
    beforeEach(async () => {
      await EventoModel.crear(testData);
    });

    test('Debe obtener eventos de fecha específica', async () => {
      const fechaHoy = new Date().toISOString().split('T')[0];
      const eventos = await EventoModel.obtenerPorFecha(fechaHoy);

      expect(eventos.length).toBeGreaterThan(0);
      eventos.forEach(evento => {
        const fechaEvento = evento.timestamp.toISOString().split('T')[0];
        expect(fechaEvento).toBe(fechaHoy);
      });
    });

    test('Debe aplicar filtro por usuario en consulta de fecha', async () => {
      const fechaHoy = new Date().toISOString().split('T')[0];
      const eventos = await EventoModel.obtenerPorFecha(fechaHoy, null, {
        usuarioId: testData.usuario_id
      });

      eventos.forEach(evento => {
        expect(evento.usuario_id).toBe(testData.usuario_id);
      });
    });
  });

  describe('obtenerPorTipo()', () => {
    beforeEach(async () => {
      await EventoModel.crear({
        ...testData,
        tipo_evento: 'button_click'
      });

      await EventoModel.crear({
        ...testData,
        tipo_evento: 'page_view'
      });
    });

    test('Debe obtener eventos por tipo específico', async () => {
      const eventos = await EventoModel.obtenerPorTipo('button_click');

      expect(eventos.length).toBeGreaterThan(0);
      eventos.forEach(evento => {
        expect(evento.tipo_evento).toBe('button_click');
      });
    });
  });

  describe('actualizarMetadata()', () => {
    beforeEach(async () => {
      const evento = await EventoModel.crear(testData);
      testEventoId = evento.evento_id;
    });

    test('Debe actualizar metadata correctamente', async () => {
      const nuevaMetadata = {
        nueva_propiedad: 'nuevo_valor',
        numero: 42
      };

      const resultado = await EventoModel.actualizarMetadata(testEventoId, nuevaMetadata);
      expect(resultado.modifiedCount).toBe(1);

      const eventoActualizado = await EventoModel.obtenerPorId(testEventoId);
      expect(eventoActualizado.metadata).toEqual(nuevaMetadata);
      expect(eventoActualizado.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('eliminar()', () => {
    beforeEach(async () => {
      const evento = await EventoModel.crear(testData);
      testEventoId = evento.evento_id;
    });

    test('Debe eliminar evento existente', async () => {
      const resultado = await EventoModel.eliminar(testEventoId);
      expect(resultado.deletedCount).toBe(1);

      const eventoEliminado = await EventoModel.obtenerPorId(testEventoId);
      expect(eventoEliminado).toBeNull();
    });

    test('Debe retornar 0 para evento inexistente', async () => {
      const resultado = await EventoModel.eliminar('id-inexistente');
      expect(resultado.deletedCount).toBe(0);
    });
  });

  describe('obtenerMetricasBasicas()', () => {
    beforeEach(async () => {
      // Crear varios eventos para métricas
      const eventos = [
        { usuario_id: 'user-1', tipo_evento: 'click', aplicacion_id: 'app-1', sesion_id: 'session-1' },
        { usuario_id: 'user-1', tipo_evento: 'view', aplicacion_id: 'app-1', sesion_id: 'session-1' },
        { usuario_id: 'user-2', tipo_evento: 'click', aplicacion_id: 'app-2', sesion_id: 'session-2' }
      ];

      for (const eventoData of eventos) {
        await EventoModel.crear({
          ...testData,
          ...eventoData
        });
      }
    });

    test('Debe calcular métricas básicas correctamente', async () => {
      const metricas = await EventoModel.obtenerMetricasBasicas();

      expect(metricas.totalEventos).toBe(3);
      expect(metricas.usuariosUnicos).toBe(2);
      expect(metricas.tiposEventos).toBe(2);
      expect(metricas.aplicacionesUnicos).toBe(2);
      expect(metricas.sesionesUnicas).toBe(2);
      expect(metricas.fechaMin).toBeInstanceOf(Date);
      expect(metricas.fechaMax).toBeInstanceOf(Date);
    });
  });

  describe('obtenerEventosPorTipo()', () => {
    beforeEach(async () => {
      // Crear eventos con diferentes tipos
      await EventoModel.crear({
        ...testData,
        usuario_id: 'user-1',
        tipo_evento: 'click'
      });

      await EventoModel.crear({
        ...testData,
        usuario_id: 'user-2',
        tipo_evento: 'click'
      });

      await EventoModel.crear({
        ...testData,
        usuario_id: 'user-1',
        tipo_evento: 'view'
      });
    });

    test('Debe agrupar eventos por tipo correctamente', async () => {
      const grupos = await EventoModel.obtenerEventosPorTipo();

      expect(grupos).toHaveLength(2);

      const grupoClick = grupos.find(g => g.tipoEvento === 'click');
      const grupoView = grupos.find(g => g.tipoEvento === 'view');

      expect(grupoClick.cantidad).toBe(2);
      expect(grupoClick.usuariosUnicos).toBe(2);
      expect(grupoView.cantidad).toBe(1);
      expect(grupoView.usuariosUnicos).toBe(1);
    });
  });

  describe('contar()', () => {
    beforeEach(async () => {
      await EventoModel.crear(testData);
      await EventoModel.crear({
        ...testData,
        usuario_id: 'otro-usuario'
      });
    });

    test('Debe contar todos los eventos sin filtros', async () => {
      const total = await EventoModel.contar();
      expect(total).toBe(2);
    });

    test('Debe contar con filtros aplicados', async () => {
      const total = await EventoModel.contar({ usuario_id: testData.usuario_id });
      expect(total).toBe(1);
    });
  });
});
