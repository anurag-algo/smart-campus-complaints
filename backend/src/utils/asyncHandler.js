const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    console.log("ASYNC HANDLER START", typeof next, requestHandler.name);
    Promise.resolve()
      .then(() => requestHandler(req, res, next))
      .catch((err) => {
        console.log("ASYNC HANDLER CATCH", typeof next, err && err.message);
        if (typeof next === "function") {
          return next(err);
        }
        throw err;
      });
  };
};

export default asyncHandler;
