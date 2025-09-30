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
      todos.filter(function (todo) {
        for (var q in query) {
          if (query[q] !== todo[q])
            return false;
        }

        return true;
      })
    );
  },

  async findAll (callback) {
    callback = callback || function () {};
    callback.call(this, await remoteStorage.todos.getAllTodos());
  },

  async save (updateData, callback, id) {
    id = id.toString();

    const todos = await remoteStorage.todos.getAllTodos();

    callback = callback || function () {};

    const match = todos.filter(e => e.id === id).shift();

    // If an ID was actually given, find the item and update each property
    updateData = await (id && match ? remoteStorage.todos.updateTodo(id, Object.assign(match, updateData)) : remoteStorage.todos.addTodo(updateData));

    callback.call(this, id ? todos : [updateData]);
  },

  async remove (id, callback) {
    id = id.toString();

    const todos = await remoteStorage.todos.getAllTodos();

    remoteStorage.todos.removeTodo(id);

    callback.call(this, todos.filter(e => e.id !== id));
  },

};

// Setup after page loads
document.addEventListener('DOMContentLoaded', () => {
  (new Widget(remoteStorage)).attach(document.body.insertBefore(document.createElement('widget-container'), document.querySelector('.todoapp')));

  remoteStorage.on('ready', () => {
    // overwrite built-in storage from `store.js`
    Object.assign(window.todo.storage, altStore);

    // trigger app setup from `app.js`
    todo.controller.setView(document.location.hash);
  });
  
});
