export const createUser = (id, socket) => {
  const type = id.substr(0, 1);
  return {
    type,
    id,
    socket,
    lookingForRandomUser: false,
    export() {
      return {
        type,
        id,
        lookingForRandomUser: this.lookingForRandomUser,
      };
    },
  };
};
