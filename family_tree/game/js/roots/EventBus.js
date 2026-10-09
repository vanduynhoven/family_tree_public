// ═══════════════════════════════════════════════════════════
//  EventBus — lightweight pub/sub for decoupled communication
//  Usage: bus.on('npc_talked', cb); bus.emit('npc_talked', data);
// ═══════════════════════════════════════════════════════════
export class EventBus {
  constructor() {
    this._listeners = new Map(); // eventName → Set<callback>
  }

  on(event, callback) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback); // returns unsubscribe fn
  }

  off(event, callback) {
    this._listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    this._listeners.get(event)?.forEach(cb => cb(data));
  }

  clear() {
    this._listeners.clear();
  }
}
