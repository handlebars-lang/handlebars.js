define(['handlebars.runtime'], function(Handlebars) {
Handlebars = Handlebars["default"]; var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
return templates['known.helpers'] = template({"1":function(container,depth0,helpers,partials,data) {
var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
return parent[propertyName];
}
return undefined
};
return " <div>Some known helper</div>\n" 
+ ((stack1 = lookupProperty(helpers,"anotherHelper").call(depth0 != null ? depth0 : (container.nullContext || {}),true,{"name":"anotherHelper","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":4},"end":{"line":5,"column":22}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
return " <div>Another known helper</div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
return parent[propertyName];
}
return undefined
};
return ((stack1 = lookupProperty(helpers,"someHelper").call(depth0 != null ? depth0 : (container.nullContext || {}),true,{"name":"someHelper","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":6,"column":15}}})) != null ? stack1 : "");
},"useData":true});
});
    