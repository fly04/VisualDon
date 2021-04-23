
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
  'use strict';

  // https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
  class Adder {
    constructor() {
      this._partials = new Float64Array(32);
      this._n = 0;
    }
    add(x) {
      const p = this._partials;
      let i = 0;
      for (let j = 0; j < this._n && j < 32; j++) {
        const y = p[j],
          hi = x + y,
          lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
        if (lo) p[i++] = lo;
        x = hi;
      }
      p[i] = x;
      this._n = i + 1;
      return this;
    }
    valueOf() {
      const p = this._partials;
      let n = this._n, x, y, lo, hi = 0;
      if (n > 0) {
        hi = p[--n];
        while (n > 0) {
          x = hi;
          y = p[--n];
          hi = x + y;
          lo = y - (hi - x);
          if (lo) break;
        }
        if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
          y = lo * 2;
          x = hi + y;
          if (y == x - hi) hi = x;
        }
      }
      return hi;
    }
  }

  function* flatten(arrays) {
    for (const array of arrays) {
      yield* array;
    }
  }

  function merge(arrays) {
    return Array.from(flatten(arrays));
  }

  var noop$1 = {value: () => {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames$1(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get$1(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set$1(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection$1(subgroups, this._parents);
  }

  function array(x) {
    return typeof x === "object" && "length" in x
      ? x // Array, TypedArray, NodeList, array-like
      : Array.from(x); // Map, Set, iterable, string, or anything else
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function arrayAll(select) {
    return function() {
      var group = select.apply(this, arguments);
      return group == null ? [] : array(group);
    };
  }

  function selection_selectAll(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection$1(subgroups, parents);
  }

  function matcher(selector) {
    return function() {
      return this.matches(selector);
    };
  }

  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  var find = Array.prototype.find;

  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }

  function childFirst() {
    return this.firstElementChild;
  }

  function selection_selectChild(match) {
    return this.select(match == null ? childFirst
        : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  var filter = Array.prototype.filter;

  function children() {
    return this.children;
  }

  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }

  function selection_selectChildren(match) {
    return this.selectAll(match == null ? children
        : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection$1(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant$1(x) {
    return function() {
      return x;
    };
  }

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = new Map,
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
        exit[i] = node;
      }
    }
  }

  function datum(node) {
    return node.__data__;
  }

  function selection_data(value, key) {
    if (!arguments.length) return Array.from(this, datum);

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant$1(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = array(value.call(parent, parent && parent.__data__, j, parents)),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection$1(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove(); else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(selection) {
    if (!(selection instanceof Selection$1)) throw new Error("invalid merge");

    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection$1(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection$1(sortgroups, this._parents).order();
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    return Array.from(this);
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    let size = 0;
    for (const node of this) ++size; // eslint-disable-line no-unused-vars
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove$1(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS$1(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant$1(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS$1(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction$1(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS$1(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
        : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove$1(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant$1(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction$1(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove$1 : typeof value === "function"
              ? styleFunction$1
              : styleConstant$1)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant$1(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction$1(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction$1
            : textConstant$1)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, options) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  function* selection_iterator() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  var root = [null];

  function Selection$1(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection$1([[document.documentElement]], root);
  }

  function selection_selection() {
    return this;
  }

  Selection$1.prototype = selection.prototype = {
    constructor: Selection$1,
    select: selection_select,
    selectAll: selection_selectAll,
    selectChild: selection_selectChild,
    selectChildren: selection_selectChildren,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    selection: selection_selection,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch,
    [Symbol.iterator]: selection_iterator
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
        : new Selection$1([[selector]], root);
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    copy: function(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable: function() {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
        : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
        : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
        : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
        : null) // invalid hex
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (-0.5 <= this.r && this.r < 255.5)
          && (-0.5 <= this.g && this.g < 255.5)
          && (-0.5 <= this.b && this.b < 255.5)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex, // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  function rgb_formatRgb() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "hsl(" : "hsla(")
          + (this.h || 0) + ", "
          + (this.s || 0) * 100 + "%, "
          + (this.l || 0) * 100 + "%"
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  var constant = x => () => x;

  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant(isNaN(a) ? b : a);
  }

  var interpolateRgb = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb$1(start, end) {
      var r = color((start = rgb(start)).r, (end = rgb(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$1.gamma = rgbGamma;

    return rgb$1;
  })(1);

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function interpolateString(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  var degrees$1 = 180 / Math.PI;

  var identity$1 = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };

  function decompose(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees$1,
      skewX: Math.atan(skewX) * degrees$1,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var svgNode;

  /* eslint-disable no-undef */
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity$1 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  function parseSvg(value) {
    if (value == null) return identity$1;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
    value = value.matrix;
    return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  function interpolateTransform(parse, pxComma, pxParen, degParen) {

    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }

    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }

    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
        q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }

    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }

    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }

    return function(a, b) {
      var s = [], // string constants and placeholders
          q = []; // number interpolators
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null; // gc
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }

  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  var frame = 0, // is an animation frame pending?
      timeout$1 = 0, // is a timeout pending?
      interval = 0, // are any timers active?
      pokeDelay = 1000, // how frequently we check for clock skew
      taskHead,
      taskTail,
      clockLast = 0,
      clockNow = 0,
      clockSkew = 0,
      clock = typeof performance === "object" && performance.now ? performance : Date,
      setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }

  function clearNow() {
    clockNow = 0;
  }

  function Timer() {
    this._call =
    this._time =
    this._next = null;
  }

  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };

  function timer(callback, delay, time) {
    var t = new Timer;
    t.restart(callback, delay, time);
    return t;
  }

  function timerFlush() {
    now(); // Get the current time, if not already set.
    ++frame; // Pretend we’ve set an alarm, if we haven’t already.
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
      t = t._next;
    }
    --frame;
  }

  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout$1 = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }

  function poke() {
    var now = clock.now(), delay = now - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
  }

  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }

  function sleep(time) {
    if (frame) return; // Soonest alarm already set, or will be.
    if (timeout$1) timeout$1 = clearTimeout(timeout$1);
    var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
    if (delay > 24) {
      if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  function timeout(callback, delay, time) {
    var t = new Timer;
    delay = delay == null ? 0 : +delay;
    t.restart(elapsed => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  var emptyOn = dispatch("start", "end", "cancel", "interrupt");
  var emptyTween = [];

  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;

  function schedule(node, name, id, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id in schedules) return;
    create(node, id, {
      name: name,
      index: index, // For context during callback.
      group: group, // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }

  function init(node, id) {
    var schedule = get(node, id);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }

  function set(node, id) {
    var schedule = get(node, id);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }

  function get(node, id) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
    return schedule;
  }

  function create(node, id, self) {
    var schedules = node.__transition,
        tween;

    // Initialize the self timer when the transition is created.
    // Note the actual delay is not known until the first callback!
    schedules[id] = self;
    self.timer = timer(schedule, 0, self.time);

    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start, self.delay, self.time);

      // If the elapsed delay is less than our first sleep, start immediately.
      if (self.delay <= elapsed) start(elapsed - self.delay);
    }

    function start(elapsed) {
      var i, j, n, o;

      // If the state is not SCHEDULED, then we previously errored on start.
      if (self.state !== SCHEDULED) return stop();

      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;

        // While this element already has a starting transition during this frame,
        // defer starting an interrupting transition until that transition has a
        // chance to tick (and possibly end); see d3/d3-transition#54!
        if (o.state === STARTED) return timeout(start);

        // Interrupt the active transition, if any.
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }

        // Cancel any pre-empted transitions.
        else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }

      // Defer the first tick to end of the current frame; see d3/d3#1576.
      // Note the transition may be canceled after start and before the first tick!
      // Note this must be scheduled before the start event; see d3/d3-transition#16!
      // Assuming this is successful, subsequent callbacks go straight to tick.
      timeout(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });

      // Dispatch the start event.
      // Note this must be done before the tween are initialized.
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return; // interrupted
      self.state = STARTED;

      // Initialize the tween, deleting null tween.
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }

    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
          i = -1,
          n = tween.length;

      while (++i < n) {
        tween[i].call(node, t);
      }

      // Dispatch the end event.
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }

    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id];
      for (var i in schedules) return; // eslint-disable-line no-unused-vars
      delete node.__transition;
    }
  }

  function interrupt(node, name) {
    var schedules = node.__transition,
        schedule,
        active,
        empty = true,
        i;

    if (!schedules) return;

    name = name == null ? null : name + "";

    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }

    if (empty) delete node.__transition;
  }

  function selection_interrupt(name) {
    return this.each(function() {
      interrupt(this, name);
    });
  }

  function tweenRemove(id, name) {
    var tween0, tween1;
    return function() {
      var schedule = set(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }

      schedule.tween = tween1;
    };
  }

  function tweenFunction(id, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error;
    return function() {
      var schedule = set(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }

      schedule.tween = tween1;
    };
  }

  function transition_tween(name, value) {
    var id = this._id;

    name += "";

    if (arguments.length < 2) {
      var tween = get(this.node(), id).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }

    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
  }

  function tweenValue(transition, name, value) {
    var id = transition._id;

    transition.each(function() {
      var schedule = set(this, id);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });

    return function(node) {
      return get(node, id).value[name];
    };
  }

  function interpolate(a, b) {
    var c;
    return (typeof b === "number" ? interpolateNumber
        : b instanceof color ? interpolateRgb
        : (c = color(b)) ? (b = c, interpolateRgb)
        : interpolateString)(a, b);
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrConstantNS(fullname, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrFunction(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function attrFunctionNS(fullname, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function transition_attr(name, value) {
    var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
    return this.attrTween(name, typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
        : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
        : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
  }

  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }

  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }

  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_attrTween(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    var fullname = namespace(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  function delayFunction(id, value) {
    return function() {
      init(this, id).delay = +value.apply(this, arguments);
    };
  }

  function delayConstant(id, value) {
    return value = +value, function() {
      init(this, id).delay = value;
    };
  }

  function transition_delay(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? delayFunction
            : delayConstant)(id, value))
        : get(this.node(), id).delay;
  }

  function durationFunction(id, value) {
    return function() {
      set(this, id).duration = +value.apply(this, arguments);
    };
  }

  function durationConstant(id, value) {
    return value = +value, function() {
      set(this, id).duration = value;
    };
  }

  function transition_duration(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? durationFunction
            : durationConstant)(id, value))
        : get(this.node(), id).duration;
  }

  function easeConstant(id, value) {
    if (typeof value !== "function") throw new Error;
    return function() {
      set(this, id).ease = value;
    };
  }

  function transition_ease(value) {
    var id = this._id;

    return arguments.length
        ? this.each(easeConstant(id, value))
        : get(this.node(), id).ease;
  }

  function easeVarying(id, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error;
      set(this, id).ease = v;
    };
  }

  function transition_easeVarying(value) {
    if (typeof value !== "function") throw new Error;
    return this.each(easeVarying(this._id, value));
  }

  function transition_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  function transition_merge(transition) {
    if (transition._id !== this._id) throw new Error;

    for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Transition(merges, this._parents, this._name, this._id);
  }

  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }

  function onFunction(id, name, listener) {
    var on0, on1, sit = start(name) ? init : set;
    return function() {
      var schedule = sit(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

      schedule.on = on1;
    };
  }

  function transition_on(name, listener) {
    var id = this._id;

    return arguments.length < 2
        ? get(this.node(), id).on.on(name)
        : this.each(onFunction(id, name, listener));
  }

  function removeFunction(id) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id) return;
      if (parent) parent.removeChild(this);
    };
  }

  function transition_remove() {
    return this.on("end.remove", removeFunction(this._id));
  }

  function transition_select(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule(subgroup[i], name, id, i, subgroup, get(node, id));
        }
      }
    }

    return new Transition(subgroups, this._parents, name, id);
  }

  function transition_selectAll(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
            if (child = children[k]) {
              schedule(child, name, id, k, children, inherit);
            }
          }
          subgroups.push(children);
          parents.push(node);
        }
      }
    }

    return new Transition(subgroups, parents, name, id);
  }

  var Selection = selection.prototype.constructor;

  function transition_selection() {
    return new Selection(this._groups, this._parents);
  }

  function styleNull(name, interpolate) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function styleFunction(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          value1 = value(this),
          string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function styleMaybeRemove(id, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
    return function() {
      var schedule = set(this, id),
          on = schedule.on,
          listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

      schedule.on = on1;
    };
  }

  function transition_style(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
    return value == null ? this
        .styleTween(name, styleNull(name, i))
        .on("end.style." + name, styleRemove(name))
      : typeof value === "function" ? this
        .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
        .each(styleMaybeRemove(this._id, name))
      : this
        .styleTween(name, styleConstant(name, i, value), priority)
        .on("end.style." + name, null);
  }

  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }

  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }

  function transition_styleTween(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }

  function transition_text(value) {
    return this.tween("text", typeof value === "function"
        ? textFunction(tweenValue(this, "text", value))
        : textConstant(value == null ? "" : value + ""));
  }

  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }

  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_textTween(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, textTween(value));
  }

  function transition_transition() {
    var name = this._name,
        id0 = this._id,
        id1 = newId();

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit = get(node, id0);
          schedule(node, name, id1, i, group, {
            time: inherit.time + inherit.delay + inherit.duration,
            delay: 0,
            duration: inherit.duration,
            ease: inherit.ease
          });
        }
      }
    }

    return new Transition(groups, this._parents, name, id1);
  }

  function transition_end() {
    var on0, on1, that = this, id = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = {value: reject},
          end = {value: function() { if (--size === 0) resolve(); }};

      that.each(function() {
        var schedule = set(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }

        schedule.on = on1;
      });

      // The selection was empty, resolve end immediately
      if (size === 0) resolve();
    });
  }

  var id = 0;

  function Transition(groups, parents, name, id) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id;
  }

  function newId() {
    return ++id;
  }

  var selection_prototype = selection.prototype;

  Transition.prototype = {
    constructor: Transition,
    select: transition_select,
    selectAll: transition_selectAll,
    filter: transition_filter,
    merge: transition_merge,
    selection: transition_selection,
    transition: transition_transition,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: transition_on,
    attr: transition_attr,
    attrTween: transition_attrTween,
    style: transition_style,
    styleTween: transition_styleTween,
    text: transition_text,
    textTween: transition_textTween,
    remove: transition_remove,
    tween: transition_tween,
    delay: transition_delay,
    duration: transition_duration,
    ease: transition_ease,
    easeVarying: transition_easeVarying,
    end: transition_end,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  var defaultTiming = {
    time: null, // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };

  function inherit(node, id) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id} not found`);
      }
    }
    return timing;
  }

  function selection_transition(name) {
    var id,
        timing;

    if (name instanceof Transition) {
      id = name._id, name = name._name;
    } else {
      id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule(node, name, id, i, group, timing || inherit(node, id));
        }
      }
    }

    return new Transition(groups, this._parents, name, id);
  }

  selection.prototype.interrupt = selection_interrupt;
  selection.prototype.transition = selection_transition;

  var epsilon = 1e-6;
  var epsilon2 = 1e-12;
  var pi = Math.PI;
  var halfPi = pi / 2;
  var quarterPi = pi / 4;
  var tau = pi * 2;

  var degrees = 180 / pi;
  var radians = pi / 180;

  var abs = Math.abs;
  var atan = Math.atan;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var exp = Math.exp;
  var log = Math.log;
  var sin = Math.sin;
  var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
  var sqrt = Math.sqrt;
  var tan = Math.tan;

  function acos(x) {
    return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
  }

  function asin(x) {
    return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
  }

  function noop() {}

  function streamGeometry(geometry, stream) {
    if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
      streamGeometryType[geometry.type](geometry, stream);
    }
  }

  var streamObjectType = {
    Feature: function(object, stream) {
      streamGeometry(object.geometry, stream);
    },
    FeatureCollection: function(object, stream) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) streamGeometry(features[i].geometry, stream);
    }
  };

  var streamGeometryType = {
    Sphere: function(object, stream) {
      stream.sphere();
    },
    Point: function(object, stream) {
      object = object.coordinates;
      stream.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
    },
    LineString: function(object, stream) {
      streamLine(object.coordinates, stream, 0);
    },
    MultiLineString: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamLine(coordinates[i], stream, 0);
    },
    Polygon: function(object, stream) {
      streamPolygon(object.coordinates, stream);
    },
    MultiPolygon: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamPolygon(coordinates[i], stream);
    },
    GeometryCollection: function(object, stream) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) streamGeometry(geometries[i], stream);
    }
  };

  function streamLine(coordinates, stream, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    stream.lineStart();
    while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
    stream.lineEnd();
  }

  function streamPolygon(coordinates, stream) {
    var i = -1, n = coordinates.length;
    stream.polygonStart();
    while (++i < n) streamLine(coordinates[i], stream, 1);
    stream.polygonEnd();
  }

  function geoStream(object, stream) {
    if (object && streamObjectType.hasOwnProperty(object.type)) {
      streamObjectType[object.type](object, stream);
    } else {
      streamGeometry(object, stream);
    }
  }

  function spherical(cartesian) {
    return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
  }

  function cartesian(spherical) {
    var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
    return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
  }

  function cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function cartesianCross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  // TODO return a
  function cartesianAddInPlace(a, b) {
    a[0] += b[0], a[1] += b[1], a[2] += b[2];
  }

  function cartesianScale(vector, k) {
    return [vector[0] * k, vector[1] * k, vector[2] * k];
  }

  // TODO return d
  function cartesianNormalizeInPlace(d) {
    var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l, d[1] /= l, d[2] /= l;
  }

  function compose(a, b) {

    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }

    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };

    return compose;
  }

  function rotationIdentity(lambda, phi) {
    return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
  }

  rotationIdentity.invert = rotationIdentity;

  function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
    return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
      : rotationLambda(deltaLambda))
      : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
      : rotationIdentity);
  }

  function forwardRotationLambda(deltaLambda) {
    return function(lambda, phi) {
      return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
    };
  }

  function rotationLambda(deltaLambda) {
    var rotation = forwardRotationLambda(deltaLambda);
    rotation.invert = forwardRotationLambda(-deltaLambda);
    return rotation;
  }

  function rotationPhiGamma(deltaPhi, deltaGamma) {
    var cosDeltaPhi = cos(deltaPhi),
        sinDeltaPhi = sin(deltaPhi),
        cosDeltaGamma = cos(deltaGamma),
        sinDeltaGamma = sin(deltaGamma);

    function rotation(lambda, phi) {
      var cosPhi = cos(phi),
          x = cos(lambda) * cosPhi,
          y = sin(lambda) * cosPhi,
          z = sin(phi),
          k = z * cosDeltaPhi + x * sinDeltaPhi;
      return [
        atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
        asin(k * cosDeltaGamma + y * sinDeltaGamma)
      ];
    }

    rotation.invert = function(lambda, phi) {
      var cosPhi = cos(phi),
          x = cos(lambda) * cosPhi,
          y = sin(lambda) * cosPhi,
          z = sin(phi),
          k = z * cosDeltaGamma - y * sinDeltaGamma;
      return [
        atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
        asin(k * cosDeltaPhi - x * sinDeltaPhi)
      ];
    };

    return rotation;
  }

  function rotation(rotate) {
    rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

    function forward(coordinates) {
      coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
      return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
    }

    forward.invert = function(coordinates) {
      coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
      return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
    };

    return forward;
  }

  // Generates a circle centered at [0°, 0°], with a given radius and precision.
  function circleStream(stream, radius, delta, direction, t0, t1) {
    if (!delta) return;
    var cosRadius = cos(radius),
        sinRadius = sin(radius),
        step = direction * delta;
    if (t0 == null) {
      t0 = radius + direction * tau;
      t1 = radius - step / 2;
    } else {
      t0 = circleRadius(cosRadius, t0);
      t1 = circleRadius(cosRadius, t1);
      if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
    }
    for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
      point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
      stream.point(point[0], point[1]);
    }
  }

  // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
  function circleRadius(cosRadius, point) {
    point = cartesian(point), point[0] -= cosRadius;
    cartesianNormalizeInPlace(point);
    var radius = acos(-point[1]);
    return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
  }

  function clipBuffer() {
    var lines = [],
        line;
    return {
      point: function(x, y, m) {
        line.push([x, y, m]);
      },
      lineStart: function() {
        lines.push(line = []);
      },
      lineEnd: noop,
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      },
      result: function() {
        var result = lines;
        lines = [];
        line = null;
        return result;
      }
    };
  }

  function pointEqual(a, b) {
    return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
  }

  function Intersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other; // another intersection
    this.e = entry; // is an entry?
    this.v = false; // visited
    this.n = this.p = null; // next & previous
  }

  // A generalized polygon clipping algorithm: given a polygon that has been cut
  // into its visible line segments, and rejoins the segments by interpolating
  // along the clip edge.
  function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
    var subject = [],
        clip = [],
        i,
        n;

    segments.forEach(function(segment) {
      if ((n = segment.length - 1) <= 0) return;
      var n, p0 = segment[0], p1 = segment[n], x;

      if (pointEqual(p0, p1)) {
        if (!p0[2] && !p1[2]) {
          stream.lineStart();
          for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
          stream.lineEnd();
          return;
        }
        // handle degenerate cases by moving the point
        p1[0] += 2 * epsilon;
      }

      subject.push(x = new Intersection(p0, segment, null, true));
      clip.push(x.o = new Intersection(p0, null, x, false));
      subject.push(x = new Intersection(p1, segment, null, false));
      clip.push(x.o = new Intersection(p1, null, x, true));
    });

    if (!subject.length) return;

    clip.sort(compareIntersection);
    link(subject);
    link(clip);

    for (i = 0, n = clip.length; i < n; ++i) {
      clip[i].e = startInside = !startInside;
    }

    var start = subject[0],
        points,
        point;

    while (1) {
      // Find first unvisited intersection.
      var current = start,
          isSubject = true;
      while (current.v) if ((current = current.n) === start) return;
      points = current.z;
      stream.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, stream);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, stream);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      stream.lineEnd();
    }
  }

  function link(array) {
    if (!(n = array.length)) return;
    var n,
        i = 0,
        a = array[0],
        b;
    while (++i < n) {
      a.n = b = array[i];
      b.p = a;
      a = b;
    }
    a.n = b = array[0];
    b.p = a;
  }

  function longitude(point) {
    if (abs(point[0]) <= pi)
      return point[0];
    else
      return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
  }

  function polygonContains(polygon, point) {
    var lambda = longitude(point),
        phi = point[1],
        sinPhi = sin(phi),
        normal = [sin(lambda), -cos(lambda), 0],
        angle = 0,
        winding = 0;

    var sum = new Adder();

    if (sinPhi === 1) phi = halfPi + epsilon;
    else if (sinPhi === -1) phi = -halfPi - epsilon;

    for (var i = 0, n = polygon.length; i < n; ++i) {
      if (!(m = (ring = polygon[i]).length)) continue;
      var ring,
          m,
          point0 = ring[m - 1],
          lambda0 = longitude(point0),
          phi0 = point0[1] / 2 + quarterPi,
          sinPhi0 = sin(phi0),
          cosPhi0 = cos(phi0);

      for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
        var point1 = ring[j],
            lambda1 = longitude(point1),
            phi1 = point1[1] / 2 + quarterPi,
            sinPhi1 = sin(phi1),
            cosPhi1 = cos(phi1),
            delta = lambda1 - lambda0,
            sign = delta >= 0 ? 1 : -1,
            absDelta = sign * delta,
            antimeridian = absDelta > pi,
            k = sinPhi0 * sinPhi1;

        sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
        angle += antimeridian ? delta + sign * tau : delta;

        // Are the longitudes either side of the point’s meridian (lambda),
        // and are the latitudes smaller than the parallel (phi)?
        if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
          var arc = cartesianCross(cartesian(point0), cartesian(point1));
          cartesianNormalizeInPlace(arc);
          var intersection = cartesianCross(normal, arc);
          cartesianNormalizeInPlace(intersection);
          var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
          if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
            winding += antimeridian ^ delta >= 0 ? 1 : -1;
          }
        }
      }
    }

    // First, determine whether the South pole is inside or outside:
    //
    // It is inside if:
    // * the polygon winds around it in a clockwise direction.
    // * the polygon does not (cumulatively) wind around it, but has a negative
    //   (counter-clockwise) area.
    //
    // Second, count the (signed) number of times a segment crosses a lambda
    // from the point to the South pole.  If it is zero, then the point is the
    // same side as the South pole.

    return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ (winding & 1);
  }

  function clip(pointVisible, clipLine, interpolate, start) {
    return function(sink) {
      var line = clipLine(sink),
          ringBuffer = clipBuffer(),
          ringSink = clipLine(ringBuffer),
          polygonStarted = false,
          polygon,
          segments,
          ring;

      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = merge(segments);
          var startInside = polygonContains(polygon, start);
          if (segments.length) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
          } else if (startInside) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
          }
          if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          sink.polygonStart();
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
          sink.polygonEnd();
        }
      };

      function point(lambda, phi) {
        if (pointVisible(lambda, phi)) sink.point(lambda, phi);
      }

      function pointLine(lambda, phi) {
        line.point(lambda, phi);
      }

      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }

      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }

      function pointRing(lambda, phi) {
        ring.push([lambda, phi]);
        ringSink.point(lambda, phi);
      }

      function ringStart() {
        ringSink.lineStart();
        ring = [];
      }

      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringSink.lineEnd();

        var clean = ringSink.clean(),
            ringSegments = ringBuffer.result(),
            i, n = ringSegments.length, m,
            segment,
            point;

        ring.pop();
        polygon.push(ring);
        ring = null;

        if (!n) return;

        // No intersections.
        if (clean & 1) {
          segment = ringSegments[0];
          if ((m = segment.length - 1) > 0) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
            sink.lineEnd();
          }
          return;
        }

        // Rejoin connected segments.
        // TODO reuse ringBuffer.rejoin()?
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

        segments.push(ringSegments.filter(validSegment));
      }

      return clip;
    };
  }

  function validSegment(segment) {
    return segment.length > 1;
  }

  // Intersections are sorted along the clip edge. For both antimeridian cutting
  // and circle clipping, the same comparison is used.
  function compareIntersection(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
         - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
  }

  var clipAntimeridian = clip(
    function() { return true; },
    clipAntimeridianLine,
    clipAntimeridianInterpolate,
    [-pi, -halfPi]
  );

  // Takes a line and cuts into visible segments. Return values: 0 - there were
  // intersections or the line was empty; 1 - no intersections; 2 - there were
  // intersections, and the first and last segments should be rejoined.
  function clipAntimeridianLine(stream) {
    var lambda0 = NaN,
        phi0 = NaN,
        sign0 = NaN,
        clean; // no intersections

    return {
      lineStart: function() {
        stream.lineStart();
        clean = 1;
      },
      point: function(lambda1, phi1) {
        var sign1 = lambda1 > 0 ? pi : -pi,
            delta = abs(lambda1 - lambda0);
        if (abs(delta - pi) < epsilon) { // line crosses a pole
          stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          stream.point(lambda1, phi0);
          clean = 0;
        } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
          if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
          if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
          phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          clean = 0;
        }
        stream.point(lambda0 = lambda1, phi0 = phi1);
        sign0 = sign1;
      },
      lineEnd: function() {
        stream.lineEnd();
        lambda0 = phi0 = NaN;
      },
      clean: function() {
        return 2 - clean; // if intersections, rejoin first and last segments
      }
    };
  }

  function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
    var cosPhi0,
        cosPhi1,
        sinLambda0Lambda1 = sin(lambda0 - lambda1);
    return abs(sinLambda0Lambda1) > epsilon
        ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
            - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
            / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
        : (phi0 + phi1) / 2;
  }

  function clipAntimeridianInterpolate(from, to, direction, stream) {
    var phi;
    if (from == null) {
      phi = direction * halfPi;
      stream.point(-pi, phi);
      stream.point(0, phi);
      stream.point(pi, phi);
      stream.point(pi, 0);
      stream.point(pi, -phi);
      stream.point(0, -phi);
      stream.point(-pi, -phi);
      stream.point(-pi, 0);
      stream.point(-pi, phi);
    } else if (abs(from[0] - to[0]) > epsilon) {
      var lambda = from[0] < to[0] ? pi : -pi;
      phi = direction * lambda / 2;
      stream.point(-lambda, phi);
      stream.point(0, phi);
      stream.point(lambda, phi);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  function clipCircle(radius) {
    var cr = cos(radius),
        delta = 6 * radians,
        smallRadius = cr > 0,
        notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

    function interpolate(from, to, direction, stream) {
      circleStream(stream, radius, delta, direction, from, to);
    }

    function visible(lambda, phi) {
      return cos(lambda) * cos(phi) > cr;
    }

    // Takes a line and cuts into visible segments. Return values used for polygon
    // clipping: 0 - there were intersections or the line was empty; 1 - no
    // intersections 2 - there were intersections, and the first and last segments
    // should be rejoined.
    function clipLine(stream) {
      var point0, // previous point
          c0, // code for previous point
          v0, // visibility of previous point
          v00, // visibility of first point
          clean; // no intersections
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(lambda, phi) {
          var point1 = [lambda, phi],
              point2,
              v = visible(lambda, phi),
              c = smallRadius
                ? v ? 0 : code(lambda, phi)
                : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
          if (!point0 && (v00 = v0 = v)) stream.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
              point1[2] = 1;
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              // outside going in
              stream.lineStart();
              point2 = intersect(point1, point0);
              stream.point(point2[0], point2[1]);
            } else {
              // inside going out
              point2 = intersect(point0, point1);
              stream.point(point2[0], point2[1], 2);
              stream.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            // If the codes for two points are different, or are both zero,
            // and there this segment intersects with the small circle.
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                stream.lineStart();
                stream.point(t[0][0], t[0][1]);
                stream.point(t[1][0], t[1][1]);
                stream.lineEnd();
              } else {
                stream.point(t[1][0], t[1][1]);
                stream.lineEnd();
                stream.lineStart();
                stream.point(t[0][0], t[0][1], 3);
              }
            }
          }
          if (v && (!point0 || !pointEqual(point0, point1))) {
            stream.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) stream.lineEnd();
          point0 = null;
        },
        // Rejoin first and last segments if there were intersections and the first
        // and last points were visible.
        clean: function() {
          return clean | ((v00 && v0) << 1);
        }
      };
    }

    // Intersects the great circle between a and b with the clip circle.
    function intersect(a, b, two) {
      var pa = cartesian(a),
          pb = cartesian(b);

      // We have two planes, n1.p = d1 and n2.p = d2.
      // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
      var n1 = [1, 0, 0], // normal
          n2 = cartesianCross(pa, pb),
          n2n2 = cartesianDot(n2, n2),
          n1n2 = n2[0], // cartesianDot(n1, n2),
          determinant = n2n2 - n1n2 * n1n2;

      // Two polar points.
      if (!determinant) return !two && a;

      var c1 =  cr * n2n2 / determinant,
          c2 = -cr * n1n2 / determinant,
          n1xn2 = cartesianCross(n1, n2),
          A = cartesianScale(n1, c1),
          B = cartesianScale(n2, c2);
      cartesianAddInPlace(A, B);

      // Solve |p(t)|^2 = 1.
      var u = n1xn2,
          w = cartesianDot(A, u),
          uu = cartesianDot(u, u),
          t2 = w * w - uu * (cartesianDot(A, A) - 1);

      if (t2 < 0) return;

      var t = sqrt(t2),
          q = cartesianScale(u, (-w - t) / uu);
      cartesianAddInPlace(q, A);
      q = spherical(q);

      if (!two) return q;

      // Two intersection points.
      var lambda0 = a[0],
          lambda1 = b[0],
          phi0 = a[1],
          phi1 = b[1],
          z;

      if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

      var delta = lambda1 - lambda0,
          polar = abs(delta - pi) < epsilon,
          meridian = polar || delta < epsilon;

      if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

      // Check that the first point is between a and b.
      if (meridian
          ? polar
            ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
            : phi0 <= q[1] && q[1] <= phi1
          : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
        var q1 = cartesianScale(u, (-w + t) / uu);
        cartesianAddInPlace(q1, A);
        return [q, spherical(q1)];
      }
    }

    // Generates a 4-bit vector representing the location of a point relative to
    // the small circle's bounding box.
    function code(lambda, phi) {
      var r = smallRadius ? radius : pi - radius,
          code = 0;
      if (lambda < -r) code |= 1; // left
      else if (lambda > r) code |= 2; // right
      if (phi < -r) code |= 4; // below
      else if (phi > r) code |= 8; // above
      return code;
    }

    return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
  }

  function clipLine(a, b, x0, y0, x1, y1) {
    var ax = a[0],
        ay = a[1],
        bx = b[0],
        by = b[1],
        t0 = 0,
        t1 = 1,
        dx = bx - ax,
        dy = by - ay,
        r;

    r = x0 - ax;
    if (!dx && r > 0) return;
    r /= dx;
    if (dx < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dx > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }

    r = x1 - ax;
    if (!dx && r < 0) return;
    r /= dx;
    if (dx < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dx > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }

    r = y0 - ay;
    if (!dy && r > 0) return;
    r /= dy;
    if (dy < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dy > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }

    r = y1 - ay;
    if (!dy && r < 0) return;
    r /= dy;
    if (dy < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dy > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }

    if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
    if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
    return true;
  }

  var clipMax = 1e9, clipMin = -clipMax;

  // TODO Use d3-polygon’s polygonContains here for the ring check?
  // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

  function clipRectangle(x0, y0, x1, y1) {

    function visible(x, y) {
      return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    }

    function interpolate(from, to, direction, stream) {
      var a = 0, a1 = 0;
      if (from == null
          || (a = corner(from, direction)) !== (a1 = corner(to, direction))
          || comparePoint(from, to) < 0 ^ direction > 0) {
        do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
        while ((a = (a + direction + 4) % 4) !== a1);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function corner(p, direction) {
      return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
          : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
          : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
          : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
    }

    function compareIntersection(a, b) {
      return comparePoint(a.x, b.x);
    }

    function comparePoint(a, b) {
      var ca = corner(a, 1),
          cb = corner(b, 1);
      return ca !== cb ? ca - cb
          : ca === 0 ? b[1] - a[1]
          : ca === 1 ? a[0] - b[0]
          : ca === 2 ? a[1] - b[1]
          : b[0] - a[0];
    }

    return function(stream) {
      var activeStream = stream,
          bufferStream = clipBuffer(),
          segments,
          polygon,
          ring,
          x__, y__, v__, // first point
          x_, y_, v_, // previous point
          first,
          clean;

      var clipStream = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: polygonStart,
        polygonEnd: polygonEnd
      };

      function point(x, y) {
        if (visible(x, y)) activeStream.point(x, y);
      }

      function polygonInside() {
        var winding = 0;

        for (var i = 0, n = polygon.length; i < n; ++i) {
          for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
            a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
            if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
            else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
          }
        }

        return winding;
      }

      // Buffer geometry within a polygon and then clip it en masse.
      function polygonStart() {
        activeStream = bufferStream, segments = [], polygon = [], clean = true;
      }

      function polygonEnd() {
        var startInside = polygonInside(),
            cleanInside = clean && startInside,
            visible = (segments = merge(segments)).length;
        if (cleanInside || visible) {
          stream.polygonStart();
          if (cleanInside) {
            stream.lineStart();
            interpolate(null, null, 1, stream);
            stream.lineEnd();
          }
          if (visible) {
            clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
          }
          stream.polygonEnd();
        }
        activeStream = stream, segments = polygon = ring = null;
      }

      function lineStart() {
        clipStream.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }

      // TODO rather than special-case polygons, simply handle them separately.
      // Ideally, coincident intersection points should be jittered to avoid
      // clipping issues.
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferStream.rejoin();
          segments.push(bufferStream.result());
        }
        clipStream.point = point;
        if (v_) activeStream.lineEnd();
      }

      function linePoint(x, y) {
        var v = visible(x, y);
        if (polygon) ring.push([x, y]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
          }
        } else {
          if (v && v_) activeStream.point(x, y);
          else {
            var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
            if (clipLine(a, b, x0, y0, x1, y1)) {
              if (!v_) {
                activeStream.lineStart();
                activeStream.point(a[0], a[1]);
              }
              activeStream.point(b[0], b[1]);
              if (!v) activeStream.lineEnd();
              clean = false;
            } else if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }

      return clipStream;
    };
  }

  var identity = x => x;

  var areaSum = new Adder(),
      areaRingSum = new Adder(),
      x00$2,
      y00$2,
      x0$3,
      y0$3;

  var areaStream = {
    point: noop,
    lineStart: noop,
    lineEnd: noop,
    polygonStart: function() {
      areaStream.lineStart = areaRingStart;
      areaStream.lineEnd = areaRingEnd;
    },
    polygonEnd: function() {
      areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop;
      areaSum.add(abs(areaRingSum));
      areaRingSum = new Adder();
    },
    result: function() {
      var area = areaSum / 2;
      areaSum = new Adder();
      return area;
    }
  };

  function areaRingStart() {
    areaStream.point = areaPointFirst;
  }

  function areaPointFirst(x, y) {
    areaStream.point = areaPoint;
    x00$2 = x0$3 = x, y00$2 = y0$3 = y;
  }

  function areaPoint(x, y) {
    areaRingSum.add(y0$3 * x - x0$3 * y);
    x0$3 = x, y0$3 = y;
  }

  function areaRingEnd() {
    areaPoint(x00$2, y00$2);
  }

  var x0$2 = Infinity,
      y0$2 = x0$2,
      x1 = -x0$2,
      y1 = x1;

  var boundsStream = {
    point: boundsPoint,
    lineStart: noop,
    lineEnd: noop,
    polygonStart: noop,
    polygonEnd: noop,
    result: function() {
      var bounds = [[x0$2, y0$2], [x1, y1]];
      x1 = y1 = -(y0$2 = x0$2 = Infinity);
      return bounds;
    }
  };

  function boundsPoint(x, y) {
    if (x < x0$2) x0$2 = x;
    if (x > x1) x1 = x;
    if (y < y0$2) y0$2 = y;
    if (y > y1) y1 = y;
  }

  // TODO Enforce positive area for exterior, negative area for interior?

  var X0 = 0,
      Y0 = 0,
      Z0 = 0,
      X1 = 0,
      Y1 = 0,
      Z1 = 0,
      X2 = 0,
      Y2 = 0,
      Z2 = 0,
      x00$1,
      y00$1,
      x0$1,
      y0$1;

  var centroidStream = {
    point: centroidPoint,
    lineStart: centroidLineStart,
    lineEnd: centroidLineEnd,
    polygonStart: function() {
      centroidStream.lineStart = centroidRingStart;
      centroidStream.lineEnd = centroidRingEnd;
    },
    polygonEnd: function() {
      centroidStream.point = centroidPoint;
      centroidStream.lineStart = centroidLineStart;
      centroidStream.lineEnd = centroidLineEnd;
    },
    result: function() {
      var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
          : Z1 ? [X1 / Z1, Y1 / Z1]
          : Z0 ? [X0 / Z0, Y0 / Z0]
          : [NaN, NaN];
      X0 = Y0 = Z0 =
      X1 = Y1 = Z1 =
      X2 = Y2 = Z2 = 0;
      return centroid;
    }
  };

  function centroidPoint(x, y) {
    X0 += x;
    Y0 += y;
    ++Z0;
  }

  function centroidLineStart() {
    centroidStream.point = centroidPointFirstLine;
  }

  function centroidPointFirstLine(x, y) {
    centroidStream.point = centroidPointLine;
    centroidPoint(x0$1 = x, y0$1 = y);
  }

  function centroidPointLine(x, y) {
    var dx = x - x0$1, dy = y - y0$1, z = sqrt(dx * dx + dy * dy);
    X1 += z * (x0$1 + x) / 2;
    Y1 += z * (y0$1 + y) / 2;
    Z1 += z;
    centroidPoint(x0$1 = x, y0$1 = y);
  }

  function centroidLineEnd() {
    centroidStream.point = centroidPoint;
  }

  function centroidRingStart() {
    centroidStream.point = centroidPointFirstRing;
  }

  function centroidRingEnd() {
    centroidPointRing(x00$1, y00$1);
  }

  function centroidPointFirstRing(x, y) {
    centroidStream.point = centroidPointRing;
    centroidPoint(x00$1 = x0$1 = x, y00$1 = y0$1 = y);
  }

  function centroidPointRing(x, y) {
    var dx = x - x0$1,
        dy = y - y0$1,
        z = sqrt(dx * dx + dy * dy);

    X1 += z * (x0$1 + x) / 2;
    Y1 += z * (y0$1 + y) / 2;
    Z1 += z;

    z = y0$1 * x - x0$1 * y;
    X2 += z * (x0$1 + x);
    Y2 += z * (y0$1 + y);
    Z2 += z * 3;
    centroidPoint(x0$1 = x, y0$1 = y);
  }

  function PathContext(context) {
    this._context = context;
  }

  PathContext.prototype = {
    _radius: 4.5,
    pointRadius: function(_) {
      return this._radius = _, this;
    },
    polygonStart: function() {
      this._line = 0;
    },
    polygonEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line === 0) this._context.closePath();
      this._point = NaN;
    },
    point: function(x, y) {
      switch (this._point) {
        case 0: {
          this._context.moveTo(x, y);
          this._point = 1;
          break;
        }
        case 1: {
          this._context.lineTo(x, y);
          break;
        }
        default: {
          this._context.moveTo(x + this._radius, y);
          this._context.arc(x, y, this._radius, 0, tau);
          break;
        }
      }
    },
    result: noop
  };

  var lengthSum = new Adder(),
      lengthRing,
      x00,
      y00,
      x0,
      y0;

  var lengthStream = {
    point: noop,
    lineStart: function() {
      lengthStream.point = lengthPointFirst;
    },
    lineEnd: function() {
      if (lengthRing) lengthPoint(x00, y00);
      lengthStream.point = noop;
    },
    polygonStart: function() {
      lengthRing = true;
    },
    polygonEnd: function() {
      lengthRing = null;
    },
    result: function() {
      var length = +lengthSum;
      lengthSum = new Adder();
      return length;
    }
  };

  function lengthPointFirst(x, y) {
    lengthStream.point = lengthPoint;
    x00 = x0 = x, y00 = y0 = y;
  }

  function lengthPoint(x, y) {
    x0 -= x, y0 -= y;
    lengthSum.add(sqrt(x0 * x0 + y0 * y0));
    x0 = x, y0 = y;
  }

  function PathString() {
    this._string = [];
  }

  PathString.prototype = {
    _radius: 4.5,
    _circle: circle(4.5),
    pointRadius: function(_) {
      if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
      return this;
    },
    polygonStart: function() {
      this._line = 0;
    },
    polygonEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line === 0) this._string.push("Z");
      this._point = NaN;
    },
    point: function(x, y) {
      switch (this._point) {
        case 0: {
          this._string.push("M", x, ",", y);
          this._point = 1;
          break;
        }
        case 1: {
          this._string.push("L", x, ",", y);
          break;
        }
        default: {
          if (this._circle == null) this._circle = circle(this._radius);
          this._string.push("M", x, ",", y, this._circle);
          break;
        }
      }
    },
    result: function() {
      if (this._string.length) {
        var result = this._string.join("");
        this._string = [];
        return result;
      } else {
        return null;
      }
    }
  };

  function circle(radius) {
    return "m0," + radius
        + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
        + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
        + "z";
  }

  function geoPath(projection, context) {
    var pointRadius = 4.5,
        projectionStream,
        contextStream;

    function path(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        geoStream(object, projectionStream(contextStream));
      }
      return contextStream.result();
    }

    path.area = function(object) {
      geoStream(object, projectionStream(areaStream));
      return areaStream.result();
    };

    path.measure = function(object) {
      geoStream(object, projectionStream(lengthStream));
      return lengthStream.result();
    };

    path.bounds = function(object) {
      geoStream(object, projectionStream(boundsStream));
      return boundsStream.result();
    };

    path.centroid = function(object) {
      geoStream(object, projectionStream(centroidStream));
      return centroidStream.result();
    };

    path.projection = function(_) {
      return arguments.length ? (projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream, path) : projection;
    };

    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return path;
    };

    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };

    return path.projection(projection).context(context);
  }

  function transformer(methods) {
    return function(stream) {
      var s = new TransformStream;
      for (var key in methods) s[key] = methods[key];
      s.stream = stream;
      return s;
    };
  }

  function TransformStream() {}

  TransformStream.prototype = {
    constructor: TransformStream,
    point: function(x, y) { this.stream.point(x, y); },
    sphere: function() { this.stream.sphere(); },
    lineStart: function() { this.stream.lineStart(); },
    lineEnd: function() { this.stream.lineEnd(); },
    polygonStart: function() { this.stream.polygonStart(); },
    polygonEnd: function() { this.stream.polygonEnd(); }
  };

  function fit(projection, fitBounds, object) {
    var clip = projection.clipExtent && projection.clipExtent();
    projection.scale(150).translate([0, 0]);
    if (clip != null) projection.clipExtent(null);
    geoStream(object, projection.stream(boundsStream));
    fitBounds(boundsStream.result());
    if (clip != null) projection.clipExtent(clip);
    return projection;
  }

  function fitExtent(projection, extent, object) {
    return fit(projection, function(b) {
      var w = extent[1][0] - extent[0][0],
          h = extent[1][1] - extent[0][1],
          k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
          x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
          y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  function fitSize(projection, size, object) {
    return fitExtent(projection, [[0, 0], size], object);
  }

  function fitWidth(projection, width, object) {
    return fit(projection, function(b) {
      var w = +width,
          k = w / (b[1][0] - b[0][0]),
          x = (w - k * (b[1][0] + b[0][0])) / 2,
          y = -k * b[0][1];
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  function fitHeight(projection, height, object) {
    return fit(projection, function(b) {
      var h = +height,
          k = h / (b[1][1] - b[0][1]),
          x = -k * b[0][0],
          y = (h - k * (b[1][1] + b[0][1])) / 2;
      projection.scale(150 * k).translate([x, y]);
    }, object);
  }

  var maxDepth = 16, // maximum depth of subdivision
      cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

  function resample(project, delta2) {
    return +delta2 ? resample$1(project, delta2) : resampleNone(project);
  }

  function resampleNone(project) {
    return transformer({
      point: function(x, y) {
        x = project(x, y);
        this.stream.point(x[0], x[1]);
      }
    });
  }

  function resample$1(project, delta2) {

    function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0,
          dy = y1 - y0,
          d2 = dx * dx + dy * dy;
      if (d2 > 4 * delta2 && depth--) {
        var a = a0 + a1,
            b = b0 + b1,
            c = c0 + c1,
            m = sqrt(a * a + b * b + c * c),
            phi2 = asin(c /= m),
            lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
            p = project(lambda2, phi2),
            x2 = p[0],
            y2 = p[1],
            dx2 = x2 - x0,
            dy2 = y2 - y0,
            dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > delta2 // perpendicular projected distance
            || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
            || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
        }
      }
    }
    return function(stream) {
      var lambda00, x00, y00, a00, b00, c00, // first point
          lambda0, x0, y0, a0, b0, c0; // previous point

      var resampleStream = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
        polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
      };

      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }

      function lineStart() {
        x0 = NaN;
        resampleStream.point = linePoint;
        stream.lineStart();
      }

      function linePoint(lambda, phi) {
        var c = cartesian([lambda, phi]), p = project(lambda, phi);
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }

      function lineEnd() {
        resampleStream.point = point;
        stream.lineEnd();
      }

      function ringStart() {
        lineStart();
        resampleStream.point = ringPoint;
        resampleStream.lineEnd = ringEnd;
      }

      function ringPoint(lambda, phi) {
        linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resampleStream.point = linePoint;
      }

      function ringEnd() {
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
        resampleStream.lineEnd = lineEnd;
        lineEnd();
      }

      return resampleStream;
    };
  }

  var transformRadians = transformer({
    point: function(x, y) {
      this.stream.point(x * radians, y * radians);
    }
  });

  function transformRotate(rotate) {
    return transformer({
      point: function(x, y) {
        var r = rotate(x, y);
        return this.stream.point(r[0], r[1]);
      }
    });
  }

  function scaleTranslate(k, dx, dy, sx, sy) {
    function transform(x, y) {
      x *= sx; y *= sy;
      return [dx + k * x, dy - k * y];
    }
    transform.invert = function(x, y) {
      return [(x - dx) / k * sx, (dy - y) / k * sy];
    };
    return transform;
  }

  function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
    if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
    var cosAlpha = cos(alpha),
        sinAlpha = sin(alpha),
        a = cosAlpha * k,
        b = sinAlpha * k,
        ai = cosAlpha / k,
        bi = sinAlpha / k,
        ci = (sinAlpha * dy - cosAlpha * dx) / k,
        fi = (sinAlpha * dx + cosAlpha * dy) / k;
    function transform(x, y) {
      x *= sx; y *= sy;
      return [a * x - b * y + dx, dy - b * x - a * y];
    }
    transform.invert = function(x, y) {
      return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
    };
    return transform;
  }

  function projection$1(project) {
    return projectionMutator(function() { return project; })();
  }

  function projectionMutator(projectAt) {
    var project,
        k = 150, // scale
        x = 480, y = 250, // translate
        lambda = 0, phi = 0, // center
        deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
        alpha = 0, // post-rotate angle
        sx = 1, // reflectX
        sy = 1, // reflectX
        theta = null, preclip = clipAntimeridian, // pre-clip angle
        x0 = null, y0, x1, y1, postclip = identity, // post-clip extent
        delta2 = 0.5, // precision
        projectResample,
        projectTransform,
        projectRotateTransform,
        cache,
        cacheStream;

    function projection(point) {
      return projectRotateTransform(point[0] * radians, point[1] * radians);
    }

    function invert(point) {
      point = projectRotateTransform.invert(point[0], point[1]);
      return point && [point[0] * degrees, point[1] * degrees];
    }

    projection.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
    };

    projection.preclip = function(_) {
      return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
    };

    projection.postclip = function(_) {
      return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
    };

    projection.clipAngle = function(_) {
      return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
    };

    projection.clipExtent = function(_) {
      return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
    };

    projection.scale = function(_) {
      return arguments.length ? (k = +_, recenter()) : k;
    };

    projection.translate = function(_) {
      return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
    };

    projection.center = function(_) {
      return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
    };

    projection.rotate = function(_) {
      return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
    };

    projection.angle = function(_) {
      return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
    };

    projection.reflectX = function(_) {
      return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
    };

    projection.reflectY = function(_) {
      return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
    };

    projection.precision = function(_) {
      return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
    };

    projection.fitExtent = function(extent, object) {
      return fitExtent(projection, extent, object);
    };

    projection.fitSize = function(size, object) {
      return fitSize(projection, size, object);
    };

    projection.fitWidth = function(width, object) {
      return fitWidth(projection, width, object);
    };

    projection.fitHeight = function(height, object) {
      return fitHeight(projection, height, object);
    };

    function recenter() {
      var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
          transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
      rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
      projectTransform = compose(project, transform);
      projectRotateTransform = compose(rotate, projectTransform);
      projectResample = resample(projectTransform, delta2);
      return reset();
    }

    function reset() {
      cache = cacheStream = null;
      return projection;
    }

    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return recenter();
    };
  }

  function mercatorRaw(lambda, phi) {
    return [lambda, log(tan((halfPi + phi) / 2))];
  }

  mercatorRaw.invert = function(x, y) {
    return [x, 2 * atan(exp(y)) - halfPi];
  };

  function geoMercator() {
    return mercatorProjection(mercatorRaw)
        .scale(961 / tau);
  }

  function mercatorProjection(project) {
    var m = projection$1(project),
        center = m.center,
        scale = m.scale,
        translate = m.translate,
        clipExtent = m.clipExtent,
        x0 = null, y0, x1, y1; // clip extent

    m.scale = function(_) {
      return arguments.length ? (scale(_), reclip()) : scale();
    };

    m.translate = function(_) {
      return arguments.length ? (translate(_), reclip()) : translate();
    };

    m.center = function(_) {
      return arguments.length ? (center(_), reclip()) : center();
    };

    m.clipExtent = function(_) {
      return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
    };

    function reclip() {
      var k = pi * scale(),
          t = m(rotation(m.rotate()).invert([0, 0]));
      return clipExtent(x0 == null
          ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
          ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
          : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
    }

    return reclip();
  }

  var bars = [
  	[
  		7.3595623,
  		46.2320079
  	],
  	[
  		7.3571448,
  		46.2317543
  	],
  	[
  		7.3628953,
  		46.2319292
  	],
  	[
  		7.3578263,
  		46.2324081
  	],
  	[
  		7.3610683,
  		46.2315552
  	],
  	[
  		7.3590366,
  		46.2325246
  	],
  	[
  		7.3600302,
  		46.2313626
  	],
  	[
  		7.3600541,
  		46.2335208
  	],
  	[
  		7.3590514,
  		46.2330274
  	],
  	[
  		7.3615194,
  		46.2318622
  	],
  	[
  		7.3619735,
  		46.2325311
  	],
  	[
  		7.3597337,
  		46.2308414
  	]
  ];

  var batiments = [
  	{
  		type: "Feature",
  		id: "relation/4445990",
  		properties: {
  			timestamp: "2014-12-31T21:38:56Z",
  			version: "1",
  			changeset: "27831348",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "22",
  			"addr:street": "Rue des C├¿dres",
  			building: "yes",
  			type: "multipolygon",
  			id: "relation/4445990"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3634581,
  						46.2310034
  					],
  					[
  						7.3633855,
  						46.2309464
  					],
  					[
  						7.3634204,
  						46.2309203
  					],
  					[
  						7.3633238,
  						46.2308514
  					],
  					[
  						7.3631912,
  						46.2309403
  					],
  					[
  						7.3633531,
  						46.2310675
  					],
  					[
  						7.3634581,
  						46.2310034
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/219963005",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "23",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			source: "Bing",
  			id: "way/219963005"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3589423,
  						46.2324908
  					],
  					[
  						7.3590583,
  						46.2323188
  					],
  					[
  						7.3588005,
  						46.2322356
  					],
  					[
  						7.3586845,
  						46.2324076
  					],
  					[
  						7.3589423,
  						46.2324908
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/219963006",
  		properties: {
  			timestamp: "2020-01-26T09:12:11Z",
  			version: "3",
  			changeset: "80091996",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "35",
  			"addr:street": "Avenue de la Gare",
  			building: "office",
  			source: "Bing",
  			id: "way/219963006"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3569484,
  						46.2324276
  					],
  					[
  						7.3571269,
  						46.2321274
  					],
  					[
  						7.3568428,
  						46.2320465
  					],
  					[
  						7.3567897,
  						46.2321357
  					],
  					[
  						7.3568714,
  						46.232159
  					],
  					[
  						7.3567459,
  						46.23237
  					],
  					[
  						7.3569484,
  						46.2324276
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/219963007",
  		properties: {
  			timestamp: "2015-01-19T08:41:22Z",
  			version: "2",
  			changeset: "28247624",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "36",
  			"addr:street": "Avenue de la Gare",
  			building: "yes",
  			source: "Bing",
  			id: "way/219963007"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3577045,
  						46.2317041
  					],
  					[
  						7.3575354,
  						46.2319887
  					],
  					[
  						7.3577385,
  						46.2320503
  					],
  					[
  						7.3578039,
  						46.2319235
  					],
  					[
  						7.3578154,
  						46.2319041
  					],
  					[
  						7.3579008,
  						46.2317596
  					],
  					[
  						7.3577045,
  						46.2317041
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/219963008",
  		properties: {
  			timestamp: "2020-12-20T07:24:55Z",
  			version: "4",
  			changeset: "96130403",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "39",
  			"addr:street": "Avenue de la Gare",
  			building: "office",
  			"building:levels": "5",
  			"roof:levels": "1",
  			source: "Bing",
  			id: "way/219963008"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3567085,
  						46.2324812
  					],
  					[
  						7.3566392,
  						46.2326333
  					],
  					[
  						7.3566323,
  						46.2326445
  					],
  					[
  						7.3565651,
  						46.2327524
  					],
  					[
  						7.3565532,
  						46.2327786
  					],
  					[
  						7.3567786,
  						46.2328278
  					],
  					[
  						7.3569159,
  						46.2325264
  					],
  					[
  						7.3567085,
  						46.2324812
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/220565423",
  		properties: {
  			timestamp: "2014-12-24T16:47:19Z",
  			version: "2",
  			changeset: "27676143",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "2",
  			"addr:street": "Chemin des Collines",
  			building: "yes",
  			id: "way/220565423"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3560817,
  						46.232899
  					],
  					[
  						7.3565175,
  						46.2329954
  					],
  					[
  						7.3565574,
  						46.232912
  					],
  					[
  						7.3561208,
  						46.232814
  					],
  					[
  						7.3560817,
  						46.232899
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/220565427",
  		properties: {
  			timestamp: "2014-12-31T21:45:54Z",
  			version: "2",
  			changeset: "27831453",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "17",
  			"addr:street": "Rue des C├¿dres",
  			building: "yes",
  			id: "way/220565427"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3616712,
  						46.2309379
  					],
  					[
  						7.3618418,
  						46.230982
  					],
  					[
  						7.3618208,
  						46.2310209
  					],
  					[
  						7.3619958,
  						46.2310662
  					],
  					[
  						7.362087,
  						46.2308974
  					],
  					[
  						7.3617414,
  						46.230808
  					],
  					[
  						7.3616712,
  						46.2309379
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495349",
  		properties: {
  			timestamp: "2015-01-19T08:41:22Z",
  			version: "2",
  			changeset: "28247624",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "34",
  			"addr:street": "Avenue de la Gare",
  			building: "yes",
  			id: "way/221495349"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3579008,
  						46.2317596
  					],
  					[
  						7.3579749,
  						46.2316341
  					],
  					[
  						7.3579784,
  						46.2316267
  					],
  					[
  						7.3580386,
  						46.2314977
  					],
  					[
  						7.3578568,
  						46.2314463
  					],
  					[
  						7.3577045,
  						46.2317041
  					],
  					[
  						7.3579008,
  						46.2317596
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495350",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "6",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "25, 27",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/221495350"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3580299,
  						46.2321412
  					],
  					[
  						7.3586131,
  						46.232325
  					],
  					[
  						7.3587164,
  						46.2321682
  					],
  					[
  						7.3585361,
  						46.2321306
  					],
  					[
  						7.3585101,
  						46.2321252
  					],
  					[
  						7.3581212,
  						46.2320026
  					],
  					[
  						7.3581096,
  						46.2320203
  					],
  					[
  						7.3580422,
  						46.2321226
  					],
  					[
  						7.3580299,
  						46.2321412
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495351",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "6",
  			"addr:street": "Espace des Remparts",
  			building: "yes",
  			id: "way/221495351"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.359036,
  						46.231926
  					],
  					[
  						7.3592439,
  						46.2319899
  					],
  					[
  						7.3593308,
  						46.2318546
  					],
  					[
  						7.3591229,
  						46.2317907
  					],
  					[
  						7.359036,
  						46.231926
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495352",
  		properties: {
  			timestamp: "2015-01-19T08:41:22Z",
  			version: "2",
  			changeset: "28247624",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "9",
  			"addr:street": "Rue des Vergers",
  			building: "yes",
  			id: "way/221495352"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3582973,
  						46.2316806
  					],
  					[
  						7.3585647,
  						46.2317663
  					],
  					[
  						7.3586403,
  						46.2316534
  					],
  					[
  						7.358373,
  						46.2315677
  					],
  					[
  						7.3582973,
  						46.2316806
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495353",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "2",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			building: "yes",
  			government: "prosecutor",
  			office: "government",
  			id: "way/221495353"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3585611,
  						46.2318354
  					],
  					[
  						7.3588633,
  						46.231931
  					],
  					[
  						7.3589679,
  						46.2317728
  					],
  					[
  						7.3586657,
  						46.2316772
  					],
  					[
  						7.3585611,
  						46.2318354
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495359",
  		properties: {
  			timestamp: "2015-01-19T08:41:22Z",
  			version: "3",
  			changeset: "28247624",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "18, 16",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/221495359"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3578999,
  						46.2323375
  					],
  					[
  						7.3577671,
  						46.2323829
  					],
  					[
  						7.3578357,
  						46.2324757
  					],
  					[
  						7.357867,
  						46.2325128
  					],
  					[
  						7.3579857,
  						46.2325416
  					],
  					[
  						7.3580526,
  						46.2325113
  					],
  					[
  						7.3581974,
  						46.2325418
  					],
  					[
  						7.3582205,
  						46.2325648
  					],
  					[
  						7.3583224,
  						46.2325898
  					],
  					[
  						7.3583666,
  						46.2325768
  					],
  					[
  						7.3584136,
  						46.2324998
  					],
  					[
  						7.3583908,
  						46.2324609
  					],
  					[
  						7.3582823,
  						46.2324349
  					],
  					[
  						7.358199,
  						46.2324544
  					],
  					[
  						7.3581467,
  						46.2324034
  					],
  					[
  						7.3578999,
  						46.2323375
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495360",
  		properties: {
  			timestamp: "2014-12-24T16:45:32Z",
  			version: "2",
  			changeset: "27676111",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "20",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/221495360"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3562459,
  						46.2320046
  					],
  					[
  						7.3566152,
  						46.2321234
  					],
  					[
  						7.3567043,
  						46.2319909
  					],
  					[
  						7.3563351,
  						46.2318721
  					],
  					[
  						7.3562459,
  						46.2320046
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495374",
  		properties: {
  			timestamp: "2020-01-26T15:37:21Z",
  			version: "3",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "46",
  			"addr:street": "Place du Midi",
  			building: "apartments",
  			id: "way/221495374"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3622275,
  						46.2319445
  					],
  					[
  						7.362278,
  						46.2318403
  					],
  					[
  						7.3623622,
  						46.2318599
  					],
  					[
  						7.3624066,
  						46.2317683
  					],
  					[
  						7.3622043,
  						46.2317213
  					],
  					[
  						7.3621093,
  						46.2319171
  					],
  					[
  						7.3622275,
  						46.2319445
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495375",
  		properties: {
  			timestamp: "2014-12-29T23:51:22Z",
  			version: "2",
  			changeset: "27790096",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "48, 50",
  			"addr:street": "Place du Midi",
  			building: "yes",
  			id: "way/221495375"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3621093,
  						46.2319171
  					],
  					[
  						7.3623053,
  						46.2322414
  					],
  					[
  						7.3624863,
  						46.2321635
  					],
  					[
  						7.3624317,
  						46.2321032
  					],
  					[
  						7.3623911,
  						46.2321199
  					],
  					[
  						7.362265,
  						46.2319547
  					],
  					[
  						7.3622275,
  						46.2319445
  					],
  					[
  						7.3621093,
  						46.2319171
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495376",
  		properties: {
  			timestamp: "2014-12-29T23:51:22Z",
  			version: "2",
  			changeset: "27790096",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "5",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/221495376"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3627525,
  						46.232048
  					],
  					[
  						7.3629825,
  						46.231925
  					],
  					[
  						7.3626588,
  						46.2318315
  					],
  					[
  						7.3626223,
  						46.2319041
  					],
  					[
  						7.362676,
  						46.2319636
  					],
  					[
  						7.3627525,
  						46.232048
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495377",
  		properties: {
  			timestamp: "2014-12-29T23:51:22Z",
  			version: "2",
  			changeset: "27790096",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "52",
  			"addr:street": "Place du Midi",
  			building: "yes",
  			id: "way/221495377"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3624863,
  						46.2321635
  					],
  					[
  						7.3627525,
  						46.232048
  					],
  					[
  						7.362676,
  						46.2319636
  					],
  					[
  						7.3625306,
  						46.2320267
  					],
  					[
  						7.3625525,
  						46.2320509
  					],
  					[
  						7.3624317,
  						46.2321032
  					],
  					[
  						7.3624863,
  						46.2321635
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495378",
  		properties: {
  			timestamp: "2014-12-29T23:51:22Z",
  			version: "2",
  			changeset: "27790096",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "3",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/221495378"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3624501,
  						46.231874
  					],
  					[
  						7.3626172,
  						46.2319142
  					],
  					[
  						7.3626223,
  						46.2319041
  					],
  					[
  						7.3626588,
  						46.2318315
  					],
  					[
  						7.3626725,
  						46.2318041
  					],
  					[
  						7.3625054,
  						46.2317639
  					],
  					[
  						7.3624501,
  						46.231874
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495380",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "3",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "5, 7",
  			"addr:street": "Avenue des Mayennets",
  			building: "yes",
  			id: "way/221495380"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3609637,
  						46.2309904
  					],
  					[
  						7.3611265,
  						46.2310217
  					],
  					[
  						7.3611397,
  						46.2309927
  					],
  					[
  						7.36115,
  						46.2309703
  					],
  					[
  						7.3613597,
  						46.2310124
  					],
  					[
  						7.3614641,
  						46.2307923
  					],
  					[
  						7.3612426,
  						46.2307343
  					],
  					[
  						7.3612904,
  						46.2306058
  					],
  					[
  						7.3611166,
  						46.2305726
  					],
  					[
  						7.3609757,
  						46.2309576
  					],
  					[
  						7.3609637,
  						46.2309904
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495381",
  		properties: {
  			timestamp: "2013-05-15T15:28:10Z",
  			version: "1",
  			changeset: "16140533",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/221495381"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3609637,
  						46.2309904
  					],
  					[
  						7.3609168,
  						46.231107
  					],
  					[
  						7.3610796,
  						46.2311384
  					],
  					[
  						7.3611265,
  						46.2310217
  					],
  					[
  						7.3609637,
  						46.2309904
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495382",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "3",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "24, 30, 32, 36, 40",
  			"addr:street": "Place du Midi",
  			building: "yes",
  			id: "way/221495382"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3609168,
  						46.231107
  					],
  					[
  						7.3608562,
  						46.2312602
  					],
  					[
  						7.3610454,
  						46.2313093
  					],
  					[
  						7.3610581,
  						46.2312829
  					],
  					[
  						7.3617659,
  						46.2314742
  					],
  					[
  						7.3617495,
  						46.2315044
  					],
  					[
  						7.3619624,
  						46.2315598
  					],
  					[
  						7.361995,
  						46.2315333
  					],
  					[
  						7.3622134,
  						46.2313559
  					],
  					[
  						7.3620932,
  						46.2312861
  					],
  					[
  						7.3620206,
  						46.2312439
  					],
  					[
  						7.3612146,
  						46.2310362
  					],
  					[
  						7.3611528,
  						46.2311621
  					],
  					[
  						7.3610796,
  						46.2311384
  					],
  					[
  						7.3609168,
  						46.231107
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/221495383",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "5",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "6, 8",
  			"addr:street": "Rue de la Dixence",
  			building: "office",
  			"building:levels": "5",
  			id: "way/221495383"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3622134,
  						46.2313559
  					],
  					[
  						7.3622413,
  						46.2313346
  					],
  					[
  						7.3625627,
  						46.2310891
  					],
  					[
  						7.3622953,
  						46.2309078
  					],
  					[
  						7.3621898,
  						46.2309947
  					],
  					[
  						7.3623371,
  						46.2310878
  					],
  					[
  						7.3621252,
  						46.2312601
  					],
  					[
  						7.3620932,
  						46.2312861
  					],
  					[
  						7.3622134,
  						46.2313559
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222828917",
  		properties: {
  			timestamp: "2017-02-14T16:41:35Z",
  			version: "3",
  			changeset: "46083933",
  			user: "ravemiki",
  			uid: "616894",
  			"addr:city": "Sion",
  			"addr:housenumber": "12",
  			"addr:postcode": "1950",
  			"addr:street": "Rue de la Tour",
  			building: "yes",
  			name: "Ev├¬ch├® de Sion",
  			id: "way/222828917"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3579724,
  						46.2338529
  					],
  					[
  						7.3582065,
  						46.2339059
  					],
  					[
  						7.3583672,
  						46.2335661
  					],
  					[
  						7.3581331,
  						46.2335131
  					],
  					[
  						7.3579724,
  						46.2338529
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222828919",
  		properties: {
  			timestamp: "2021-04-13T16:01:20Z",
  			version: "5",
  			changeset: "102876319",
  			user: "Valdor",
  			uid: "60458",
  			"addr:housenumber": "5, 7, 9",
  			"addr:street": "Place du Scex",
  			building: "apartments",
  			"building:levels": "6",
  			"roof:levels": "0",
  			id: "way/222828919"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3624277,
  						46.2326058
  					],
  					[
  						7.3627753,
  						46.2326974
  					],
  					[
  						7.363002,
  						46.2327571
  					],
  					[
  						7.3630692,
  						46.2326218
  					],
  					[
  						7.3624277,
  						46.2324637
  					],
  					[
  						7.3624277,
  						46.2326058
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222828920",
  		properties: {
  			timestamp: "2021-01-04T22:53:56Z",
  			version: "3",
  			changeset: "96936656",
  			user: "Valdor",
  			uid: "60458",
  			"addr:housenumber": "11",
  			"addr:street": "Place du Scex",
  			building: "apartments",
  			id: "way/222828920"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.363002,
  						46.2327571
  					],
  					[
  						7.3633154,
  						46.2328338
  					],
  					[
  						7.3634007,
  						46.2326671
  					],
  					[
  						7.3630855,
  						46.23259
  					],
  					[
  						7.3630692,
  						46.2326218
  					],
  					[
  						7.363002,
  						46.2327571
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222828921",
  		properties: {
  			timestamp: "2014-12-29T23:49:27Z",
  			version: "2",
  			changeset: "27790069",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "19",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/222828921"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3647008,
  						46.2325172
  					],
  					[
  						7.3649693,
  						46.2325573
  					],
  					[
  						7.3650104,
  						46.2324259
  					],
  					[
  						7.3647419,
  						46.2323857
  					],
  					[
  						7.3647008,
  						46.2325172
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222854872",
  		properties: {
  			timestamp: "2014-12-31T22:05:20Z",
  			version: "2",
  			changeset: "27831719",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "25",
  			"addr:street": "Avenue de la Gare",
  			building: "yes",
  			id: "way/222854872"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3574804,
  						46.2308342
  					],
  					[
  						7.3576638,
  						46.2308788
  					],
  					[
  						7.3577598,
  						46.2306897
  					],
  					[
  						7.3575764,
  						46.2306452
  					],
  					[
  						7.3574804,
  						46.2308342
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222854873",
  		properties: {
  			timestamp: "2020-02-18T18:08:27Z",
  			version: "4",
  			changeset: "81183843",
  			user: "billyonthemountain",
  			uid: "3130748",
  			"addr:housenumber": "23",
  			"addr:street": "Avenue de la Gare",
  			building: "government",
  			"building:levels": "4",
  			id: "way/222854873"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3573866,
  						46.230527
  					],
  					[
  						7.3578079,
  						46.230625
  					],
  					[
  						7.3579157,
  						46.2304034
  					],
  					[
  						7.3574944,
  						46.2303053
  					],
  					[
  						7.3573866,
  						46.230527
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222854876",
  		properties: {
  			timestamp: "2021-03-02T16:23:31Z",
  			version: "4",
  			changeset: "100292671",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "14, 18",
  			"addr:street": "Rue de la Dent-Blanche",
  			building: "yes",
  			id: "way/222854876"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3594181,
  						46.2306629
  					],
  					[
  						7.359608,
  						46.2307086
  					],
  					[
  						7.3596903,
  						46.2305422
  					],
  					[
  						7.3597446,
  						46.2304323
  					],
  					[
  						7.3595722,
  						46.2303922
  					],
  					[
  						7.3595505,
  						46.2303872
  					],
  					[
  						7.3594181,
  						46.2306629
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222854877",
  		properties: {
  			timestamp: "2014-12-31T22:11:50Z",
  			version: "2",
  			changeset: "27831808",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "10, 12",
  			"addr:street": "Avenue du Midi",
  			building: "yes",
  			id: "way/222854877"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3589996,
  						46.2307161
  					],
  					[
  						7.3595391,
  						46.2308458
  					],
  					[
  						7.359608,
  						46.2307086
  					],
  					[
  						7.3594181,
  						46.2306629
  					],
  					[
  						7.3590708,
  						46.2305789
  					],
  					[
  						7.359061,
  						46.2305984
  					],
  					[
  						7.3589996,
  						46.2307161
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222854878",
  		properties: {
  			timestamp: "2014-12-31T22:11:50Z",
  			version: "2",
  			changeset: "27831808",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "6, 6a, 8",
  			"addr:street": "Avenue du Midi",
  			building: "yes",
  			name: "Hotel Elite Sion",
  			tourism: "hotel",
  			id: "way/222854878"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3586024,
  						46.2306102
  					],
  					[
  						7.3589996,
  						46.2307161
  					],
  					[
  						7.359061,
  						46.2305984
  					],
  					[
  						7.3586675,
  						46.2304934
  					],
  					[
  						7.3586024,
  						46.2306102
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222854879",
  		properties: {
  			timestamp: "2020-01-26T09:12:20Z",
  			version: "4",
  			changeset: "80091996",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "24, 26",
  			"addr:street": "Avenue de la Gare",
  			building: "apartments",
  			"building:levels": "4",
  			id: "way/222854879"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.358229,
  						46.2305245
  					],
  					[
  						7.3583974,
  						46.2305667
  					],
  					[
  						7.3585495,
  						46.2302762
  					],
  					[
  						7.3583811,
  						46.230234
  					],
  					[
  						7.358229,
  						46.2305245
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892759",
  		properties: {
  			timestamp: "2021-04-13T16:01:17Z",
  			version: "3",
  			changeset: "102876316",
  			user: "Valdor",
  			uid: "60458",
  			building: "apartments",
  			id: "way/222892759"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3607586,
  						46.2315935
  					],
  					[
  						7.361132,
  						46.2318015
  					],
  					[
  						7.3612547,
  						46.2316206
  					],
  					[
  						7.3608357,
  						46.2314635
  					],
  					[
  						7.3607586,
  						46.2315935
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892761",
  		properties: {
  			timestamp: "2013-05-24T13:41:34Z",
  			version: "1",
  			changeset: "16265957",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/222892761"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3607586,
  						46.2315935
  					],
  					[
  						7.3608357,
  						46.2314635
  					],
  					[
  						7.360723,
  						46.2314211
  					],
  					[
  						7.3606874,
  						46.2314362
  					],
  					[
  						7.360636,
  						46.2315155
  					],
  					[
  						7.3606696,
  						46.231547
  					],
  					[
  						7.3607586,
  						46.2315935
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892762",
  		properties: {
  			timestamp: "2020-02-09T14:15:34Z",
  			version: "4",
  			changeset: "80752879",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			"building:levels": "5",
  			"roof:levels": "1",
  			id: "way/222892762"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3611856,
  						46.2318178
  					],
  					[
  						7.3614407,
  						46.2319504
  					],
  					[
  						7.3616285,
  						46.2318109
  					],
  					[
  						7.3616325,
  						46.2317795
  					],
  					[
  						7.3613082,
  						46.2316427
  					],
  					[
  						7.3611856,
  						46.2318178
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892763",
  		properties: {
  			timestamp: "2019-07-27T13:42:01Z",
  			version: "3",
  			changeset: "72717226",
  			user: "RaphB",
  			uid: "5864987",
  			building: "office",
  			id: "way/222892763"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3604064,
  						46.2303884
  					],
  					[
  						7.360578,
  						46.2305679
  					],
  					[
  						7.3609201,
  						46.2306491
  					],
  					[
  						7.3609891,
  						46.2305106
  					],
  					[
  						7.3604064,
  						46.2303884
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892764",
  		properties: {
  			timestamp: "2020-12-20T07:46:32Z",
  			version: "3",
  			changeset: "96130400",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "4",
  			"addr:street": "Avenue des Mayennets",
  			building: "office",
  			id: "way/222892764"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3606716,
  						46.2308453
  					],
  					[
  						7.3608319,
  						46.2308785
  					],
  					[
  						7.3609249,
  						46.2306635
  					],
  					[
  						7.3607646,
  						46.2306303
  					],
  					[
  						7.3606716,
  						46.2308453
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892766",
  		properties: {
  			timestamp: "2019-07-27T13:42:06Z",
  			version: "3",
  			changeset: "72717226",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "18, 20",
  			"addr:street": "Avenue du Midi",
  			building: "office",
  			id: "way/222892766"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3603315,
  						46.2310423
  					],
  					[
  						7.3607473,
  						46.2311506
  					],
  					[
  						7.3608338,
  						46.2309917
  					],
  					[
  						7.360418,
  						46.2308834
  					],
  					[
  						7.3603315,
  						46.2310423
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892768",
  		properties: {
  			timestamp: "2015-01-23T15:17:30Z",
  			version: "2",
  			changeset: "28351409",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "14",
  			"addr:street": "Rue des Vergers",
  			building: "yes",
  			id: "way/222892768"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.359163,
  						46.2317152
  					],
  					[
  						7.3593463,
  						46.2317703
  					],
  					[
  						7.3594251,
  						46.2316448
  					],
  					[
  						7.3594346,
  						46.2316296
  					],
  					[
  						7.3592513,
  						46.2315746
  					],
  					[
  						7.359163,
  						46.2317152
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892769",
  		properties: {
  			timestamp: "2015-10-13T16:59:33Z",
  			version: "3",
  			changeset: "34616880",
  			user: "vonde",
  			uid: "2528547",
  			"addr:housenumber": "8",
  			"addr:street": "Espace des Remparts",
  			building: "residential",
  			"building:levels": "5",
  			id: "way/222892769"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3593463,
  						46.2317703
  					],
  					[
  						7.3595228,
  						46.2318273
  					],
  					[
  						7.3597146,
  						46.231663
  					],
  					[
  						7.359592,
  						46.2315957
  					],
  					[
  						7.3595149,
  						46.2316714
  					],
  					[
  						7.3594251,
  						46.2316448
  					],
  					[
  						7.3593463,
  						46.2317703
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892772",
  		properties: {
  			timestamp: "2015-01-23T15:17:30Z",
  			version: "2",
  			changeset: "28351409",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "14",
  			"addr:street": "Espace des Remparts",
  			building: "yes",
  			id: "way/222892772"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3599197,
  						46.2312686
  					],
  					[
  						7.3598189,
  						46.2313591
  					],
  					[
  						7.3599652,
  						46.231437
  					],
  					[
  						7.3600659,
  						46.2313465
  					],
  					[
  						7.3599197,
  						46.2312686
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892774",
  		properties: {
  			timestamp: "2015-01-23T15:17:30Z",
  			version: "2",
  			changeset: "28351409",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "12",
  			"addr:street": "Espace des Remparts",
  			building: "yes",
  			id: "way/222892774"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3596832,
  						46.231472
  					],
  					[
  						7.3597136,
  						46.2314897
  					],
  					[
  						7.3598362,
  						46.231557
  					],
  					[
  						7.3599652,
  						46.231437
  					],
  					[
  						7.3598189,
  						46.2313591
  					],
  					[
  						7.3596832,
  						46.231472
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892776",
  		properties: {
  			timestamp: "2015-01-23T15:17:30Z",
  			version: "2",
  			changeset: "28351409",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "10",
  			"addr:street": "Espace des Remparts",
  			building: "yes",
  			id: "way/222892776"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.359592,
  						46.2315957
  					],
  					[
  						7.3597146,
  						46.231663
  					],
  					[
  						7.3598362,
  						46.231557
  					],
  					[
  						7.3597136,
  						46.2314897
  					],
  					[
  						7.359592,
  						46.2315957
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892778",
  		properties: {
  			timestamp: "2021-04-13T16:01:27Z",
  			version: "2",
  			changeset: "102876316",
  			user: "Valdor",
  			uid: "60458",
  			building: "apartments",
  			id: "way/222892778"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3594972,
  						46.2311781
  					],
  					[
  						7.3596117,
  						46.2312026
  					],
  					[
  						7.3599197,
  						46.2312686
  					],
  					[
  						7.3600659,
  						46.2313465
  					],
  					[
  						7.3602042,
  						46.2312096
  					],
  					[
  						7.3595884,
  						46.2310361
  					],
  					[
  						7.3594972,
  						46.2311781
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892780",
  		properties: {
  			timestamp: "2013-05-24T13:41:35Z",
  			version: "1",
  			changeset: "16265957",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/222892780"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3594972,
  						46.2311781
  					],
  					[
  						7.3593651,
  						46.2313807
  					],
  					[
  						7.359478,
  						46.2314139
  					],
  					[
  						7.3596117,
  						46.2312026
  					],
  					[
  						7.3594972,
  						46.2311781
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892781",
  		properties: {
  			timestamp: "2015-01-23T15:17:30Z",
  			version: "2",
  			changeset: "28351409",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "9",
  			"addr:street": "Rue de la Dent-Blanche",
  			building: "yes",
  			id: "way/222892781"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3592919,
  						46.2315202
  					],
  					[
  						7.3594172,
  						46.2315558
  					],
  					[
  						7.3594832,
  						46.2314448
  					],
  					[
  						7.3593579,
  						46.2314092
  					],
  					[
  						7.3592919,
  						46.2315202
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892783",
  		properties: {
  			timestamp: "2021-01-04T23:03:29Z",
  			version: "4",
  			changeset: "96936656",
  			user: "Valdor",
  			uid: "60458",
  			"addr:housenumber": "12",
  			"addr:street": "Rue de la Dent-Blanche",
  			building: "retail",
  			"building:levels": "4",
  			id: "way/222892783"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3590059,
  						46.2312945
  					],
  					[
  						7.3590441,
  						46.2313048
  					],
  					[
  						7.3591965,
  						46.2313464
  					],
  					[
  						7.3593932,
  						46.2310021
  					],
  					[
  						7.359201,
  						46.2309495
  					],
  					[
  						7.3591367,
  						46.2310622
  					],
  					[
  						7.3590059,
  						46.2312945
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892785",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "3",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "10, 8",
  			"addr:street": "Rue de la Dent-Blanche",
  			building: "yes",
  			id: "way/222892785"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3587681,
  						46.2316017
  					],
  					[
  						7.359001,
  						46.2316689
  					],
  					[
  						7.359134,
  						46.2314495
  					],
  					[
  						7.3591965,
  						46.2313464
  					],
  					[
  						7.3590441,
  						46.2313048
  					],
  					[
  						7.3589174,
  						46.2315145
  					],
  					[
  						7.358835,
  						46.2314908
  					],
  					[
  						7.3587681,
  						46.2316017
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892786",
  		properties: {
  			timestamp: "2018-08-22T14:18:45Z",
  			version: "5",
  			changeset: "61890337",
  			user: "fredjunod",
  			uid: "84054",
  			"addr:housenumber": "28",
  			"addr:street": "Avenue de la Gare",
  			building: "yes",
  			"building:levels": "4",
  			id: "way/222892786"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3581219,
  						46.2308117
  					],
  					[
  						7.3583355,
  						46.2308669
  					],
  					[
  						7.3583617,
  						46.2308554
  					],
  					[
  						7.3584294,
  						46.2307301
  					],
  					[
  						7.3584361,
  						46.2307177
  					],
  					[
  						7.3582049,
  						46.2306579
  					],
  					[
  						7.3581219,
  						46.2308117
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892788",
  		properties: {
  			timestamp: "2015-01-23T15:12:03Z",
  			version: "4",
  			changeset: "28351310",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "1, 3, 5, 7",
  			"addr:street": "Avenue du Midi",
  			building: "yes",
  			"building:levels": "4",
  			id: "way/222892788"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3583617,
  						46.2308554
  					],
  					[
  						7.3588993,
  						46.2309963
  					],
  					[
  						7.3591367,
  						46.2310622
  					],
  					[
  						7.359201,
  						46.2309495
  					],
  					[
  						7.3584294,
  						46.2307301
  					],
  					[
  						7.3583617,
  						46.2308554
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892790",
  		properties: {
  			timestamp: "2020-01-26T09:12:21Z",
  			version: "4",
  			changeset: "80091996",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "30",
  			"addr:street": "Avenue de la Gare",
  			building: "apartments",
  			"building:levels": "4",
  			id: "way/222892790"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3579753,
  						46.2311118
  					],
  					[
  						7.35817,
  						46.2311555
  					],
  					[
  						7.3582781,
  						46.2309249
  					],
  					[
  						7.3580834,
  						46.2308812
  					],
  					[
  						7.3579753,
  						46.2311118
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892791",
  		properties: {
  			timestamp: "2020-02-25T14:30:20Z",
  			version: "3",
  			changeset: "81460127",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "4, 6",
  			"addr:street": "Rue des Vergers",
  			building: "yes",
  			id: "way/222892791"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3582453,
  						46.2314461
  					],
  					[
  						7.3586879,
  						46.2315803
  					],
  					[
  						7.3587453,
  						46.2314876
  					],
  					[
  						7.3587018,
  						46.231475
  					],
  					[
  						7.3587196,
  						46.2314438
  					],
  					[
  						7.358323,
  						46.2313236
  					],
  					[
  						7.3582453,
  						46.2314461
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892793",
  		properties: {
  			timestamp: "2015-01-23T15:12:03Z",
  			version: "2",
  			changeset: "28351310",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "2",
  			"addr:street": "Rue des Vergers",
  			building: "yes",
  			id: "way/222892793"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.358012,
  						46.2313742
  					],
  					[
  						7.3582453,
  						46.2314461
  					],
  					[
  						7.358323,
  						46.2313236
  					],
  					[
  						7.3580825,
  						46.2312506
  					],
  					[
  						7.358012,
  						46.2313742
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892795",
  		properties: {
  			timestamp: "2015-01-23T15:12:01Z",
  			version: "2",
  			changeset: "28351310",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "32",
  			"addr:street": "Avenue de la Gare",
  			building: "yes",
  			id: "way/222892795"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.358012,
  						46.2313742
  					],
  					[
  						7.3580825,
  						46.2312506
  					],
  					[
  						7.3581108,
  						46.2311995
  					],
  					[
  						7.3579578,
  						46.2311589
  					],
  					[
  						7.3578607,
  						46.2313341
  					],
  					[
  						7.358012,
  						46.2313742
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892796",
  		properties: {
  			timestamp: "2014-12-31T22:13:52Z",
  			version: "2",
  			changeset: "27831838",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "14",
  			"addr:street": "Avenue du Midi",
  			building: "yes",
  			id: "way/222892796"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3596904,
  						46.2308945
  					],
  					[
  						7.3600813,
  						46.2309989
  					],
  					[
  						7.3601412,
  						46.2308916
  					],
  					[
  						7.3600793,
  						46.230875
  					],
  					[
  						7.3598897,
  						46.2308241
  					],
  					[
  						7.3597484,
  						46.2307877
  					],
  					[
  						7.3596904,
  						46.2308945
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892798",
  		properties: {
  			timestamp: "2014-12-31T22:13:52Z",
  			version: "3",
  			changeset: "27831838",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "17, 19",
  			"addr:street": "Rue de la Dent-Blanche",
  			building: "yes",
  			id: "way/222892798"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3597484,
  						46.2307877
  					],
  					[
  						7.3598897,
  						46.2308241
  					],
  					[
  						7.3599855,
  						46.2306153
  					],
  					[
  						7.3599878,
  						46.2306103
  					],
  					[
  						7.3600101,
  						46.2305467
  					],
  					[
  						7.3598712,
  						46.2305156
  					],
  					[
  						7.3597484,
  						46.2307877
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892810",
  		properties: {
  			timestamp: "2020-02-09T14:15:34Z",
  			version: "4",
  			changeset: "80752879",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "10",
  			"addr:street": "Rue de la Dixence",
  			building: "office",
  			"building:levels": "3",
  			"roof:levels": "2",
  			id: "way/222892810"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3623754,
  						46.2307085
  					],
  					[
  						7.3627079,
  						46.2309872
  					],
  					[
  						7.3632049,
  						46.2307035
  					],
  					[
  						7.3628678,
  						46.230421
  					],
  					[
  						7.3627729,
  						46.2304751
  					],
  					[
  						7.36301,
  						46.2306738
  					],
  					[
  						7.3629254,
  						46.2307221
  					],
  					[
  						7.3628689,
  						46.2306748
  					],
  					[
  						7.3627292,
  						46.2307545
  					],
  					[
  						7.3627764,
  						46.230794
  					],
  					[
  						7.3627205,
  						46.2308259
  					],
  					[
  						7.3624973,
  						46.2306389
  					],
  					[
  						7.3623754,
  						46.2307085
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/222892812",
  		properties: {
  			timestamp: "2020-01-26T15:37:32Z",
  			version: "5",
  			changeset: "80101064",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "21",
  			"addr:street": "Rue de la Dixence",
  			building: "apartments",
  			"building:levels": "5",
  			id: "way/222892812"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3636902,
  						46.2305799
  					],
  					[
  						7.3638246,
  						46.2306477
  					],
  					[
  						7.3638447,
  						46.2306578
  					],
  					[
  						7.363996,
  						46.2305141
  					],
  					[
  						7.3638415,
  						46.2304363
  					],
  					[
  						7.3636902,
  						46.2305799
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035744",
  		properties: {
  			timestamp: "2013-05-25T17:05:24Z",
  			version: "1",
  			changeset: "16282028",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/223035744"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3605772,
  						46.2319695
  					],
  					[
  						7.3610794,
  						46.2320488
  					],
  					[
  						7.3610854,
  						46.2320324
  					],
  					[
  						7.3611328,
  						46.2320474
  					],
  					[
  						7.3612673,
  						46.2319134
  					],
  					[
  						7.3607473,
  						46.2316043
  					],
  					[
  						7.3606741,
  						46.2316057
  					],
  					[
  						7.3606286,
  						46.2316248
  					],
  					[
  						7.3605733,
  						46.2317753
  					],
  					[
  						7.3605772,
  						46.2319695
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035745",
  		properties: {
  			timestamp: "2013-05-25T17:05:24Z",
  			version: "1",
  			changeset: "16282028",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/223035745"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3605401,
  						46.2322342
  					],
  					[
  						7.3607682,
  						46.2322475
  					],
  					[
  						7.36079,
  						46.2320679
  					],
  					[
  						7.3605619,
  						46.2320547
  					],
  					[
  						7.3605401,
  						46.2322342
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035746",
  		properties: {
  			timestamp: "2015-01-08T19:49:32Z",
  			version: "2",
  			changeset: "28004540",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "37",
  			"addr:street": "Place du Midi",
  			building: "yes",
  			id: "way/223035746"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3617812,
  						46.2320923
  					],
  					[
  						7.361889,
  						46.2321708
  					],
  					[
  						7.3620081,
  						46.2321363
  					],
  					[
  						7.3619142,
  						46.2320022
  					],
  					[
  						7.361827,
  						46.2320629
  					],
  					[
  						7.3617812,
  						46.2320923
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035747",
  		properties: {
  			timestamp: "2021-04-13T16:01:18Z",
  			version: "3",
  			changeset: "102876316",
  			user: "Valdor",
  			uid: "60458",
  			"addr:housenumber": "39",
  			"addr:street": "Place du Midi",
  			building: "apartments",
  			id: "way/223035747"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3620081,
  						46.2321363
  					],
  					[
  						7.361889,
  						46.2321708
  					],
  					[
  						7.3619628,
  						46.2322926
  					],
  					[
  						7.3619792,
  						46.2323196
  					],
  					[
  						7.3620982,
  						46.2322852
  					],
  					[
  						7.3620081,
  						46.2321363
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035748",
  		properties: {
  			timestamp: "2015-01-08T19:49:32Z",
  			version: "2",
  			changeset: "28004540",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "35",
  			"addr:street": "Place du Midi",
  			building: "yes",
  			id: "way/223035748"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3617476,
  						46.2320084
  					],
  					[
  						7.361827,
  						46.2320629
  					],
  					[
  						7.3619142,
  						46.2320022
  					],
  					[
  						7.3618348,
  						46.2319476
  					],
  					[
  						7.3617476,
  						46.2320084
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035749",
  		properties: {
  			timestamp: "2020-02-09T14:15:35Z",
  			version: "4",
  			changeset: "80752879",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "33",
  			"addr:street": "Place du Midi",
  			building: "apartments",
  			"building:levels": "5",
  			"roof:levels": "1",
  			id: "way/223035749"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3615537,
  						46.2319586
  					],
  					[
  						7.3616197,
  						46.2320109
  					],
  					[
  						7.3617476,
  						46.2320084
  					],
  					[
  						7.3618348,
  						46.2319476
  					],
  					[
  						7.3617613,
  						46.2318673
  					],
  					[
  						7.3617385,
  						46.2318523
  					],
  					[
  						7.3616977,
  						46.2318506
  					],
  					[
  						7.3616701,
  						46.2318656
  					],
  					[
  						7.3615537,
  						46.2319586
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035750",
  		properties: {
  			timestamp: "2019-07-27T13:42:01Z",
  			version: "3",
  			changeset: "72717226",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "25",
  			"addr:street": "Rue du Rh├┤ne",
  			building: "apartments",
  			id: "way/223035750"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3615537,
  						46.2319586
  					],
  					[
  						7.3614072,
  						46.2321039
  					],
  					[
  						7.3616113,
  						46.2321861
  					],
  					[
  						7.3617133,
  						46.2320698
  					],
  					[
  						7.3616293,
  						46.2320341
  					],
  					[
  						7.3616197,
  						46.2320109
  					],
  					[
  						7.3615537,
  						46.2319586
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035751",
  		properties: {
  			timestamp: "2021-04-12T15:49:24Z",
  			version: "2",
  			changeset: "102814933",
  			user: "Valdor",
  			uid: "60458",
  			building: "apartments",
  			id: "way/223035751"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3594837,
  						46.232043
  					],
  					[
  						7.3596242,
  						46.2321251
  					],
  					[
  						7.3597411,
  						46.2320295
  					],
  					[
  						7.3596005,
  						46.2319473
  					],
  					[
  						7.3594837,
  						46.232043
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035752",
  		properties: {
  			timestamp: "2013-11-07T17:11:30Z",
  			version: "2",
  			changeset: "18768032",
  			user: "springslord",
  			uid: "1798321",
  			building: "yes",
  			id: "way/223035752"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3595902,
  						46.2319413
  					],
  					[
  						7.3597617,
  						46.2320347
  					],
  					[
  						7.3598029,
  						46.2319984
  					],
  					[
  						7.3599137,
  						46.231901
  					],
  					[
  						7.3597422,
  						46.2318076
  					],
  					[
  						7.3595902,
  						46.2319413
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035753",
  		properties: {
  			timestamp: "2021-04-13T16:01:31Z",
  			version: "3",
  			changeset: "102876316",
  			user: "Valdor",
  			uid: "60458",
  			building: "apartments",
  			id: "way/223035753"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3602783,
  						46.2322972
  					],
  					[
  						7.3604345,
  						46.2322959
  					],
  					[
  						7.3604484,
  						46.2318103
  					],
  					[
  						7.3604286,
  						46.2317857
  					],
  					[
  						7.3603811,
  						46.2317748
  					],
  					[
  						7.3599976,
  						46.2317926
  					],
  					[
  						7.3599995,
  						46.2318897
  					],
  					[
  						7.3600747,
  						46.2318992
  					],
  					[
  						7.3602902,
  						46.2318924
  					],
  					[
  						7.3602857,
  						46.2320439
  					],
  					[
  						7.3602783,
  						46.2322972
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035754",
  		properties: {
  			timestamp: "2021-04-12T15:49:25Z",
  			version: "4",
  			changeset: "102814933",
  			user: "Valdor",
  			uid: "60458",
  			building: "apartments",
  			id: "way/223035754"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3594029,
  						46.2321249
  					],
  					[
  						7.35954,
  						46.232191
  					],
  					[
  						7.3595901,
  						46.2322147
  					],
  					[
  						7.3596616,
  						46.2321425
  					],
  					[
  						7.359628,
  						46.2321288
  					],
  					[
  						7.3594737,
  						46.2320534
  					],
  					[
  						7.3594029,
  						46.2321249
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035756",
  		properties: {
  			timestamp: "2013-05-25T17:05:24Z",
  			version: "1",
  			changeset: "16282028",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/223035756"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3593658,
  						46.2324231
  					],
  					[
  						7.3594437,
  						46.2323602
  					],
  					[
  						7.3593561,
  						46.2323083
  					],
  					[
  						7.3592782,
  						46.2323712
  					],
  					[
  						7.3593658,
  						46.2324231
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035757",
  		properties: {
  			timestamp: "2015-02-20T00:41:34Z",
  			version: "2",
  			changeset: "28968983",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "5",
  			"addr:street": "Espace des Remparts",
  			building: "yes",
  			id: "way/223035757"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3591701,
  						46.2323567
  					],
  					[
  						7.3592235,
  						46.2323819
  					],
  					[
  						7.3593144,
  						46.2322896
  					],
  					[
  						7.359261,
  						46.2322644
  					],
  					[
  						7.3591701,
  						46.2323567
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035758",
  		properties: {
  			timestamp: "2015-02-20T00:40:54Z",
  			version: "2",
  			changeset: "28968977",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "21, 15",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/223035758"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3590083,
  						46.2325342
  					],
  					[
  						7.3594294,
  						46.2326642
  					],
  					[
  						7.3595323,
  						46.2325479
  					],
  					[
  						7.3594275,
  						46.2324905
  					],
  					[
  						7.3593978,
  						46.232511
  					],
  					[
  						7.3590834,
  						46.232418
  					],
  					[
  						7.3590083,
  						46.2325342
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035759",
  		properties: {
  			timestamp: "2015-02-20T00:40:54Z",
  			version: "2",
  			changeset: "28968977",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "13",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/223035759"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3594806,
  						46.2326811
  					],
  					[
  						7.3597324,
  						46.2327639
  					],
  					[
  						7.3598081,
  						46.2326537
  					],
  					[
  						7.3595563,
  						46.2325709
  					],
  					[
  						7.3594806,
  						46.2326811
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035760",
  		properties: {
  			timestamp: "2020-02-09T14:15:35Z",
  			version: "4",
  			changeset: "80752879",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "6",
  			"addr:street": "Rue du Grand-Pont",
  			building: "apartments",
  			"building:levels": "4",
  			id: "way/223035760"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3606007,
  						46.2336362
  					],
  					[
  						7.3608152,
  						46.2336534
  					],
  					[
  						7.3608207,
  						46.2336204
  					],
  					[
  						7.3608238,
  						46.2336019
  					],
  					[
  						7.360853,
  						46.2334273
  					],
  					[
  						7.3606385,
  						46.2334101
  					],
  					[
  						7.3606007,
  						46.2336362
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035761",
  		properties: {
  			timestamp: "2021-02-02T09:27:49Z",
  			version: "3",
  			changeset: "98565874",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "12",
  			"addr:street": "Rue du Grand-Pont",
  			building: "yes",
  			id: "way/223035761"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3605621,
  						46.2338786
  					],
  					[
  						7.3607616,
  						46.2338903
  					],
  					[
  						7.36078,
  						46.2337397
  					],
  					[
  						7.3607366,
  						46.2337372
  					],
  					[
  						7.3607444,
  						46.2336733
  					],
  					[
  						7.3605883,
  						46.2336642
  					],
  					[
  						7.3605621,
  						46.2338786
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/223035838",
  		properties: {
  			timestamp: "2013-05-25T17:05:29Z",
  			version: "1",
  			changeset: "16282028",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/223035838"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3582692,
  						46.2332518
  					],
  					[
  						7.3584695,
  						46.2332934
  					],
  					[
  						7.3585411,
  						46.2331448
  					],
  					[
  						7.3593049,
  						46.2332968
  					],
  					[
  						7.3593765,
  						46.2331729
  					],
  					[
  						7.3583946,
  						46.2329735
  					],
  					[
  						7.3582692,
  						46.2332518
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224262468",
  		properties: {
  			timestamp: "2017-01-17T14:28:57Z",
  			version: "3",
  			changeset: "45244370",
  			user: "Sldomino",
  			uid: "5113725",
  			"addr:housenumber": "3, 5, 7",
  			"addr:postcode": "1950",
  			"addr:street": "Avenue de Pratifori",
  			building: "yes",
  			"building:levels": "4",
  			id: "way/224262468"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3562922,
  						46.2307659
  					],
  					[
  						7.3570846,
  						46.2310215
  					],
  					[
  						7.3571484,
  						46.2308829
  					],
  					[
  						7.357317,
  						46.2306328
  					],
  					[
  						7.3571186,
  						46.2305688
  					],
  					[
  						7.3569518,
  						46.2308163
  					],
  					[
  						7.3566494,
  						46.2307188
  					],
  					[
  						7.3567679,
  						46.2305429
  					],
  					[
  						7.3565779,
  						46.2304816
  					],
  					[
  						7.3564655,
  						46.2306484
  					],
  					[
  						7.3563882,
  						46.2306235
  					],
  					[
  						7.3562922,
  						46.2307659
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224262469",
  		properties: {
  			timestamp: "2020-03-21T19:14:55Z",
  			version: "3",
  			changeset: "82467965",
  			user: "Geonick",
  			uid: "6087",
  			"addr:city": "Sion",
  			"addr:housenumber": "16",
  			"addr:postcode": "1950",
  			"addr:street": "Rue du Pr├®-Fleuri",
  			amenity: "clinic",
  			building: "hospital",
  			healthcare: "clinic",
  			name: "Clinique de Val├¿re",
  			website: "https://www.cliniquevalere.ch/",
  			id: "way/224262469"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3566816,
  						46.2303646
  					],
  					[
  						7.3572409,
  						46.230526
  					],
  					[
  						7.3573118,
  						46.2304085
  					],
  					[
  						7.3567525,
  						46.2302471
  					],
  					[
  						7.3566816,
  						46.2303646
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224321698",
  		properties: {
  			timestamp: "2017-08-02T23:45:38Z",
  			version: "3",
  			changeset: "50793440",
  			user: "kalber",
  			uid: "589346",
  			"addr:housenumber": "39",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/224321698"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3561088,
  						46.2315178
  					],
  					[
  						7.3565061,
  						46.2316391
  					],
  					[
  						7.3565772,
  						46.2315278
  					],
  					[
  						7.3561799,
  						46.2314064
  					],
  					[
  						7.3561088,
  						46.2315178
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224445826",
  		properties: {
  			timestamp: "2014-12-24T16:41:17Z",
  			version: "2",
  			changeset: "27675964",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "10",
  			"addr:street": "Avenue de Pratifori",
  			building: "yes",
  			id: "way/224445826"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3564762,
  						46.2311629
  					],
  					[
  						7.3568394,
  						46.2312855
  					],
  					[
  						7.3569279,
  						46.231162
  					],
  					[
  						7.3565641,
  						46.2310382
  					],
  					[
  						7.3564762,
  						46.2311629
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224445827",
  		properties: {
  			timestamp: "2014-12-24T16:41:17Z",
  			version: "2",
  			changeset: "27675964",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "37",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/224445827"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.356653,
  						46.2316871
  					],
  					[
  						7.3568496,
  						46.2317421
  					],
  					[
  						7.3569335,
  						46.2316183
  					],
  					[
  						7.3567015,
  						46.231548
  					],
  					[
  						7.356653,
  						46.2316871
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224445828",
  		properties: {
  			timestamp: "2014-12-24T16:41:17Z",
  			version: "2",
  			changeset: "27675964",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "33",
  			"addr:street": "Avenue de la Gare",
  			building: "yes",
  			id: "way/224445828"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.357066,
  						46.231794
  					],
  					[
  						7.3571411,
  						46.231817
  					],
  					[
  						7.3573245,
  						46.2317207
  					],
  					[
  						7.3573173,
  						46.2316706
  					],
  					[
  						7.3571058,
  						46.2316244
  					],
  					[
  						7.3570528,
  						46.2316504
  					],
  					[
  						7.357066,
  						46.231794
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224445829",
  		properties: {
  			timestamp: "2014-12-24T16:41:17Z",
  			version: "2",
  			changeset: "27675964",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "35",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/224445829"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3568496,
  						46.2317421
  					],
  					[
  						7.3568584,
  						46.2317803
  					],
  					[
  						7.357002,
  						46.2318246
  					],
  					[
  						7.357066,
  						46.231794
  					],
  					[
  						7.3570528,
  						46.2316504
  					],
  					[
  						7.3569335,
  						46.2316183
  					],
  					[
  						7.3568496,
  						46.2317421
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224445830",
  		properties: {
  			timestamp: "2014-12-24T16:41:17Z",
  			version: "2",
  			changeset: "27675964",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "31",
  			"addr:street": "Avenue de la Gare",
  			building: "yes",
  			id: "way/224445830"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3571058,
  						46.2316244
  					],
  					[
  						7.3573173,
  						46.2316706
  					],
  					[
  						7.3573709,
  						46.2315113
  					],
  					[
  						7.357178,
  						46.2314663
  					],
  					[
  						7.3571058,
  						46.2316244
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224445831",
  		properties: {
  			timestamp: "2014-12-24T16:41:17Z",
  			version: "2",
  			changeset: "27675964",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "8",
  			"addr:street": "Avenue de Pratifori",
  			building: "yes",
  			id: "way/224445831"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3568394,
  						46.2312855
  					],
  					[
  						7.3570767,
  						46.2313669
  					],
  					[
  						7.3571652,
  						46.2312435
  					],
  					[
  						7.3569279,
  						46.231162
  					],
  					[
  						7.3568394,
  						46.2312855
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224445832",
  		properties: {
  			timestamp: "2020-02-18T18:09:53Z",
  			version: "3",
  			changeset: "81183843",
  			user: "billyonthemountain",
  			uid: "3130748",
  			"addr:housenumber": "29",
  			"addr:street": "Avenue de la Gare",
  			building: "office",
  			id: "way/224445832"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3570767,
  						46.2313669
  					],
  					[
  						7.357203,
  						46.2314074
  					],
  					[
  						7.357178,
  						46.2314663
  					],
  					[
  						7.3573709,
  						46.2315113
  					],
  					[
  						7.3574416,
  						46.2313876
  					],
  					[
  						7.3574438,
  						46.2313494
  					],
  					[
  						7.3573996,
  						46.2313157
  					],
  					[
  						7.3571652,
  						46.2312435
  					],
  					[
  						7.3570767,
  						46.2313669
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665375",
  		properties: {
  			timestamp: "2014-12-29T23:55:03Z",
  			version: "2",
  			changeset: "27790142",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "11",
  			"addr:street": "Rue des Aub├®pines",
  			building: "yes",
  			id: "way/224665375"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3648935,
  						46.2315872
  					],
  					[
  						7.3650688,
  						46.2315668
  					],
  					[
  						7.3650469,
  						46.231477
  					],
  					[
  						7.3648716,
  						46.2314974
  					],
  					[
  						7.3648935,
  						46.2315872
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665376",
  		properties: {
  			timestamp: "2014-12-29T23:55:03Z",
  			version: "2",
  			changeset: "27790142",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "13",
  			"addr:street": "Passage des Aub├®pines",
  			building: "yes",
  			id: "way/224665376"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3648856,
  						46.2318553
  					],
  					[
  						7.3650818,
  						46.2318584
  					],
  					[
  						7.3650859,
  						46.2317361
  					],
  					[
  						7.3648897,
  						46.231733
  					],
  					[
  						7.3648856,
  						46.2318553
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665377",
  		properties: {
  			timestamp: "2014-12-29T23:55:02Z",
  			version: "2",
  			changeset: "27790142",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "18",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/224665377"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3647116,
  						46.2321794
  					],
  					[
  						7.3650376,
  						46.2322439
  					],
  					[
  						7.3650851,
  						46.2321291
  					],
  					[
  						7.3647591,
  						46.2320646
  					],
  					[
  						7.3647189,
  						46.2321618
  					],
  					[
  						7.3647116,
  						46.2321794
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665379",
  		properties: {
  			timestamp: "2014-12-29T23:55:02Z",
  			version: "2",
  			changeset: "27790142",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "16a, 16b",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/224665379"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.364255,
  						46.2320767
  					],
  					[
  						7.3644888,
  						46.2321379
  					],
  					[
  						7.3645009,
  						46.2321158
  					],
  					[
  						7.3645532,
  						46.2320202
  					],
  					[
  						7.3646463,
  						46.23185
  					],
  					[
  						7.364504,
  						46.2318128
  					],
  					[
  						7.3644043,
  						46.231995
  					],
  					[
  						7.3643128,
  						46.2319711
  					],
  					[
  						7.364255,
  						46.2320767
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665380",
  		properties: {
  			timestamp: "2021-03-29T20:25:56Z",
  			version: "3",
  			changeset: "101939294",
  			user: "Valdor",
  			uid: "60458",
  			"addr:housenumber": "14",
  			"addr:street": "Rue du Scex",
  			building: "apartments",
  			id: "way/224665380"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3640631,
  						46.232029
  					],
  					[
  						7.364255,
  						46.2320767
  					],
  					[
  						7.3643128,
  						46.2319711
  					],
  					[
  						7.3641194,
  						46.2319209
  					],
  					[
  						7.3640631,
  						46.232029
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665381",
  		properties: {
  			timestamp: "2021-03-29T20:25:57Z",
  			version: "3",
  			changeset: "101939294",
  			user: "Valdor",
  			uid: "60458",
  			"addr:housenumber": "1, 3, 5",
  			"addr:street": "Rue des Aub├®pines",
  			building: "apartments",
  			id: "way/224665381"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3639069,
  						46.2318621
  					],
  					[
  						7.3639217,
  						46.2318657
  					],
  					[
  						7.3640928,
  						46.2319073
  					],
  					[
  						7.3641817,
  						46.2317281
  					],
  					[
  						7.3643716,
  						46.231709
  					],
  					[
  						7.364336,
  						46.2315777
  					],
  					[
  						7.3640275,
  						46.2316201
  					],
  					[
  						7.3639069,
  						46.2318621
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665382",
  		properties: {
  			timestamp: "2014-12-29T23:55:03Z",
  			version: "2",
  			changeset: "27790142",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "9",
  			"addr:street": "Rue des Aub├®pines",
  			building: "yes",
  			id: "way/224665382"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.364595,
  						46.2316406
  					],
  					[
  						7.3647966,
  						46.2316187
  					],
  					[
  						7.3648085,
  						46.2315052
  					],
  					[
  						7.3645198,
  						46.2315503
  					],
  					[
  						7.364595,
  						46.2316406
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665383",
  		properties: {
  			timestamp: "2014-12-29T23:55:02Z",
  			version: "2",
  			changeset: "27790142",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "12",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/224665383"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3638417,
  						46.2319975
  					],
  					[
  						7.3638634,
  						46.232029
  					],
  					[
  						7.3640414,
  						46.2320687
  					],
  					[
  						7.3640631,
  						46.232029
  					],
  					[
  						7.3641194,
  						46.2319209
  					],
  					[
  						7.3640928,
  						46.2319073
  					],
  					[
  						7.3639217,
  						46.2318657
  					],
  					[
  						7.3638417,
  						46.2319975
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665384",
  		properties: {
  			timestamp: "2013-06-06T17:47:43Z",
  			version: "1",
  			changeset: "16447497",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/224665384"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.364073,
  						46.2322724
  					],
  					[
  						7.3641873,
  						46.2323006
  					],
  					[
  						7.3642399,
  						46.2321984
  					],
  					[
  						7.3641256,
  						46.2321703
  					],
  					[
  						7.364073,
  						46.2322724
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665385",
  		properties: {
  			timestamp: "2014-12-29T23:49:27Z",
  			version: "2",
  			changeset: "27790069",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "15",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/224665385"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3641873,
  						46.2323006
  					],
  					[
  						7.3643292,
  						46.2323356
  					],
  					[
  						7.3643817,
  						46.2322332
  					],
  					[
  						7.3642399,
  						46.2321984
  					],
  					[
  						7.3641873,
  						46.2323006
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665387",
  		properties: {
  			timestamp: "2014-12-29T23:49:27Z",
  			version: "2",
  			changeset: "27790069",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "21, 23",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/224665387"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3646899,
  						46.2328263
  					],
  					[
  						7.3650198,
  						46.2328416
  					],
  					[
  						7.3650222,
  						46.2328174
  					],
  					[
  						7.3652594,
  						46.2328284
  					],
  					[
  						7.3652694,
  						46.2327254
  					],
  					[
  						7.3647022,
  						46.2326991
  					],
  					[
  						7.3646899,
  						46.2328263
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665396",
  		properties: {
  			timestamp: "2014-12-29T23:58:56Z",
  			version: "2",
  			changeset: "27790181",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "8",
  			"addr:street": "Rue des Aub├®pines",
  			building: "yes",
  			id: "way/224665396"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3647542,
  						46.2313488
  					],
  					[
  						7.3649012,
  						46.2312784
  					],
  					[
  						7.3648086,
  						46.231186
  					],
  					[
  						7.3646616,
  						46.2312564
  					],
  					[
  						7.3647542,
  						46.2313488
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/224665398",
  		properties: {
  			timestamp: "2020-01-26T15:37:32Z",
  			version: "6",
  			changeset: "80101064",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "19",
  			"addr:street": "Rue de la Dixence",
  			building: "apartments",
  			"building:levels": "5",
  			id: "way/224665398"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3635372,
  						46.230854
  					],
  					[
  						7.3635615,
  						46.2308758
  					],
  					[
  						7.3636386,
  						46.2308293
  					],
  					[
  						7.363804,
  						46.2306685
  					],
  					[
  						7.3638246,
  						46.2306477
  					],
  					[
  						7.3636902,
  						46.2305799
  					],
  					[
  						7.3636708,
  						46.2305981
  					],
  					[
  						7.3635299,
  						46.2307308
  					],
  					[
  						7.3634498,
  						46.2307804
  					],
  					[
  						7.3635372,
  						46.230854
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/226541393",
  		properties: {
  			timestamp: "2013-06-20T10:34:12Z",
  			version: "1",
  			changeset: "16628059",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/226541393"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3584232,
  						46.2335194
  					],
  					[
  						7.358458,
  						46.2334462
  					],
  					[
  						7.3581409,
  						46.2333741
  					],
  					[
  						7.3581062,
  						46.2334473
  					],
  					[
  						7.3584232,
  						46.2335194
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620873",
  		properties: {
  			timestamp: "2020-02-09T14:14:57Z",
  			version: "2",
  			changeset: "80752870",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			id: "way/232620873"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3602024,
  						46.2330276
  					],
  					[
  						7.3601128,
  						46.2331774
  					],
  					[
  						7.3602875,
  						46.2332131
  					],
  					[
  						7.3604617,
  						46.2332485
  					],
  					[
  						7.3604827,
  						46.2331293
  					],
  					[
  						7.3604662,
  						46.2331031
  					],
  					[
  						7.3602024,
  						46.2330276
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620874",
  		properties: {
  			timestamp: "2020-06-28T17:00:29Z",
  			version: "3",
  			changeset: "87255898",
  			user: "Thierry Vouillamoz",
  			uid: "11227806",
  			building: "apartments",
  			id: "way/232620874"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3602464,
  						46.233334
  					],
  					[
  						7.3603567,
  						46.2333739
  					],
  					[
  						7.3604271,
  						46.2333993
  					],
  					[
  						7.3604483,
  						46.2333071
  					],
  					[
  						7.3604617,
  						46.2332485
  					],
  					[
  						7.3602875,
  						46.2332131
  					],
  					[
  						7.3602464,
  						46.233334
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620876",
  		properties: {
  			timestamp: "2015-01-19T08:45:46Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "4",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/232620876"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3598181,
  						46.2330457
  					],
  					[
  						7.3600135,
  						46.2331042
  					],
  					[
  						7.3599793,
  						46.2331729
  					],
  					[
  						7.3600884,
  						46.2332022
  					],
  					[
  						7.3601812,
  						46.2330141
  					],
  					[
  						7.3598995,
  						46.2329274
  					],
  					[
  						7.3598181,
  						46.2330457
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620877",
  		properties: {
  			timestamp: "2013-09-13T11:02:58Z",
  			version: "3",
  			changeset: "17815337",
  			user: "donovaly",
  			uid: "1730904",
  			building: "yes",
  			id: "way/232620877"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.359867,
  						46.2330806
  					],
  					[
  						7.3597758,
  						46.233254
  					],
  					[
  						7.3600005,
  						46.2333442
  					],
  					[
  						7.3600705,
  						46.2332495
  					],
  					[
  						7.3599419,
  						46.2332124
  					],
  					[
  						7.3599809,
  						46.2331132
  					],
  					[
  						7.359867,
  						46.2330806
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620879",
  		properties: {
  			timestamp: "2013-10-03T19:31:17Z",
  			version: "4",
  			changeset: "18167332",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/232620879"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3600005,
  						46.2333442
  					],
  					[
  						7.3601487,
  						46.2334039
  					],
  					[
  						7.3602121,
  						46.2333214
  					],
  					[
  						7.3602561,
  						46.2332642
  					],
  					[
  						7.3601031,
  						46.2332101
  					],
  					[
  						7.3600705,
  						46.2332495
  					],
  					[
  						7.3600005,
  						46.2333442
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620880",
  		properties: {
  			timestamp: "2013-08-07T08:56:04Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620880"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3601487,
  						46.2334039
  					],
  					[
  						7.3602936,
  						46.2334635
  					],
  					[
  						7.3603567,
  						46.2333739
  					],
  					[
  						7.3602464,
  						46.233334
  					],
  					[
  						7.3602121,
  						46.2333214
  					],
  					[
  						7.3601487,
  						46.2334039
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620881",
  		properties: {
  			timestamp: "2020-02-09T14:14:59Z",
  			version: "2",
  			changeset: "80752870",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			id: "way/232620881"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3602936,
  						46.2334635
  					],
  					[
  						7.360432,
  						46.2335154
  					],
  					[
  						7.3604548,
  						46.2334072
  					],
  					[
  						7.3604271,
  						46.2333993
  					],
  					[
  						7.3603567,
  						46.2333739
  					],
  					[
  						7.3602936,
  						46.2334635
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620883",
  		properties: {
  			timestamp: "2015-01-19T08:45:46Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "5",
  			"addr:street": "Rue Supersaxo",
  			building: "yes",
  			id: "way/232620883"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3595807,
  						46.2329781
  					],
  					[
  						7.3594859,
  						46.2331482
  					],
  					[
  						7.3596585,
  						46.2332079
  					],
  					[
  						7.3597986,
  						46.2330321
  					],
  					[
  						7.3595807,
  						46.2329781
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620884",
  		properties: {
  			timestamp: "2015-01-19T08:51:26Z",
  			version: "2",
  			changeset: "28247770",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "15",
  			"addr:street": "Rue Saint-Th├®odule",
  			building: "yes",
  			id: "way/232620884"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3588649,
  						46.2333611
  					],
  					[
  						7.3591166,
  						46.2334341
  					],
  					[
  						7.3591652,
  						46.2333541
  					],
  					[
  						7.3589135,
  						46.2332811
  					],
  					[
  						7.3588649,
  						46.2333611
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620886",
  		properties: {
  			timestamp: "2019-01-09T16:56:04Z",
  			version: "5",
  			changeset: "66168729",
  			user: "Edward",
  			uid: "364",
  			"addr:city": "Sion",
  			"addr:housenumber": "14",
  			"addr:postcode": "1950",
  			"addr:street": "Rue Saint-Th├®odule",
  			amenity: "place_of_worship",
  			building: "yes",
  			denomination: "catholic",
  			name: "├ëglise Saint-Th├®odule",
  			"name:de": "Pfarrei St. Theodul",
  			religion: "christian",
  			wikidata: "Q3584594",
  			id: "way/232620886"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3585995,
  						46.2335019
  					],
  					[
  						7.3589998,
  						46.2336222
  					],
  					[
  						7.3590575,
  						46.2336396
  					],
  					[
  						7.3591189,
  						46.233619
  					],
  					[
  						7.3591466,
  						46.2335807
  					],
  					[
  						7.3591254,
  						46.2335315
  					],
  					[
  						7.3590144,
  						46.2334981
  					],
  					[
  						7.3590504,
  						46.2334408
  					],
  					[
  						7.3589442,
  						46.2334088
  					],
  					[
  						7.3589019,
  						46.2334762
  					],
  					[
  						7.3586611,
  						46.2334039
  					],
  					[
  						7.3585995,
  						46.2335019
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620893",
  		properties: {
  			timestamp: "2021-04-03T17:13:13Z",
  			version: "6",
  			changeset: "102245073",
  			user: "asdf2",
  			uid: "1416503",
  			"addr:housenumber": "18",
  			"addr:street": "Rue du Vieux-Coll├¿ge",
  			amenity: "place_of_worship",
  			building: "church",
  			name: "Eglise des J├®suites",
  			wikidata: "Q29928135",
  			id: "way/232620893"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3616864,
  						46.2336347
  					],
  					[
  						7.3618689,
  						46.2336971
  					],
  					[
  						7.3620008,
  						46.2335125
  					],
  					[
  						7.3620607,
  						46.233533
  					],
  					[
  						7.3621047,
  						46.2334715
  					],
  					[
  						7.3620292,
  						46.2334457
  					],
  					[
  						7.3620034,
  						46.2334151
  					],
  					[
  						7.3619994,
  						46.2333798
  					],
  					[
  						7.3618932,
  						46.2333453
  					],
  					[
  						7.3618519,
  						46.233403
  					],
  					[
  						7.3616864,
  						46.2336347
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620906",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "1",
  			"addr:street": "Place de la Planta",
  			building: "yes",
  			id: "way/232620906"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3584837,
  						46.2328018
  					],
  					[
  						7.3586852,
  						46.2328483
  					],
  					[
  						7.3587706,
  						46.2326712
  					],
  					[
  						7.3586141,
  						46.2326351
  					],
  					[
  						7.3585691,
  						46.2326247
  					],
  					[
  						7.3584837,
  						46.2328018
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620908",
  		properties: {
  			timestamp: "2018-08-22T14:18:45Z",
  			version: "3",
  			changeset: "61890337",
  			user: "fredjunod",
  			uid: "84054",
  			"addr:housenumber": "14",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/232620908"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3586141,
  						46.2326351
  					],
  					[
  						7.3587706,
  						46.2326712
  					],
  					[
  						7.358809,
  						46.2326823
  					],
  					[
  						7.358822,
  						46.2326566
  					],
  					[
  						7.358861,
  						46.232666
  					],
  					[
  						7.3588881,
  						46.2326174
  					],
  					[
  						7.3588999,
  						46.2325924
  					],
  					[
  						7.3586645,
  						46.2325355
  					],
  					[
  						7.3586141,
  						46.2326351
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620909",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "8",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/232620909"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3593276,
  						46.2327452
  					],
  					[
  						7.3592581,
  						46.2328521
  					],
  					[
  						7.3593839,
  						46.2328923
  					],
  					[
  						7.3594941,
  						46.2329189
  					],
  					[
  						7.3595569,
  						46.2328166
  					],
  					[
  						7.3593276,
  						46.2327452
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620910",
  		properties: {
  			timestamp: "2018-08-22T14:18:45Z",
  			version: "2",
  			changeset: "61890337",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			id: "way/232620910"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3593025,
  						46.2330181
  					],
  					[
  						7.3594598,
  						46.2330535
  					],
  					[
  						7.359525,
  						46.232927
  					],
  					[
  						7.3594941,
  						46.2329189
  					],
  					[
  						7.3593839,
  						46.2328923
  					],
  					[
  						7.3593025,
  						46.2330181
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620912",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "10",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/232620912"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3590013,
  						46.2327684
  					],
  					[
  						7.3592374,
  						46.232839
  					],
  					[
  						7.3593048,
  						46.232731
  					],
  					[
  						7.3590688,
  						46.2326604
  					],
  					[
  						7.3590013,
  						46.2327684
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620913",
  		properties: {
  			timestamp: "2018-08-22T14:18:45Z",
  			version: "3",
  			changeset: "61890337",
  			user: "fredjunod",
  			uid: "84054",
  			"addr:housenumber": "12",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/232620913"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3588881,
  						46.2326174
  					],
  					[
  						7.358861,
  						46.232666
  					],
  					[
  						7.358812,
  						46.232754
  					],
  					[
  						7.3589486,
  						46.2327904
  					],
  					[
  						7.3590247,
  						46.2326538
  					],
  					[
  						7.3588881,
  						46.2326174
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620915",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "19",
  			"addr:street": "Rue de Conthey",
  			building: "yes",
  			id: "way/232620915"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.358717,
  						46.2328324
  					],
  					[
  						7.3586781,
  						46.2329632
  					],
  					[
  						7.3587921,
  						46.2329892
  					],
  					[
  						7.358831,
  						46.2328519
  					],
  					[
  						7.358717,
  						46.2328324
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620916",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "17",
  			"addr:street": "Rue de Conthey",
  			building: "yes",
  			id: "way/232620916"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3587921,
  						46.2329892
  					],
  					[
  						7.358957,
  						46.2330263
  					],
  					[
  						7.3589946,
  						46.2328862
  					],
  					[
  						7.358831,
  						46.2328519
  					],
  					[
  						7.3587921,
  						46.2329892
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620917",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "15",
  			"addr:street": "Rue de Conthey",
  			building: "yes",
  			id: "way/232620917"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.359016,
  						46.2329048
  					],
  					[
  						7.3589611,
  						46.2330288
  					],
  					[
  						7.3592689,
  						46.233094
  					],
  					[
  						7.3593025,
  						46.2330181
  					],
  					[
  						7.3591869,
  						46.2329936
  					],
  					[
  						7.3592082,
  						46.2329455
  					],
  					[
  						7.359016,
  						46.2329048
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620919",
  		properties: {
  			timestamp: "2015-01-19T08:45:45Z",
  			version: "2",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "13",
  			"addr:street": "Rue de Conthey",
  			building: "yes",
  			id: "way/232620919"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3592689,
  						46.233094
  					],
  					[
  						7.3594244,
  						46.2331302
  					],
  					[
  						7.3594598,
  						46.2330535
  					],
  					[
  						7.3593025,
  						46.2330181
  					],
  					[
  						7.3592689,
  						46.233094
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620930",
  		properties: {
  			timestamp: "2021-04-03T17:13:13Z",
  			version: "4",
  			changeset: "102245073",
  			user: "asdf2",
  			uid: "1416503",
  			"addr:housenumber": "20",
  			"addr:street": "Rue du Vieux-Coll├¿ge",
  			amenity: "theatre",
  			building: "yes",
  			name: "Th├®├ótre de Val├¿re",
  			phone: "+41 27 323 45 61",
  			website: "http://www.theatredevalere.ch",
  			wikidata: "Q29928464",
  			id: "way/232620930"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3619088,
  						46.2337694
  					],
  					[
  						7.3623178,
  						46.2339076
  					],
  					[
  						7.3623809,
  						46.233812
  					],
  					[
  						7.3620939,
  						46.233697
  					],
  					[
  						7.3621086,
  						46.2336729
  					],
  					[
  						7.362008,
  						46.2336348
  					],
  					[
  						7.3619088,
  						46.2337694
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620933",
  		properties: {
  			timestamp: "2015-01-08T19:23:49Z",
  			version: "2",
  			changeset: "28003807",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "1",
  			"addr:street": "Rue du Vieux-Coll├¿ge",
  			building: "yes",
  			id: "way/232620933"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3611766,
  						46.2338445
  					],
  					[
  						7.3613697,
  						46.2339289
  					],
  					[
  						7.3614649,
  						46.2338324
  					],
  					[
  						7.3615165,
  						46.2337662
  					],
  					[
  						7.3613308,
  						46.2336933
  					],
  					[
  						7.3612329,
  						46.2337703
  					],
  					[
  						7.3611766,
  						46.2338445
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620934",
  		properties: {
  			timestamp: "2020-01-26T15:37:26Z",
  			version: "2",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			id: "way/232620934"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3611108,
  						46.2324576
  					],
  					[
  						7.3609848,
  						46.232427
  					],
  					[
  						7.3607844,
  						46.2326397
  					],
  					[
  						7.3609305,
  						46.2327152
  					],
  					[
  						7.3611108,
  						46.2324576
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620935",
  		properties: {
  			timestamp: "2013-08-07T08:56:07Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620935"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3605382,
  						46.2326255
  					],
  					[
  						7.3606549,
  						46.232632
  					],
  					[
  						7.3607327,
  						46.2323166
  					],
  					[
  						7.3605422,
  						46.2322841
  					],
  					[
  						7.3605382,
  						46.2326255
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620936",
  		properties: {
  			timestamp: "2020-01-26T15:37:26Z",
  			version: "2",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			id: "way/232620936"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3605905,
  						46.2328732
  					],
  					[
  						7.3606992,
  						46.2329294
  					],
  					[
  						7.3609305,
  						46.2327152
  					],
  					[
  						7.3607844,
  						46.2326397
  					],
  					[
  						7.3607263,
  						46.2326935
  					],
  					[
  						7.3607637,
  						46.2327128
  					],
  					[
  						7.3606634,
  						46.2328057
  					],
  					[
  						7.3605905,
  						46.2328732
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620937",
  		properties: {
  			timestamp: "2013-08-07T08:56:07Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620937"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3604913,
  						46.2326339
  					],
  					[
  						7.3604859,
  						46.232851
  					],
  					[
  						7.3605261,
  						46.2328565
  					],
  					[
  						7.3606085,
  						46.2327787
  					],
  					[
  						7.3606254,
  						46.2327628
  					],
  					[
  						7.3606549,
  						46.232632
  					],
  					[
  						7.3605382,
  						46.2326255
  					],
  					[
  						7.3604913,
  						46.2326339
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620938",
  		properties: {
  			timestamp: "2013-08-07T08:56:08Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620938"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3605261,
  						46.2328565
  					],
  					[
  						7.3605637,
  						46.2328964
  					],
  					[
  						7.3605905,
  						46.2328732
  					],
  					[
  						7.3606634,
  						46.2328057
  					],
  					[
  						7.3606085,
  						46.2327787
  					],
  					[
  						7.3605261,
  						46.2328565
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620939",
  		properties: {
  			timestamp: "2020-02-09T14:15:36Z",
  			version: "3",
  			changeset: "80752879",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			"building:levels": "5",
  			id: "way/232620939"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.360502,
  						46.2329456
  					],
  					[
  						7.3604859,
  						46.2329957
  					],
  					[
  						7.3606254,
  						46.2330152
  					],
  					[
  						7.3606401,
  						46.2329697
  					],
  					[
  						7.360502,
  						46.2329456
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620940",
  		properties: {
  			timestamp: "2020-01-26T15:37:27Z",
  			version: "2",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			id: "way/232620940"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.360502,
  						46.2329456
  					],
  					[
  						7.3606401,
  						46.2329697
  					],
  					[
  						7.3606992,
  						46.2329294
  					],
  					[
  						7.3605905,
  						46.2328732
  					],
  					[
  						7.3605637,
  						46.2328964
  					],
  					[
  						7.360502,
  						46.2329456
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620941",
  		properties: {
  			timestamp: "2013-08-07T08:56:08Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620941"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3601855,
  						46.2329075
  					],
  					[
  						7.3604148,
  						46.2329706
  					],
  					[
  						7.3604269,
  						46.2328157
  					],
  					[
  						7.3602579,
  						46.2327962
  					],
  					[
  						7.3601855,
  						46.2329075
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620942",
  		properties: {
  			timestamp: "2013-08-07T08:56:08Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620942"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3602659,
  						46.2327786
  					],
  					[
  						7.3604282,
  						46.232774
  					],
  					[
  						7.3604345,
  						46.2322959
  					],
  					[
  						7.3602783,
  						46.2322972
  					],
  					[
  						7.3602807,
  						46.232414
  					],
  					[
  						7.3603558,
  						46.2324131
  					],
  					[
  						7.3603545,
  						46.2325931
  					],
  					[
  						7.3602861,
  						46.2325931
  					],
  					[
  						7.3602659,
  						46.2327786
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620943",
  		properties: {
  			timestamp: "2013-08-07T08:56:08Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620943"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3600701,
  						46.2326116
  					],
  					[
  						7.3602508,
  						46.2325978
  					],
  					[
  						7.3602188,
  						46.2323975
  					],
  					[
  						7.3600381,
  						46.2324113
  					],
  					[
  						7.3600701,
  						46.2326116
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620944",
  		properties: {
  			timestamp: "2021-04-12T15:49:25Z",
  			version: "2",
  			changeset: "102814933",
  			user: "Valdor",
  			uid: "60458",
  			building: "apartments",
  			id: "way/232620944"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3593446,
  						46.2321812
  					],
  					[
  						7.3594805,
  						46.2322485
  					],
  					[
  						7.35954,
  						46.232191
  					],
  					[
  						7.3594029,
  						46.2321249
  					],
  					[
  						7.3593446,
  						46.2321812
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620965",
  		properties: {
  			timestamp: "2013-08-07T08:56:09Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620965"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.360273,
  						46.2314569
  					],
  					[
  						7.3604159,
  						46.2314361
  					],
  					[
  						7.3605233,
  						46.2314384
  					],
  					[
  						7.3605641,
  						46.2313801
  					],
  					[
  						7.3604886,
  						46.2313571
  					],
  					[
  						7.3604407,
  						46.2313309
  					],
  					[
  						7.3603626,
  						46.2313279
  					],
  					[
  						7.3602946,
  						46.2313428
  					],
  					[
  						7.360244,
  						46.2313757
  					],
  					[
  						7.3602055,
  						46.2314215
  					],
  					[
  						7.360273,
  						46.2314569
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620966",
  		properties: {
  			timestamp: "2013-08-07T08:56:09Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620966"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3601909,
  						46.2314436
  					],
  					[
  						7.3600051,
  						46.231594
  					],
  					[
  						7.3600182,
  						46.2316042
  					],
  					[
  						7.3601098,
  						46.2316757
  					],
  					[
  						7.3603248,
  						46.2315137
  					],
  					[
  						7.3601909,
  						46.2314436
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620967",
  		properties: {
  			timestamp: "2013-08-07T08:56:09Z",
  			version: "1",
  			changeset: "17251212",
  			user: "akira86",
  			uid: "88528",
  			building: "yes",
  			id: "way/232620967"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.359895,
  						46.2317094
  					],
  					[
  						7.3599116,
  						46.2317333
  					],
  					[
  						7.360164,
  						46.2317228
  					],
  					[
  						7.3601098,
  						46.2316757
  					],
  					[
  						7.3600182,
  						46.2316042
  					],
  					[
  						7.359895,
  						46.2317094
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/232620969",
  		properties: {
  			timestamp: "2021-04-13T16:01:32Z",
  			version: "2",
  			changeset: "102876316",
  			user: "Valdor",
  			uid: "60458",
  			building: "apartments",
  			id: "way/232620969"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.360164,
  						46.2317228
  					],
  					[
  						7.3604915,
  						46.2317122
  					],
  					[
  						7.3605369,
  						46.2314663
  					],
  					[
  						7.3604434,
  						46.2314582
  					],
  					[
  						7.3603,
  						46.2314765
  					],
  					[
  						7.3603248,
  						46.2315137
  					],
  					[
  						7.3601098,
  						46.2316757
  					],
  					[
  						7.360164,
  						46.2317228
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167865",
  		properties: {
  			timestamp: "2020-02-09T14:15:01Z",
  			version: "3",
  			changeset: "80752870",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			id: "way/233167865"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3604004,
  						46.2337746
  					],
  					[
  						7.3604152,
  						46.2336921
  					],
  					[
  						7.3602395,
  						46.2336846
  					],
  					[
  						7.3602516,
  						46.2337598
  					],
  					[
  						7.3604004,
  						46.2337746
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167866",
  		properties: {
  			timestamp: "2017-05-02T09:32:55Z",
  			version: "4",
  			changeset: "48329613",
  			user: "s├®dunois",
  			uid: "4642519",
  			"addr:city": "Sion",
  			"addr:housenumber": "4",
  			"addr:postcode": "1950",
  			"addr:street": "Rue de Conthey",
  			building: "yes",
  			id: "way/233167866"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3601671,
  						46.2335306
  					],
  					[
  						7.3600169,
  						46.2336188
  					],
  					[
  						7.3601295,
  						46.2336781
  					],
  					[
  						7.3601645,
  						46.2336534
  					],
  					[
  						7.3602596,
  						46.2335863
  					],
  					[
  						7.3601671,
  						46.2335306
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167867",
  		properties: {
  			timestamp: "2017-05-02T09:32:55Z",
  			version: "3",
  			changeset: "48329613",
  			user: "s├®dunois",
  			uid: "4642519",
  			"addr:city": "Sion",
  			"addr:housenumber": "6",
  			"addr:postcode": "1950",
  			"addr:street": "Rue de Conthey",
  			building: "yes",
  			id: "way/233167867"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.359927,
  						46.2335102
  					],
  					[
  						7.3598696,
  						46.2335656
  					],
  					[
  						7.3599956,
  						46.2336351
  					],
  					[
  						7.3600169,
  						46.2336188
  					],
  					[
  						7.3601671,
  						46.2335306
  					],
  					[
  						7.3600303,
  						46.2334379
  					],
  					[
  						7.359927,
  						46.2335102
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167868",
  		properties: {
  			timestamp: "2014-03-19T12:51:32Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167868"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3596963,
  						46.233436
  					],
  					[
  						7.3597661,
  						46.2334666
  					],
  					[
  						7.3597942,
  						46.2334332
  					],
  					[
  						7.3598586,
  						46.2334638
  					],
  					[
  						7.3599418,
  						46.2333906
  					],
  					[
  						7.3597755,
  						46.233321
  					],
  					[
  						7.3596963,
  						46.233436
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167869",
  		properties: {
  			timestamp: "2014-03-19T12:51:30Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167869"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3602596,
  						46.2335863
  					],
  					[
  						7.3601645,
  						46.2336534
  					],
  					[
  						7.3602395,
  						46.2336846
  					],
  					[
  						7.3602998,
  						46.233605
  					],
  					[
  						7.3602596,
  						46.2335863
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167870",
  		properties: {
  			timestamp: "2020-02-09T14:15:02Z",
  			version: "4",
  			changeset: "80752870",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:city": "Sion",
  			"addr:housenumber": "2",
  			"addr:postcode": "1950",
  			"addr:street": "Rue de Conthey",
  			building: "apartments",
  			id: "way/233167870"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3602998,
  						46.233605
  					],
  					[
  						7.3602395,
  						46.2336846
  					],
  					[
  						7.3604152,
  						46.2336921
  					],
  					[
  						7.3604186,
  						46.2336512
  					],
  					[
  						7.3602998,
  						46.233605
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167871",
  		properties: {
  			timestamp: "2014-03-19T12:51:30Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167871"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3598096,
  						46.2337193
  					],
  					[
  						7.3599171,
  						46.2337452
  					],
  					[
  						7.3599602,
  						46.2336529
  					],
  					[
  						7.3598772,
  						46.2336286
  					],
  					[
  						7.3598096,
  						46.2337193
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167872",
  		properties: {
  			timestamp: "2014-03-19T12:51:31Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167872"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3600775,
  						46.2337818
  					],
  					[
  						7.3601811,
  						46.2338024
  					],
  					[
  						7.3602227,
  						46.2337022
  					],
  					[
  						7.360119,
  						46.2336816
  					],
  					[
  						7.3600775,
  						46.2337818
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167873",
  		properties: {
  			timestamp: "2014-03-19T12:51:31Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167873"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3598586,
  						46.2334638
  					],
  					[
  						7.359927,
  						46.2335102
  					],
  					[
  						7.3600303,
  						46.2334379
  					],
  					[
  						7.3599418,
  						46.2333906
  					],
  					[
  						7.3598586,
  						46.2334638
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167874",
  		properties: {
  			timestamp: "2014-03-19T12:51:31Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167874"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3596899,
  						46.2336298
  					],
  					[
  						7.3597705,
  						46.2336495
  					],
  					[
  						7.359852,
  						46.2335183
  					],
  					[
  						7.3597575,
  						46.2334833
  					],
  					[
  						7.3596899,
  						46.2336298
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167881",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "5",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "9",
  			"addr:street": "Rue du Vieux-Coll├¿ge",
  			building: "yes",
  			id: "way/233167881"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3615264,
  						46.233623
  					],
  					[
  						7.3615444,
  						46.2336295
  					],
  					[
  						7.3616244,
  						46.2336582
  					],
  					[
  						7.3617112,
  						46.2335425
  					],
  					[
  						7.3616133,
  						46.2335073
  					],
  					[
  						7.3615471,
  						46.2335955
  					],
  					[
  						7.3615264,
  						46.233623
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167882",
  		properties: {
  			timestamp: "2014-03-19T12:51:32Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167882"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3596587,
  						46.2335862
  					],
  					[
  						7.3594232,
  						46.2335271
  					],
  					[
  						7.359456,
  						46.2334646
  					],
  					[
  						7.359305,
  						46.2334267
  					],
  					[
  						7.3592278,
  						46.2335739
  					],
  					[
  						7.3596142,
  						46.2336709
  					],
  					[
  						7.3596587,
  						46.2335862
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167883",
  		properties: {
  			timestamp: "2014-03-19T12:51:32Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167883"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3595714,
  						46.2335213
  					],
  					[
  						7.3596764,
  						46.2335605
  					],
  					[
  						7.3597041,
  						46.233525
  					],
  					[
  						7.3596375,
  						46.2335001
  					],
  					[
  						7.3596555,
  						46.2334771
  					],
  					[
  						7.3596171,
  						46.2334627
  					],
  					[
  						7.3595714,
  						46.2335213
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167884",
  		properties: {
  			timestamp: "2014-03-19T12:51:31Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167884"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.359305,
  						46.2334267
  					],
  					[
  						7.359456,
  						46.2334646
  					],
  					[
  						7.3594915,
  						46.2333904
  					],
  					[
  						7.3593448,
  						46.2333553
  					],
  					[
  						7.359305,
  						46.2334267
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167885",
  		properties: {
  			timestamp: "2014-03-19T12:51:31Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167885"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3594245,
  						46.2331912
  					],
  					[
  						7.3593482,
  						46.2333143
  					],
  					[
  						7.3595024,
  						46.23336
  					],
  					[
  						7.3595787,
  						46.233237
  					],
  					[
  						7.3594245,
  						46.2331912
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/233167886",
  		properties: {
  			timestamp: "2014-03-19T12:51:31Z",
  			version: "2",
  			changeset: "21191633",
  			user: "haavee",
  			uid: "311036",
  			building: "yes",
  			id: "way/233167886"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3595787,
  						46.233237
  					],
  					[
  						7.3595024,
  						46.23336
  					],
  					[
  						7.3596963,
  						46.233436
  					],
  					[
  						7.3597755,
  						46.233321
  					],
  					[
  						7.3595787,
  						46.233237
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237140288",
  		properties: {
  			timestamp: "2020-04-01T22:03:44Z",
  			version: "2",
  			changeset: "82945715",
  			user: "Diony B├®trisey",
  			uid: "10969926",
  			amenity: "place_of_worship",
  			building: "yes",
  			name: "Basilique Notre-Dame de Val├¿re",
  			religion: "christian",
  			id: "way/237140288"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3646122,
  						46.233819
  					],
  					[
  						7.3646492,
  						46.233761
  					],
  					[
  						7.3645593,
  						46.2337335
  					],
  					[
  						7.364544,
  						46.2337575
  					],
  					[
  						7.3641005,
  						46.2336219
  					],
  					[
  						7.3640173,
  						46.2337522
  					],
  					[
  						7.3644354,
  						46.2338799
  					],
  					[
  						7.3644111,
  						46.2339179
  					],
  					[
  						7.364537,
  						46.2339564
  					],
  					[
  						7.3645786,
  						46.2338913
  					],
  					[
  						7.3646229,
  						46.2339048
  					],
  					[
  						7.3646701,
  						46.2338912
  					],
  					[
  						7.3646799,
  						46.2338608
  					],
  					[
  						7.3646571,
  						46.2338327
  					],
  					[
  						7.3646122,
  						46.233819
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/239881037",
  		properties: {
  			timestamp: "2013-09-29T14:18:27Z",
  			version: "1",
  			changeset: "18093565",
  			user: "gangbang",
  			uid: "1760087",
  			"addr:city": "Sion",
  			"addr:housenumber": "26",
  			"addr:postcode": "1950",
  			"addr:street": "Rue des C├¿dres",
  			building: "yes",
  			"building:levels": "4",
  			name: "Les aigues vives",
  			id: "way/239881037"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3635704,
  						46.2312601
  					],
  					[
  						7.3637642,
  						46.2314093
  					],
  					[
  						7.3638878,
  						46.2313326
  					],
  					[
  						7.3637069,
  						46.2311828
  					],
  					[
  						7.3635704,
  						46.2312601
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/239881191",
  		properties: {
  			timestamp: "2015-10-07T17:05:55Z",
  			version: "2",
  			changeset: "34495346",
  			user: "vonde",
  			uid: "2528547",
  			"addr:city": "Sion",
  			"addr:housenumber": "28",
  			"addr:postcode": "1950",
  			"addr:street": "Rue des C├¿dres",
  			building: "yes",
  			name: "Kedros",
  			id: "way/239881191"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3637662,
  						46.2314258
  					],
  					[
  						7.3637801,
  						46.2314354
  					],
  					[
  						7.3638018,
  						46.2314491
  					],
  					[
  						7.3638519,
  						46.2314573
  					],
  					[
  						7.363929,
  						46.2314706
  					],
  					[
  						7.3641629,
  						46.2313475
  					],
  					[
  						7.3640588,
  						46.2312886
  					],
  					[
  						7.363924,
  						46.2313538
  					],
  					[
  						7.3638984,
  						46.2313292
  					],
  					[
  						7.3637926,
  						46.2313928
  					],
  					[
  						7.3638056,
  						46.2314026
  					],
  					[
  						7.3637662,
  						46.2314258
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/239883102",
  		properties: {
  			timestamp: "2019-04-28T15:02:45Z",
  			version: "5",
  			changeset: "69666315",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "13",
  			"addr:street": "Place du Scex",
  			building: "yes",
  			"building:levels": "3",
  			name: "Conservatoire cantonal du Valais",
  			id: "way/239883102"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3637012,
  						46.2325641
  					],
  					[
  						7.3640549,
  						46.2326482
  					],
  					[
  						7.3641699,
  						46.2324169
  					],
  					[
  						7.3638162,
  						46.2323327
  					],
  					[
  						7.3637012,
  						46.2325641
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245085559",
  		properties: {
  			timestamp: "2013-11-07T17:11:23Z",
  			version: "1",
  			changeset: "18768032",
  			user: "springslord",
  			uid: "1798321",
  			building: "yes",
  			id: "way/245085559"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3598029,
  						46.2319984
  					],
  					[
  						7.3599211,
  						46.2320604
  					],
  					[
  						7.3599421,
  						46.2320335
  					],
  					[
  						7.360002,
  						46.2320687
  					],
  					[
  						7.360029,
  						46.2320356
  					],
  					[
  						7.3600919,
  						46.2320687
  					],
  					[
  						7.3601159,
  						46.2320418
  					],
  					[
  						7.3601698,
  						46.2320646
  					],
  					[
  						7.3602028,
  						46.2320418
  					],
  					[
  						7.3602477,
  						46.2320667
  					],
  					[
  						7.3602857,
  						46.2320439
  					],
  					[
  						7.3602902,
  						46.2318924
  					],
  					[
  						7.3600747,
  						46.2318992
  					],
  					[
  						7.3599995,
  						46.2318897
  					],
  					[
  						7.3599451,
  						46.2318718
  					],
  					[
  						7.3599137,
  						46.231901
  					],
  					[
  						7.3598029,
  						46.2319984
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245085562",
  		properties: {
  			timestamp: "2013-11-07T17:11:23Z",
  			version: "1",
  			changeset: "18768032",
  			user: "springslord",
  			uid: "1798321",
  			building: "yes",
  			id: "way/245085562"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.360934,
  						46.2322677
  					],
  					[
  						7.3609879,
  						46.2320542
  					],
  					[
  						7.3608351,
  						46.2320314
  					],
  					[
  						7.3607842,
  						46.2322532
  					],
  					[
  						7.360934,
  						46.2322677
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245085564",
  		properties: {
  			timestamp: "2020-01-26T15:37:29Z",
  			version: "3",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "22, 24, 26, 32",
  			"addr:street": "Rue du Rh├┤ne",
  			building: "apartments",
  			id: "way/245085564"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3612673,
  						46.2319134
  					],
  					[
  						7.3611011,
  						46.2321259
  					],
  					[
  						7.361048,
  						46.232121
  					],
  					[
  						7.3609454,
  						46.2323389
  					],
  					[
  						7.3611754,
  						46.2323879
  					],
  					[
  						7.3614338,
  						46.2319937
  					],
  					[
  						7.3612673,
  						46.2319134
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245085566",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "4",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "23, 21, 19, 19a, 17, 15, 13",
  			"addr:street": "Rue du Rh├┤ne",
  			building: "apartments",
  			id: "way/245085566"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3613941,
  						46.2321367
  					],
  					[
  						7.3612901,
  						46.2323052
  					],
  					[
  						7.3610972,
  						46.2326177
  					],
  					[
  						7.3612292,
  						46.2326984
  					],
  					[
  						7.361341,
  						46.2326651
  					],
  					[
  						7.3612914,
  						46.2326201
  					],
  					[
  						7.3612723,
  						46.2326036
  					],
  					[
  						7.3616243,
  						46.2324481
  					],
  					[
  						7.3615648,
  						46.2323947
  					],
  					[
  						7.3615298,
  						46.2323733
  					],
  					[
  						7.3614224,
  						46.2323463
  					],
  					[
  						7.3614276,
  						46.2323405
  					],
  					[
  						7.361432,
  						46.2323356
  					],
  					[
  						7.3615443,
  						46.2323661
  					],
  					[
  						7.3615762,
  						46.2323868
  					],
  					[
  						7.3616409,
  						46.2324432
  					],
  					[
  						7.3617925,
  						46.2323772
  					],
  					[
  						7.3616047,
  						46.2322333
  					],
  					[
  						7.3613941,
  						46.2321367
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245085569",
  		properties: {
  			timestamp: "2020-02-25T16:33:25Z",
  			version: "2",
  			changeset: "81464097",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/245085569"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3614372,
  						46.2325685
  					],
  					[
  						7.3612914,
  						46.2326201
  					],
  					[
  						7.361341,
  						46.2326651
  					],
  					[
  						7.3613579,
  						46.2326805
  					],
  					[
  						7.3615151,
  						46.2326295
  					],
  					[
  						7.3614372,
  						46.2325685
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245085571",
  		properties: {
  			timestamp: "2018-08-22T14:18:45Z",
  			version: "3",
  			changeset: "61890337",
  			user: "fredjunod",
  			uid: "84054",
  			building: "yes",
  			id: "way/245085571"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3583355,
  						46.2308669
  					],
  					[
  						7.3583076,
  						46.2309339
  					],
  					[
  						7.358208,
  						46.2311734
  					],
  					[
  						7.358652,
  						46.2312617
  					],
  					[
  						7.3586693,
  						46.2312202
  					],
  					[
  						7.3588108,
  						46.2312483
  					],
  					[
  						7.3588363,
  						46.2311871
  					],
  					[
  						7.358816,
  						46.2311485
  					],
  					[
  						7.3588993,
  						46.2309963
  					],
  					[
  						7.3583617,
  						46.2308554
  					],
  					[
  						7.3583355,
  						46.2308669
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245085573",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "3",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			building: "yes",
  			id: "way/245085573"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3588109,
  						46.2315066
  					],
  					[
  						7.358835,
  						46.2314908
  					],
  					[
  						7.3589174,
  						46.2315145
  					],
  					[
  						7.3590441,
  						46.2313048
  					],
  					[
  						7.3590059,
  						46.2312945
  					],
  					[
  						7.3591367,
  						46.2310622
  					],
  					[
  						7.3588993,
  						46.2309963
  					],
  					[
  						7.358816,
  						46.2311485
  					],
  					[
  						7.3588566,
  						46.2312046
  					],
  					[
  						7.3587196,
  						46.2314438
  					],
  					[
  						7.3587018,
  						46.231475
  					],
  					[
  						7.3587453,
  						46.2314876
  					],
  					[
  						7.3587768,
  						46.2314967
  					],
  					[
  						7.3588109,
  						46.2315066
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245089365",
  		properties: {
  			timestamp: "2014-12-31T21:38:56Z",
  			version: "2",
  			changeset: "27831348",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "17",
  			"addr:street": "Rue de la Dixence",
  			building: "yes",
  			id: "way/245089365"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3638709,
  						46.2308411
  					],
  					[
  						7.3637712,
  						46.2309372
  					],
  					[
  						7.3639884,
  						46.2310449
  					],
  					[
  						7.364088,
  						46.2309488
  					],
  					[
  						7.3638709,
  						46.2308411
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245089366",
  		properties: {
  			timestamp: "2019-01-23T20:24:53Z",
  			version: "3",
  			changeset: "66581075",
  			user: "vonde",
  			uid: "2528547",
  			"addr:housenumber": "15",
  			"addr:street": "Rue de la Dixence",
  			building: "yes",
  			"building:levels": "5",
  			id: "way/245089366"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3643529,
  						46.2310719
  					],
  					[
  						7.3640588,
  						46.2312886
  					],
  					[
  						7.3641629,
  						46.2313475
  					],
  					[
  						7.3645076,
  						46.2311417
  					],
  					[
  						7.3643529,
  						46.2310719
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245089368",
  		properties: {
  			timestamp: "2019-07-14T19:37:29Z",
  			version: "4",
  			changeset: "72240932",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "7",
  			"addr:street": "Rue Sainte-Marguerite",
  			building: "apartments",
  			"building:levels": "6",
  			"roof:levels": "1",
  			id: "way/245089368"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3643679,
  						46.2305843
  					],
  					[
  						7.3644303,
  						46.2307122
  					],
  					[
  						7.3645205,
  						46.2306899
  					],
  					[
  						7.3646838,
  						46.2308014
  					],
  					[
  						7.3645635,
  						46.2309024
  					],
  					[
  						7.3646867,
  						46.2309682
  					],
  					[
  						7.3647418,
  						46.2309975
  					],
  					[
  						7.3648471,
  						46.2309009
  					],
  					[
  						7.364918,
  						46.2309574
  					],
  					[
  						7.3651157,
  						46.2308668
  					],
  					[
  						7.3646279,
  						46.2305264
  					],
  					[
  						7.3643679,
  						46.2305843
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/245089370",
  		properties: {
  			timestamp: "2014-12-31T21:38:56Z",
  			version: "2",
  			changeset: "27831348",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "3",
  			"addr:street": "Rue Sainte-Marguerite",
  			building: "yes",
  			id: "way/245089370"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3646867,
  						46.2309682
  					],
  					[
  						7.3645635,
  						46.2309024
  					],
  					[
  						7.3645463,
  						46.2308905
  					],
  					[
  						7.3643529,
  						46.2310719
  					],
  					[
  						7.3645076,
  						46.2311417
  					],
  					[
  						7.3646867,
  						46.2309682
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/283943425",
  		properties: {
  			timestamp: "2019-10-22T19:15:53Z",
  			version: "3",
  			changeset: "76065768",
  			user: "RaphB",
  			uid: "5864987",
  			building: "school",
  			id: "way/283943425"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.361886,
  						46.2304017
  					],
  					[
  						7.3617967,
  						46.2305256
  					],
  					[
  						7.3621792,
  						46.2306573
  					],
  					[
  						7.362164,
  						46.2306783
  					],
  					[
  						7.3622226,
  						46.2306985
  					],
  					[
  						7.3622348,
  						46.2306817
  					],
  					[
  						7.3622909,
  						46.2307011
  					],
  					[
  						7.3623831,
  						46.2305734
  					],
  					[
  						7.361886,
  						46.2304017
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/295458262",
  		properties: {
  			timestamp: "2020-01-26T15:37:30Z",
  			version: "3",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "4, 2",
  			"addr:street": "Rue du Grand-Pont",
  			building: "apartments",
  			id: "way/295458262"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3610066,
  						46.2333279
  					],
  					[
  						7.3608092,
  						46.233315
  					],
  					[
  						7.3608303,
  						46.2332649
  					],
  					[
  						7.3608022,
  						46.2332609
  					],
  					[
  						7.3608151,
  						46.2332051
  					],
  					[
  						7.3608606,
  						46.2332108
  					],
  					[
  						7.3608816,
  						46.23313
  					],
  					[
  						7.360682,
  						46.2331389
  					],
  					[
  						7.3606435,
  						46.2333893
  					],
  					[
  						7.3609867,
  						46.233424
  					],
  					[
  						7.3610066,
  						46.2333279
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/295458263",
  		properties: {
  			timestamp: "2015-01-08T19:45:10Z",
  			version: "2",
  			changeset: "28004428",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "46",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/295458263"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3621131,
  						46.232751
  					],
  					[
  						7.3622497,
  						46.2327437
  					],
  					[
  						7.3622451,
  						46.2326493
  					],
  					[
  						7.3622544,
  						46.2326468
  					],
  					[
  						7.3622521,
  						46.2325418
  					],
  					[
  						7.3621096,
  						46.2325443
  					],
  					[
  						7.3621131,
  						46.232751
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/295458264",
  		properties: {
  			timestamp: "2014-08-02T07:30:07Z",
  			version: "1",
  			changeset: "24493481",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/295458264"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3621106,
  						46.2328045
  					],
  					[
  						7.36218,
  						46.2328033
  					],
  					[
  						7.3622653,
  						46.2328025
  					],
  					[
  						7.3622653,
  						46.232748
  					],
  					[
  						7.3622497,
  						46.2327437
  					],
  					[
  						7.3621131,
  						46.232751
  					],
  					[
  						7.3621106,
  						46.2328045
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/295458265",
  		properties: {
  			timestamp: "2015-01-08T19:45:10Z",
  			version: "2",
  			changeset: "28004428",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "48",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/295458265"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3622521,
  						46.2325418
  					],
  					[
  						7.3622371,
  						46.2324991
  					],
  					[
  						7.3622506,
  						46.2324545
  					],
  					[
  						7.3621044,
  						46.2324587
  					],
  					[
  						7.362095,
  						46.2325065
  					],
  					[
  						7.3621096,
  						46.2325443
  					],
  					[
  						7.3622521,
  						46.2325418
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/295458266",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "6",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			access: "yes",
  			amenity: "parking",
  			building: "parking",
  			capacity: "658",
  			"capacity:charging": "5",
  			"capacity:disabled": "4",
  			fee: "yes",
  			layer: "-1",
  			location: "underground",
  			"motorcycle:parking": "no",
  			name: "Parking du Scex",
  			operator: "Ville de Sion",
  			parking: "underground",
  			"payment:cash": "yes",
  			"payment:credit_cards": "yes",
  			"payment:debit_cards": "yes",
  			id: "way/295458266"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.363545,
  						46.2322508
  					],
  					[
  						7.3637298,
  						46.2322967
  					],
  					[
  						7.3637862,
  						46.2321879
  					],
  					[
  						7.3637128,
  						46.2321697
  					],
  					[
  						7.3636599,
  						46.2321565
  					],
  					[
  						7.3636015,
  						46.232142
  					],
  					[
  						7.363545,
  						46.2322508
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/311654944",
  		properties: {
  			timestamp: "2015-12-04T13:23:58Z",
  			version: "4",
  			changeset: "35747129",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "2, 4, 6",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/311654944"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3623147,
  						46.2316017
  					],
  					[
  						7.36304,
  						46.2317853
  					],
  					[
  						7.3632193,
  						46.2318303
  					],
  					[
  						7.3633222,
  						46.2316325
  					],
  					[
  						7.3624774,
  						46.2314211
  					],
  					[
  						7.3624182,
  						46.2314061
  					],
  					[
  						7.3623147,
  						46.2316017
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/311654945",
  		properties: {
  			timestamp: "2020-01-26T15:37:30Z",
  			version: "4",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "9",
  			"addr:street": "Rue de la Dixence",
  			building: "office",
  			id: "way/311654945"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3631582,
  						46.2311505
  					],
  					[
  						7.3630137,
  						46.2310334
  					],
  					[
  						7.3627733,
  						46.2311753
  					],
  					[
  						7.3629178,
  						46.2312924
  					],
  					[
  						7.3631582,
  						46.2311505
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/311654946",
  		properties: {
  			timestamp: "2021-03-29T20:26:02Z",
  			version: "5",
  			changeset: "101939294",
  			user: "Valdor",
  			uid: "60458",
  			"addr:housenumber": "8, 10",
  			"addr:street": "Rue du Scex",
  			building: "hotel",
  			id: "way/311654946"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3632193,
  						46.2318303
  					],
  					[
  						7.363422,
  						46.2318807
  					],
  					[
  						7.3636034,
  						46.2315321
  					],
  					[
  						7.3636209,
  						46.2314984
  					],
  					[
  						7.3635582,
  						46.2314828
  					],
  					[
  						7.3634182,
  						46.2314479
  					],
  					[
  						7.3633222,
  						46.2316325
  					],
  					[
  						7.3632193,
  						46.2318303
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314193759",
  		properties: {
  			timestamp: "2015-01-08T19:43:49Z",
  			version: "2",
  			changeset: "28004384",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:street": "Rue des Tanneries",
  			building: "yes",
  			id: "way/314193759"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3618047,
  						46.2328741
  					],
  					[
  						7.3620476,
  						46.2327998
  					],
  					[
  						7.3619892,
  						46.2327207
  					],
  					[
  						7.3618351,
  						46.2325753
  					],
  					[
  						7.3617533,
  						46.2326125
  					],
  					[
  						7.3618421,
  						46.2327336
  					],
  					[
  						7.3617487,
  						46.2327627
  					],
  					[
  						7.3618047,
  						46.2328741
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314193760",
  		properties: {
  			timestamp: "2015-01-08T19:43:49Z",
  			version: "2",
  			changeset: "28004384",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "7",
  			"addr:street": "Rue des Tanneries",
  			building: "yes",
  			id: "way/314193760"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3617487,
  						46.2327627
  					],
  					[
  						7.3618421,
  						46.2327336
  					],
  					[
  						7.3617533,
  						46.2326125
  					],
  					[
  						7.3616226,
  						46.2326399
  					],
  					[
  						7.3617487,
  						46.2327627
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314193761",
  		properties: {
  			timestamp: "2015-01-08T19:45:10Z",
  			version: "2",
  			changeset: "28004428",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "33",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/314193761"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3621408,
  						46.23293
  					],
  					[
  						7.3622836,
  						46.2329255
  					],
  					[
  						7.362277,
  						46.2328241
  					],
  					[
  						7.3621342,
  						46.2328286
  					],
  					[
  						7.3621408,
  						46.23293
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314193762",
  		properties: {
  			timestamp: "2015-01-08T19:28:04Z",
  			version: "2",
  			changeset: "28003913",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "16",
  			"addr:street": "Rue du Vieux-Coll├¿ge",
  			building: "yes",
  			id: "way/314193762"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3616869,
  						46.2333221
  					],
  					[
  						7.3618519,
  						46.233403
  					],
  					[
  						7.3618932,
  						46.2333453
  					],
  					[
  						7.3618456,
  						46.2333097
  					],
  					[
  						7.3618724,
  						46.2332772
  					],
  					[
  						7.3618831,
  						46.2332374
  					],
  					[
  						7.3619314,
  						46.2332346
  					],
  					[
  						7.3620266,
  						46.2331724
  					],
  					[
  						7.3618523,
  						46.2330769
  					],
  					[
  						7.3617204,
  						46.2332214
  					],
  					[
  						7.3616869,
  						46.2333221
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314193764",
  		properties: {
  			timestamp: "2014-11-23T22:35:34Z",
  			version: "1",
  			changeset: "26984337",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/314193764"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.362092,
  						46.2329814
  					],
  					[
  						7.3620759,
  						46.2328914
  					],
  					[
  						7.3619297,
  						46.232909
  					],
  					[
  						7.3618117,
  						46.2329461
  					],
  					[
  						7.3618707,
  						46.233063
  					],
  					[
  						7.3620048,
  						46.2330083
  					],
  					[
  						7.362092,
  						46.2329814
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/318731811",
  		properties: {
  			timestamp: "2014-12-24T16:45:32Z",
  			version: "1",
  			changeset: "27676111",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "1",
  			"addr:street": "Chemin des Collines",
  			building: "yes",
  			id: "way/318731811"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3565651,
  						46.2327524
  					],
  					[
  						7.3566323,
  						46.2326445
  					],
  					[
  						7.3564729,
  						46.2326067
  					],
  					[
  						7.3564166,
  						46.232719
  					],
  					[
  						7.3565651,
  						46.2327524
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/318731975",
  		properties: {
  			timestamp: "2020-12-20T07:24:54Z",
  			version: "2",
  			changeset: "96130400",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "41",
  			"addr:street": "Avenue de la Gare",
  			building: "office",
  			id: "way/318731975"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3565574,
  						46.232912
  					],
  					[
  						7.3565175,
  						46.2329954
  					],
  					[
  						7.356493,
  						46.2330465
  					],
  					[
  						7.3566459,
  						46.2330854
  					],
  					[
  						7.3567197,
  						46.2329472
  					],
  					[
  						7.3565574,
  						46.232912
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319410011",
  		properties: {
  			timestamp: "2017-01-17T14:24:27Z",
  			version: "2",
  			changeset: "45244241",
  			user: "Sldomino",
  			uid: "5113725",
  			"addr:housenumber": "27",
  			"addr:postcode": "1950",
  			"addr:street": "Avenue de la Gare",
  			building: "yes",
  			"building:levels": "4",
  			id: "way/319410011"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3570846,
  						46.2310215
  					],
  					[
  						7.3575066,
  						46.2311631
  					],
  					[
  						7.3575944,
  						46.231031
  					],
  					[
  						7.3571484,
  						46.2308829
  					],
  					[
  						7.3570846,
  						46.2310215
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319498415",
  		properties: {
  			timestamp: "2014-12-29T23:55:02Z",
  			version: "1",
  			changeset: "27790142",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "16c",
  			"addr:street": "Rue du Scex",
  			building: "yes",
  			id: "way/319498415"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3647189,
  						46.2321618
  					],
  					[
  						7.3647591,
  						46.2320646
  					],
  					[
  						7.3645532,
  						46.2320202
  					],
  					[
  						7.3645009,
  						46.2321158
  					],
  					[
  						7.3647189,
  						46.2321618
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319784789",
  		properties: {
  			timestamp: "2014-12-31T21:38:55Z",
  			version: "1",
  			changeset: "27831348",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "24",
  			"addr:street": "Rue des C├¿dres",
  			building: "yes",
  			id: "way/319784789"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3634752,
  						46.2310317
  					],
  					[
  						7.3633814,
  						46.2310855
  					],
  					[
  						7.3635704,
  						46.2312601
  					],
  					[
  						7.3637069,
  						46.2311828
  					],
  					[
  						7.3634752,
  						46.2310317
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319784794",
  		properties: {
  			timestamp: "2020-01-26T15:37:34Z",
  			version: "4",
  			changeset: "80101064",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "13",
  			"addr:street": "Rue de la Dixence",
  			building: "apartments",
  			"building:levels": "5",
  			id: "way/319784794"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3634204,
  						46.2309203
  					],
  					[
  						7.3635372,
  						46.230854
  					],
  					[
  						7.3634498,
  						46.2307804
  					],
  					[
  						7.3633238,
  						46.2308514
  					],
  					[
  						7.3634204,
  						46.2309203
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319785265",
  		properties: {
  			timestamp: "2014-12-31T21:45:54Z",
  			version: "1",
  			changeset: "27831453",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "13, 15",
  			"addr:street": "Rue des C├¿dres",
  			building: "yes",
  			id: "way/319785265"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3614641,
  						46.2307923
  					],
  					[
  						7.3616425,
  						46.2308175
  					],
  					[
  						7.3617027,
  						46.2306902
  					],
  					[
  						7.3612904,
  						46.2306058
  					],
  					[
  						7.3612426,
  						46.2307343
  					],
  					[
  						7.3614641,
  						46.2307923
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319787358",
  		properties: {
  			timestamp: "2014-12-31T22:13:52Z",
  			version: "1",
  			changeset: "27831838",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "4, 8",
  			"addr:street": "Rue des Creusets",
  			building: "yes",
  			id: "way/319787358"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3600793,
  						46.230875
  					],
  					[
  						7.3599855,
  						46.2306153
  					],
  					[
  						7.3598897,
  						46.2308241
  					],
  					[
  						7.3600793,
  						46.230875
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320653865",
  		properties: {
  			timestamp: "2020-02-23T11:07:50Z",
  			version: "2",
  			changeset: "81363921",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "22 a",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/320653865"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3562714,
  						46.2323085
  					],
  					[
  						7.3564516,
  						46.2323628
  					],
  					[
  						7.3565209,
  						46.2322595
  					],
  					[
  						7.3563422,
  						46.2322019
  					],
  					[
  						7.3562714,
  						46.2323085
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321024708",
  		properties: {
  			timestamp: "2015-01-08T19:23:49Z",
  			version: "1",
  			changeset: "28003807",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "5, 7",
  			"addr:street": "Rue du Vieux-Coll├¿ge",
  			building: "yes",
  			id: "way/321024708"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3614642,
  						46.2337341
  					],
  					[
  						7.3615444,
  						46.2336295
  					],
  					[
  						7.3615264,
  						46.233623
  					],
  					[
  						7.3615471,
  						46.2335955
  					],
  					[
  						7.361407,
  						46.2335403
  					],
  					[
  						7.3613276,
  						46.233684
  					],
  					[
  						7.3614642,
  						46.2337341
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321025520",
  		properties: {
  			timestamp: "2015-01-08T19:28:04Z",
  			version: "1",
  			changeset: "28003913",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "4, 6",
  			"addr:street": "Rue du Vieux-Coll├¿ge",
  			building: "yes",
  			id: "way/321025520"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.361115,
  						46.2336609
  					],
  					[
  						7.3612492,
  						46.2336786
  					],
  					[
  						7.3612924,
  						46.2335947
  					],
  					[
  						7.3611852,
  						46.2335755
  					],
  					[
  						7.3611523,
  						46.2335696
  					],
  					[
  						7.361115,
  						46.2336609
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321025522",
  		properties: {
  			timestamp: "2015-01-08T19:28:04Z",
  			version: "1",
  			changeset: "28003913",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "5",
  			"addr:street": "Ruelle du Casino",
  			building: "yes",
  			id: "way/321025522"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3611852,
  						46.2335755
  					],
  					[
  						7.3612095,
  						46.2335341
  					],
  					[
  						7.3611838,
  						46.2335147
  					],
  					[
  						7.3611453,
  						46.2335026
  					],
  					[
  						7.3611465,
  						46.233463
  					],
  					[
  						7.3610613,
  						46.2334541
  					],
  					[
  						7.3610566,
  						46.233522
  					],
  					[
  						7.3610402,
  						46.2335187
  					],
  					[
  						7.3610344,
  						46.2335672
  					],
  					[
  						7.3611523,
  						46.2335696
  					],
  					[
  						7.3611852,
  						46.2335755
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321025525",
  		properties: {
  			timestamp: "2015-01-08T19:28:04Z",
  			version: "1",
  			changeset: "28003913",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/321025525"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3612617,
  						46.2335338
  					],
  					[
  						7.361365,
  						46.2335459
  					],
  					[
  						7.3613924,
  						46.2334748
  					],
  					[
  						7.3612769,
  						46.2334748
  					],
  					[
  						7.3612617,
  						46.2335338
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321025527",
  		properties: {
  			timestamp: "2018-12-10T03:42:20Z",
  			version: "2",
  			changeset: "65330577",
  			user: "Joshua Garner",
  			uid: "2135234",
  			"addr:city": "Sion",
  			"addr:housenumber": "8",
  			"addr:postcode": "1950",
  			"addr:street": "Rue du Grand-Pont",
  			building: "yes",
  			"name:en": "Saints Theodore and Ame Orthodox Church",
  			"name:fr": "Chapelle orthodoxe saint-Th├®odore-et-saint-Am├®",
  			phone: "+41 27 323 6208",
  			website: "https://www.egliserusse-sion.ch/",
  			id: "way/321025527"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3610773,
  						46.2336783
  					],
  					[
  						7.3610666,
  						46.2335975
  					],
  					[
  						7.3610049,
  						46.2335938
  					],
  					[
  						7.3610062,
  						46.2335669
  					],
  					[
  						7.3608882,
  						46.2335669
  					],
  					[
  						7.3608949,
  						46.2336031
  					],
  					[
  						7.3608238,
  						46.2336019
  					],
  					[
  						7.3608207,
  						46.2336204
  					],
  					[
  						7.3608533,
  						46.2336207
  					],
  					[
  						7.360856,
  						46.2336764
  					],
  					[
  						7.3608788,
  						46.2337348
  					],
  					[
  						7.3610009,
  						46.2337302
  					],
  					[
  						7.3610089,
  						46.2336857
  					],
  					[
  						7.3610773,
  						46.2336783
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321025530",
  		properties: {
  			timestamp: "2015-01-08T19:28:04Z",
  			version: "1",
  			changeset: "28003913",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "2, 4",
  			"addr:street": "Rue des Ch├óteaux",
  			building: "yes",
  			id: "way/321025530"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3610009,
  						46.2337302
  					],
  					[
  						7.3608788,
  						46.2337348
  					],
  					[
  						7.360856,
  						46.2336764
  					],
  					[
  						7.360797,
  						46.233682
  					],
  					[
  						7.3607914,
  						46.2337415
  					],
  					[
  						7.3608064,
  						46.2338397
  					],
  					[
  						7.3609901,
  						46.233835
  					],
  					[
  						7.3611537,
  						46.2338276
  					],
  					[
  						7.3611873,
  						46.2337645
  					],
  					[
  						7.3609975,
  						46.2337626
  					],
  					[
  						7.3610009,
  						46.2337302
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321025533",
  		properties: {
  			timestamp: "2015-01-08T19:28:04Z",
  			version: "1",
  			changeset: "28003913",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "2",
  			"addr:street": "Rue du Vieux-Coll├¿ge",
  			building: "yes",
  			id: "way/321025533"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3609975,
  						46.2337626
  					],
  					[
  						7.3611873,
  						46.2337645
  					],
  					[
  						7.3612221,
  						46.2337033
  					],
  					[
  						7.3610773,
  						46.2336783
  					],
  					[
  						7.3610089,
  						46.2336857
  					],
  					[
  						7.3610009,
  						46.2337302
  					],
  					[
  						7.3609975,
  						46.2337626
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321026990",
  		properties: {
  			timestamp: "2015-01-08T19:40:16Z",
  			version: "1",
  			changeset: "28004288",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/321026990"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.36119,
  						46.2334508
  					],
  					[
  						7.361413,
  						46.2334484
  					],
  					[
  						7.3614095,
  						46.2333612
  					],
  					[
  						7.3614655,
  						46.2332958
  					],
  					[
  						7.3612168,
  						46.2331326
  					],
  					[
  						7.3611129,
  						46.2331544
  					],
  					[
  						7.3608911,
  						46.2331343
  					],
  					[
  						7.3608606,
  						46.2332108
  					],
  					[
  						7.3608151,
  						46.2332051
  					],
  					[
  						7.3608022,
  						46.2332609
  					],
  					[
  						7.3608303,
  						46.2332649
  					],
  					[
  						7.3608092,
  						46.233315
  					],
  					[
  						7.3610066,
  						46.2333279
  					],
  					[
  						7.3609867,
  						46.233424
  					],
  					[
  						7.36119,
  						46.2334508
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321026991",
  		properties: {
  			timestamp: "2020-01-26T15:37:40Z",
  			version: "3",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "2",
  			"addr:street": "Rue de la Lombardie",
  			building: "apartments",
  			id: "way/321026991"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3606905,
  						46.233106
  					],
  					[
  						7.3609587,
  						46.2331042
  					],
  					[
  						7.3609802,
  						46.2330541
  					],
  					[
  						7.3608303,
  						46.2329784
  					],
  					[
  						7.3607576,
  						46.2330328
  					],
  					[
  						7.3606905,
  						46.233106
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321026992",
  		properties: {
  			timestamp: "2015-01-08T19:40:16Z",
  			version: "1",
  			changeset: "28004288",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "3",
  			"addr:street": "Rue du Rh├┤ne",
  			building: "yes",
  			id: "way/321026992"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.360982,
  						46.2330511
  					],
  					[
  						7.3610357,
  						46.2330284
  					],
  					[
  						7.3609493,
  						46.2329759
  					],
  					[
  						7.3609704,
  						46.2329614
  					],
  					[
  						7.3609132,
  						46.2329259
  					],
  					[
  						7.3608303,
  						46.2329784
  					],
  					[
  						7.360982,
  						46.2330511
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321026993",
  		properties: {
  			timestamp: "2015-01-08T19:40:16Z",
  			version: "1",
  			changeset: "28004288",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "5, 7, 9",
  			"addr:street": "Rue du Rh├┤ne",
  			building: "yes",
  			id: "way/321026993"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3610357,
  						46.2330284
  					],
  					[
  						7.3612319,
  						46.2329307
  					],
  					[
  						7.3610859,
  						46.2328031
  					],
  					[
  						7.3609132,
  						46.2329259
  					],
  					[
  						7.3609704,
  						46.2329614
  					],
  					[
  						7.3609493,
  						46.2329759
  					],
  					[
  						7.3610357,
  						46.2330284
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321026994",
  		properties: {
  			timestamp: "2015-01-08T19:40:16Z",
  			version: "1",
  			changeset: "28004288",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/321026994"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3612692,
  						46.2329953
  					],
  					[
  						7.3611899,
  						46.233026
  					],
  					[
  						7.3611455,
  						46.2330099
  					],
  					[
  						7.3611011,
  						46.2330333
  					],
  					[
  						7.3610498,
  						46.2330309
  					],
  					[
  						7.3609587,
  						46.2331042
  					],
  					[
  						7.3610462,
  						46.2331076
  					],
  					[
  						7.3610918,
  						46.2331326
  					],
  					[
  						7.3611805,
  						46.2331132
  					],
  					[
  						7.361358,
  						46.2330486
  					],
  					[
  						7.3612692,
  						46.2329953
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321026995",
  		properties: {
  			timestamp: "2015-01-08T19:40:16Z",
  			version: "1",
  			changeset: "28004288",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "8",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/321026995"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3612856,
  						46.2329986
  					],
  					[
  						7.3613603,
  						46.2330341
  					],
  					[
  						7.3613802,
  						46.2330236
  					],
  					[
  						7.361358,
  						46.2329218
  					],
  					[
  						7.3613329,
  						46.2328976
  					],
  					[
  						7.3612307,
  						46.2329372
  					],
  					[
  						7.3612856,
  						46.2329986
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321026996",
  		properties: {
  			timestamp: "2015-01-08T19:40:17Z",
  			version: "1",
  			changeset: "28004288",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "23",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/321026996"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3615,
  						46.2332016
  					],
  					[
  						7.3616316,
  						46.233149
  					],
  					[
  						7.3615854,
  						46.2330894
  					],
  					[
  						7.3615364,
  						46.2330853
  					],
  					[
  						7.3614852,
  						46.2331052
  					],
  					[
  						7.3614724,
  						46.2330971
  					],
  					[
  						7.361435,
  						46.2331019
  					],
  					[
  						7.3614117,
  						46.2330567
  					],
  					[
  						7.3612669,
  						46.2331189
  					],
  					[
  						7.361442,
  						46.2332457
  					],
  					[
  						7.3615,
  						46.2332016
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321026997",
  		properties: {
  			timestamp: "2015-01-08T19:40:17Z",
  			version: "1",
  			changeset: "28004288",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "7",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/321026997"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3614762,
  						46.2332625
  					],
  					[
  						7.3615145,
  						46.2332907
  					],
  					[
  						7.3614966,
  						46.2333176
  					],
  					[
  						7.3615611,
  						46.2333655
  					],
  					[
  						7.361674,
  						46.2332397
  					],
  					[
  						7.3616394,
  						46.2332193
  					],
  					[
  						7.3616191,
  						46.233244
  					],
  					[
  						7.3615332,
  						46.2332125
  					],
  					[
  						7.3614762,
  						46.2332625
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027247",
  		properties: {
  			timestamp: "2015-01-08T19:41:43Z",
  			version: "1",
  			changeset: "28004341",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "13",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/321027247"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3617593,
  						46.2330927
  					],
  					[
  						7.3618244,
  						46.2330548
  					],
  					[
  						7.3618478,
  						46.2330738
  					],
  					[
  						7.3618707,
  						46.233063
  					],
  					[
  						7.3618081,
  						46.2329894
  					],
  					[
  						7.3616851,
  						46.2330288
  					],
  					[
  						7.3617593,
  						46.2330927
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027248",
  		properties: {
  			timestamp: "2015-01-08T19:41:43Z",
  			version: "1",
  			changeset: "28004341",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "17",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/321027248"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.361616,
  						46.2329437
  					],
  					[
  						7.3616577,
  						46.2330189
  					],
  					[
  						7.3617593,
  						46.232988
  					],
  					[
  						7.3617288,
  						46.2329563
  					],
  					[
  						7.3616973,
  						46.2329585
  					],
  					[
  						7.361675,
  						46.2329247
  					],
  					[
  						7.361616,
  						46.2329437
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027249",
  		properties: {
  			timestamp: "2015-01-08T19:41:43Z",
  			version: "1",
  			changeset: "28004341",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "19, 25",
  			"addr:street": "Rue de la Lombardie",
  			building: "yes",
  			id: "way/321027249"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.361616,
  						46.2329437
  					],
  					[
  						7.3615378,
  						46.2328671
  					],
  					[
  						7.3613802,
  						46.2329205
  					],
  					[
  						7.3613985,
  						46.2330077
  					],
  					[
  						7.3614402,
  						46.2330632
  					],
  					[
  						7.361493,
  						46.233097
  					],
  					[
  						7.3616414,
  						46.2330252
  					],
  					[
  						7.361616,
  						46.2329437
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027472",
  		properties: {
  			timestamp: "2015-01-08T19:43:49Z",
  			version: "1",
  			changeset: "28004384",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "1",
  			"addr:street": "Rue des Tanneries",
  			building: "yes",
  			id: "way/321027472"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3613939,
  						46.2328554
  					],
  					[
  						7.3615579,
  						46.2328146
  					],
  					[
  						7.3616404,
  						46.2327922
  					],
  					[
  						7.3614863,
  						46.232653
  					],
  					[
  						7.3612737,
  						46.2327222
  					],
  					[
  						7.3613939,
  						46.2328554
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027473",
  		properties: {
  			timestamp: "2020-02-25T16:33:25Z",
  			version: "2",
  			changeset: "81464097",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/321027473"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3615579,
  						46.2328146
  					],
  					[
  						7.3615695,
  						46.2328544
  					],
  					[
  						7.3616681,
  						46.2328725
  					],
  					[
  						7.3617297,
  						46.2328682
  					],
  					[
  						7.361702,
  						46.2327755
  					],
  					[
  						7.3616404,
  						46.2327922
  					],
  					[
  						7.3615579,
  						46.2328146
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027474",
  		properties: {
  			timestamp: "2015-01-08T19:43:49Z",
  			version: "1",
  			changeset: "28004384",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/321027474"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3610311,
  						46.2327584
  					],
  					[
  						7.3611311,
  						46.2328343
  					],
  					[
  						7.3612364,
  						46.2327828
  					],
  					[
  						7.3611364,
  						46.2326965
  					],
  					[
  						7.3610311,
  						46.2327584
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027475",
  		properties: {
  			timestamp: "2020-02-25T16:33:25Z",
  			version: "2",
  			changeset: "81464097",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "18",
  			"addr:street": "Rue des Tanneries",
  			building: "yes",
  			id: "way/321027475"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3613417,
  						46.2328948
  					],
  					[
  						7.3613647,
  						46.2328814
  					],
  					[
  						7.361247,
  						46.2327786
  					],
  					[
  						7.3611311,
  						46.2328343
  					],
  					[
  						7.3612381,
  						46.2329285
  					],
  					[
  						7.3613329,
  						46.2328976
  					],
  					[
  						7.3613417,
  						46.2328948
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027611",
  		properties: {
  			timestamp: "2015-01-08T19:45:10Z",
  			version: "1",
  			changeset: "28004428",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "13",
  			"addr:street": "Rue des Tanneries",
  			building: "yes",
  			id: "way/321027611"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3620065,
  						46.2325911
  					],
  					[
  						7.3620351,
  						46.2325869
  					],
  					[
  						7.3620573,
  						46.2325836
  					],
  					[
  						7.3620912,
  						46.2325506
  					],
  					[
  						7.3620065,
  						46.2324707
  					],
  					[
  						7.3619218,
  						46.2325122
  					],
  					[
  						7.3620065,
  						46.2325911
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027612",
  		properties: {
  			timestamp: "2015-01-08T19:45:10Z",
  			version: "1",
  			changeset: "28004428",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/321027612"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.362005,
  						46.2326838
  					],
  					[
  						7.3620897,
  						46.2326529
  					],
  					[
  						7.3620351,
  						46.2325869
  					],
  					[
  						7.3620065,
  						46.2325911
  					],
  					[
  						7.3619526,
  						46.2326273
  					],
  					[
  						7.362005,
  						46.2326838
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321027613",
  		properties: {
  			timestamp: "2015-01-08T19:45:10Z",
  			version: "1",
  			changeset: "28004428",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/321027613"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3616434,
  						46.2322189
  					],
  					[
  						7.3617336,
  						46.2322764
  					],
  					[
  						7.3618416,
  						46.2322207
  					],
  					[
  						7.3617142,
  						46.2321522
  					],
  					[
  						7.3616434,
  						46.2322189
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/321028028",
  		properties: {
  			timestamp: "2015-01-08T19:49:32Z",
  			version: "1",
  			changeset: "28004540",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "10",
  			"addr:street": "Rue des Tanneries",
  			building: "yes",
  			id: "way/321028028"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3618064,
  						46.232314
  					],
  					[
  						7.3618527,
  						46.2323481
  					],
  					[
  						7.3619792,
  						46.2323196
  					],
  					[
  						7.3619628,
  						46.2322926
  					],
  					[
  						7.3618634,
  						46.2323114
  					],
  					[
  						7.3618527,
  						46.2322991
  					],
  					[
  						7.3618064,
  						46.232314
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/323013023",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "2",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			"addr:housenumber": "29",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/323013023"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3577385,
  						46.2320503
  					],
  					[
  						7.3579568,
  						46.2321197
  					],
  					[
  						7.357969,
  						46.2321019
  					],
  					[
  						7.3580383,
  						46.2320004
  					],
  					[
  						7.3580537,
  						46.2319779
  					],
  					[
  						7.3578154,
  						46.2319041
  					],
  					[
  						7.3577385,
  						46.2320503
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/323013024",
  		properties: {
  			timestamp: "2015-01-19T08:41:21Z",
  			version: "1",
  			changeset: "28247624",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "1",
  			"addr:street": "Rue des Vergers",
  			building: "yes",
  			id: "way/323013024"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3579784,
  						46.2316267
  					],
  					[
  						7.3581831,
  						46.2316879
  					],
  					[
  						7.3582625,
  						46.2315578
  					],
  					[
  						7.3580386,
  						46.2314977
  					],
  					[
  						7.3579784,
  						46.2316267
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/323013025",
  		properties: {
  			timestamp: "2015-01-19T08:41:22Z",
  			version: "1",
  			changeset: "28247624",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "4",
  			"addr:street": "Rue de la Dent-Blanche",
  			building: "yes",
  			id: "way/323013025"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3587164,
  						46.2321682
  					],
  					[
  						7.3588371,
  						46.2319893
  					],
  					[
  						7.3586655,
  						46.2319336
  					],
  					[
  						7.3585361,
  						46.2321306
  					],
  					[
  						7.3587164,
  						46.2321682
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/323013370",
  		properties: {
  			timestamp: "2015-01-19T08:45:44Z",
  			version: "1",
  			changeset: "28247692",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "6",
  			"addr:street": "Rue de Lausanne",
  			building: "yes",
  			id: "way/323013370"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3595807,
  						46.2329781
  					],
  					[
  						7.3597986,
  						46.2330321
  					],
  					[
  						7.3598692,
  						46.2329138
  					],
  					[
  						7.3596546,
  						46.2328507
  					],
  					[
  						7.3595807,
  						46.2329781
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/323827785",
  		properties: {
  			timestamp: "2015-01-23T15:14:51Z",
  			version: "1",
  			changeset: "28351357",
  			user: "keigan160",
  			uid: "2028552",
  			"addr:housenumber": "3, 5",
  			"addr:street": "Rue des Creusets",
  			building: "yes",
  			id: "way/323827785"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.360578,
  						46.2305679
  					],
  					[
  						7.3604064,
  						46.2303884
  					],
  					[
  						7.3602415,
  						46.230736
  					],
  					[
  						7.3604734,
  						46.2307886
  					],
  					[
  						7.360578,
  						46.2305679
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/384321385",
  		properties: {
  			timestamp: "2015-12-04T13:03:55Z",
  			version: "1",
  			changeset: "35746801",
  			user: "keigan160",
  			uid: "2028552",
  			building: "yes",
  			id: "way/384321385"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3583076,
  						46.2309339
  					],
  					[
  						7.3583355,
  						46.2308669
  					],
  					[
  						7.3581219,
  						46.2308117
  					],
  					[
  						7.3581043,
  						46.2308434
  					],
  					[
  						7.3580834,
  						46.2308812
  					],
  					[
  						7.3582781,
  						46.2309249
  					],
  					[
  						7.3583076,
  						46.2309339
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/384324486",
  		properties: {
  			timestamp: "2020-01-26T15:37:41Z",
  			version: "2",
  			changeset: "80101059",
  			user: "RaphB",
  			uid: "5864987",
  			building: "apartments",
  			id: "way/384324486"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3624774,
  						46.2314211
  					],
  					[
  						7.3633222,
  						46.2316325
  					],
  					[
  						7.3634182,
  						46.2314479
  					],
  					[
  						7.3635582,
  						46.2314828
  					],
  					[
  						7.3635948,
  						46.2314684
  					],
  					[
  						7.3631582,
  						46.2311505
  					],
  					[
  						7.3629178,
  						46.2312924
  					],
  					[
  						7.3627733,
  						46.2311753
  					],
  					[
  						7.3625378,
  						46.2313741
  					],
  					[
  						7.3624774,
  						46.2314211
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733991484",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "1",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			building: "roof",
  			id: "way/733991484"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3627687,
  						46.2322183
  					],
  					[
  						7.3627952,
  						46.2322472
  					],
  					[
  						7.362872,
  						46.2322135
  					],
  					[
  						7.3628455,
  						46.2321846
  					],
  					[
  						7.3627687,
  						46.2322183
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/761164419",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "1",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			building: "yes",
  			id: "way/761164419"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3580422,
  						46.2321226
  					],
  					[
  						7.3581096,
  						46.2320203
  					],
  					[
  						7.3580383,
  						46.2320004
  					],
  					[
  						7.357969,
  						46.2321019
  					],
  					[
  						7.3580422,
  						46.2321226
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/786971603",
  		properties: {
  			timestamp: "2020-04-01T22:03:44Z",
  			version: "1",
  			changeset: "82945715",
  			user: "Diony B├®trisey",
  			uid: "10969926",
  			building: "yes",
  			id: "way/786971603"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3641005,
  						46.2336219
  					],
  					[
  						7.3640432,
  						46.2336043
  					],
  					[
  						7.3640005,
  						46.2336957
  					],
  					[
  						7.3639801,
  						46.2337392
  					],
  					[
  						7.3640173,
  						46.2337522
  					],
  					[
  						7.3641005,
  						46.2336219
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/786971604",
  		properties: {
  			timestamp: "2020-04-01T22:03:44Z",
  			version: "1",
  			changeset: "82945715",
  			user: "Diony B├®trisey",
  			uid: "10969926",
  			building: "yes",
  			id: "way/786971604"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3638727,
  						46.2336528
  					],
  					[
  						7.3640005,
  						46.2336957
  					],
  					[
  						7.3640432,
  						46.2336043
  					],
  					[
  						7.3639043,
  						46.2335785
  					],
  					[
  						7.3638863,
  						46.2336209
  					],
  					[
  						7.3638727,
  						46.2336528
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/786971605",
  		properties: {
  			timestamp: "2020-04-01T22:03:44Z",
  			version: "1",
  			changeset: "82945715",
  			user: "Diony B├®trisey",
  			uid: "10969926",
  			building: "yes",
  			id: "way/786971605"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3637073,
  						46.2334211
  					],
  					[
  						7.3637661,
  						46.2334628
  					],
  					[
  						7.3638491,
  						46.2334132
  					],
  					[
  						7.3637953,
  						46.2333879
  					],
  					[
  						7.3637482,
  						46.2333924
  					],
  					[
  						7.3637073,
  						46.2334211
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/819544406",
  		properties: {
  			timestamp: "2020-06-25T17:28:37Z",
  			version: "1",
  			changeset: "87152576",
  			user: "RaphB",
  			uid: "5864987",
  			building: "yes",
  			id: "way/819544406"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.3643679,
  						46.2305843
  					],
  					[
  						7.3642613,
  						46.2306135
  					],
  					[
  						7.3641161,
  						46.2307478
  					],
  					[
  						7.3642564,
  						46.2308268
  					],
  					[
  						7.3643527,
  						46.2307298
  					],
  					[
  						7.3644303,
  						46.2307122
  					],
  					[
  						7.3643679,
  						46.2305843
  					]
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/819544413",
  		properties: {
  			timestamp: "2020-06-25T17:28:37Z",
  			version: "1",
  			changeset: "87152576",
  			user: "RaphB",
  			uid: "5864987",
  			building: "roof",
  			id: "way/819544413"
  		},
  		geometry: {
  			type: "Polygon",
  			coordinates: [
  				[
  					[
  						7.364063,
  						46.2305607
  					],
  					[
  						7.3641015,
  						46.2305776
  					],
  					[
  						7.3641298,
  						46.2305468
  					],
  					[
  						7.3640913,
  						46.2305298
  					],
  					[
  						7.364063,
  						46.2305607
  					]
  				]
  			]
  		}
  	}
  ];

  var routes = [
  	{
  		type: "Feature",
  		id: "way/23157579",
  		properties: {
  			timestamp: "2021-03-29T20:25:54Z",
  			version: "14",
  			changeset: "101939290",
  			user: "Valdor",
  			uid: "60458",
  			highway: "residential",
  			lane_markings: "no",
  			lit: "yes",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue des C├¿dres",
  			surface: "asphalt",
  			id: "way/23157579"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3630731,
  					46.2309008
  				],
  				[
  					7.3631569,
  					46.2309708
  				],
  				[
  					7.3633317,
  					46.2311108
  				],
  				[
  					7.3635937,
  					46.2313208
  				],
  				[
  					7.3638061,
  					46.2314909
  				],
  				[
  					7.3638875,
  					46.2315561
  				],
  				[
  					7.3639227,
  					46.2315845
  				],
  				[
  					7.3639513,
  					46.2316286
  				],
  				[
  					7.3639327,
  					46.2317002
  				],
  				[
  					7.3638328,
  					46.2318783
  				],
  				[
  					7.3637531,
  					46.2319683
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26410720",
  		properties: {
  			timestamp: "2020-02-21T23:05:12Z",
  			version: "12",
  			changeset: "81335315",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			"maxspeed:type": "sign",
  			name: "Rue de la Dixence",
  			surface: "asphalt",
  			id: "way/26410720"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3621343,
  					46.2316259
  				],
  				[
  					7.3622162,
  					46.2315336
  				],
  				[
  					7.3623104,
  					46.2314275
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26410725",
  		properties: {
  			timestamp: "2021-03-19T13:47:42Z",
  			version: "13",
  			changeset: "101333969",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Place du Midi",
  			oneway: "no",
  			surface: "asphalt",
  			id: "way/26410725"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3607566,
  					46.2312734
  				],
  				[
  					7.3614149,
  					46.2314418
  				],
  				[
  					7.3617119,
  					46.231516
  				],
  				[
  					7.3620088,
  					46.2315902
  				],
  				[
  					7.3621343,
  					46.2316259
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26410726",
  		properties: {
  			timestamp: "2021-04-04T18:36:02Z",
  			version: "13",
  			changeset: "102283494",
  			user: "Valdor",
  			uid: "60458",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Espace des Remparts",
  			oneway: "yes",
  			"oneway:bicycle": "no",
  			surface: "sett",
  			"survey:date": "2019-09-20",
  			wikimedia_commons: "File:Sion 13.jpg",
  			id: "way/26410726"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.358931,
  					46.2325682
  				],
  				[
  					7.3593707,
  					46.2319461
  				],
  				[
  					7.3595178,
  					46.2318723
  				],
  				[
  					7.3596113,
  					46.2318552
  				],
  				[
  					7.3597309,
  					46.2317672
  				],
  				[
  					7.3601349,
  					46.2314021
  				],
  				[
  					7.360146,
  					46.2313921
  				],
  				[
  					7.3601859,
  					46.2313526
  				],
  				[
  					7.3602619,
  					46.231207
  				],
  				[
  					7.3602912,
  					46.2311511
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26461220",
  		properties: {
  			timestamp: "2020-10-25T07:22:12Z",
  			version: "11",
  			changeset: "93007506",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Avenue du Midi",
  			oneway: "no",
  			surface: "asphalt",
  			id: "way/26461220"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3607566,
  					46.2312734
  				],
  				[
  					7.3602912,
  					46.2311511
  				],
  				[
  					7.3601173,
  					46.2311032
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26461221",
  		properties: {
  			timestamp: "2019-10-29T21:14:39Z",
  			version: "10",
  			changeset: "76365831",
  			user: "MuzFa",
  			uid: "10418826",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Rue des Creusets",
  			oneway: "yes",
  			surface: "asphalt",
  			id: "way/26461221"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3602912,
  					46.2311511
  				],
  				[
  					7.3602341,
  					46.2310701
  				],
  				[
  					7.3602002,
  					46.231021
  				],
  				[
  					7.3601127,
  					46.230706
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26461225",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "10",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "yes",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Rue de la Dent-Blanche",
  			oneway: "no",
  			surface: "asphalt",
  			id: "way/26461225"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3595296,
  					46.2309383
  				],
  				[
  					7.3594719,
  					46.2310259
  				],
  				[
  					7.3592864,
  					46.2313077
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/26461226",
  		properties: {
  			timestamp: "2021-03-19T13:47:42Z",
  			version: "12",
  			changeset: "101333969",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "residential",
  			lanes: "2",
  			lit: "yes",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue de la Dixence",
  			surface: "asphalt",
  			id: "way/26461226"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3639027,
  					46.2302145
  				],
  				[
  					7.3638571,
  					46.2302692
  				],
  				[
  					7.363761,
  					46.2303796
  				],
  				[
  					7.3636925,
  					46.2304577
  				],
  				[
  					7.3636433,
  					46.2305095
  				],
  				[
  					7.363594,
  					46.2305613
  				],
  				[
  					7.3634728,
  					46.2306574
  				],
  				[
  					7.3632719,
  					46.2307833
  				],
  				[
  					7.3632473,
  					46.2307951
  				],
  				[
  					7.3630731,
  					46.2309008
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/27835247",
  		properties: {
  			timestamp: "2020-10-25T07:22:12Z",
  			version: "8",
  			changeset: "93007506",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "yes",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Avenue du Midi",
  			oneway: "no",
  			surface: "asphalt",
  			id: "way/27835247"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3595296,
  					46.2309383
  				],
  				[
  					7.3593879,
  					46.230903
  				],
  				[
  					7.3581222,
  					46.2305876
  				],
  				[
  					7.3580408,
  					46.2305673
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/33137687",
  		properties: {
  			timestamp: "2017-04-02T15:51:14Z",
  			version: "6",
  			changeset: "47385574",
  			user: "datendelphin",
  			uid: "97547",
  			highway: "service",
  			service: "parking_aisle",
  			id: "way/33137687"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3567831,
  					46.2331174
  				],
  				[
  					7.3568607,
  					46.2331365
  				],
  				[
  					7.3569238,
  					46.2331499
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/38658971",
  		properties: {
  			timestamp: "2018-01-11T13:30:31Z",
  			version: "5",
  			changeset: "55351510",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "residential",
  			lit: "yes",
  			name: "Rue des Vergers",
  			surface: "asphalt",
  			id: "way/38658971"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3590407,
  					46.2317267
  				],
  				[
  					7.359004,
  					46.2317157
  				],
  				[
  					7.3583338,
  					46.2315145
  				],
  				[
  					7.3577744,
  					46.2313423
  				],
  				[
  					7.3576657,
  					46.2313117
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/38658972",
  		properties: {
  			timestamp: "2018-01-11T13:31:43Z",
  			version: "7",
  			changeset: "55351510",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "residential",
  			lit: "yes",
  			name: "Rue des Creusets",
  			oneway: "yes",
  			surface: "asphalt",
  			id: "way/38658972"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3601127,
  					46.230706
  				],
  				[
  					7.36015,
  					46.23058
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/38658973",
  		properties: {
  			timestamp: "2021-04-13T16:01:04Z",
  			version: "5",
  			changeset: "102876306",
  			user: "Valdor",
  			uid: "60458",
  			highway: "unclassified",
  			lane_markings: "no",
  			lit: "yes",
  			maxspeed: "50",
  			name: "Avenue des Mayennets",
  			surface: "asphalt",
  			id: "way/38658973"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3610652,
  					46.2304476
  				],
  				[
  					7.3610203,
  					46.2305677
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/38659513",
  		properties: {
  			timestamp: "2018-01-10T21:08:15Z",
  			version: "3",
  			changeset: "55334436",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Rue du Scex",
  			surface: "asphalt",
  			id: "way/38659513"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3626033,
  					46.2317369
  				],
  				[
  					7.3621343,
  					46.2316259
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/38665618",
  		properties: {
  			timestamp: "2020-12-24T00:19:06Z",
  			version: "11",
  			changeset: "96350425",
  			user: "Valdor",
  			uid: "60458",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Rue de Lausanne",
  			oneway: "yes",
  			surface: "sett",
  			id: "way/38665618"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3585702,
  					46.2324533
  				],
  				[
  					7.3587225,
  					46.2324979
  				],
  				[
  					7.358931,
  					46.2325682
  				],
  				[
  					7.359674,
  					46.2327812
  				],
  				[
  					7.3599183,
  					46.2328583
  				],
  				[
  					7.3603085,
  					46.2329816
  				],
  				[
  					7.3604732,
  					46.2330335
  				],
  				[
  					7.3605956,
  					46.2331256
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/48215496",
  		properties: {
  			timestamp: "2019-10-22T19:15:53Z",
  			version: "5",
  			changeset: "76065768",
  			user: "RaphB",
  			uid: "5864987",
  			access: "yes",
  			foot: "yes",
  			highway: "footway",
  			name: "Rue des C├¿dres",
  			id: "way/48215496"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617322,
  					46.2305784
  				],
  				[
  					7.3618034,
  					46.230595
  				],
  				[
  					7.3623678,
  					46.2308011
  				],
  				[
  					7.3626731,
  					46.2310489
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/48216316",
  		properties: {
  			timestamp: "2019-04-28T15:45:20Z",
  			version: "6",
  			changeset: "69667364",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "pedestrian",
  			name: "Rue de la Tour",
  			surface: "paved",
  			id: "way/48216316"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3581802,
  					46.2340649
  				],
  				[
  					7.3582422,
  					46.2339557
  				],
  				[
  					7.3583305,
  					46.2338002
  				],
  				[
  					7.3584818,
  					46.2335337
  				],
  				[
  					7.3585115,
  					46.2334813
  				],
  				[
  					7.3585628,
  					46.2333909
  				],
  				[
  					7.3581056,
  					46.2332753
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/77493039",
  		properties: {
  			timestamp: "2020-08-14T13:17:57Z",
  			version: "6",
  			changeset: "89413450",
  			user: "RaphB",
  			uid: "5864987",
  			FIXME: "confirm",
  			highway: "pedestrian",
  			name: "Rue de Conthey",
  			source: "photo",
  			surface: "paved",
  			id: "way/77493039"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3582851,
  					46.2328771
  				],
  				[
  					7.3584519,
  					46.2329185
  				],
  				[
  					7.3594267,
  					46.2331607
  				],
  				[
  					7.3596853,
  					46.2332501
  				],
  				[
  					7.3598111,
  					46.2332936
  				],
  				[
  					7.3600578,
  					46.2334029
  				],
  				[
  					7.3602646,
  					46.2334971
  				],
  				[
  					7.3605197,
  					46.2335942
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/77493040",
  		properties: {
  			timestamp: "2013-09-21T18:53:53Z",
  			version: "4",
  			changeset: "17961831",
  			user: "donovaly",
  			uid: "1730904",
  			highway: "pedestrian",
  			name: "Rue Saint-Th├®odule",
  			official_name: "Rue St-Th├®odule",
  			id: "way/77493040"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.359674,
  					46.2327812
  				],
  				[
  					7.3595301,
  					46.2330261
  				],
  				[
  					7.3594267,
  					46.2331607
  				],
  				[
  					7.3593262,
  					46.2333394
  				],
  				[
  					7.3592091,
  					46.2335778
  				],
  				[
  					7.3596057,
  					46.2336864
  				],
  				[
  					7.3596534,
  					46.2337005
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/77493042",
  		properties: {
  			timestamp: "2013-09-08T18:48:36Z",
  			version: "3",
  			changeset: "17738177",
  			user: "donovaly",
  			uid: "1730904",
  			FIXME: "confirm",
  			highway: "pedestrian",
  			source: "photo",
  			id: "way/77493042"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3593262,
  					46.2333394
  				],
  				[
  					7.358651,
  					46.2332017
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/90486965",
  		properties: {
  			timestamp: "2020-02-09T14:15:11Z",
  			version: "3",
  			changeset: "80752884",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "yes",
  			highway: "pedestrian",
  			surface: "sett",
  			id: "way/90486965"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3604883,
  					46.2322493
  				],
  				[
  					7.3611929,
  					46.2324202
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/90486968",
  		properties: {
  			timestamp: "2018-01-11T13:30:10Z",
  			version: "4",
  			changeset: "55351510",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "living_street",
  			lit: "yes",
  			name: "Rue de la Dent-Blanche",
  			oneway: "yes",
  			surface: "asphalt",
  			id: "way/90486968"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3590407,
  					46.2317267
  				],
  				[
  					7.3590357,
  					46.2317583
  				],
  				[
  					7.3589655,
  					46.231868
  				],
  				[
  					7.3587348,
  					46.2322286
  				],
  				[
  					7.3585702,
  					46.2324533
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/90486970",
  		properties: {
  			timestamp: "2020-02-09T14:15:11Z",
  			version: "4",
  			changeset: "80752884",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "pedestrian",
  			name: "Rue du Midi",
  			surface: "sett",
  			id: "way/90486970"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3613868,
  					46.2321072
  				],
  				[
  					7.3616437,
  					46.2322312
  				],
  				[
  					7.3617978,
  					46.2323574
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/90486972",
  		properties: {
  			timestamp: "2018-01-10T12:57:03Z",
  			version: "3",
  			changeset: "55321302",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Rue de Lausanne",
  			surface: "asphalt",
  			id: "way/90486972"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3585702,
  					46.2324533
  				],
  				[
  					7.3579637,
  					46.2322612
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/90486973",
  		properties: {
  			timestamp: "2018-01-11T13:30:01Z",
  			version: "4",
  			changeset: "55351510",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "living_street",
  			lit: "yes",
  			name: "Rue de la Dent-Blanche",
  			oneway: "yes",
  			surface: "asphalt",
  			id: "way/90486973"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3591561,
  					46.2315056
  				],
  				[
  					7.3590601,
  					46.2316896
  				],
  				[
  					7.3590407,
  					46.2317267
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/90486978",
  		properties: {
  			timestamp: "2021-03-20T07:34:11Z",
  			version: "11",
  			changeset: "101377024",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "residential",
  			lit: "yes",
  			maxspeed: "20",
  			"maxspeed:type": "sign",
  			name: "Chemin des Collines",
  			surface: "asphalt",
  			id: "way/90486978"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3568915,
  					46.2328988
  				],
  				[
  					7.3568116,
  					46.2328854
  				],
  				[
  					7.3565572,
  					46.2328191
  				],
  				[
  					7.356292,
  					46.2327551
  				],
  				[
  					7.3558862,
  					46.2326573
  				],
  				[
  					7.3557358,
  					46.232636
  				],
  				[
  					7.3554457,
  					46.2325949
  				],
  				[
  					7.3553808,
  					46.2325805
  				],
  				[
  					7.3552123,
  					46.2325432
  				],
  				[
  					7.3550378,
  					46.2325103
  				],
  				[
  					7.3546971,
  					46.2324251
  				],
  				[
  					7.3545514,
  					46.2323895
  				],
  				[
  					7.3544586,
  					46.2323668
  				],
  				[
  					7.3542549,
  					46.2323151
  				],
  				[
  					7.3540248,
  					46.2322407
  				],
  				[
  					7.3537796,
  					46.2321536
  				],
  				[
  					7.3535352,
  					46.2320667
  				],
  				[
  					7.3533754,
  					46.232003
  				],
  				[
  					7.3530772,
  					46.2318976
  				],
  				[
  					7.3526085,
  					46.231732
  				],
  				[
  					7.3525322,
  					46.2316622
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/90486980",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "16",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "tertiary",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue de Lausanne",
  			surface: "asphalt",
  			id: "way/90486980"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3579637,
  					46.2322612
  				],
  				[
  					7.3573088,
  					46.2320569
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/156291683",
  		properties: {
  			timestamp: "2021-03-19T09:03:24Z",
  			version: "9",
  			changeset: "101312998",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "residential",
  			lit: "yes",
  			maxspeed: "30",
  			"maxspeed:type": "sign",
  			name: "Avenue de Pratifori",
  			oneway: "yes",
  			surface: "asphalt",
  			id: "way/156291683"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3576657,
  					46.2313117
  				],
  				[
  					7.3575332,
  					46.2312693
  				],
  				[
  					7.3567922,
  					46.2310283
  				],
  				[
  					7.3556033,
  					46.2306416
  				],
  				[
  					7.3552941,
  					46.2305413
  				],
  				[
  					7.3547162,
  					46.2303453
  				],
  				[
  					7.3535611,
  					46.2303618
  				],
  				[
  					7.3533572,
  					46.2303647
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/156291706",
  		properties: {
  			timestamp: "2019-10-25T14:37:56Z",
  			version: "6",
  			changeset: "76214522",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "yes",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Rue de la Porte-Neuve",
  			surface: "sett",
  			id: "way/156291706"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3607566,
  					46.2312734
  				],
  				[
  					7.36061,
  					46.2314595
  				],
  				[
  					7.3605779,
  					46.2315002
  				],
  				[
  					7.3605241,
  					46.2317435
  				],
  				[
  					7.3604883,
  					46.2322493
  				],
  				[
  					7.3604732,
  					46.2330335
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/156291709",
  		properties: {
  			timestamp: "2021-04-04T18:33:32Z",
  			version: "12",
  			changeset: "102283494",
  			user: "Valdor",
  			uid: "60458",
  			bicycle: "yes",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Rue du Grand-Pont",
  			oneway: "yes",
  			"oneway:bicycle": "no",
  			surface: "paved",
  			"survey:date": "2019-09-17",
  			wikimedia_commons: "File:Rue du Grand-Pont in Sion.jpg",
  			id: "way/156291709"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3605956,
  					46.2331256
  				],
  				[
  					7.3605522,
  					46.2333937
  				],
  				[
  					7.3605197,
  					46.2335942
  				],
  				[
  					7.3605159,
  					46.2336455
  				],
  				[
  					7.3605032,
  					46.2338141
  				],
  				[
  					7.3604826,
  					46.2339001
  				],
  				[
  					7.3604048,
  					46.2341519
  				],
  				[
  					7.360414,
  					46.2342098
  				],
  				[
  					7.3604307,
  					46.2343151
  				],
  				[
  					7.360431,
  					46.2343237
  				],
  				[
  					7.3604433,
  					46.2346967
  				],
  				[
  					7.3604239,
  					46.2348975
  				],
  				[
  					7.3604668,
  					46.2351999
  				],
  				[
  					7.3605133,
  					46.235397
  				],
  				[
  					7.3605538,
  					46.2356407
  				],
  				[
  					7.3605699,
  					46.2356934
  				],
  				[
  					7.360586,
  					46.2357461
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/156291710",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "9",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "yes",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Rue du Rh├┤ne",
  			surface: "sett",
  			id: "way/156291710"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3621343,
  					46.2316259
  				],
  				[
  					7.3617421,
  					46.2317676
  				],
  				[
  					7.3614864,
  					46.2319901
  				],
  				[
  					7.3613868,
  					46.2321072
  				],
  				[
  					7.3613286,
  					46.2321968
  				],
  				[
  					7.3612664,
  					46.2322992
  				],
  				[
  					7.3611929,
  					46.2324202
  				],
  				[
  					7.3611817,
  					46.2324409
  				],
  				[
  					7.3610606,
  					46.2326418
  				],
  				[
  					7.3609986,
  					46.2327394
  				],
  				[
  					7.3605956,
  					46.2331256
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/156291712",
  		properties: {
  			timestamp: "2018-01-10T21:07:36Z",
  			version: "5",
  			changeset: "55334436",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Ruelle du Midi",
  			surface: "sett",
  			id: "way/156291712"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3614864,
  					46.2319901
  				],
  				[
  					7.3611585,
  					46.2318156
  				],
  				[
  					7.361132,
  					46.2318015
  				],
  				[
  					7.3605779,
  					46.2315002
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/157395604",
  		properties: {
  			timestamp: "2019-01-12T22:34:07Z",
  			version: "2",
  			changeset: "66262214",
  			user: "Valdor",
  			uid: "60458",
  			highway: "living_street",
  			maxspeed: "20",
  			name: "Rue des Vergers",
  			surface: "sett",
  			id: "way/157395604"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3595178,
  					46.2318723
  				],
  				[
  					7.3590407,
  					46.2317267
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/236929910",
  		properties: {
  			timestamp: "2019-01-23T20:24:53Z",
  			version: "5",
  			changeset: "66581075",
  			user: "vonde",
  			uid: "2528547",
  			bicycle: "yes",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Place du Midi",
  			surface: "asphalt",
  			id: "way/236929910"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3622241,
  					46.2322443
  				],
  				[
  					7.3620461,
  					46.2319304
  				],
  				[
  					7.3621343,
  					46.2316259
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/236929912",
  		properties: {
  			timestamp: "2020-12-24T00:18:49Z",
  			version: "8",
  			changeset: "96350408",
  			user: "Valdor",
  			uid: "60458",
  			bicycle: "permit",
  			highway: "pedestrian",
  			name: "Place du Scex",
  			surface: "asphalt",
  			id: "way/236929912"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3632939,
  					46.2319172
  				],
  				[
  					7.3632082,
  					46.2319819
  				],
  				[
  					7.3631745,
  					46.2320074
  				],
  				[
  					7.3624583,
  					46.2323192
  				],
  				[
  					7.3622959,
  					46.2323567
  				],
  				[
  					7.3622599,
  					46.232365
  				],
  				[
  					7.36218,
  					46.2323834
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/236929914",
  		properties: {
  			timestamp: "2019-09-28T13:42:32Z",
  			version: "3",
  			changeset: "75040460",
  			user: "Trim",
  			uid: "327106",
  			bridge: "yes",
  			highway: "pedestrian",
  			noname: "yes",
  			id: "way/236929914"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617978,
  					46.2323574
  				],
  				[
  					7.3619127,
  					46.2324384
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/236933253",
  		properties: {
  			timestamp: "2021-04-13T16:01:23Z",
  			version: "4",
  			changeset: "102876324",
  			user: "Valdor",
  			uid: "60458",
  			bridge: "yes",
  			highway: "pedestrian",
  			lit: "no",
  			noname: "yes",
  			surface: "wood",
  			id: "way/236933253"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.36218,
  					46.2323834
  				],
  				[
  					7.3622241,
  					46.2322443
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/236933254",
  		properties: {
  			timestamp: "2021-04-13T16:01:24Z",
  			version: "6",
  			changeset: "102876324",
  			user: "Valdor",
  			uid: "60458",
  			bicycle: "permit",
  			bridge: "yes",
  			highway: "pedestrian",
  			lit: "no",
  			noname: "yes",
  			surface: "wood",
  			id: "way/236933254"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3624583,
  					46.2323192
  				],
  				[
  					7.362334,
  					46.2322795
  				],
  				[
  					7.3622241,
  					46.2322443
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237109215",
  		properties: {
  			timestamp: "2014-12-13T15:51:18Z",
  			version: "2",
  			changeset: "27445209",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "footway",
  			id: "way/237109215"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3576616,
  					46.2331286
  				],
  				[
  					7.3573904,
  					46.2331815
  				],
  				[
  					7.3572551,
  					46.2332186
  				],
  				[
  					7.3572028,
  					46.2332329
  				],
  				[
  					7.3568171,
  					46.2332819
  				],
  				[
  					7.3567601,
  					46.2333243
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237109216",
  		properties: {
  			timestamp: "2013-09-08T14:31:40Z",
  			version: "1",
  			changeset: "17734007",
  			user: "donovaly",
  			uid: "1730904",
  			highway: "footway",
  			id: "way/237109216"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575718,
  					46.2326439
  				],
  				[
  					7.3574504,
  					46.2324535
  				],
  				[
  					7.3573852,
  					46.2323513
  				],
  				[
  					7.3573078,
  					46.2322482
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237109217",
  		properties: {
  			timestamp: "2014-12-13T15:51:18Z",
  			version: "2",
  			changeset: "27445209",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "footway",
  			id: "way/237109217"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3574504,
  					46.2324535
  				],
  				[
  					7.3571477,
  					46.2325488
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237109218",
  		properties: {
  			timestamp: "2014-04-19T19:46:37Z",
  			version: "2",
  			changeset: "21804641",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			id: "way/237109218"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3572551,
  					46.2332186
  				],
  				[
  					7.3572456,
  					46.2332773
  				],
  				[
  					7.3571747,
  					46.233304
  				],
  				[
  					7.3571167,
  					46.2334348
  				],
  				[
  					7.3569985,
  					46.2334229
  				],
  				[
  					7.3569426,
  					46.2334779
  				],
  				[
  					7.3569899,
  					46.2335463
  				],
  				[
  					7.3570844,
  					46.2335522
  				],
  				[
  					7.3571124,
  					46.2335002
  				],
  				[
  					7.3571167,
  					46.2334348
  				],
  				[
  					7.3573478,
  					46.2335261
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237140276",
  		properties: {
  			timestamp: "2020-08-14T13:17:57Z",
  			version: "3",
  			changeset: "89413450",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/237140276"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3574649,
  					46.2339004
  				],
  				[
  					7.357777,
  					46.2332908
  				],
  				[
  					7.3578196,
  					46.2332076
  				],
  				[
  					7.3576991,
  					46.2331791
  				],
  				[
  					7.3576616,
  					46.2331286
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237140281",
  		properties: {
  			timestamp: "2018-01-11T13:02:54Z",
  			version: "5",
  			changeset: "55351510",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Ruelle du Chapitre",
  			surface: "sett",
  			id: "way/237140281"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3600537,
  					46.2340319
  				],
  				[
  					7.3597499,
  					46.2339881
  				],
  				[
  					7.35964,
  					46.2339584
  				],
  				[
  					7.3595445,
  					46.2339135
  				],
  				[
  					7.3595032,
  					46.2338916
  				],
  				[
  					7.3596057,
  					46.2336864
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237140282",
  		properties: {
  			timestamp: "2013-09-08T18:48:32Z",
  			version: "1",
  			changeset: "17738177",
  			user: "donovaly",
  			uid: "1730904",
  			highway: "pedestrian",
  			name: "Rue de la Tour",
  			id: "way/237140282"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3585628,
  					46.2333909
  				],
  				[
  					7.358651,
  					46.2332017
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237140283",
  		properties: {
  			timestamp: "2018-01-10T12:55:51Z",
  			version: "4",
  			changeset: "55321302",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Rue Supersaxo",
  			surface: "sett",
  			id: "way/237140283"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3599183,
  					46.2328583
  				],
  				[
  					7.3598304,
  					46.2329992
  				],
  				[
  					7.3596853,
  					46.2332501
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237140291",
  		properties: {
  			timestamp: "2020-04-01T22:03:44Z",
  			version: "3",
  			changeset: "82945715",
  			user: "Diony B├®trisey",
  			uid: "10969926",
  			highway: "path",
  			id: "way/237140291"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3650268,
  					46.2342305
  				],
  				[
  					7.365024,
  					46.2341818
  				],
  				[
  					7.3649047,
  					46.2341744
  				],
  				[
  					7.3646619,
  					46.2341336
  				],
  				[
  					7.3644393,
  					46.2341103
  				],
  				[
  					7.3641161,
  					46.2339582
  				],
  				[
  					7.364119,
  					46.2339255
  				],
  				[
  					7.3639872,
  					46.2338403
  				],
  				[
  					7.3640271,
  					46.2337857
  				],
  				[
  					7.3639715,
  					46.2337497
  				],
  				[
  					7.3637925,
  					46.233636
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237140295",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "3",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/237140295"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3647404,
  					46.2322692
  				],
  				[
  					7.3645729,
  					46.2324265
  				],
  				[
  					7.3643786,
  					46.2325793
  				],
  				[
  					7.3642814,
  					46.2326527
  				],
  				[
  					7.3642018,
  					46.2326802
  				],
  				[
  					7.3640958,
  					46.2326832
  				],
  				[
  					7.3640622,
  					46.2326848
  				],
  				[
  					7.3638871,
  					46.2327109
  				],
  				[
  					7.363639,
  					46.2326533
  				],
  				[
  					7.3635643,
  					46.2327275
  				],
  				[
  					7.3635045,
  					46.2327689
  				],
  				[
  					7.3634735,
  					46.2328026
  				],
  				[
  					7.3634424,
  					46.232821
  				],
  				[
  					7.3634025,
  					46.2328256
  				],
  				[
  					7.3633627,
  					46.2328256
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237141883",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "3",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "permit",
  			highway: "pedestrian",
  			name: "Place des Tanneries",
  			id: "way/237141883"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.36218,
  					46.2323834
  				],
  				[
  					7.3619127,
  					46.2324384
  				],
  				[
  					7.3617843,
  					46.2325013
  				],
  				[
  					7.3617156,
  					46.2325349
  				],
  				[
  					7.3615378,
  					46.2326221
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237141884",
  		properties: {
  			timestamp: "2020-02-09T14:15:11Z",
  			version: "5",
  			changeset: "80752884",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "permit",
  			highway: "pedestrian",
  			name: "Rue des Tanneries",
  			surface: "sett",
  			id: "way/237141884"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3615378,
  					46.2326221
  				],
  				[
  					7.3615151,
  					46.2326295
  				],
  				[
  					7.3613579,
  					46.2326805
  				],
  				[
  					7.3612303,
  					46.232722
  				],
  				[
  					7.3614092,
  					46.2328965
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237141885",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "4",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "yes",
  			highway: "pedestrian",
  			name: "Rue de la Lombardie",
  			id: "way/237141885"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617843,
  					46.2325013
  				],
  				[
  					7.3618658,
  					46.2325716
  				],
  				[
  					7.3620319,
  					46.2327214
  				],
  				[
  					7.3620938,
  					46.2328025
  				],
  				[
  					7.3620361,
  					46.2328215
  				],
  				[
  					7.3618332,
  					46.2328881
  				],
  				[
  					7.3617799,
  					46.2328886
  				],
  				[
  					7.3617143,
  					46.2328893
  				],
  				[
  					7.3615906,
  					46.2328701
  				],
  				[
  					7.3615108,
  					46.2328521
  				],
  				[
  					7.3614092,
  					46.2328965
  				],
  				[
  					7.3613691,
  					46.232914
  				],
  				[
  					7.3614001,
  					46.2330503
  				],
  				[
  					7.3612226,
  					46.2331213
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237141891",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "4",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			name: "Rue du Vieux-Coll├¿ge",
  			service: "alley",
  			id: "way/237141891"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3611487,
  					46.2338512
  				],
  				[
  					7.3612152,
  					46.2337686
  				],
  				[
  					7.3613097,
  					46.2336976
  				],
  				[
  					7.361365,
  					46.2335782
  				],
  				[
  					7.3614186,
  					46.2334644
  				],
  				[
  					7.3614334,
  					46.2334329
  				],
  				[
  					7.3614986,
  					46.2333642
  				],
  				[
  					7.3616044,
  					46.2333755
  				],
  				[
  					7.3617282,
  					46.2334318
  				],
  				[
  					7.3617379,
  					46.2334712
  				],
  				[
  					7.3617284,
  					46.2335408
  				],
  				[
  					7.3616581,
  					46.2336447
  				],
  				[
  					7.3616198,
  					46.2337564
  				],
  				[
  					7.3619122,
  					46.2338497
  				],
  				[
  					7.3618301,
  					46.2339527
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237141892",
  		properties: {
  			timestamp: "2013-09-08T19:07:49Z",
  			version: "1",
  			changeset: "17738457",
  			user: "donovaly",
  			uid: "1730904",
  			highway: "service",
  			name: "Ruelle du Casino",
  			service: "alley",
  			id: "way/237141892"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3605522,
  					46.2333937
  				],
  				[
  					7.3610835,
  					46.2334457
  				],
  				[
  					7.3612936,
  					46.2334682
  				],
  				[
  					7.3614186,
  					46.2334644
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237141893",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "5",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			service: "alley",
  			id: "way/237141893"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3614986,
  					46.2333642
  				],
  				[
  					7.3614792,
  					46.2332813
  				],
  				[
  					7.3614573,
  					46.2332675
  				],
  				[
  					7.3613571,
  					46.2332047
  				],
  				[
  					7.3612226,
  					46.2331213
  				],
  				[
  					7.3610982,
  					46.2331427
  				],
  				[
  					7.3609288,
  					46.2331191
  				],
  				[
  					7.3608083,
  					46.2331179
  				],
  				[
  					7.3605956,
  					46.2331256
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237143472",
  		properties: {
  			timestamp: "2019-09-28T13:39:13Z",
  			version: "5",
  			changeset: "75040468",
  			user: "Trim",
  			uid: "327106",
  			bicycle: "yes",
  			highway: "pedestrian",
  			lit: "yes",
  			noname: "yes",
  			surface: "sett",
  			id: "way/237143472"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3611585,
  					46.2318156
  				],
  				[
  					7.3614149,
  					46.2314418
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237143473",
  		properties: {
  			timestamp: "2018-01-10T21:07:10Z",
  			version: "6",
  			changeset: "55334436",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Ruelle des Galeries",
  			surface: "sett",
  			id: "way/237143473"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3605241,
  					46.2317435
  				],
  				[
  					7.3597309,
  					46.2317672
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237748742",
  		properties: {
  			timestamp: "2013-09-12T22:09:48Z",
  			version: "1",
  			changeset: "17808641",
  			user: "donovaly",
  			uid: "1730904",
  			highway: "residential",
  			name: "Passage des Aub├®pines",
  			id: "way/237748742"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3655786,
  					46.2319368
  				],
  				[
  					7.3648906,
  					46.2318964
  				],
  				[
  					7.3646686,
  					46.2317655
  				],
  				[
  					7.36442,
  					46.2315065
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237752509",
  		properties: {
  			timestamp: "2013-09-12T23:31:00Z",
  			version: "2",
  			changeset: "17809331",
  			user: "donovaly",
  			uid: "1730904",
  			highway: "footway",
  			name: "Passage Supersaxo",
  			tunnel: "yes",
  			id: "way/237752509"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3600578,
  					46.2334029
  				],
  				[
  					7.3601913,
  					46.2332159
  				],
  				[
  					7.3603085,
  					46.2329816
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237878951",
  		properties: {
  			timestamp: "2018-05-18T09:01:45Z",
  			version: "3",
  			changeset: "59072883",
  			user: "FuBuLaSse",
  			uid: "8269151",
  			highway: "footway",
  			id: "way/237878951"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3576991,
  					46.2331791
  				],
  				[
  					7.3575423,
  					46.2333518
  				],
  				[
  					7.3574955,
  					46.2333939
  				],
  				[
  					7.3574319,
  					46.2334581
  				],
  				[
  					7.3573478,
  					46.2335261
  				],
  				[
  					7.3573876,
  					46.2335693
  				],
  				[
  					7.3573983,
  					46.2335809
  				],
  				[
  					7.3572699,
  					46.2338576
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/237880004",
  		properties: {
  			timestamp: "2013-09-13T22:30:37Z",
  			version: "1",
  			changeset: "17825294",
  			user: "donovaly",
  			uid: "1730904",
  			highway: "service",
  			name: "Ruelle des Princes",
  			service: "alley",
  			id: "way/237880004"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3611817,
  					46.2324409
  				],
  				[
  					7.3609952,
  					46.2324031
  				],
  				[
  					7.3609427,
  					46.2323925
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/238061500",
  		properties: {
  			timestamp: "2020-01-26T15:37:37Z",
  			version: "3",
  			changeset: "80101069",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "permit",
  			highway: "pedestrian",
  			name: "Ruelle des Princes",
  			surface: "sett",
  			id: "way/238061500"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3612303,
  					46.232722
  				],
  				[
  					7.3611251,
  					46.2326507
  				],
  				[
  					7.3610606,
  					46.2326418
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/238061501",
  		properties: {
  			timestamp: "2015-01-08T19:43:49Z",
  			version: "3",
  			changeset: "28004384",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "pedestrian",
  			name: "Ruelle du Gu├¬t",
  			official_name: "Ruelle du Guet",
  			id: "way/238061501"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617799,
  					46.2328886
  				],
  				[
  					7.361717,
  					46.2327682
  				],
  				[
  					7.3615378,
  					46.2326221
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/257749438",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "3",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			name: "Passage Raphy-Dall├¿ves",
  			tunnel: "building_passage",
  			id: "way/257749438"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3579898,
  					46.232139
  				],
  				[
  					7.3581361,
  					46.2318923
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814918",
  		properties: {
  			timestamp: "2014-04-12T19:47:17Z",
  			version: "1",
  			changeset: "21652597",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "path",
  			id: "way/273814918"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3574686,
  					46.2319659
  				],
  				[
  					7.3575078,
  					46.2318763
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814919",
  		properties: {
  			timestamp: "2014-04-12T19:47:18Z",
  			version: "1",
  			changeset: "21652597",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "path",
  			id: "way/273814919"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3572852,
  					46.231851
  				],
  				[
  					7.3572588,
  					46.2319037
  				],
  				[
  					7.3572212,
  					46.2319318
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814920",
  		properties: {
  			timestamp: "2017-04-02T15:51:18Z",
  			version: "3",
  			changeset: "47385574",
  			user: "datendelphin",
  			uid: "97547",
  			highway: "path",
  			layer: "-1",
  			tunnel: "yes",
  			id: "way/273814920"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3573835,
  					46.232171
  				],
  				[
  					7.3573115,
  					46.2320512
  				],
  				[
  					7.3572212,
  					46.2319318
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814921",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "4",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "path",
  			layer: "-1",
  			tunnel: "yes",
  			id: "way/273814921"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3574686,
  					46.2319659
  				],
  				[
  					7.3574647,
  					46.2319691
  				],
  				[
  					7.3574519,
  					46.2319796
  				],
  				[
  					7.3573115,
  					46.2320512
  				],
  				[
  					7.3571551,
  					46.2321158
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814922",
  		properties: {
  			timestamp: "2014-04-12T19:47:18Z",
  			version: "1",
  			changeset: "21652597",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "path",
  			id: "way/273814922"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3571551,
  					46.2321158
  				],
  				[
  					7.3571182,
  					46.232074
  				],
  				[
  					7.3570142,
  					46.232043
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814923",
  		properties: {
  			timestamp: "2014-04-12T19:47:18Z",
  			version: "1",
  			changeset: "21652597",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "path",
  			id: "way/273814923"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3572212,
  					46.2319318
  				],
  				[
  					7.3571897,
  					46.2319416
  				],
  				[
  					7.3571562,
  					46.2319424
  				],
  				[
  					7.3570749,
  					46.2319213
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814924",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "3",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "steps",
  			id: "way/273814924"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575936,
  					46.232011
  				],
  				[
  					7.3574936,
  					46.231981
  				],
  				[
  					7.3574743,
  					46.2319705
  				],
  				[
  					7.3574686,
  					46.2319659
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814925",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "3",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "path",
  			id: "way/273814925"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575257,
  					46.2321923
  				],
  				[
  					7.3574953,
  					46.2321808
  				],
  				[
  					7.3574292,
  					46.2321625
  				],
  				[
  					7.3573835,
  					46.232171
  				],
  				[
  					7.3573479,
  					46.2321928
  				],
  				[
  					7.3573078,
  					46.2322482
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/273814926",
  		properties: {
  			timestamp: "2014-04-12T19:47:18Z",
  			version: "1",
  			changeset: "21652597",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "path",
  			id: "way/273814926"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3571364,
  					46.2321865
  				],
  				[
  					7.3571551,
  					46.2321158
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/275564893",
  		properties: {
  			timestamp: "2014-04-19T19:46:30Z",
  			version: "1",
  			changeset: "21804641",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			id: "way/275564893"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3569985,
  					46.2334229
  				],
  				[
  					7.3570631,
  					46.2332979
  				],
  				[
  					7.3571747,
  					46.233304
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/276996017",
  		properties: {
  			timestamp: "2021-03-08T16:33:19Z",
  			version: "9",
  			changeset: "100649700",
  			user: "Valdor",
  			uid: "60458",
  			"cycleway:both": "no",
  			highway: "residential",
  			lanes: "2",
  			lit: "yes",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue du Scex",
  			sidewalk: "none",
  			surface: "asphalt",
  			id: "way/276996017"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3636339,
  					46.2319981
  				],
  				[
  					7.3632939,
  					46.2319172
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/276996019",
  		properties: {
  			timestamp: "2019-04-28T15:02:45Z",
  			version: "5",
  			changeset: "69666315",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			lit: "yes",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue des C├¿dres",
  			surface: "asphalt",
  			id: "way/276996019"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3636793,
  					46.232057
  				],
  				[
  					7.3636599,
  					46.2321565
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/276996021",
  		properties: {
  			timestamp: "2020-12-20T07:40:26Z",
  			version: "10",
  			changeset: "96130419",
  			user: "RaphB",
  			uid: "5864987",
  			"cycleway:both": "no",
  			highway: "residential",
  			lane_markings: "no",
  			lit: "yes",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue du Scex",
  			oneway: "yes",
  			sidewalk: "none",
  			surface: "asphalt",
  			id: "way/276996021"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3637715,
  					46.2320353
  				],
  				[
  					7.3637587,
  					46.2320458
  				],
  				[
  					7.3637399,
  					46.2320554
  				],
  				[
  					7.3637177,
  					46.2320604
  				],
  				[
  					7.3636943,
  					46.2320604
  				],
  				[
  					7.3636793,
  					46.232057
  				],
  				[
  					7.3636721,
  					46.2320554
  				],
  				[
  					7.3636533,
  					46.2320458
  				],
  				[
  					7.3636397,
  					46.2320326
  				],
  				[
  					7.3636324,
  					46.2320157
  				],
  				[
  					7.3636339,
  					46.2319981
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/276996023",
  		properties: {
  			timestamp: "2020-12-20T07:40:35Z",
  			version: "9",
  			changeset: "96130419",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "residential",
  			lane_markings: "no",
  			lit: "yes",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue du Scex",
  			oneway: "yes",
  			surface: "asphalt",
  			id: "way/276996023"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3636339,
  					46.2319981
  				],
  				[
  					7.3636443,
  					46.2319823
  				],
  				[
  					7.3636613,
  					46.231969
  				],
  				[
  					7.363684,
  					46.2319609
  				],
  				[
  					7.3637092,
  					46.2319586
  				],
  				[
  					7.3637531,
  					46.2319683
  				],
  				[
  					7.3637714,
  					46.2319857
  				],
  				[
  					7.363779,
  					46.232001
  				],
  				[
  					7.3637793,
  					46.2320172
  				],
  				[
  					7.3637715,
  					46.2320353
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/295420553",
  		properties: {
  			timestamp: "2014-08-01T20:34:52Z",
  			version: "1",
  			changeset: "24488272",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "path",
  			id: "way/295420553"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3565572,
  					46.2328191
  				],
  				[
  					7.3565676,
  					46.2328474
  				],
  				[
  					7.3565898,
  					46.2328725
  				],
  				[
  					7.3566154,
  					46.2328792
  				],
  				[
  					7.3566765,
  					46.2328853
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/295420554",
  		properties: {
  			timestamp: "2017-04-02T15:51:19Z",
  			version: "2",
  			changeset: "47385574",
  			user: "datendelphin",
  			uid: "97547",
  			highway: "path",
  			layer: "-1",
  			tunnel: "yes",
  			id: "way/295420554"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3566765,
  					46.2328853
  				],
  				[
  					7.3569578,
  					46.232946
  				],
  				[
  					7.357333,
  					46.2330286
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314813581",
  		properties: {
  			timestamp: "2020-02-18T18:12:30Z",
  			version: "3",
  			changeset: "81184028",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/314813581"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3570749,
  					46.2319213
  				],
  				[
  					7.3565755,
  					46.2317697
  				],
  				[
  					7.355687,
  					46.2314903
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314813585",
  		properties: {
  			timestamp: "2020-02-18T18:12:28Z",
  			version: "4",
  			changeset: "81184028",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/314813585"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3568178,
  					46.2319609
  				],
  				[
  					7.3567511,
  					46.2319382
  				],
  				[
  					7.3560736,
  					46.2317077
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314813586",
  		properties: {
  			timestamp: "2014-11-28T07:47:21Z",
  			version: "1",
  			changeset: "27083606",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/314813586"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3568178,
  					46.2319609
  				],
  				[
  					7.3570142,
  					46.232043
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314813587",
  		properties: {
  			timestamp: "2021-02-02T17:47:35Z",
  			version: "2",
  			changeset: "98592820",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			mapillary: "STsy2n4VkKJutH7IUbbdAu",
  			"survey:date": "2020-11-07",
  			id: "way/314813587"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3572852,
  					46.231851
  				],
  				[
  					7.357352,
  					46.2317112
  				],
  				[
  					7.357498,
  					46.2313978
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314813588",
  		properties: {
  			timestamp: "2020-01-16T07:11:41Z",
  			version: "3",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/314813588"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.357498,
  					46.2313978
  				],
  				[
  					7.3575006,
  					46.2313562
  				],
  				[
  					7.3575027,
  					46.2313469
  				],
  				[
  					7.3575104,
  					46.2313127
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314813589",
  		properties: {
  			timestamp: "2020-01-16T07:11:43Z",
  			version: "4",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			crossing: "zebra",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/314813589"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575104,
  					46.2313127
  				],
  				[
  					7.3575332,
  					46.2312693
  				],
  				[
  					7.3575646,
  					46.2312095
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314813591",
  		properties: {
  			timestamp: "2020-01-16T07:12:10Z",
  			version: "3",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/314813591"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575646,
  					46.2312095
  				],
  				[
  					7.3578465,
  					46.2306843
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314813592",
  		properties: {
  			timestamp: "2020-01-16T07:11:45Z",
  			version: "3",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/314813592"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575027,
  					46.2313469
  				],
  				[
  					7.3574573,
  					46.2313118
  				],
  				[
  					7.3574037,
  					46.2312556
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314815262",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "5",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			id: "way/314815262"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3595766,
  					46.2310042
  				],
  				[
  					7.3595982,
  					46.2309601
  				],
  				[
  					7.3596031,
  					46.2308996
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/314815263",
  		properties: {
  			timestamp: "2019-08-16T13:10:31Z",
  			version: "2",
  			changeset: "73415533",
  			user: "RaphB",
  			uid: "5864987",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			id: "way/314815263"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3600955,
  					46.2305467
  				],
  				[
  					7.3601286,
  					46.2304727
  				],
  				[
  					7.3601647,
  					46.2303919
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317102806",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "5",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "tertiary",
  			maxspeed: "50",
  			name: "Avenue de la Gare",
  			surface: "asphalt",
  			id: "way/317102806"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3570594,
  					46.23256
  				],
  				[
  					7.3573088,
  					46.2320569
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317102808",
  		properties: {
  			timestamp: "2017-04-02T15:51:23Z",
  			version: "2",
  			changeset: "47385574",
  			user: "datendelphin",
  			uid: "97547",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317102808"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3569578,
  					46.232946
  				],
  				[
  					7.3571477,
  					46.2325488
  				],
  				[
  					7.3571704,
  					46.2325043
  				],
  				[
  					7.3573078,
  					46.2322482
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317102809",
  		properties: {
  			timestamp: "2018-01-10T12:57:35Z",
  			version: "3",
  			changeset: "55321260",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "tertiary",
  			maxspeed: "50",
  			name: "Avenue de la Gare",
  			surface: "asphalt",
  			id: "way/317102809"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3566686,
  					46.2333416
  				],
  				[
  					7.3567831,
  					46.2331174
  				],
  				[
  					7.3568915,
  					46.2328988
  				],
  				[
  					7.3570594,
  					46.23256
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317102810",
  		properties: {
  			timestamp: "2017-02-14T16:41:35Z",
  			version: "2",
  			changeset: "46083933",
  			user: "ravemiki",
  			uid: "616894",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317102810"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3565806,
  					46.2337065
  				],
  				[
  					7.3567401,
  					46.2333595
  				],
  				[
  					7.3567601,
  					46.2333243
  				],
  				[
  					7.3568607,
  					46.2331365
  				],
  				[
  					7.3569578,
  					46.232946
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317102811",
  		properties: {
  			timestamp: "2020-04-15T10:32:28Z",
  			version: "3",
  			changeset: "83585147",
  			user: "RaphB",
  			uid: "5864987",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317102811"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3571364,
  					46.2321865
  				],
  				[
  					7.3571224,
  					46.2322256
  				],
  				[
  					7.3570454,
  					46.232427
  				],
  				[
  					7.356926,
  					46.2326559
  				],
  				[
  					7.3568116,
  					46.2328854
  				],
  				[
  					7.3566066,
  					46.2332802
  				],
  				[
  					7.3564248,
  					46.2336575
  				],
  				[
  					7.3564191,
  					46.2336706
  				],
  				[
  					7.3563116,
  					46.2339186
  				],
  				[
  					7.3561801,
  					46.2342221
  				],
  				[
  					7.3561023,
  					46.2343926
  				],
  				[
  					7.3560624,
  					46.2344454
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317103740",
  		properties: {
  			timestamp: "2021-02-02T17:47:25Z",
  			version: "2",
  			changeset: "98592820",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			mapillary: "STsy2n4VkKJutH7IUbbdAu",
  			"survey:date": "2020-11-07",
  			id: "way/317103740"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575078,
  					46.2318763
  				],
  				[
  					7.357607,
  					46.2316518
  				],
  				[
  					7.3577462,
  					46.2314086
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317103742",
  		properties: {
  			timestamp: "2020-01-16T07:12:29Z",
  			version: "3",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/317103742"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3577462,
  					46.2314086
  				],
  				[
  					7.3577744,
  					46.2313423
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317103743",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "5",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/317103743"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575646,
  					46.2312095
  				],
  				[
  					7.3577004,
  					46.2312426
  				],
  				[
  					7.3578035,
  					46.2312669
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317103744",
  		properties: {
  			timestamp: "2020-01-16T07:12:12Z",
  			version: "3",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/317103744"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3578035,
  					46.2312669
  				],
  				[
  					7.3581143,
  					46.2306704
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317103745",
  		properties: {
  			timestamp: "2020-01-16T07:13:39Z",
  			version: "4",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			crossing: "zebra",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/317103745"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3580966,
  					46.2306338
  				],
  				[
  					7.3581222,
  					46.2305876
  				],
  				[
  					7.3581529,
  					46.2305322
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317103746",
  		properties: {
  			timestamp: "2020-01-16T07:13:37Z",
  			version: "3",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/317103746"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3581143,
  					46.2306704
  				],
  				[
  					7.358104,
  					46.2306514
  				],
  				[
  					7.3580966,
  					46.2306338
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317103748",
  		properties: {
  			timestamp: "2020-01-16T07:14:22Z",
  			version: "4",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/317103748"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3581529,
  					46.2305322
  				],
  				[
  					7.3582025,
  					46.2304281
  				],
  				[
  					7.3582114,
  					46.2304095
  				],
  				[
  					7.3584308,
  					46.2299481
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317201977",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "2",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317201977"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3585618,
  					46.2323278
  				],
  				[
  					7.3579898,
  					46.232139
  				],
  				[
  					7.3575936,
  					46.232011
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370858",
  		properties: {
  			timestamp: "2020-02-25T15:02:34Z",
  			version: "2",
  			changeset: "81461200",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317370858"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3600955,
  					46.2305467
  				],
  				[
  					7.3600659,
  					46.2305695
  				],
  				[
  					7.3600309,
  					46.2306309
  				],
  				[
  					7.360124,
  					46.2308707
  				],
  				[
  					7.3601441,
  					46.2308895
  				],
  				[
  					7.3601445,
  					46.2309072
  				],
  				[
  					7.3601449,
  					46.231047
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370862",
  		properties: {
  			timestamp: "2021-03-02T16:23:31Z",
  			version: "5",
  			changeset: "100292671",
  			user: "RaphB",
  			uid: "5864987",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			mapillary: "Z6B7404NIr14ySegsNCiY3",
  			surface: "asphalt",
  			"survey:date": "2020-11-07",
  			id: "way/317370862"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3596031,
  					46.2308996
  				],
  				[
  					7.3594737,
  					46.2308651
  				],
  				[
  					7.3594181,
  					46.2308511
  				],
  				[
  					7.3581529,
  					46.2305322
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370863",
  		properties: {
  			timestamp: "2021-02-19T16:30:04Z",
  			version: "3",
  			changeset: "99606958",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			mapillary: "Z6B7404NIr14ySegsNCiY3",
  			surface: "asphalt",
  			"survey:date": "2020-11-07",
  			id: "way/317370863"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3581883,
  					46.2306439
  				],
  				[
  					7.358414,
  					46.2307
  				],
  				[
  					7.3584536,
  					46.2307182
  				],
  				[
  					7.3593593,
  					46.2309718
  				],
  				[
  					7.3594117,
  					46.2310027
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370864",
  		properties: {
  			timestamp: "2020-01-16T07:13:41Z",
  			version: "3",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/317370864"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3581883,
  					46.2306439
  				],
  				[
  					7.3580966,
  					46.2306338
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370865",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "3",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			id: "way/317370865"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3593593,
  					46.2309718
  				],
  				[
  					7.3593879,
  					46.230903
  				],
  				[
  					7.3594181,
  					46.2308511
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370868",
  		properties: {
  			timestamp: "2014-12-15T13:58:36Z",
  			version: "1",
  			changeset: "27482544",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "steps",
  			id: "way/317370868"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3593874,
  					46.2310214
  				],
  				[
  					7.3593639,
  					46.2310608
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370869",
  		properties: {
  			timestamp: "2015-12-04T13:06:39Z",
  			version: "2",
  			changeset: "35746836",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "service",
  			oneway: "yes",
  			service: "parking_aisle",
  			id: "way/317370869"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.359387,
  					46.2310449
  				],
  				[
  					7.359269,
  					46.231249
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370870",
  		properties: {
  			timestamp: "2015-12-04T13:06:39Z",
  			version: "2",
  			changeset: "35746836",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "service",
  			oneway: "yes",
  			service: "parking_aisle",
  			id: "way/317370870"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.359269,
  					46.231249
  				],
  				[
  					7.3592864,
  					46.2313077
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370871",
  		properties: {
  			timestamp: "2014-12-31T22:15:40Z",
  			version: "2",
  			changeset: "27831862",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317370871"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3593639,
  					46.2310608
  				],
  				[
  					7.3592484,
  					46.2312633
  				],
  				[
  					7.3592108,
  					46.2313434
  				],
  				[
  					7.359117,
  					46.2314915
  				],
  				[
  					7.359021,
  					46.2316567
  				],
  				[
  					7.3590153,
  					46.2316665
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317370970",
  		properties: {
  			timestamp: "2020-02-21T23:06:32Z",
  			version: "3",
  			changeset: "81335331",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317370970"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3593874,
  					46.2310214
  				],
  				[
  					7.3594117,
  					46.2310027
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317371204",
  		properties: {
  			timestamp: "2014-12-15T14:02:34Z",
  			version: "1",
  			changeset: "27482615",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317371204"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3603678,
  					46.2303553
  				],
  				[
  					7.3602307,
  					46.2306145
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317371206",
  		properties: {
  			timestamp: "2021-04-13T16:01:21Z",
  			version: "4",
  			changeset: "102876320",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			mapillary: "radhAydyk4Czc9OG2hiGiZ",
  			surface: "asphalt",
  			"survey:date": "2020-11-07",
  			id: "way/317371206"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3602307,
  					46.2306145
  				],
  				[
  					7.3602038,
  					46.2306767
  				],
  				[
  					7.360205,
  					46.2307413
  				],
  				[
  					7.360261,
  					46.2309925
  				],
  				[
  					7.3603194,
  					46.2310926
  				],
  				[
  					7.360644,
  					46.2311717
  				],
  				[
  					7.3607213,
  					46.2311753
  				],
  				[
  					7.3607635,
  					46.231161
  				],
  				[
  					7.3608423,
  					46.2309913
  				],
  				[
  					7.3608524,
  					46.2309502
  				],
  				[
  					7.3609685,
  					46.2305773
  				],
  				[
  					7.3609837,
  					46.2305434
  				],
  				[
  					7.3609965,
  					46.230516
  				],
  				[
  					7.3609928,
  					46.2304987
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/317371365",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "4",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/317371365"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3596031,
  					46.2308996
  				],
  				[
  					7.3601449,
  					46.231047
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/318299895",
  		properties: {
  			timestamp: "2021-03-19T09:03:24Z",
  			version: "8",
  			changeset: "101312998",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "tertiary",
  			lit: "yes",
  			mapillary: "jXRiPsqijPFe3EScsCtlPE",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue de Lausanne",
  			surface: "asphalt",
  			"survey:date": "2020-11-07",
  			id: "way/318299895"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3573088,
  					46.2320569
  				],
  				[
  					7.356783,
  					46.2318858
  				],
  				[
  					7.356203,
  					46.2316972
  				],
  				[
  					7.3559587,
  					46.2316177
  				],
  				[
  					7.3554535,
  					46.2314533
  				],
  				[
  					7.3546049,
  					46.2311874
  				],
  				[
  					7.354453,
  					46.2311401
  				],
  				[
  					7.3534579,
  					46.2308297
  				],
  				[
  					7.3532269,
  					46.2307401
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/318299896",
  		properties: {
  			timestamp: "2021-02-02T17:47:29Z",
  			version: "6",
  			changeset: "98592820",
  			user: "Valdor",
  			uid: "60458",
  			highway: "tertiary",
  			lit: "yes",
  			mapillary: "STsy2n4VkKJutH7IUbbdAu",
  			maxspeed: "50",
  			name: "Avenue de la Gare",
  			surface: "asphalt",
  			"survey:date": "2020-11-07",
  			id: "way/318299896"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3573088,
  					46.2320569
  				],
  				[
  					7.3576657,
  					46.2313117
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/318299897",
  		properties: {
  			timestamp: "2021-01-31T18:23:40Z",
  			version: "5",
  			changeset: "98460760",
  			user: "Valdor",
  			uid: "60458",
  			highway: "tertiary",
  			lit: "yes",
  			mapillary: "S4Z0JtTBPqMS0kpEBsNhPF",
  			maxspeed: "50",
  			name: "Avenue de la Gare",
  			surface: "asphalt",
  			"survey:date": "2020-11-07",
  			id: "way/318299897"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3576657,
  					46.2313117
  				],
  				[
  					7.3577004,
  					46.2312426
  				],
  				[
  					7.3580408,
  					46.2305673
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/318448394",
  		properties: {
  			timestamp: "2018-11-26T21:22:19Z",
  			version: "3",
  			changeset: "64912156",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "tertiary",
  			maxspeed: "50",
  			name: "Avenue de la Gare",
  			surface: "asphalt",
  			id: "way/318448394"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3561164,
  					46.2345797
  				],
  				[
  					7.3561179,
  					46.234455
  				],
  				[
  					7.3563501,
  					46.2339772
  				],
  				[
  					7.3564922,
  					46.2336869
  				],
  				[
  					7.3565827,
  					46.2335097
  				],
  				[
  					7.3566686,
  					46.2333416
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/318453877",
  		properties: {
  			timestamp: "2021-03-19T09:03:24Z",
  			version: "9",
  			changeset: "101312998",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "tertiary",
  			lit: "yes",
  			mapillary: "4LYOCx1V0slEf22osPFSgK",
  			maxspeed: "50",
  			name: "Avenue de la Gare",
  			surface: "asphalt",
  			"survey:date": "2021-02-08",
  			id: "way/318453877"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3580408,
  					46.2305673
  				],
  				[
  					7.3581168,
  					46.2304094
  				],
  				[
  					7.3581323,
  					46.2303772
  				],
  				[
  					7.3582507,
  					46.230131
  				],
  				[
  					7.35832,
  					46.229987
  				],
  				[
  					7.3583962,
  					46.22984
  				],
  				[
  					7.3584242,
  					46.2297721
  				],
  				[
  					7.3587049,
  					46.2291804
  				],
  				[
  					7.3587457,
  					46.2290959
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/318992070",
  		properties: {
  			timestamp: "2021-04-09T05:55:52Z",
  			version: "10",
  			changeset: "102608597",
  			user: "Michael Nixt",
  			uid: "6641970",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "no",
  			mapillary: "ybaSlEez2niIBbF8q4EZwZ",
  			"survey:date": "2021-04-03",
  			id: "way/318992070"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617168,
  					46.2295315
  				],
  				[
  					7.3617707,
  					46.2295187
  				],
  				[
  					7.3617887,
  					46.22952
  				],
  				[
  					7.3618524,
  					46.2295432
  				],
  				[
  					7.3622286,
  					46.2296864
  				],
  				[
  					7.3623661,
  					46.2297387
  				],
  				[
  					7.3636225,
  					46.2302167
  				],
  				[
  					7.3636814,
  					46.2302603
  				],
  				[
  					7.3636902,
  					46.2302668
  				],
  				[
  					7.3637056,
  					46.2303223
  				],
  				[
  					7.3636914,
  					46.2303456
  				],
  				[
  					7.3636764,
  					46.2303702
  				],
  				[
  					7.3635393,
  					46.2304831
  				],
  				[
  					7.3633421,
  					46.2306409
  				],
  				[
  					7.3632512,
  					46.2307325
  				],
  				[
  					7.3631946,
  					46.2307635
  				],
  				[
  					7.3628636,
  					46.2309448
  				],
  				[
  					7.3627474,
  					46.2310085
  				],
  				[
  					7.3626731,
  					46.2310489
  				],
  				[
  					7.362618,
  					46.2310789
  				],
  				[
  					7.362282,
  					46.2313609
  				],
  				[
  					7.3621123,
  					46.2315034
  				],
  				[
  					7.3620442,
  					46.2315605
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319787432",
  		properties: {
  			timestamp: "2021-04-13T16:01:35Z",
  			version: "5",
  			changeset: "102876324",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/319787432"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3595134,
  					46.2310381
  				],
  				[
  					7.3595491,
  					46.2310238
  				],
  				[
  					7.3595766,
  					46.2310042
  				],
  				[
  					7.3601703,
  					46.2311756
  				],
  				[
  					7.3602619,
  					46.231207
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319787433",
  		properties: {
  			timestamp: "2020-02-21T23:06:32Z",
  			version: "3",
  			changeset: "81335331",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/319787433"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3595134,
  					46.2310381
  				],
  				[
  					7.3594957,
  					46.2310626
  				],
  				[
  					7.3591083,
  					46.2316806
  				],
  				[
  					7.359094,
  					46.2317034
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319787434",
  		properties: {
  			timestamp: "2021-01-04T23:03:50Z",
  			version: "3",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/319787434"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.359094,
  					46.2317034
  				],
  				[
  					7.3590919,
  					46.2317196
  				],
  				[
  					7.3594671,
  					46.2318336
  				],
  				[
  					7.3595178,
  					46.2318723
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319787435",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "3",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/319787435"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3578244,
  					46.2313379
  				],
  				[
  					7.3583478,
  					46.2314909
  				],
  				[
  					7.3587152,
  					46.2315983
  				],
  				[
  					7.358995,
  					46.2316801
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319787436",
  		properties: {
  			timestamp: "2014-12-31T22:15:40Z",
  			version: "1",
  			changeset: "27831862",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/319787436"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3577895,
  					46.2313115
  				],
  				[
  					7.3577978,
  					46.2313272
  				],
  				[
  					7.3578244,
  					46.2313379
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319787437",
  		properties: {
  			timestamp: "2014-12-31T22:15:40Z",
  			version: "1",
  			changeset: "27831862",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/319787437"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3590153,
  					46.2316665
  				],
  				[
  					7.3590091,
  					46.2316766
  				],
  				[
  					7.358995,
  					46.2316801
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319788177",
  		properties: {
  			timestamp: "2021-04-09T05:55:43Z",
  			version: "4",
  			changeset: "102608597",
  			user: "Michael Nixt",
  			uid: "6641970",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "no",
  			mapillary: "IZxTrE5YlukllU798OLRW7",
  			surface: "asphalt",
  			"survey:date": "2021-04-03",
  			id: "way/319788177"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3638179,
  					46.2304091
  				],
  				[
  					7.3637366,
  					46.2305019
  				],
  				[
  					7.3636563,
  					46.2305758
  				],
  				[
  					7.3636456,
  					46.2305859
  				],
  				[
  					7.3635201,
  					46.2307044
  				],
  				[
  					7.3634287,
  					46.2307642
  				],
  				[
  					7.363299,
  					46.2308353
  				],
  				[
  					7.3632569,
  					46.2308584
  				],
  				[
  					7.3632173,
  					46.23089
  				],
  				[
  					7.3632081,
  					46.2309167
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319788178",
  		properties: {
  			timestamp: "2021-01-04T22:54:06Z",
  			version: "3",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			crossing: "zebra",
  			footway: "crossing",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/319788178"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3632112,
  					46.2307705
  				],
  				[
  					7.3632473,
  					46.2307951
  				],
  				[
  					7.363266,
  					46.2308078
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319788179",
  		properties: {
  			timestamp: "2021-01-04T22:54:09Z",
  			version: "2",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/319788179"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3632112,
  					46.2307705
  				],
  				[
  					7.3631946,
  					46.2307635
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/319788180",
  		properties: {
  			timestamp: "2021-01-04T22:54:11Z",
  			version: "2",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/319788180"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.363266,
  					46.2308078
  				],
  				[
  					7.363299,
  					46.2308353
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494500",
  		properties: {
  			timestamp: "2021-01-04T22:54:22Z",
  			version: "3",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			crossing: "zebra",
  			footway: "crossing",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/320494500"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3631154,
  					46.2309942
  				],
  				[
  					7.3631569,
  					46.2309708
  				],
  				[
  					7.3631939,
  					46.2309499
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494501",
  		properties: {
  			timestamp: "2021-01-04T22:54:23Z",
  			version: "3",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/320494501"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3631939,
  					46.2309499
  				],
  				[
  					7.3631897,
  					46.2309407
  				],
  				[
  					7.3631947,
  					46.230926
  				],
  				[
  					7.3632081,
  					46.2309167
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494502",
  		properties: {
  			timestamp: "2021-04-09T05:55:38Z",
  			version: "3",
  			changeset: "102608597",
  			user: "Michael Nixt",
  			uid: "6641970",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			mapillary: "ncJgXDyPgO0txkraMoUXtB",
  			"survey:date": "2021-04-03",
  			id: "way/320494502"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3631011,
  					46.231003
  				],
  				[
  					7.3630915,
  					46.230999
  				],
  				[
  					7.3630345,
  					46.2309931
  				],
  				[
  					7.3629813,
  					46.2310155
  				],
  				[
  					7.3629664,
  					46.2310253
  				],
  				[
  					7.3627664,
  					46.2311572
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494503",
  		properties: {
  			timestamp: "2021-03-08T16:33:27Z",
  			version: "3",
  			changeset: "100649799",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/320494503"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3627664,
  					46.2311572
  				],
  				[
  					7.362634,
  					46.2312552
  				],
  				[
  					7.3624864,
  					46.2313665
  				],
  				[
  					7.3624605,
  					46.2313815
  				],
  				[
  					7.3624056,
  					46.2314041
  				],
  				[
  					7.3623636,
  					46.2314598
  				],
  				[
  					7.3623122,
  					46.2315592
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494504",
  		properties: {
  			timestamp: "2018-01-10T21:09:23Z",
  			version: "5",
  			changeset: "55334436",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "residential",
  			lit: "yes",
  			maxspeed: "20",
  			"maxspeed:type": "sign",
  			name: "Rue de la Dixence",
  			surface: "asphalt",
  			id: "way/320494504"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3627321,
  					46.2310799
  				],
  				[
  					7.3629115,
  					46.2309833
  				],
  				[
  					7.3630731,
  					46.2309008
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494506",
  		properties: {
  			timestamp: "2021-01-04T22:54:26Z",
  			version: "3",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			crossing: "zebra",
  			footway: "crossing",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/320494506"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.362875,
  					46.2309565
  				],
  				[
  					7.3629115,
  					46.2309833
  				],
  				[
  					7.3629414,
  					46.2310052
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494507",
  		properties: {
  			timestamp: "2021-01-04T22:54:27Z",
  			version: "2",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/320494507"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3631011,
  					46.231003
  				],
  				[
  					7.3631154,
  					46.2309942
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494508",
  		properties: {
  			timestamp: "2021-01-04T22:54:29Z",
  			version: "2",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/320494508"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3629414,
  					46.2310052
  				],
  				[
  					7.3629664,
  					46.2310253
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494509",
  		properties: {
  			timestamp: "2021-01-04T22:54:45Z",
  			version: "2",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/320494509"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.362875,
  					46.2309565
  				],
  				[
  					7.3628636,
  					46.2309448
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494810",
  		properties: {
  			timestamp: "2015-01-05T10:55:47Z",
  			version: "1",
  			changeset: "27929582",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/320494810"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3585618,
  					46.2323278
  				],
  				[
  					7.3585976,
  					46.2323355
  				],
  				[
  					7.358623,
  					46.2323278
  				],
  				[
  					7.3587663,
  					46.2321148
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/320494812",
  		properties: {
  			timestamp: "2021-01-04T23:03:51Z",
  			version: "4",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/320494812"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3587663,
  					46.2321148
  				],
  				[
  					7.3589886,
  					46.2317815
  				],
  				[
  					7.3589983,
  					46.23174
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/384322098",
  		properties: {
  			timestamp: "2018-01-11T13:31:50Z",
  			version: "4",
  			changeset: "55351510",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "residential",
  			lit: "yes",
  			name: "Rue de la Dent-Blanche",
  			oneway: "yes",
  			surface: "asphalt",
  			id: "way/384322098"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3592864,
  					46.2313077
  				],
  				[
  					7.3591561,
  					46.2315056
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/384322410",
  		properties: {
  			timestamp: "2019-12-31T10:24:52Z",
  			version: "5",
  			changeset: "79050948",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "residential",
  			lit: "yes",
  			name: "Rue des Creusets",
  			surface: "asphalt",
  			id: "way/384322410"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.36015,
  					46.23058
  				],
  				[
  					7.3601938,
  					46.2304864
  				],
  				[
  					7.3602644,
  					46.2303357
  				],
  				[
  					7.3602831,
  					46.2302957
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/384323396",
  		properties: {
  			timestamp: "2018-01-10T21:08:11Z",
  			version: "3",
  			changeset: "55334436",
  			user: "s├®dunois",
  			uid: "4642519",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Rue du Scex",
  			surface: "asphalt",
  			id: "way/384323396"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3632939,
  					46.2319172
  				],
  				[
  					7.3626033,
  					46.2317369
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/384324483",
  		properties: {
  			timestamp: "2015-12-04T13:23:57Z",
  			version: "1",
  			changeset: "35747129",
  			user: "keigan160",
  			uid: "2028552",
  			highway: "service",
  			id: "way/384324483"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3636034,
  					46.2315321
  				],
  				[
  					7.3637193,
  					46.2315526
  				],
  				[
  					7.3638875,
  					46.2315561
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/384324484",
  		properties: {
  			timestamp: "2021-03-08T16:33:28Z",
  			version: "4",
  			changeset: "100649799",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			mapillary: "3W8iV3LYi2XJ2TjQaULGW2",
  			surface: "asphalt",
  			"survey:date": "2020-11-07",
  			id: "way/384324484"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3623397,
  					46.2316258
  				],
  				[
  					7.3632134,
  					46.2318609
  				],
  				[
  					7.3632939,
  					46.2319172
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/384324485",
  		properties: {
  			timestamp: "2021-01-04T22:55:00Z",
  			version: "2",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			surface: "paving_stones",
  			id: "way/384324485"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3623122,
  					46.2315592
  				],
  				[
  					7.3623035,
  					46.2315776
  				],
  				[
  					7.3622925,
  					46.2315969
  				],
  				[
  					7.3622955,
  					46.2316159
  				],
  				[
  					7.3623397,
  					46.2316258
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/470707924",
  		properties: {
  			timestamp: "2021-03-29T20:26:08Z",
  			version: "6",
  			changeset: "101939308",
  			user: "Valdor",
  			uid: "60458",
  			"cycleway:left": "opposite_lane",
  			highway: "residential",
  			lit: "yes",
  			maxspeed: "30",
  			"maxspeed:type": "CH:zone30",
  			name: "Rue des Aub├®pines",
  			oneway: "yes",
  			"oneway:bicycle": "no",
  			surface: "asphalt",
  			id: "way/470707924"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3639227,
  					46.2315845
  				],
  				[
  					7.364054,
  					46.2315639
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/484377537",
  		properties: {
  			timestamp: "2017-04-02T15:51:10Z",
  			version: "1",
  			changeset: "47385574",
  			user: "datendelphin",
  			uid: "97547",
  			highway: "footway",
  			id: "way/484377537"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3573904,
  					46.2331815
  				],
  				[
  					7.357333,
  					46.2330286
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/589178522",
  		properties: {
  			timestamp: "2021-01-18T16:41:05Z",
  			version: "4",
  			changeset: "97710353",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			surface: "paving_stones",
  			"survey:date": "2019-09-16",
  			wikimedia_commons: "File:Kyburz DXP.jpg",
  			id: "way/589178522"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3585115,
  					46.2334813
  				],
  				[
  					7.3585453,
  					46.2335282
  				],
  				[
  					7.3585638,
  					46.2335538
  				],
  				[
  					7.3587462,
  					46.233821
  				],
  				[
  					7.3587247,
  					46.23391
  				],
  				[
  					7.3585794,
  					46.2338692
  				],
  				[
  					7.3583305,
  					46.2338002
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/589178529",
  		properties: {
  			timestamp: "2018-05-18T09:01:44Z",
  			version: "1",
  			changeset: "59072883",
  			user: "FuBuLaSse",
  			uid: "8269151",
  			highway: "footway",
  			id: "way/589178529"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3574319,
  					46.2334581
  				],
  				[
  					7.3574641,
  					46.2335342
  				],
  				[
  					7.3573876,
  					46.2335693
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/589178530",
  		properties: {
  			timestamp: "2019-01-23T20:24:52Z",
  			version: "2",
  			changeset: "66581075",
  			user: "vonde",
  			uid: "2528547",
  			bicycle: "yes",
  			highway: "footway",
  			id: "way/589178530"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3631745,
  					46.2320074
  				],
  				[
  					7.3631807,
  					46.2320807
  				],
  				[
  					7.3626657,
  					46.2324761
  				],
  				[
  					7.3624603,
  					46.2324097
  				],
  				[
  					7.3622959,
  					46.2323567
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/589178531",
  		properties: {
  			timestamp: "2021-01-04T22:55:03Z",
  			version: "2",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/589178531"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3626657,
  					46.2324761
  				],
  				[
  					7.3629738,
  					46.2325379
  				],
  				[
  					7.3631807,
  					46.2320807
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/589178532",
  		properties: {
  			timestamp: "2021-04-03T18:25:44Z",
  			version: "3",
  			changeset: "102247298",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			"survey:date": "2019-09-16",
  			wikimedia_commons: "File:Sionne river.jpg",
  			id: "way/589178532"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3624603,
  					46.2324097
  				],
  				[
  					7.3631807,
  					46.2320807
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/637407785",
  		properties: {
  			timestamp: "2020-02-25T14:22:00Z",
  			version: "4",
  			changeset: "81459808",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/637407785"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3547896,
  					46.2302767
  				],
  				[
  					7.3547955,
  					46.2303339
  				],
  				[
  					7.3553176,
  					46.2305022
  				],
  				[
  					7.3553643,
  					46.2305173
  				],
  				[
  					7.3556158,
  					46.2305967
  				],
  				[
  					7.356189,
  					46.2307832
  				],
  				[
  					7.3575646,
  					46.2312095
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/649286122",
  		properties: {
  			timestamp: "2018-11-26T21:22:18Z",
  			version: "1",
  			changeset: "64912156",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			service: "parking_aisle",
  			id: "way/649286122"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3565827,
  					46.2335097
  				],
  				[
  					7.3564582,
  					46.2334822
  				],
  				[
  					7.3563613,
  					46.2334617
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/665685342",
  		properties: {
  			timestamp: "2019-01-23T20:24:52Z",
  			version: "1",
  			changeset: "66581075",
  			user: "vonde",
  			uid: "2528547",
  			bicycle: "yes",
  			highway: "pedestrian",
  			id: "way/665685342"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.363639,
  					46.2326533
  				],
  				[
  					7.3629738,
  					46.2325379
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/697021989",
  		properties: {
  			timestamp: "2020-01-16T07:11:01Z",
  			version: "3",
  			changeset: "79636752",
  			user: "billyonthemountain",
  			uid: "3130748",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/697021989"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3547123,
  					46.2303921
  				],
  				[
  					7.3558958,
  					46.2307731
  				],
  				[
  					7.3574037,
  					46.2312556
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/697336408",
  		properties: {
  			timestamp: "2019-06-15T14:07:43Z",
  			version: "1",
  			changeset: "71280736",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/697336408"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.356292,
  					46.2327551
  				],
  				[
  					7.3563816,
  					46.2325712
  				],
  				[
  					7.3564432,
  					46.2325803
  				],
  				[
  					7.3565151,
  					46.2325377
  				],
  				[
  					7.3565782,
  					46.2324311
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/697336409",
  		properties: {
  			timestamp: "2019-06-15T14:07:43Z",
  			version: "1",
  			changeset: "71280736",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/697336409"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.356783,
  					46.2318858
  				],
  				[
  					7.3567511,
  					46.2319382
  				],
  				[
  					7.3564417,
  					46.2324007
  				],
  				[
  					7.3562803,
  					46.2323509
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/702898908",
  		properties: {
  			timestamp: "2021-04-09T05:55:48Z",
  			version: "3",
  			changeset: "102608597",
  			user: "Michael Nixt",
  			uid: "6641970",
  			fixme: "V├®rifier la connexion avec la rue suivante",
  			highway: "living_street",
  			lit: "no",
  			mapillary: "AREmU7mi5SlOrxgvPNvSh0",
  			maxspeed: "20",
  			surface: "asphalt",
  			"survey:date": "2021-02-07",
  			id: "way/702898908"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3642998,
  					46.2304752
  				],
  				[
  					7.3639703,
  					46.2307647
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/704659908",
  		properties: {
  			timestamp: "2019-07-15T20:08:42Z",
  			version: "1",
  			changeset: "72280128",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/704659908"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3646306,
  					46.2304105
  				],
  				[
  					7.3646564,
  					46.2304783
  				],
  				[
  					7.3646328,
  					46.2305001
  				],
  				[
  					7.3643265,
  					46.2305707
  				],
  				[
  					7.3642657,
  					46.2305938
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/704659909",
  		properties: {
  			timestamp: "2019-07-15T20:08:42Z",
  			version: "1",
  			changeset: "72280128",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/704659909"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3648032,
  					46.2303775
  				],
  				[
  					7.3648528,
  					46.2305204
  				],
  				[
  					7.3650032,
  					46.2306123
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/704659911",
  		properties: {
  			timestamp: "2019-07-15T20:08:42Z",
  			version: "1",
  			changeset: "72280128",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "residential",
  			motor_vehicle: "no",
  			id: "way/704659911"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3647144,
  					46.2304438
  				],
  				[
  					7.3647413,
  					46.2305145
  				],
  				[
  					7.364773,
  					46.2305362
  				],
  				[
  					7.365003,
  					46.2306934
  				],
  				[
  					7.3652375,
  					46.2308537
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/704659912",
  		properties: {
  			timestamp: "2019-07-15T20:08:42Z",
  			version: "1",
  			changeset: "72280128",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/704659912"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.364773,
  					46.2305362
  				],
  				[
  					7.3647245,
  					46.2305723
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/704659914",
  		properties: {
  			timestamp: "2019-07-15T20:08:42Z",
  			version: "1",
  			changeset: "72280128",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/704659914"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.363594,
  					46.2305613
  				],
  				[
  					7.3636456,
  					46.2305859
  				],
  				[
  					7.3636708,
  					46.2305981
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/704659915",
  		properties: {
  			timestamp: "2020-06-25T17:28:37Z",
  			version: "2",
  			changeset: "87152576",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/704659915"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.363804,
  					46.2306685
  				],
  				[
  					7.3638967,
  					46.2307129
  				],
  				[
  					7.3639703,
  					46.2307647
  				],
  				[
  					7.3640511,
  					46.2308216
  				],
  				[
  					7.3642788,
  					46.2310332
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/704659916",
  		properties: {
  			timestamp: "2019-07-15T20:08:42Z",
  			version: "1",
  			changeset: "72280128",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			tunnel: "building_passage",
  			id: "way/704659916"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3636708,
  					46.2305981
  				],
  				[
  					7.363804,
  					46.2306685
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/714438059",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "2",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "residential",
  			lit: "yes",
  			maxspeed: "20",
  			"maxspeed:type": "sign",
  			name: "Rue de la Dixence",
  			surface: "asphalt",
  			id: "way/714438059"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3623104,
  					46.2314275
  				],
  				[
  					7.362347,
  					46.2313973
  				],
  				[
  					7.3627321,
  					46.2310799
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733991483",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "1",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "pedestrian",
  			id: "way/733991483"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3622599,
  					46.232365
  				],
  				[
  					7.3622822,
  					46.2324532
  				],
  				[
  					7.3622998,
  					46.2328145
  				],
  				[
  					7.3620361,
  					46.2328215
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733991485",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "1",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "steps",
  			id: "way/733991485"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3640415,
  					46.2327175
  				],
  				[
  					7.3639998,
  					46.2328002
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733991486",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "1",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/733991486"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3638871,
  					46.2327109
  				],
  				[
  					7.3639998,
  					46.2328002
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733991487",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "1",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/733991487"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3635937,
  					46.2313208
  				],
  				[
  					7.3635137,
  					46.2313185
  				],
  				[
  					7.3633119,
  					46.2311592
  				],
  				[
  					7.3633317,
  					46.2311108
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733991488",
  		properties: {
  			timestamp: "2019-10-12T20:35:19Z",
  			version: "1",
  			changeset: "75609384",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/733991488"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3632745,
  					46.2311799
  				],
  				[
  					7.3633119,
  					46.2311592
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733995654",
  		properties: {
  			timestamp: "2019-10-12T21:06:30Z",
  			version: "1",
  			changeset: "75609917",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Rue de l'├ëglise",
  			official_name: "Rue de l'Eglise",
  			service: "alley",
  			surface: "sett",
  			id: "way/733995654"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3596534,
  					46.2337005
  				],
  				[
  					7.3598111,
  					46.2332936
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733995655",
  		properties: {
  			timestamp: "2019-10-12T21:06:30Z",
  			version: "1",
  			changeset: "75609917",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "pedestrian",
  			id: "way/733995655"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3600174,
  					46.2336701
  				],
  				[
  					7.3598484,
  					46.2335728
  				],
  				[
  					7.3598678,
  					46.2335378
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/733995656",
  		properties: {
  			timestamp: "2019-10-12T21:06:30Z",
  			version: "1",
  			changeset: "75609917",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "pedestrian",
  			id: "way/733995656"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3599723,
  					46.2337671
  				],
  				[
  					7.3599835,
  					46.2337485
  				],
  				[
  					7.3600174,
  					46.2336701
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/737684632",
  		properties: {
  			timestamp: "2019-10-22T19:15:53Z",
  			version: "1",
  			changeset: "76065768",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "residential",
  			id: "way/737684632"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3610652,
  					46.2304476
  				],
  				[
  					7.3611336,
  					46.2304613
  				],
  				[
  					7.3617322,
  					46.2305784
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/737684633",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "2",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "living_street",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Avenue des Mayennets",
  			surface: "asphalt",
  			id: "way/737684633"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3610203,
  					46.2305677
  				],
  				[
  					7.3608819,
  					46.2309382
  				],
  				[
  					7.3607566,
  					46.2312734
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/738571765",
  		properties: {
  			timestamp: "2019-10-25T14:37:56Z",
  			version: "1",
  			changeset: "76214522",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/738571765"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.36061,
  					46.2314595
  				],
  				[
  					7.3604334,
  					46.2314474
  				],
  				[
  					7.3602819,
  					46.2314666
  				],
  				[
  					7.3602505,
  					46.2314615
  				],
  				[
  					7.3601349,
  					46.2314021
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/754372980",
  		properties: {
  			timestamp: "2020-12-20T07:41:23Z",
  			version: "3",
  			changeset: "96130419",
  			user: "RaphB",
  			uid: "5864987",
  			"cycleway:right": "lane",
  			highway: "residential",
  			lanes: "2",
  			lit: "yes",
  			maxspeed: "50",
  			"maxspeed:type": "sign",
  			name: "Rue du Scex",
  			surface: "asphalt",
  			id: "way/754372980"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3655412,
  					46.2323537
  				],
  				[
  					7.3653288,
  					46.2323557
  				],
  				[
  					7.3649584,
  					46.2323235
  				],
  				[
  					7.3647404,
  					46.2322692
  				],
  				[
  					7.3641176,
  					46.2321188
  				],
  				[
  					7.3637715,
  					46.2320353
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/759814179",
  		properties: {
  			timestamp: "2021-03-02T16:23:31Z",
  			version: "4",
  			changeset: "100292671",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "yes",
  			highway: "pedestrian",
  			lit: "yes",
  			name: "Rue de la Dent-Blanche",
  			oneway: "no",
  			surface: "asphalt",
  			id: "way/759814179"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3598035,
  					46.2303997
  				],
  				[
  					7.3598023,
  					46.2304975
  				],
  				[
  					7.3596031,
  					46.2308996
  				],
  				[
  					7.3595296,
  					46.2309383
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/761164420",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "1",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			name: "Passage Raphy-Dall├¿ves",
  			id: "way/761164420"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3581361,
  					46.2318923
  				],
  				[
  					7.3583338,
  					46.2315145
  				],
  				[
  					7.3583478,
  					46.2314909
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/761164421",
  		properties: {
  			timestamp: "2020-01-06T07:04:51Z",
  			version: "1",
  			changeset: "79235218",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			incline: "down",
  			id: "way/761164421"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575936,
  					46.232011
  				],
  				[
  					7.3575795,
  					46.2320099
  				],
  				[
  					7.3574903,
  					46.2319871
  				],
  				[
  					7.3574647,
  					46.2319691
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424686",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "1",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/775424686"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.357996,
  					46.2303905
  				],
  				[
  					7.3578465,
  					46.2306843
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424687",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "1",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/775424687"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3578035,
  					46.2312669
  				],
  				[
  					7.3578023,
  					46.231287
  				],
  				[
  					7.3577895,
  					46.2313115
  				],
  				[
  					7.3577744,
  					46.2313423
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424689",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "1",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			id: "way/775424689"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3601449,
  					46.231047
  				],
  				[
  					7.3602341,
  					46.2310701
  				],
  				[
  					7.3603194,
  					46.2310926
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424690",
  		properties: {
  			timestamp: "2020-02-21T23:02:18Z",
  			version: "1",
  			changeset: "81335263",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/775424690"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3620442,
  					46.2315605
  				],
  				[
  					7.3620041,
  					46.2315563
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424691",
  		properties: {
  			timestamp: "2021-02-03T21:39:27Z",
  			version: "4",
  			changeset: "98667462",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			mapillary: "7gzBp9tHZKffHlBjamvJGi",
  			surface: "asphalt",
  			"survey:date": "2020-11-07",
  			id: "way/775424691"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3608369,
  					46.2312492
  				],
  				[
  					7.3608208,
  					46.2312299
  				],
  				[
  					7.3608498,
  					46.2311641
  				],
  				[
  					7.3609348,
  					46.2309464
  				],
  				[
  					7.3609422,
  					46.2309275
  				],
  				[
  					7.3610377,
  					46.2306813
  				],
  				[
  					7.3610978,
  					46.230546
  				],
  				[
  					7.3611336,
  					46.2304613
  				],
  				[
  					7.3611379,
  					46.2304511
  				],
  				[
  					7.3611591,
  					46.2303983
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424692",
  		properties: {
  			timestamp: "2020-02-21T23:05:12Z",
  			version: "2",
  			changeset: "81335315",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			id: "way/775424692"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3620041,
  					46.2315563
  				],
  				[
  					7.3619832,
  					46.2315507
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424924",
  		properties: {
  			timestamp: "2021-01-18T16:56:23Z",
  			version: "2",
  			changeset: "97710353",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			mapillary: "9H6GmCL9KSJaIuy7k7HLjV",
  			surface: "paving_stones",
  			"survey:date": "2020-11-07",
  			id: "way/775424924"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617475,
  					46.2314871
  				],
  				[
  					7.3611575,
  					46.2313281
  				],
  				[
  					7.3610663,
  					46.2313056
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424925",
  		properties: {
  			timestamp: "2020-02-21T23:05:12Z",
  			version: "1",
  			changeset: "81335315",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			layer: "-1",
  			id: "way/775424925"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3619832,
  					46.2315507
  				],
  				[
  					7.3617475,
  					46.2314871
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424926",
  		properties: {
  			timestamp: "2020-02-21T23:05:12Z",
  			version: "1",
  			changeset: "81335315",
  			user: "keigan160",
  			uid: "2028552",
  			footway: "sidewalk",
  			highway: "footway",
  			layer: "-1",
  			id: "way/775424926"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3610663,
  					46.2313056
  				],
  				[
  					7.3608369,
  					46.2312492
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775424927",
  		properties: {
  			timestamp: "2021-01-04T22:55:05Z",
  			version: "2",
  			changeset: "96936663",
  			user: "Valdor",
  			uid: "60458",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/775424927"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3623122,
  					46.2315592
  				],
  				[
  					7.3622162,
  					46.2315336
  				],
  				[
  					7.3621123,
  					46.2315034
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775425028",
  		properties: {
  			timestamp: "2020-12-24T00:19:05Z",
  			version: "2",
  			changeset: "96350438",
  			user: "Valdor",
  			uid: "60458",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			surface: "asphalt",
  			id: "way/775425028"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3594117,
  					46.2310027
  				],
  				[
  					7.3594719,
  					46.2310259
  				],
  				[
  					7.3595134,
  					46.2310381
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775425029",
  		properties: {
  			timestamp: "2020-02-21T23:06:32Z",
  			version: "1",
  			changeset: "81335331",
  			user: "keigan160",
  			uid: "2028552",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			id: "way/775425029"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.359094,
  					46.2317034
  				],
  				[
  					7.3590601,
  					46.2316896
  				],
  				[
  					7.3590153,
  					46.2316665
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/775425030",
  		properties: {
  			timestamp: "2020-02-21T23:06:32Z",
  			version: "1",
  			changeset: "81335331",
  			user: "keigan160",
  			uid: "2028552",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			id: "way/775425030"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3589983,
  					46.23174
  				],
  				[
  					7.359004,
  					46.2317157
  				],
  				[
  					7.358995,
  					46.2316801
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606301",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "1",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/809606301"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.362347,
  					46.2313973
  				],
  				[
  					7.362282,
  					46.2313609
  				],
  				[
  					7.3622413,
  					46.2313346
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606302",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "1",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/809606302"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3609757,
  					46.2309576
  				],
  				[
  					7.3609348,
  					46.2309464
  				],
  				[
  					7.3608819,
  					46.2309382
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606303",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "1",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			tunnel: "building_passage",
  			id: "way/809606303"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3611397,
  					46.2309927
  				],
  				[
  					7.3609757,
  					46.2309576
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606304",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "1",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/809606304"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3621252,
  					46.2312601
  				],
  				[
  					7.3620509,
  					46.2312154
  				],
  				[
  					7.3611397,
  					46.2309927
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606305",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "1",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			tunnel: "building_passage",
  			id: "way/809606305"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3622413,
  					46.2313346
  				],
  				[
  					7.3621252,
  					46.2312601
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606306",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "1",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			id: "way/809606306"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3620509,
  					46.2312154
  				],
  				[
  					7.3622544,
  					46.2310768
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606308",
  		properties: {
  			timestamp: "2021-03-29T20:26:10Z",
  			version: "3",
  			changeset: "101939308",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/809606308"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3632939,
  					46.2319172
  				],
  				[
  					7.3633711,
  					46.2318968
  				],
  				[
  					7.363482,
  					46.2318978
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606309",
  		properties: {
  			timestamp: "2021-03-08T16:33:29Z",
  			version: "3",
  			changeset: "100649799",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			lit: "yes",
  			surface: "paving_stones",
  			id: "way/809606309"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.363482,
  					46.2318978
  				],
  				[
  					7.3636549,
  					46.2315868
  				],
  				[
  					7.3637193,
  					46.2315526
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606310",
  		properties: {
  			timestamp: "2021-03-29T20:26:20Z",
  			version: "3",
  			changeset: "101939308",
  			user: "Valdor",
  			uid: "60458",
  			footway: "sidewalk",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/809606310"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3632134,
  					46.2318609
  				],
  				[
  					7.3633711,
  					46.2318968
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606311",
  		properties: {
  			timestamp: "2021-03-08T16:33:30Z",
  			version: "3",
  			changeset: "100649799",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			lit: "yes",
  			surface: "paving_stones",
  			id: "way/809606311"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.363482,
  					46.2318978
  				],
  				[
  					7.3635526,
  					46.2319018
  				],
  				[
  					7.3636247,
  					46.2318908
  				],
  				[
  					7.3636492,
  					46.2318739
  				],
  				[
  					7.3637068,
  					46.2318659
  				],
  				[
  					7.36375,
  					46.2318709
  				],
  				[
  					7.3637947,
  					46.2318729
  				],
  				[
  					7.3638328,
  					46.2318783
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606312",
  		properties: {
  			timestamp: "2021-03-29T20:26:28Z",
  			version: "3",
  			changeset: "101939308",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			lit: "no",
  			surface: "asphalt",
  			id: "way/809606312"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.364096,
  					46.2321591
  				],
  				[
  					7.3640718,
  					46.2322005
  				],
  				[
  					7.3640387,
  					46.2322101
  				],
  				[
  					7.3639929,
  					46.2322022
  				],
  				[
  					7.3637626,
  					46.2321459
  				],
  				[
  					7.3637397,
  					46.2321494
  				],
  				[
  					7.3637128,
  					46.2321697
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606313",
  		properties: {
  			timestamp: "2021-03-29T20:26:31Z",
  			version: "3",
  			changeset: "101939308",
  			user: "Valdor",
  			uid: "60458",
  			crossing: "marked",
  			footway: "crossing",
  			highway: "footway",
  			lit: "yes",
  			surface: "asphalt",
  			id: "way/809606313"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.364096,
  					46.2321591
  				],
  				[
  					7.3641176,
  					46.2321188
  				],
  				[
  					7.3641304,
  					46.2320939
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606314",
  		properties: {
  			timestamp: "2020-08-14T21:41:28Z",
  			version: "2",
  			changeset: "89430958",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/809606314"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3637128,
  					46.2321697
  				],
  				[
  					7.3636789,
  					46.2322345
  				],
  				[
  					7.3636538,
  					46.2322826
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606315",
  		properties: {
  			timestamp: "2020-05-29T15:27:50Z",
  			version: "1",
  			changeset: "85954096",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/809606315"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.362334,
  					46.2322795
  				],
  				[
  					7.3626128,
  					46.2321669
  				],
  				[
  					7.3628657,
  					46.232054
  				],
  				[
  					7.3630746,
  					46.2319491
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/809606316",
  		properties: {
  			timestamp: "2021-03-29T20:26:32Z",
  			version: "3",
  			changeset: "101939308",
  			user: "Valdor",
  			uid: "60458",
  			highway: "footway",
  			lit: "no",
  			surface: "asphalt",
  			id: "way/809606316"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3630746,
  					46.2319491
  				],
  				[
  					7.3632082,
  					46.2319819
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/819544401",
  		properties: {
  			timestamp: "2020-06-25T17:28:37Z",
  			version: "1",
  			changeset: "87152576",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/819544401"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3585453,
  					46.2335282
  				],
  				[
  					7.3589799,
  					46.2336508
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/837120757",
  		properties: {
  			timestamp: "2020-08-14T13:17:57Z",
  			version: "1",
  			changeset: "89413450",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "steps",
  			id: "way/837120757"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3584167,
  					46.2328316
  				],
  				[
  					7.3584284,
  					46.2328465
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/837120758",
  		properties: {
  			timestamp: "2020-08-14T13:17:57Z",
  			version: "1",
  			changeset: "89413450",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/837120758"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3584519,
  					46.2329185
  				],
  				[
  					7.3584284,
  					46.2328465
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/837256035",
  		properties: {
  			timestamp: "2020-08-14T21:41:28Z",
  			version: "1",
  			changeset: "89430958",
  			user: "RaphB",
  			uid: "5864987",
  			"cycleway:left": "opposite_lane",
  			highway: "residential",
  			maxspeed: "30",
  			name: "Rue des Aub├®pines",
  			oneway: "yes",
  			"oneway:bicycle": "no",
  			surface: "asphalt",
  			id: "way/837256035"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.364054,
  					46.2315639
  				],
  				[
  					7.36442,
  					46.2315065
  				],
  				[
  					7.3647409,
  					46.2314612
  				],
  				[
  					7.3654278,
  					46.2313813
  				],
  				[
  					7.3656046,
  					46.2313551
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/863474974",
  		properties: {
  			timestamp: "2020-10-25T07:22:12Z",
  			version: "1",
  			changeset: "93007506",
  			user: "RaphB",
  			uid: "5864987",
  			bicycle: "yes",
  			highway: "pedestrian",
  			lit: "yes",
  			maxspeed: "20",
  			name: "Avenue du Midi",
  			oneway: "no",
  			surface: "asphalt",
  			id: "way/863474974"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3601173,
  					46.2311032
  				],
  				[
  					7.3595982,
  					46.2309601
  				],
  				[
  					7.3595296,
  					46.2309383
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617840",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/899617840"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617156,
  					46.2325349
  				],
  				[
  					7.3616792,
  					46.2324917
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617841",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			bridge: "yes",
  			highway: "footway",
  			layer: "1",
  			id: "way/899617841"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3616792,
  					46.2324917
  				],
  				[
  					7.3616368,
  					46.2324516
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617842",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/899617842"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3616368,
  					46.2324516
  				],
  				[
  					7.3615685,
  					46.2323902
  				],
  				[
  					7.3615371,
  					46.232369
  				],
  				[
  					7.3614276,
  					46.2323405
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617843",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			tunnel: "building_passage",
  			id: "way/899617843"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3614276,
  					46.2323405
  				],
  				[
  					7.3612901,
  					46.2323052
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617844",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/899617844"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3612901,
  					46.2323052
  				],
  				[
  					7.3612664,
  					46.2322992
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617845",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/899617845"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617799,
  					46.2328886
  				],
  				[
  					7.3617853,
  					46.2329199
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617846",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "steps",
  			id: "way/899617846"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3617853,
  					46.2329199
  				],
  				[
  					7.3618183,
  					46.2329774
  				],
  				[
  					7.3616816,
  					46.2330216
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617847",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/899617847"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3616816,
  					46.2330216
  				],
  				[
  					7.3615848,
  					46.2330815
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617848",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "steps",
  			id: "way/899617848"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3615848,
  					46.2330815
  				],
  				[
  					7.3616577,
  					46.233154
  				],
  				[
  					7.3615586,
  					46.2331997
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617849",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/899617849"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3615586,
  					46.2331997
  				],
  				[
  					7.3615187,
  					46.2332107
  				],
  				[
  					7.3614573,
  					46.2332675
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617851",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "steps",
  			id: "way/899617851"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3619171,
  					46.2337234
  				],
  				[
  					7.3619999,
  					46.2336119
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617852",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/899617852"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3619999,
  					46.2336119
  				],
  				[
  					7.3621377,
  					46.2336647
  				],
  				[
  					7.3622162,
  					46.2337322
  				],
  				[
  					7.3624007,
  					46.2338026
  				],
  				[
  					7.3625029,
  					46.2338597
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617854",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			fixme: "A v├®rifier",
  			highway: "corridor",
  			indoor: "yes",
  			id: "way/899617854"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3587152,
  					46.2315983
  				],
  				[
  					7.3587768,
  					46.2314967
  				],
  				[
  					7.3588445,
  					46.2313797
  				],
  				[
  					7.359134,
  					46.2314495
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/899617855",
  		properties: {
  			timestamp: "2021-01-24T20:45:17Z",
  			version: "1",
  			changeset: "98074291",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/899617855"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3575257,
  					46.2321923
  				],
  				[
  					7.3579075,
  					46.2322946
  				],
  				[
  					7.3579637,
  					46.2322612
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/902970568",
  		properties: {
  			timestamp: "2021-02-02T09:27:49Z",
  			version: "1",
  			changeset: "98565874",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "footway",
  			id: "way/902970568"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3607982,
  					46.2338869
  				],
  				[
  					7.3607853,
  					46.2337332
  				],
  				[
  					7.3607844,
  					46.2336683
  				],
  				[
  					7.3605159,
  					46.2336455
  				]
  			]
  		}
  	},
  	{
  		type: "Feature",
  		id: "way/912830809",
  		properties: {
  			timestamp: "2021-03-02T16:23:31Z",
  			version: "1",
  			changeset: "100292671",
  			user: "RaphB",
  			uid: "5864987",
  			highway: "service",
  			incline: "down",
  			oneway: "yes",
  			id: "way/912830809"
  		},
  		geometry: {
  			type: "LineString",
  			coordinates: [
  				[
  					7.3597623,
  					46.2304275
  				],
  				[
  					7.3597078,
  					46.230538
  				]
  			]
  		}
  	}
  ];

  const WIDTH = 800;
  const HEIGHT = 450;

  const projection = geoMercator()
    .fitExtent(
      [[0, 0], [WIDTH, HEIGHT]],
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[7.3565200,46.2305200], [7.3649400,46.2337000]]}
        }
    );

  const pathGenerator = geoPath().projection(projection);

  const svg = select('#map').append('svg')
    .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

    svg.selectAll('path.routes')
    .data(routes)
    .enter()
    .append('path')
    .attr('class', 'routes')
    .attr('d', pathGenerator)
    .attr('stroke', 'lightgrey')
    .attr('fill', 'none')
    .attr('stroke-width', 5);

  svg.selectAll('path.batiments')
    .data(batiments)
    .enter()
    .append('path')
    .attr('class', 'batiments')
    .attr('d', pathGenerator)
    .attr('fill', 'grey');

  svg.selectAll('circle')
    .data(bars)
    .enter()
    .append('circle')
    .attr('cx', d => projection(d)[0])
    .attr('cy', d => projection(d)[1])
    .attr('r', 10)
    .attr('fill', 'purple');

  // import {
  //   geoMercator,
  //   geoPath,
  //   select,
  // } from 'd3'
  // import arbres from './arbres.json'
  // import batiments from './batiments.json'
  // import routes from './routes.json'

  // const WIDTH = 800
  // const HEIGHT = 450

  // const projection = geoMercator()
  //   .fitExtent(
  //     [[0, 0], [WIDTH, HEIGHT]],
  //     {
  //       type: 'Feature',
  //       geometry: {
  //         type: 'LineString',
  //         coordinates: [[6.646,46.7795], [6.649,46.7825]]}
  //       }
  //   )

  // const pathGenerator = geoPath().projection(projection)

  // const svg = select('#map').append('svg')
  //   .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

  //   svg.selectAll('path.routes')
  //   .data(routes)
  //   .enter()
  //   .append('path')
  //   .attr('class', 'routes')
  //   .attr('d', pathGenerator)
  //   .attr('stroke', 'lightgrey')
  //   .attr('fill', 'none')
  //   .attr('stroke-width', 5)

  // svg.selectAll('path.batiments')
  //   .data(batiments)
  //   .enter()
  //   .append('path')
  //   .attr('class', 'batiments')
  //   .attr('d', pathGenerator)
  //   .attr('fill', 'grey')

  // svg.selectAll('circle')
  //   .data(arbres)
  //   .enter()
  //   .append('circle')
  //   .attr('cx', d => projection(d)[0])
  //   .attr('cy', d => projection(d)[1])
  //   .attr('r', 10)
  //   .attr('fill', 'green')

}());
