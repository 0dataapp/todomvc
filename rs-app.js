// remoteStorage module
const remoteStorage = new RemoteStorage({
  modules: [todos],
  changeEvents: { local: true, window: true, remote: true, conflict: true },
});

remoteStorage.access.claim('todos', 'rw');

remoteStorage.todos.cacheTodos();

// replicate and implement API from `store.js`
const altStore = {

  async find (query, callback) {
    if (!callback)
      return;

    const todos = await remoteStorage.todos.getAllTodos();
    callback.call(
      this,
      todos.filter(function (e) {
        for (var q in query) {
          if (query[q] !== e[q])
            return false;
        }

        return true;
      })
    );
  },

  async findAll (callback = function () {}) {
    callback.call(this, await remoteStorage.todos.getAllTodos());
  },

  async save (updateData, callback = function () {}, id) {
    const todos = await remoteStorage.todos.getAllTodos();

    const match = todos.filter(e => e.id.toString() === id.toString()).shift();

    // If an ID was actually given, find the item and update each property
    updateData = await (match ? remoteStorage.todos.updateTodo(id.toString(), Object.assign(match, updateData)) : remoteStorage.todos.addTodo(updateData));

    callback.call(this, id ? todos : [updateData]);
  },

  async remove (id, callback = function () {}) {
    await remoteStorage.todos.removeTodo(id.toString());

    callback.call(this, await remoteStorage.todos.getAllTodos());
  },

};

// remoteStorage events
remoteStorage.todos.handle('change', (event) => {
  if (event.newValue && !event.oldValue) {
    return todo.controller._filter(true);
  }

  if (!event.newValue && event.oldValue) {
    todo.controller.view.render("removeItem", event.oldValue.id);

    return todo.controller._filter();
  }

  if (event.newValue && event.oldValue) {
    console.log(`Change from ${ event.origin } (change)`, event);

    if (event.origin !== 'conflict' || (event.oldValue.description === event.newValue.description)) {
      return todo.controller._filter(true);
    }

    return todo.controller._filter();
  }

  console.log(`Change from ${ event.origin }`, event);
});

// Setup after page loads
document.addEventListener('DOMContentLoaded', () => {
  (new Widget(remoteStorage)).attach(document.body.insertBefore(document.createElement('widget-container'), document.querySelector('.todoapp')));

  remoteStorage.on('ready', () => {
    // overwrite built-in storage from `store.js`
    Object.assign(window.todo.storage, altStore);

    // trigger app setup from `app.js`
    todo.controller.setView(document.location.hash);
  });

  remoteStorage.on('disconnected', () => todo.controller._filter());

  document.body.appendChild(Object.assign(document.createElement('style'), {
    innerHTML: `.toggle-all + label:before {
  content: '✔︎';
  -webkit-transform: unset;
  transform: unset;`,
  }));

  document.querySelector('.toggle-all-label').title = 'Mark all as complete';
});
