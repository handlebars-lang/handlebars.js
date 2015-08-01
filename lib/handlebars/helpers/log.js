export default function(instance) {
  instance.registerHelper('log', function(message, options) {
    let level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, message);
  });
}
