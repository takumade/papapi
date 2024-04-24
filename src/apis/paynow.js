export const createPayment = (req, res, context) => {
    res.set("Access-Control-Allow-Origin", "*"); // Example of modifying headers to override Wasp default CORS middleware.
    res.json({ msg: `Hello, ${context.user ? "registered user" : "stranger"}!` });
  };


  export const statusUpdate = (req, res, context) => {
    res.set("Access-Control-Allow-Origin", "*"); // Example of modifying headers to override Wasp default CORS middleware.
    res.json({ msg: `Hello, ${context.user ? "registered user" : "stranger"}!` });
  };