
function MemoryStorage() {
  this.store = {
    users: {}
  };
}

MemoryStorage.prototype = {
  saveUser: function(user) {
    this.store.users[user.id] = user;
  },
  getUser: function(id) {
    if(!this.store.users[id]) { throw new Error("Couldn't find user: ", id); }
    return this.store.users[id];
  }
};

module.exports = {
  MemoryStorage: MemoryStorage
}
