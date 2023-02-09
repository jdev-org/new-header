import { defineCustomElement } from 'vue'
import Header from './header.ce.vue'

const HeaderCE = defineCustomElement(Header)
customElements.define('geor-header', HeaderCE)
