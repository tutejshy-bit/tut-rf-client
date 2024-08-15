import {ref} from 'vue'

const checkMobile = () => screen.width <= 760;

export const mobile = ref(checkMobile());

window.addEventListener('resize', () => mobile.value = checkMobile());