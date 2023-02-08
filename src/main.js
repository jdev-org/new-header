import Header from './header.ce.vue'
import { defineCustomElement } from 'vue'

const HeaderCE = defineCustomElement(Header)
customElements.define('geor-header', HeaderCE)
