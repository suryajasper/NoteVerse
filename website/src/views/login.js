import m from 'mithril';
import styles from '../signup.css';

var Login = {
  view: function(vnode) {
    return m("form", {"action":"/login","method":"POST",class:styles.signupform}, [
      m("h1", "Log in"), m("br"),
      m("span", {"className":`${styles.input}`}),
      m("input", {"type":"email","name":"email","placeholder":"Email address","required":"required"}),
      m("span", {"id":"passwordMeter"}),
      m("input", {"type":"password","name":"password","id":"password","placeholder":"Password","title":"Password min 8 characters. At least one UPPERCASE and one lowercase letter","required":"required","pattern":"(?=^.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).*$"}),
      m("button", {"className":`${styles.iconArrowRight}`,"type":"submit","value":"Log in","title":"Submit form"}, 
        m("span", "Log in")
      )
    ])
  }
}

var Signup = {
  view: function(vnode) {
    return m("form", {"action":"/signup","method":"POST",class:styles.signupform}, [
      m("h1", "Sign up"), m("br"),
      m("span", {"className":`${styles.input}`}),
      m("input", {"type":"text","name":"name","placeholder":"Full name","title":"Format: Xx[space]Xx (e.g. Alex Cican)","autofocus":"autofocus","autocomplete":"off","required":"required","pattern":"^\\w+\\s\\w+$"}),
      m("span", {"className":`${styles.input}`}),
      m("input", {"type":"email","name":"email","placeholder":"Email address","required":"required"}),
      m("span", {"id":"passwordMeter"}),
      m("span", {"className":`${styles.input}`}),
      m("input", {"type":"password","name":"password","id":"password","placeholder":"Password","title":"Password min 8 characters. At least one UPPERCASE and one lowercase letter","required":"required","pattern":"(?=^.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).*$"}),
      m("button", {"className":`${styles.iconArrowRight}`,"type":"submit","value":"Sign Up","title":"Submit form"}, 
        m("span", "Sign up")
      )
    ])
  }
}

export {Login, Signup};