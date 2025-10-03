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

    const formatOut = function (object, properties) {
      object.description = object.title;
      delete object.title;

      return inject(object, properties);
    };

    const formatIn = function (object, properties) {
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
          return privateClient.storeObject('todo', id, formatOut(object, { id }))
        },

        updateTodo: (id, object) => privateClient.storeObject('todo', id, formatOut(object, { id })),

        removeTodo: privateClient.remove.bind(privateClient),

        getAllTodos: () => privateClient.getAll('', false).then(map => Object.entries(map).reduce((coll, item) => coll.concat(formatIn(item[1], { id: tryInt(item[0]) })), [])),
      }
    }
  }
};
