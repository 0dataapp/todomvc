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

    const inject = function (object, properties) {
      return Object.assign(Object.assign({}, object), properties);
    };

    const tryInt = function (id) {
      try {
        return parseInt(id);
      } catch {
        return id;
      }
    };

    const dehydrate = function (object, properties) {
      object.description = object.title;
      delete object.title;

      delete object.id;

      return inject(object, properties);
    };

    const hydrate = function (object, properties) {
      object.title = object.description;
      delete object.description;
      
      object.completed = !!object.completed;
      
      return inject(object, properties);
    };

    return {
      exports: {
        cacheTodos: () => privateClient.cache(''),

        handle: privateClient.on,

        addTodo: (object) => {
          id = `${ new Date().getTime() }`;
          return privateClient.storeObject('todo', id, dehydrate(object))
        },

        updateTodo: (id, object) => privateClient.storeObject('todo', id, dehydrate(object)),

        removeTodo: privateClient.remove.bind(privateClient),

        getAllTodos: () => privateClient.getAll('', false).then(map => Object.entries(map).reduce((coll, item) => coll.concat(hydrate(item[1], { id: tryInt(item[0]) })), [])),
      }
    }
  }
};
