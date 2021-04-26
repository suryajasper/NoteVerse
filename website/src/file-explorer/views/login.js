import m from 'mithril';
import styles from '../signup.css';
import Cookies from '../../utils/cookies';

var Login = {
  email: '',
  password: '',
  view: function(vnode) {
    return [m("form", {class:styles.signupform}, [
      m("h1", "Log in"), m("br"),
      m("span", {"className":`${styles.input}`}),
      m("input", {oninput: e => {vnode.state.email = e.target.value;}, "type":"email","name":"email","placeholder":"Email address","required":"required"}),
      m("span", {"id":"passwordMeter"}),
      m("input", {oninput: e => {vnode.state.password = e.target.value;}, "type":"password","name":"password","id":"password","placeholder":"Password","title":"Password min 8 characters. At least one UPPERCASE and one lowercase letter","required":"required","pattern":"(?=^.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).*$"}),
      m("button", {"className":`${styles.iconArrowRight}`,style: "bottom:30px","value":"Log in","title":"Submit form", onclick: e => {
        e.preventDefault();
        m.request({
          method: 'POST',
          url: 'http://localhost:2000/authenticateUser',
          params: {
            email: vnode.state.email,
            password: vnode.state.password
          }
        }).then((res) => {
          console.log(res);
          Cookies.set('uid', res.uid, 2);
          window.location.href = '/#!/notes/root';
        }).catch(err => {
          window.alert('invalid login credentials');
        });
      }}, m("span", "Log in")
      ),
      m('a', {href: '/#!/signup'}, 'Create an Account')
      ]),
    ]
  }
}

var Signup = {
  username: '',
  email: '',
  password: '',
  view: function(vnode) {
    return m("form", {class:styles.signupform}, [
      m("h1", "Sign up"), m("br"),
      m("span", {"className":`${styles.input}`}),
      m("input", {oninput: e => {vnode.state.username = e.target.value;}, "type":"text","name":"name","placeholder":"Full name","title":"Format: Xx[space]Xx (e.g. Alex Cican)","autofocus":"autofocus","autocomplete":"off","required":"required","pattern":"^\\w+\\s\\w+$"}),
      m("span", {"className":`${styles.input}`}),
      m("input", {oninput: e => {vnode.state.email = e.target.value;}, "type":"email","name":"email","placeholder":"Email address","required":"required"}),
      m("span", {"id":"passwordMeter"}),
      m("span", {"className":`${styles.input}`}),
      m("input", {oninput: e => {vnode.state.password = e.target.value;}, "type":"password","name":"password","id":"password","placeholder":"Password","title":"Password min 8 characters. At least one UPPERCASE and one lowercase letter","required":"required","pattern":"(?=^.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).*$"}),
      m("button", {"className":`${styles.iconArrowRight}`,"value":"Sign Up","title":"Submit form", onclick: e => {
        e.preventDefault();
        m.request({
          method: 'POST',
          url: 'http://localhost:2000/createUser',
          params: {
            username: vnode.state.username,
            email: vnode.state.email,
            password: vnode.state.password
          }
        }).then((res) => {
          Cookies.set('uid', res.uid, 2);
          window.location.href = '/#!/notes/root';

        }).catch(err => {
          console.log('error bro');
        });
      }}, 
        m("span", "Sign up")
      )
    ])
  }
}

export {Login, Signup};