export default function(instance) {
  instance.registerHelper('lookup', function(obj) {
    var args = Array.prototype.slice.call(arguments, 1);
    while (args.length > 1) {
      obj = obj[args.shift()];
    }
    return obj;
  });
}
