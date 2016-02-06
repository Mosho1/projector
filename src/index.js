import shallowEqual from './shallowEqual';

const mapProps = props => props;

const mapChild = x => {
  if (typeof x === 'string') {
    return document.createTextNode(x);
  }
  return x;
};

const appendChild = (el, child) => {
  child = mapChild(child);
  el.appendChild(child);
};

const replaceElementWith = (current, next) => {
    return current.parentNode.replaceChild(next, current);
};

const forEachInMaybeArr = (maybeArr, fn) => {
  if (Array.isArray(maybeArr)) {
    for (let i = 0, len = maybeArr.length; i < len; i++) {
      fn(maybeArr[i]);
    }
  } else {
    fn(maybeArr);
  }
};

const appendChildren = (el, children) => {
  if (!children) return el;
  forEachInMaybeArr(children, c => appendChild(el, c));
  return el;
};

const createDOMElement = (type, props, children) => {
  props = mapProps(props);
  const el = document.createElement(type);
  const elWithProps = Object.assign(el, props);
  return appendChildren(elWithProps, children);
};

const shouldUpdate = ({prev, next}) => {
  return !shallowEqual(prev, next);
};

let context = '';
const componentCache = new Map();

const createComponentElement = (type, props, children) => {
  const savedContext = context;
  const parent = componentCache.get(context);
  const
  context += props.key || '0';
  const currentInstance = componentCache.get(context);

  const needsToRender = !currentInstance || shouldUpdate({
    prev: currentInstance.props,
    next: props
  })
  if (needsToRender) {
    const el = type(props, children);

    const newInstance = {
      type,
      el,
      props,
      parent: parent.el,
      update: currentInstance && currentInstance.el,
      mount: !currentInstance
    };

    componentCache.set(context, newInstance);
  }

  context = savedContext;
};

const isString = x => typeof x === 'string';

const e = (type, props, children) => {
    const create = isString(type) ? createDOMElement : createComponentElement;
    const el = create(type, props, children);
    return el;
};

const mountComponent = comp => {
  comp.parent.innerHTML = '';
  appendChild(comp.parent, comp.el);
  comp.mount = false;
};

const updateComponent = comp => {
  replaceElementWith(comp.update, comp.el);
  comp.update = false;
};

const updateOrMountComponent = comp => {
  if (comp.mount) {
    mountComponent(comp);
  }
  if (comp.update) {
    updateComponent(comp);
  }
};

const render = (component, DOMElement) => {
  componentCache.set(context, {el: DOMElement})
  const el = component();
  componentCache.forEach(updateOrMountComponent);
};

const aComponent = props => {
  return e(({date}) =>
    e('div', null, [
      e('div', null, 'wat'),
      e('div', null, date.toString())
    ]),
    {
      date: new Date()
    }
  );
}

clearInterval(window.wat);
window.wat = setInterval(() => {
  console.time('render');
  render(aComponent, document.body);
  console.timeEnd('render');
}, 1000);
