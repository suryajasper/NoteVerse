import m from 'mithril';

const brush = {
  color: '#434343',

  view(vnode) {
    return m('svg', {
      xmlns: 'http://www.w3.org/2000/svg', height: '24', viewBox: '0 0 24 24', width: '24', ...vnode.attrs,
    },
    [
      m('path', { d: 'M0 0h24v24H0V0z', fill: 'none' }),
      m('path', { d: 'M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z'}),
      m('path', { d: 'M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41', fill: this.color}),
    ]);
  },
};

const fill = {
  color: 'none',

  view(vnode) {
    return m('svg', {
      xmlns: 'http://www.w3.org/2000/svg', height: '24', viewBox: '0 0 24 24', width: '24', ...vnode.attrs,
    },
    [
      m('path', { d: 'M0 0h24v24H0V0z', fill: 'none' }),
      m('path', { d: 'M16.56 8.94 7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10 10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z'}),
      m('path', { d: 'M2 20h20v4H2v-4z', fill: this.color }),
    ]);
  },
};

// M16.56 8.94 7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10 10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5zM2 20h20v4H2v-4z

const image = {
  view(vnode) {
    return m('svg', {
      xmlns: 'http://www.w3.org/2000/svg', height: '24', viewBox: '0 0 24 24', width: '24', ...vnode.attrs,
    },
    [
      m('path', { d: 'M0 0h24v24H0V0z', fill: 'none' }),
      m('path', { d: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.9 13.98l2.1 2.53 3.1-3.99c.2-.26.6-.26.8.01l3.51 4.68c.25.33.01.8-.4.8H6.02c-.42 0-.65-.48-.39-.81L8.12 14c.19-.26.57-.27.78-.02z' }),
    ]);
  },
};

const text = {
  view(vnode) {
    return m('svg', {
      xmlns: 'http://www.w3.org/2000/svg', height: '24', viewBox: '0 0 24 24', width: '24', ...vnode.attrs,
    },
    [
      m('path', { d: 'M0 0h24v24H0V0z', fill: 'none' }),
      m('path', { d: 'M2.5 5.5C2.5 6.33 3.17 7 4 7h3.5v10.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V7H14c.83 0 1.5-.67 1.5-1.5S14.83 4 14 4H4c-.83 0-1.5.67-1.5 1.5zM20 9h-6c-.83 0-1.5.67-1.5 1.5S13.17 12 14 12h1.5v5.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12H20c.83 0 1.5-.67 1.5-1.5S20.83 9 20 9z' }),
    ]);
  },
};

const eraser = {
  view(vnode) {
    return m('svg', {
      xmlns: 'http://www.w3.org/2000/svg', height: '24', viewBox: '0 0 24 24', width: '24', ...vnode.attrs,
    },
    [
      m('path', { d: 'M0 0h24v24H0V0z', fill: 'none' }),
      m('path', { d: 'M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95l-4.95 4.95z' }),
    ]);
  },
};

const select = {
  view(vnode) {
    return m('svg', {
      xmlns: 'http://www.w3.org/2000/svg', height: '32', viewBox: '0 0 32 32', fill: 'none', width: '32', ...vnode.attrs,
    },
    [
      m('rect', {
        x: 1.5,
        y: 1.5,
        width: 29,
        height: 29,
        rx: 15,
        fill: 'none',
        stroke: '#333',
        'stroke-width': 4,
        'stroke-linejoin': 'round',
        'stroke-dasharray': '5 5',
      }),
    ]);
  },
};

const pan = {
  view(vnode) {
    return m('svg', {
      xmlns: 'http://www.w3.org/2000/svg', height: '24', viewBox: '0 0 24 24', width: '24', ...vnode.attrs,
    },
    [
      m('path', { d: 'M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z' }),
    ]);
  },
}

export {
  brush,
  fill,
  image,
  text,
  eraser,
  select,
  pan,
};
