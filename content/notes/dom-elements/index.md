---
title: Dom elements
date: 2025-07-26
---

## Creando un elemento de dom

Podemos definir un elemento con el método
`createElement`.


```js
const hw_app = () => {
    const el = document.createElement('span')
    el.textContent = 'Hello World!'
    return el
}
```

Y añadirlo a un *target* con `appendChild`:

<div id="hello-world-app" class="widget"></div>

```js
document.getElementById('hello-world-app').appendChild(hw_app())
```

## Añadiendo reactividad

El patrón de observación encapsulado en un *store* permite reaccionar a cambios:

```js
function store(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    set(newState) {
      state = newState;
      listeners.forEach(l => l(state));
    },
    get() {
      return state;
    },
    onChange(cb) {
      listeners.add(cb);
      cb(state);
      return () => listeners.delete(cb);
    }
  };
}
```

Actualizamos la *UI* ejecutando un callback:

<div id="counter-app" class="widget"></div>

```js
function counter() {
    const state = store(0)
    const app = document.createElement('div')
    const label = document.createElement('span')

    const increaseBtn = document.createElement('button')
    const decreaseBtn = document.createElement('button')

    increaseBtn.textContent = '+'
    decreaseBtn.textContent = '-'

    app.appendChild(label)
    app.appendChild(increaseBtn)
    app.appendChild(decreaseBtn)

    const increase = () => state.set(state.get() + 1)
    const decrease = () => state.set(state.get() - 1)

    label.textContent = state.get()
    increaseBtn.addEventListener('click', increase)
    decreaseBtn.addEventListener('click', decrease)

    count.onChange(
        () => label.textContent = count.get()
    )

    return app
}

document.getElementById('counter-app')
    .appendChild(counter())
```

## Simplificando la síntaxis

Para una sintáxis más declarativa, podemos definir primitivas de etiquetas html y helpers de estilo.


```js
const styled = (el) => {
    el.color = (v) => {
        el.style.color = v
        return el
    }
    return el
}

const span = (textContent) => {
    const el = document.createElement('span')
    el.textContent = textContent
    return styled(el)
}
```

Lo que permite definir y estilizar elementos de forma funcional.

<div id="hello-world-app-b" class="widget"></div>

```js
const hw_app = span("Hello world!")
    .color("red")
```

<script>
const hw_app = () => {
    const el = document.createElement('span')
    el.textContent = 'Hello World!'
    return el
}

document.getElementById('hello-world-app').appendChild(hw_app())

function store(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    set(newState) {
      state = newState;
      listeners.forEach(l => l(state));
    },
    get() {
      return state;
    },
    onChange(cb) {
      listeners.add(cb);
      cb(state);
      return () => listeners.delete(cb);
    }
  };
}

function counter() {
    const state = store(0)
    const app = document.createElement('div')
    const label = document.createElement('p')

    const increaseBtn = document.createElement('button')
    const decreaseBtn = document.createElement('button')

    increaseBtn.textContent = '+'
    decreaseBtn.textContent = '-'

    app.appendChild(label)
    app.appendChild(increaseBtn)
    app.appendChild(decreaseBtn)

    const increase = () => state.set(state.get() + 1)
    const decrease = () => state.set(state.get() - 1)

    label.textContent = state.get()
    increaseBtn.addEventListener('click', increase)
    decreaseBtn.addEventListener('click', decrease)

    state.onChange(
        () => label.textContent = state.get()
    )

    return app
}

document.getElementById('counter-app')
    .appendChild(counter())

const styled = (el) => {
    el.color = (v) => {
        el.style.color = v
        return el
    }
    return el
}

const span = (textContent) => {
    const el = document.createElement('span')
    el.textContent = textContent
    return styled(el)
}


document.getElementById('hello-world-app-b')
    .appendChild(span("Hello world!").color("brown"))

</script>

<style>
#counter-app p {
    margin-bottom: 0px;
    text-align: center;
}

.widget {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  padding: 24px;
}

#app {
    width: 300px;
    margin: auto;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}
</style>
