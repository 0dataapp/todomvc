const todos = {
  name: 'todos',
  builder: function (privateClient) {
    privateClient.declareType('todo', {
      type: 'object',
      properties: {
        description: { type: 'string' },
        completed: { type: 'boolean' },
      },
      required: ['description'],
    });

    const tryInt = function (id) {
      try {
        return parseInt(id);
      } catch {
        return id;
      }
    };

    const dehydrate = function (object) {
      object.description = object.title;
      delete object.title;

      delete object.id;

      return object;
    };

    const hydrate = function (path, object) {
      object.title = object.description;
      delete object.description;
      
      object.completed = !!object.completed;

      return Object.assign(object, {
        id: tryInt(path),
      });
    };

    return {
      exports: {
        hydrate,

        cacheTodos: () => privateClient.cache(''),

        handle: privateClient.on,

        addTodo: (object) => {
          id = `${ new Date().getTime() }`;
          return privateClient.storeObject('todo', id, dehydrate(object)).then(e => hydrate(id, object));
        },

        updateTodo: (id, object) => privateClient.storeObject('todo', id, dehydrate(object)).then(e => hydrate(id, object)),

        removeTodo: privateClient.remove.bind(privateClient),

        getAllTodos: () => privateClient.getAll('', false).then(map => Object.entries(map).reduce((coll, item) => coll.concat(hydrate(item[0], item[1])), [])),
      }
    }
  }
};
