// remoteStorage module
const remoteStorage = new RemoteStorage({
  modules: [todos],
  changeEvents: { local: true, window: true, remote: true, conflict: true },
});

remoteStorage.access.claim('todos', 'rw');

remoteStorage.todos.cacheTodos();

// Setup after page loads
document.addEventListener('DOMContentLoaded', () => {
  (new Widget(remoteStorage)).attach(document.body.insertBefore(document.createElement('widget-container'), document.querySelector('.todoapp')));

  remoteStorage.on('ready', () => {
    // trigger app setup from `app.js`
    todo.controller.setView(document.location.hash);
  });
});
