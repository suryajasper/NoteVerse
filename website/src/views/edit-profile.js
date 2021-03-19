import m from 'mithril'
import styles from '../signup.css';

export default function EditProfile() {
    return {
        view(vnode) {
            return [m('form', {class:styles.signupform}, [
             m('h1', 'Profile Picture'),
             m('div', {class:'profile-pic-div'}),
             m('img', {src:'profileimage.png'}),
             m('h2', 'Edit Username:'), 
             m('input', {"placeholder":"New Username"}),
             m('input', {'type':'Submit', 'value':'Save Changes'})
            ]
            )];
        }
    }
}
