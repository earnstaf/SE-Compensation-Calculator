const WebSettings = {
  save(data) {
    try {
      const existing = this.load();
      const merged = Object.assign({}, existing, data);
      localStorage.setItem('se-comp-settings', JSON.stringify(merged));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem('se-comp-settings');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Failed to load settings:', e);
      return {};
    }
  },

  clear() {
    localStorage.removeItem('se-comp-settings');
  }
};
