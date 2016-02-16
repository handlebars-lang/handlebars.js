export default function(instance) {
  instance.registerHelper('lookup', function(obj) {
    let args = Array.prototype.slice.call(arguments, 1);
    while (obj && args.length > 1) {
      obj = obj && obj[args.shift()];
    }
    return obj;
  });
}
